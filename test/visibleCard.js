/**
 * Fetch the setting data from the specified lua module.
 * @param {Object} scribunto       Information about the target lua module.
 * @param {String} scribunto.title Title of the target lua module.
 * @param {RegExp} scribunto.start To remove from start
 * @param {RegExp} scribunto.end   To remove at the end
 * @param {String} scribunto.name  Name of the new array in json format
 * @returns {jQuery.Promise}
 */
const fetchData = scribunto => {
    const params = {
        action: 'query',
        prop: 'revisions',
        titles: scribunto.title,
        formatversion: 2,
        rvprop: 'content',
        rvslots: 'main',
        rvlimit: 1
    };
    return new mw.Api().get( params ).then( data => {
        let content = data.query.pages[0].revisions[0].slots.main.content,
            result;

        // Borrowed some RegExp below from https://w.wiki/HXXm
        // '=' within string will break this
        content = content.replace( /\-\-.*\n/g, '' ) // remove comments
            .replace( /\s+/gm, '' )          // remove line breaks and tabs
            .replace( scribunto.start, '' )  // delete beginning
            .replace( scribunto.end, '' )    // delete end
            .replace(                        // remove square brackets from keys
                /\[\"([^\[\]\"]+?)\"\]\=/gm,
                (_, p) => '\"' + p + '\":'
            )
            .replace(                        // enclose keys in double quotes
                /([^\,\=\"\{\}]+?)\=/gm,
                (_, p) => '\"' + p + '\":'
            )
            .replace(                        // replace arrays
                /\{(\"[^\"]+?\"\,)*?\"[^\"]+?\"\}/g,
                m => m.replace('{', '[').replace('}', ']')
            );

        try {
            result = JSON.parse( "{" + content + "}" );
            return result;
        } catch ( e ) {
            console.warn( e );
            return fetch( '//raw.githubusercontent.com/sousakak/userScriptsForWikivoyage/refs/heads/master/ListingTools/vCardSetting.json' )
                .then( r => r.json() )
                .then( r => { result = r; });
        }
    });
};

(() => {
    'use strict';

    if (typeof window.voy === 'undefined') window.voy = {};

    if (typeof window.voy.VCardSetting !== 'undefined') { // avoid duplicate loading
        const deferred = $.Deferred();
        deferred.resolve( window.voy.VCardSetting );
        return deferred.promise();
    };
    return mw.loader.using( 'mediawiki.api' ).then( _ => {
        let setting = {};
        const scribuntos = [
            {
                title: 'Module:Marker utilities/Types', // name of module to import
                start: /^.*types={/g,               // to remove from start
                end: /,?},?}$/g,                  // to remove at the end
                name: 'types'                           // name of the new array
            },
            {
                title: 'Module:Marker utilities/Groups',
                start: /^.*groups={/g,
                end: /,?},?}$/g,
                name: 'groups'
            },
            {
                title: 'Module:VCard/Subtypes',
                start: /^.*,f={/g,
                end: /,?},g=.*$/g,
                name: 'subtypes'
            },
            {
                title: 'Module:VCard/Cards',
                start: /^.*cards={/g,
                end: /,?},?}$/g,
                name: 'payments'
            },
            {
                title: 'Module:Hours/i18n',
                start: /^.*dateIds={/g,
                end: /,?},?}$/g,
                name: 'hours'
            },
            {
                title: 'Module:VCard/Qualifiers',
                start: /^.*labels={/g,
                end: /,?},?}$/g,
                name: 'qualifiers'
            },
            {
                title: 'Module:CountryData/Currencies',
                start: /^.*currencies={/g,
                end: /,?},isoToQid=.*$/g,
                name: 'currencies'
            }
        ];
        for (const scribunto of scribuntos) {
            fetchData( scribunto ).done( data => {
                setting[scribunto.name] = data;
            });
        }
        window.voy = Object.assign( window.voy, { VCardSetting: setting } );
        return setting;
    });
})();

mw.loader.using( ['mediawiki.ForeignApi', '@wikimedia/codex'] ).then( require => {
    'use strict';

    const { createMwApp, ref, reactive } = require( 'vue' );
    const Codex = require( '@wikimedia/codex' );

    const Config = {
        i18n: {},
        helpLink: 'https://ja.wikivoyage.org/w/index.php?title=ヘルプ:visibleCard'
    },
    CATEGORIES = [
        {
            value: 'access',
            label: 'Access',
            active: true,
            params: {
                'name': {
                    title: 'Name',
                    widget: 'input',
                    placeholder: true
                },
                'name-local': {
                    title: 'Local Name',
                    widget: 'input',
                    placeholder: true
                },
                'name-latin': {
                    title: 'Latin Name',
                    widget: 'input',
                    placeholder: true
                },
                'name-map': {
                    title: 'Name on Map',
                    widget: 'input',
                    placeholder: true
                },
                'alt': {
                    title: 'Alt',
                    widget: 'input',
                    placeholder: true
                },
                'comment': {
                    title: 'Comment',
                    widget: 'input',
                    placeholder: true
                },
                'address': {
                    title: 'Address',
                    widget: 'input',
                    placeholder: true
                },
                'address-local': {
                    title: 'Local Address',
                    widget: 'input',
                    placeholder: true
                },
                'directions': {
                    title: 'Directions',
                    widget: 'input',
                    placeholder: true
                },
                'directions-local': {
                    title: 'Directions in Local Language',
                    widget: 'input',
                    placeholder: true
                }
            }
        },
        {
            value: 'entree',
            label: 'Entree',
            active: true,
            params: {
                'hours': {
                    title: 'Hours',
                    widget: 'input',
                    placeholder: true
                },
                'checkin': {
                    title: 'Check-in',
                    widget: 'input',
                    placeholder: true
                },
                'checkout': {
                    title: 'Check-out',
                    widget: 'input',
                    placeholder: true
                },
                'payment': {
                    title: 'Payment',
                    widget: 'input',
                    placeholder: true
                },
                'price': {
                    title: 'Price',
                    widget: 'input',
                    placeholder: true
                }
            }
        },
        {
            value: 'images',
            label: 'Images',
            active: true,
            params: {
                'image': {
                    title: 'Image',
                    widget: 'image',
                },
                'commonscat': {
                    title: 'Category on Commons',
                    widget: 'lookup',
                    placeholder: true,
                    query: 'commons'
                }
            }
        },
        {
            value: 'map',
            label: 'Map',
            active: true,
            params: {
                'lat': {
                    title: 'Latitude',
                    widget: 'input',
                    type: 'number',
                    max: 90,
                    min: -90,
                    placeholder: true
                },
                'long': {
                    title: 'Longitude',
                    widget: 'input',
                    type: 'number',
                    max: 180,
                    min: -180,
                    placeholder: true
                },
                'zoom': {
                    title: 'Zoom',
                    widget: 'input',
                    type: 'number',
                    max: 19,
                    min: 0,
                    placeholder: true
                }
            }
        },
        {
            value: 'contact',
            label: 'Contact',
            active: true,
            params: {
                'url': {
                    title: 'Url',
                    widget: 'input',
                    placeholder: true,
                    validate: /^https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+\/?$/
                },
                'phone': {
                    title: 'Phone number',
                    widget: 'input',
                    placeholder: true,
                    validate: /^\+?[0-9\s]{1,4}([-\s]?[0-9]{1,4})*(\uff08.+?\uff09)?([,\u3001]\s?\+?[0-9]{1,4}(\-[0-9]{1,4})*)*$/
                },
                'tollfree': {
                    title: 'Tollfree',
                    widget: 'input',
                    placeholder: true
                },
                'mobile': {
                    title: 'Mobile Phone Number',
                    widget: 'input',
                    placeholder: true,
                    validate: /^0[5789]0[-\s]?\d{4}[-\s]?\d{4}$/
                },
                'fax': {
                    title: 'Fax',
                    widget: 'input',
                    placeholder: true
                },
                'email': {
                    title: 'Email Address',
                    widget: 'input',
                    placeholder: true,
                    validate: /^[\w\+\-]+(.[\w\+\-]+)*@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/
                }
            }
        },
        {
            value: 'others',
            label: 'Others',
            active: true,
            params: {
                'subtype': {
                    widget: 'select',
                    options: [
                        {
                            data: 'budget',
                            label: "お手頃"
                        },
                        {
                            data: 'midrange',
                            label: "中級店"
                        },
                        {
                            data: 'upmarket',
                            label: "高級店"
                        }
                    ],
                    placeholder: true
                },
                'wikidata': {
                    widget: 'lookup',
                    placeholder: true,
                    query: 'wikidata'
                },
                'description': {
                    widget: 'input',
                    type: 'multiline',
                    placeholder: true
                },
                'lastedit': {
                    widget: 'input',
                    placeholder: true
                }
            }
        },
        {
            value: 'meta',
            label: 'Meta',
            active: true,
            params: {
                'type': {
                    widget: 'input'
                },
                'auto': {
                    widget: 'input'
                },
                'show': {
                    widget: 'input'
                },
                'group': {
                    widget: 'input'
                },
                'map-group': {
                    widget: 'input'
                },
                'before': {
                    widget: 'input'
                },
                'styles': {
                    widget: 'input'
                },
                'copy-marker': {
                    widget: 'input'
                },
                'country': {
                    widget: 'input'
                },
                'status': {
                    widget: 'input'
                },
                'section-from': {
                    widget: 'input'
                }
            }
        }
    ],
    PARAMS = {
        name: '',
        'name-local': '',
        'name-latin': '',
        'name-map': '',
        alt: '',
        comment: '',
        type: [],
        subtype: [],
        address: '',
        'address-local': '',
        directions: '',
        'directions-local': '',
        lat: '',
        long: '',
        zoom: '',
        wikidata: '',
        auto: '',
        commons: '',
        url: '',
        show: '',
        group: '',
        'map-group': '',
        image: '',
        phone: '',
        tollfree: '',
        mobile: '',
        fax: '',
        email: '',
        hours: '',
        checkin: '',
        checkout: '',
        payment: '',
        price: '',
        description: '',
        before: '',
        lastedit: '',
        styles: '',
        'copy-marker': '',
        country: '',
        status: '',
        'section-from': '',
        /*
        frequency: '',
        date: '',
        month: '',
        year: '',
        enddate: '',
        endmonth: '',
        endyear: '',
        location: ''
        */
    },
    QUERIES = {
        commons: {
            url: '//commons.wikimedia.org/w/api.php',
            params: {
                action: 'query',
                format: 'json',
                list: 'search',
                formatversion: 2,
                srnamespace: 6,
                srlimit: 10
            },
            termParam: 'srsearch'
        }
    };

    /**
     * Returns the dialog object to be mounted
     * 
     * @param {VCard} vCard
     */
    const dialog = vCard => {
        return {
            template: `
                <cdx-dialog
                    v-model:open="open"
                    title="visibleCard"
                    :use-close-button="true"
                    :primary-action="primaryAction"
                    :default-action="defaultAction"
                    @primary="onPrimaryAction"
                    @default="open = true"
                    class="voy-vCard-dialog"
                >
                    <template #header>
                        <h2 class="voy-vCard-dialog__title">${vCard.params.name}</h2>
                        <cdx-button
                            action="default"
                            weight="quiet"
                            @click="open = false"
                            class="voy-vCard-dialog__button voy-vCard-dialog__button__close"
                        >
                            <cdx-icon :icon="cdxIconClose"></cdx-icon>
                        </cdx-button>
                    </template>
                    <div
                        v-if="panel === 'main'"
                        class="voy-vCard-dialog__panel voy-vCard-dialog__panel-main"
                    >
                        <div
                            class="voy-vCard-dialog__index"
                        >
                            <div
                                class="cdx-toggle-button-group voy-vCard-dialog__index__menu"
                            >
                                <cdx-button
                                    action="default"
                                    weight="quiet"
                                    size="large"
                                    v-for="item in indexItems"
                                    :key="item"
                                    @click="page = item.value"
                                    class="voy-vCard-dialog__index__item"
                                    :class="'voy-vCard-dialog__index__item--' + item.value"
                                >
                                    {{ item.label }}
                                </cdx-button>
                            </div>
                        </div>
                        <template
                            v-for="item in indexItems"
                            :key="item"
                        >
                            <div
                                v-if="page === item.value"
                                class="voy-vCard-dialog__page"
                                :class="'voy-vCard-dialog__page--' + item.value"
                            >
                                <template
                                    v-for="(option, name) in item.params"
                                    :key="name"
                                >
                                    <cdx-field
                                        v-if="option.widget === 'input'"
                                    >
                                        <cdx-text-input
                                            v-model="input[name]"
                                        >
                                        </cdx-text-input>
                                        <template #label>
                                            {{ option.title }}
                                        </template>
                                        <template #description>
                                            {{ option.desc }}
                                        </template>
                                        <template #help-text>
                                            {{ option.guide }}
                                        </template>
                                    </cdx-field>
                                    <cdx-lookup
                                        v-model:selected="lookupSelection"
                                        v-model:input-value="input[name]"
                                        :menu-items="lookupItems"
                                        :menu-config="option.config"
                                        @update:input-value="onUpdateLookupValue(option.query, name)"
                                        @load-more="onLookupLoadMore(option.query, name)"
                                        v-if="option.widget === 'lookup'"
                                    >
                                        <template #no-results>
                                            No results found.
                                        </template>
                                    </cdx-lookup>
                                </template>
                            </div>
                        </template>
                    </div>
                    <div
                        v-if="panel === 'preview'"
                    >
                        Preview
                    </div>

                    <template #footer>
                        <cdx-button
                            action="progressive"
                            weight="primary"
                            aria-label="Settings"
                            v-tooltip="'View and change your settings'"
                            @click="onSettingsAction"
                            class="voy-vCard-dialog__button voy-vCard-dialog__button__settings"
                            disabled
                        >
                            <cdx-icon :icon="cdxIconSettings"></cdx-icon>
                            <span class="voy-vCard-dialog__buttonLabel">Settings</span>
                        </cdx-button>
                        <cdx-button
                            action="default"
                            weight="primary"
                            aria-label="Help"
                            v-tooltip="'Open the help page in a new tab'"
                            @click="onHelpAction"
                            class="voy-vCard-dialog__button voy-vCard-dialog__button__help"
                        >
                            <cdx-icon :icon="cdxIconHelp"></cdx-icon>
                            <span class="voy-vCard-dialog__buttonLabel">Help</span>
                        </cdx-button>
                        <cdx-button
                            action="progressive"
                            weight="primary"
                            aria-label="Next"
                            v-if="panel === 'main'"
                            v-tooltip="'Preview and publish your edit'"
                            @click="onNextAction"
                            class="voy-vCard-dialog__button voy-vCard-dialog__button__next"
                        >
                            <span class="voy-vCard-dialog__buttonLabel">Next</span>
                            <cdx-icon :icon="cdxIconNext"></cdx-icon>
                        </cdx-button>
                        <cdx-button
                            action="default"
                            weight="primary"
                            aria-label="Back"
                            v-if="panel === 'preview'"
                            v-tooltip="'Go back to reedit'"
                            @click="panel = 'main'"
                            class="voy-vCard-dialog__button voy-vCard-dialog__button__back"
                        >
                            <cdx-icon :icon="cdxIconPrevious"></cdx-icon>
                            <span class="voy-vCard-dialog__buttonLabel">Back</span>
                        </cdx-button>
                        <cdx-button
                            action="progressive"
                            weight="primary"
                            aria-label="Publish"
                            v-if="panel === 'preview'"
                            v-tooltip="'Publish your edit'"
                            @click="onPublishAction"
                            class="voy-vCard-dialog__button voy-vCard-dialog__button__publish"
                        >
                            <cdx-icon :icon="cdxIconRecentChanges"></cdx-icon>
                            <span class="voy-vCard-dialog__buttonLabel">Publish</span>
                        </cdx-button>
                    </template>
                </cdx-dialog>
            `,
            computed: {
                indexItems: function() {
                    return this.CATEGORIES.filter( item => item.active );
                }
            },
            setup() {
                /* Utility Functions */
                const fetchLookupResults = ( query, term, offset = null ) => {
                    if (!QUERIES[query]) {
                        console.error( new Error( `Unsupported query: ${query}` ) );
                        return [];
                    }
                    let params = QUERIES[query].params;
                    params[QUERIES[query].termParam] = term;
                    if ( offset ) params.continue = String( offset );
                    return new mw.ForeignApi( query )
                        .get( params )
                        .done( re => re.query.search );
                };

                const open = ref( true ),
                    panel = ref( 'main' ),
                    page = ref( CATEGORIES[0].value ),
                    input = reactive( vCard.params ),
                    lookupSelection = ref( null ),
                    lookupItems = ref( [] );

                const onPrimaryAction = function() {},
                    onUpdateLookupValue = function( query, name ) {
                        return function( value ) {
                            fetchLookupResults( query, value )
                                .then( data => {
                                    if ( input[name].value !== value ) {
                                        return;
                                    }

                                    // Reset the menu items if there are no results.
                                    if ( !data.search || data.search.length === 0 ) {
                                        lookupItems.value = [];
                                        return;
                                    }

                                    // Build an array of menu items.
                                    const results = data.search.map( result => ( {
                                        label: result.title,
                                        value: result.title
                                    }));

                                    // Update menuItems.
                                    lookupItems.value = results;
                                })
                                .catch( () => {
                                    lookupItems.value = [];
                                });
                        };
                    },
                    onLookupLoadMore = function( query, name ) {
                        return function( value ) {
                            //
                        };
                    },
                    onSettingsAction = function() {},
                    onHelpAction = function() {
                        window.open( Config.helpLink, '_blank' );
                    },
                    onNextAction = function() {
                        panel.value = 'preview';
                    },
                    onPublishAction = function() {
                        //
                    };

                // Copied from https://doc.wikimedia.org/codex/latest/icons/all-icons.html
                const cdxIconClose = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><g><path d="m4.34 2.93 12.73 12.73-1.41 1.41L2.93 4.35z"></path><path d="M17.07 4.34 4.34 17.07l-1.41-1.41L15.66 2.93z"></path></g></svg>`,
                    cdxIconSettings = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><g><g xmlns:xlink="http://www.w3.org/1999/xlink" transform="translate(10 10)"><path id="cdx-icon-settings-a" d="M1.5-10h-3l-1 6.5h5m0 7h-5l1 6.5h3"></path><use xlink:href="#cdx-icon-settings-a" transform="rotate(45)"></use><use xlink:href="#cdx-icon-settings-a" transform="rotate(90)"></use><use xlink:href="#cdx-icon-settings-a" transform="rotate(135)"></use></g><path d="M10 2.5a7.5 7.5 0 000 15 7.5 7.5 0 000-15v4a3.5 3.5 0 010 7 3.5 3.5 0 010-7"></path></g></svg>`,
                    cdxIconHelp = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><g><path d="M10.06 1C13 1 15 2.89 15 5.53a4.59 4.59 0 01-2.29 4.08c-1.42.92-1.82 1.53-1.82 2.71V13H8.38v-.81a3.84 3.84 0 012-3.84c1.34-.9 1.79-1.53 1.79-2.71a2.1 2.1 0 00-2.08-2.14h-.17a2.3 2.3 0 00-2.38 2.22v.17H5A4.71 4.71 0 019.51 1a5 5 0 01.55 0"></path><circle cx="10" cy="17" r="2"></circle></g></svg>`,
                    cdxIconNext = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><g><path d="M8.59 3.42 14.17 9H2v2h12.17l-5.58 5.59L10 18l8-8-8-8z"></path></g></svg>`,
                    cdxIconPrevious = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><g><path d="m4 10 9 9 1.4-1.5L7 10l7.4-7.5L13 1z"></path></g></svg>`,
                    cdxIconRecentChanges = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><g><path d="M1 3h16v2H1zm0 6h11v2H1zm0 6h7v2H1zm17.8-3.1 1-1.1a.6.6 0 000-.8L18 8.2a.6.6 0 00-.8 0l-1 1zm-3.3-2L10 15.3V18h2.6l5.6-5.5-2.7-2.7Z"></path></g></svg>`;

                return {
                    open,
                    panel,
                    page,
                    input,
                    lookupSelection,
                    lookupItems,
                    CATEGORIES,
                    onPrimaryAction,
                    onUpdateLookupValue,
                    onLookupLoadMore,
                    onSettingsAction,
                    onHelpAction,
                    onNextAction,
                    onPublishAction,
                    cdxIconClose,
                    cdxIconSettings,
                    cdxIconHelp,
                    cdxIconNext,
                    cdxIconPrevious,
                    cdxIconRecentChanges
                };
            }
        };
    };
    const container = document.createElement( 'div' );
    container.classList.add( [ 'voy-vCard-dialog-container' ] );
    document.body.append( container );

    class VCard {
        /**
         * 
         * @constructor
         * @param {Object} params Parameters of the vCard.
         * @param {Element} elem Element of the vCard.
         * @prop {Object} params Parameters of the vCard.
         * @prop {Element} elem Element of the vCard.
         */
        constructor( params, elem = null ) {
            /** @type {Object} */
            this.params = Object.assign( PARAMS, params );
            /** @type {Element} */
            this.elem = elem;

            if ( elem ) this._addOpenLink( elem );
        };

        /**
         * Add a link to open a dialog.
         * @private
         * @param {Element} elem Element to which the link will be added.
         */
        _addOpenLink( elem ) {
            let link = document.createElement( 'span' );
            link.classList.add( 'listing-metadata-item', 'listing-dialog-button', 'voy-vCard-dialog-link', 'noprint' );
            let button = document.createElement( 'button' );
            button.setAttribute( 'title', '' );
            button.textContent = '詳細';
            button.addEventListener( 'click', e => {
                this.openDialog()
            });
            link.append( button );
            elem.getElementsByClassName( 'listing-metadata-items' )[0].append( link );
        };

        openDialog() {
            createMwApp( dialog( this ) )
                .component( 'CdxButton', Codex.CdxButton )
                .component( 'CdxDialog', Codex.CdxDialog )
                .component( 'CdxField', Codex.CdxField )
                .component( 'CdxIcon', Codex.CdxIcon )
                .component( 'CdxLookup', Codex.CdxLookup )
                .component( 'CdxTextInput', Codex.CdxTextInput )
                .mount( document.getElementById( 'mw-teleport-target' ) );
        };

        /**
         * Parse the element of vCard and generate an instance of VCard class
         * @param {Element} elem div element of the vCard
         * @returns {VCard} Instance of VCard class.
         */
        static parse( elem ) {
            let params = PARAMS;
            return new VCard( params, elem );
        };
    };

    mw.loader.using( [], () => {
        const body = document.getElementsByClassName('mw-body-content')[0];
        const cardElems = body.getElementsByClassName( 'listing-edit' );
        /** @type {Array<VCard>} */
        let cards = [];
        for (const cardElem of cardElems) {
            cards.push( VCard.parse( cardElem ) );
        }
    });

    mw.loader.using( 'mediawiki.util', () => {
        mw.util.addCSS( `
.voy-vCard-dialog .cdx-dialog__header {
    display: flex;
}

.voy-vCard-dialog__title {
    margin: unset;
    border: unset;
    padding: unset;
}

.voy-vCard-dialog__button__close {
    margin-left: auto;
}

.voy-vCard-dialog .cdx-dialog__body {
    height: 100%;
}

.voy-vCard-dialog__panel {
    height: 100%;
}

.voy-vCard-dialog__panel-main {
    display: flex;
}

.voy-vCard-dialog__index {
    padding-right: 24px;
    border-right: 1px solid var(--border-color-subtle, #c8ccd1);
}

.voy-vCard-dialog__index__menu {
    display: flex;
    flex-direction: column;
}

.voy-vCard-dialog__page {
    padding: 8px 24px;
}

.voy-vCard-dialog .cdx-dialog__footer {
    display: flex;
}


.voy-vCard-dialog__buttonLabel {
    display: none;
}

.voy-vCard-dialog__button__next,
.voy-vCard-dialog__button__back {
    margin-left: auto;
}

@media (min-width: 640px) {
    .voy-vCard-dialog {
        height: calc(100% - 2rem);
        max-width: 96rem;
        max-height: unset;
    }

    .voy-vCard-dialog__buttonLabel {
        display: block;
    }
}
        ` )
    });
});