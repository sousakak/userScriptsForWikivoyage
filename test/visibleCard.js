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
        const promises = scribuntos.map( scribunto => {
            return fetchData(scribunto).then( data => {
                setting[scribunto.name] = data;
            });
        });
        return Promise.all(promises).then(() => {
            window.voy = Object.assign(window.voy, { VCardSetting: setting });
            return setting;
        });
    });
})();

mw.loader.using( ['ext.kartographer.box', 'mediawiki.api', 'mediawiki.ForeignApi', 'mediawiki.user', '@wikimedia/codex'] ).then( require => {
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
                    placeholder: true,
                    query: 'commons',
                    config: {
                        visibleItemLimit: 5
                    }
                },
                'commonscat': {
                    title: 'Category on Commons',
                    widget: 'lookup',
                    placeholder: true,
                    query: 'commonscat',
                    config: {
                        visibleItemLimit: 5
                    }
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
                    widget: 'map',
                    type: 'number',
                    max: 90,
                    min: -90,
                    placeholder: true,
                    updmap: true
                },
                'long': {
                    title: 'Longitude',
                    widget: 'input',
                    type: 'number',
                    max: 180,
                    min: -180,
                    placeholder: true,
                    updmap: true
                },
                'zoom': {
                    title: 'Zoom',
                    widget: 'input',
                    type: 'number',
                    max: 19,
                    min: 0,
                    placeholder: true,
                    updmap: true
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
                'type': {
                    title: 'Type',
                    widget: 'input'
                },
                'subtype': {
                    title: 'Subtype',
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
                    title: 'Wikidata',
                    widget: 'lookup',
                    placeholder: true,
                    query: 'wikidata'
                },
                'lastedit': {
                    title: 'Last Edit',
                    widget: 'input',
                    placeholder: true
                },
                'description': {
                    title: 'Description',
                    widget: 'textarea',
                    placeholder: true
                }
            }
        },
        {
            value: 'meta',
            label: 'Meta',
            active: true,
            params: {
                'auto': {
                    title: 'Auto',
                    widget: 'input'
                },
                'show': {
                    title: 'Show',
                    widget: 'input'
                },
                'group': {
                    title: 'Group',
                    widget: 'input'
                },
                'map-group': {
                    title: 'Map Group',
                    widget: 'input'
                },
                'before': {
                    title: 'Before',
                    widget: 'input'
                },
                'styles': {
                    title: 'Styles',
                    widget: 'input'
                },
                'copy-marker': {
                    title: 'Copy Marker',
                    widget: 'input'
                },
                'country': {
                    title: 'Country',
                    widget: 'input'
                },
                'status': {
                    title: 'Status',
                    widget: 'input'
                },
                'section-from': {
                    title: 'Section From',
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
        commonscat: '',
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
        },
        commonscat: {
            url: '//commons.wikimedia.org/w/api.php',
            params: {
                action: 'query',
                format: 'json',
                list: 'search',
                formatversion: 2,
                srnamespace: 14,
                srlimit: 10
            },
            termParam: 'srsearch'
        }
    },
    DEFAULT_OPTIONS = {
        mode: 'view', // ['view', 'edit']
        format: 'inline', // ['inline', 'full-inline', 'block']
        storage: 'wikidata-complementary' // ['wikidata-prioritized', 'wikidata-complementary', 'local-complementary', 'local-prioritized']
    },
    OPTIONS = Object.keys( DEFAULT_OPTIONS ).reduce( ( acc, key ) => {
        const userOption = mw.user.options.get( 'userjs-vcard-' + key );
        acc[key] = userOption ? userOption : DEFAULT_OPTIONS[key];
        return acc;
    }, {} );

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
                    :default-action="defaultAction"
                    :renderInPlace="true"
                    @default="open = true"
                    class="voy-vCard-dialog"
                >
                    <template #header>
                        <h2
                            class="voy-vCard-dialog__title"
                            v-if="panel !== 'settings'"
                        >
                            ${vCard.params.name}
                        </h2>
                        <h2
                            class="voy-vCard-dialog__title"
                            v-if="panel === 'settings'"
                        >
                            Settings
                        </h2>
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
                                    @click="onChangePage(item)"
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
                                    <div
                                        v-if="option.widget === 'map'"
                                        id="voy-vCard-map-container"
                                        class="voy-vCard-map-container"
                                    />
                                    <cdx-field
                                        v-if="['input', 'map'].includes(option.widget)"
                                        :status="statuses[name]"
                                    >
                                        <cdx-text-input
                                            v-model="input[name]"
                                            @blur="onInputBlur(option, name)"
                                            @keydown.enter="onInputBlur(option, name)"
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
                                    <cdx-field
                                        v-if="option.widget === 'textarea'"
                                        :status="statuses[name]"
                                    >
                                        <cdx-text-area
                                            v-model="input[name]"
                                            rows="3"
                                            @blur="onInputBlur(option, name)"
                                        >
                                        </cdx-text-area>
                                        <template #label>
                                            {{ option.title }}
                                        </template>
                                        <template #help-text>
                                            {{ option.guide }}
                                        </template>
                                    </cdx-field>
                                    <!-- Even when user has not finished input, image will be reloaded. So this acesses to commons very often, which should be avoided. -->
                                    <cdx-image
                                        :src="'//commons.wikimedia.org/w/index.php?title=Special:Filepath/' + lookupSelection[name]"
                                        :key="lookupSelection[name]"
                                        alt="No valid image selected"
                                        position="center"
                                        v-if="option.widget === 'image'"
                                    ></cdx-image>
                                    <cdx-field
                                        v-if="['lookup', 'image'].includes(option.widget)"
                                        :status="statuses[name]"
                                    >
                                        <cdx-lookup
                                            v-model:selected="lookupSelection[name]"
                                            v-model:input-value="input[name]"
                                            :menu-items="lookupItems[name] ? lookupItems[name] : []"
                                            :menu-config="option.config"
                                            @blur="onInputBlur(option, name)"
                                            @keydown.enter="onInputBlur(option, name)"
                                            @update:input-value="onUpdateLookupValue(option.query, name, $event)"
                                            @load-more="onLoadLookupMore(option.query, name)"
                                            @update:selected="onLookupSelection"
                                        >
                                            <template #no-results>
                                                No results found.
                                            </template>
                                        </cdx-lookup>
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
                                </template>
                            </div>
                        </template>
                    </div>
                    <div
                        v-if="panel === 'preview'"
                        class="voy-vCard-dialog__panel voy-vCard-dialog__panel-preview"
                    >
                        <cdx-field class="voy-vCard-dialog-minor">
                            <template #label>
                                Additional edit options
                            </template>

                            <cdx-checkbox
                                v-model="isMinor"
                                :inline="true"
                            >
                                This is a minor edit
                            </cdx-checkbox>
                            <cdx-checkbox
                                v-model="watchThisPage"
                                :inline="true"
                            >
                                Watch this page
                            </cdx-checkbox>
                            <cdx-select
                                v-model:selected="watchExpiry"
                                :menu-items="[
                                    { label: 'Permanent', value: 'infinite' },
                                    { label: '1 week', value: '1 week' },
                                    { label: '1 month', value: '1 month' },
                                    { label: '3 months', value: '3 months' },
                                    { label: '6 months', value: '6 months' },
                                    { label: '1 year', value: '1 year' }
                                ]"
                                default-label="Choose an option"
                                :disabled="!watchThisPage"
                            />
                        </cdx-field>
                        <cdx-field class="voy-vCard-dialog-summary">
                            <cdx-text-input
                                v-model="summary"
                                placeholder="Enter the summary of your edit"
                                maxlength=481
                                @input="onSummaryInput"
                            />
                            <template #label>
                                Edit summary
                            </template>
                            <template #description>
                                The text "// via visibleCard" will be added to your summary
                            </template>
                            <template #help-text>
                                <div
                                    class="voy-vCard-dialog-summary__help-text"
                                >
                                    <div class="voy-vCard-dialog-summary__help-text__counter">
                                        {{ 481 - summary.length }}
                                    </div>
                                </div>
                            </template>
                        </cdx-field>
                        <hr />
                        <cdx-accordion
                            @toggle="onLoadPreview"
                            class="voy-vCard-dialog-preview-container"
                        >
                            <template #title>
                                Preview
                            </template>
                            <cdx-progress-indicator
                                v-if="!loadingPreviewCompleted"
                            >
                                Loading preview
                            </cdx-progress-indicator>
                            <div
                                class="voy-vCard-dialog-preview"
                                v-if="loadingPreviewCompleted"
                            >
                                Here's a preview
                            </div>
                        </cdx-accordion>
                    </div>
                    <div
                        v-if="panel === 'settings'"
                        class="voy-vCard-dialog__panel voy-vCard-dialog__panel-settings"
                    >
                        For further information about each setting, please refer to the help page.
                        <cdx-field>
                            <cdx-select
                                v-model:selected="settings.mode"
                                :menu-items="[{ label: 'View Mode', value: 'view' }, { label: 'Edit Mode', value: 'edit' }]"
                                default-label="Choose an option"
                            ></cdx-select>
                            <template #label>
                                Mode
                            </template>
                            <template #description>
                                Select a mode for visibleCard.
                            </template>
                        </cdx-field>
                        <hr />
                        <h3 class="voy-vCard-settings-heading">Edit</h3>
                        <cdx-field
                            :is-fieldset="true"
                        >
                            <template #label>
                                VCard format
                            </template>
                            <cdx-radio
                                :key="'radio-format'"
                                v-model="settings.format"
                                name="radio-group-format"
                                input-value="inline"
                                :disabled="settings.mode !== 'edit'"
                            >
                                Inline
                                <template #description>
                                    Output will not include empty parameters and will be in inline format.
                                </template>
                            </cdx-radio>
                            <cdx-radio
                                :key="'radio-format'"
                                v-model="settings.format"
                                name="radio-group-format"
                                input-value="full-inline"
                                :disabled="settings.mode !== 'edit'"
                            >
                                Full-inline
                                <template #description>
                                    Output will include empty parameters and will be in inline format.
                                </template>
                            </cdx-radio>
                            <cdx-radio
                                :key="'radio-format'"
                                v-model="settings.format"
                                name="radio-group-format"
                                input-value="block"
                                :disabled="settings.mode !== 'edit'"
                            >
                                Block
                                <template #description>
                                    Output will be formatted with newline characters.
                                </template>
                            </cdx-radio>
                            <template #description>
                                Select a format of text output of vCard when you publish your edit.
                            </template>
                        </cdx-field>
                        <cdx-field
                            :is-fieldset="true"
                        >
                            <template #label>
                                Storage of synchronizable data
                            </template>
                            <cdx-radio
                                :key="'radio-storage'"
                                v-model="settings.storage"
                                name="radio-group-storage"
                                input-value="wikidata-prioritized"
                                :disabled="settings.mode !== 'edit'"
                            >
                                Wikidata Prioritized
                                <template #description>
                                    The values including ones you did not edit will be stored in Wikidata whenever possible.
                                </template>
                            </cdx-radio>
                            <cdx-radio
                                :key="'radio-storage'"
                                v-model="settings.storage"
                                name="radio-group-storage"
                                input-value="wikidata-complementary"
                                :disabled="settings.mode !== 'edit'"
                            >
                                Wikidata Complementary (default)
                                <template #description>
                                    The values you updated will be saved to Wikidata if possible.
                                </template>
                            </cdx-radio>
                            <cdx-radio
                                :key="'radio-storage'"
                                v-model="settings.storage"
                                name="radio-group-storage"
                                input-value="local-complementary"
                                :disabled="settings.mode !== 'edit'"
                            >
                                Local Complementary
                                <template #description>
                                    The values you updated will be saved to the local page if possible.
                                </template>
                            </cdx-radio>
                            <cdx-radio
                                :key="'radio-storage'"
                                v-model="settings.storage"
                                name="radio-group-storage"
                                input-value="local-prioritized"
                                :disabled="settings.mode !== 'edit'"
                            >
                                Local Prioritized
                                <template #description>
                                    The values including ones you did not edit will be stored in the local page whenever possible.
                                </template>
                            </cdx-radio>
                            <template #description>
                                You can choose where to save the values primarily when you submit your edit via visibleCard.
                            </template>
                        </cdx-field>
                    </div>

                    <template #footer>
                        <cdx-button-group
                            :buttons="[
                                {
                                    value: 'settings',
                                    label: 'Settings',
                                    icon: cdxIconSettings,
                                    areaLabel: 'Settings',
                                    disabled: panel === 'settings',
                                },
                                {
                                    value: 'help',
                                    label: 'Help',
                                    icon: cdxIconHelp,
                                    areaLabel: 'Help',
                                }
                            ]"
                            @click="if ($event === 'settings') panel = 'settings'; else onHelpAction()"
                        ></cdx-button-group>
                        <cdx-button
                            action="progressive"
                            weight="primary"
                            aria-label="Next"
                            v-if="panel === 'main'"
                            v-tooltip="'Preview and publish your edit'"
                            @click="onNextAction"
                            class="voy-vCard-dialog__button voy-vCard-dialog__button__next"
                            :disabled="options.mode === 'view'"
                        >
                            <span class="voy-vCard-dialog__buttonLabel">Next</span>
                            <cdx-icon :icon="cdxIconNext"></cdx-icon>
                        </cdx-button>
                        <cdx-button
                            action="default"
                            weight="primary"
                            aria-label="Back"
                            v-if="['preview', 'settings'].includes(panel)"
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
                            v-if="panel === 'settings'"
                            v-tooltip="'Save your settings'"
                            @click="onSaveSettingsAction"
                            class="voy-vCard-dialog__button voy-vCard-dialog__button__publish"
                        >
                            <span class="voy-vCard-dialog__buttonLabel">Save</span>
                        </cdx-button>
                        <cdx-button
                            action="progressive"
                            weight="primary"
                            aria-label="Publish"
                            v-if="panel === 'preview'"
                            v-tooltip="'Publish your edit'"
                            @click="onPublishAction"
                            class="voy-vCard-dialog__button voy-vCard-dialog__button__publish"
                            disabled
                        >
                            <cdx-icon :icon="cdxIconRecentChanges"></cdx-icon>
                            <span class="voy-vCard-dialog__buttonLabel">Publish</span>
                        </cdx-button>
                    </template>
                </cdx-dialog>

                <cdx-toast
                    v-if="settingsSaved"
                    type="success"
                    :auto-dismiss="false"
                    @user-dismissed="settingsSaved = false"
                    @auto-dismissed="settingsSaved = false"
                    standalone="true"
                >
                    Your settings have been saved.
                </cdx-toast>
            `,
            computed: {
                indexItems: function() {
                    return this.CATEGORIES.filter( item => item.active );
                }
            },
            methods: {
                observeMap: function() {
                    /* Build external components */
                    const target = document.getElementsByClassName('voy-vCard-dialog__panel-main')[0];
                    const observer = new MutationObserver( mutationList => {
                        for (const mutation of mutationList) {
                            if (mutation.type !== 'childList') continue;
                            if (mutation.addedNodes.length === 0) continue;
                            const children = mutation.addedNodes[0]?.children
                            const container = children
                                ? Array.from( children ).find(
                                    child => child.classList.contains('voy-vCard-map-container')
                                )
                                : null;
                            if (!container) continue;

                            this.createMap( container ); // CAUTION: `this` within arrow function
                        }
                    });
                    observer.observe(target, {
                        childList: true,
                        subtree: true
                    });
                },
                createMap: function( container ) {
                    container.innerHTML = '';

                    const kartoBox = mw.loader.require( 'ext.kartographer.box' );
                    const coord = [this.input['lat'] || 10, this.input['long'] || 100];
                    const map = kartoBox.map( {
                        container: container,
                        captionText: this.input['name'],
                        allowFullScreen: true,
                        data: [],
                        alwaysInteractive: true,
                        center: coord,
                        zoom: this.input['zoom'] || 13,
                        lang: 'en', // this should be personalized
                        fullscreen: false
                    });
                    this.map = map;
                    return map;
                },
                updMap: function( map = this.map ) {
                    const coord = [this.input['lat'] || 0, this.input['long'] || 0];
                    map.setView( coord, this.input['zoom'] || 13 );
                }
            },
            watch: {
                panel: async function(newv, _) {
                    await this.$nextTick();

                    if (newv === 'main') {
                        this.observeMap();

                        if (this.page === 'map') {
                            this.createMap( document.getElementById('voy-vCard-map-container') )
                        };
                    }
                }
            },
            mounted() {
                this.observeMap();
            },
            setup() {
                /* Utility Functions */
                const defaultSelection = () => 
                    CATEGORIES.reduce( (acc, obj) => {
                        for (const [param, values] of Object.entries(obj.params)) {
                            if (['lookup', 'image'].includes(values.widget)) acc[param] = vCard.params[param]
                        }
                        return acc
                    }, {}),
                fetchLookupResults = ( query, term, offset = null ) => {
                    if (!QUERIES[query]) {
                        console.error( new Error( `Unsupported query: ${query}` ) );
                        return [];
                    }
                    let params = { ...QUERIES[query].params };
                    params[QUERIES[query].termParam] = term;
                    if ( offset ) params.sroffset = offset;

                    return new mw.ForeignApi( QUERIES[query].url )
                        .get( params )
                        .then( re => re.query.search );
                };

                /* Define constants */
                const open = ref( true ),
                    panel = ref( 'main' ),
                    page = ref( CATEGORIES[0].value ),
                    input = reactive( vCard.params ),
                    statuses = reactive(
                        Object.keys( PARAMS ).reduce((acc, key) => { acc[key] = 'default'; return acc; }, {} )
                    ),
                    lookupSelection = reactive( defaultSelection() ),
                    lookupItems = reactive( {} ),
                    isMinor = ref( false ),
                    watchThisPage = ref( false ),
                    watchExpiry = ref( 'infinite' ),
                    summary = ref( '' ),
                    loadingPreviewCompleted = ref( false ),
                    settings = reactive( Object.assign( {}, OPTIONS ) ),
                    options = reactive( Object.assign( {}, OPTIONS ) ),
                    settingsSaved = ref( false );

                const onChangePage = function( item ) {
                    page.value = item.value;
                },
                onInputBlur = function( option, name ) {
                    if ( !input[name] ) {
                        statuses[name] = 'default';
                    } else {
                        if ( option.min || option.max ) {
                            if ( !input[name].match(/^-?\d+(?:\.\d+)?$/) ) {
                                statuses[name] = 'error';
                                return;
                            }
                            if ( Number(input[name]) < option.min || Number(input[name]) > option.max ) {
                                statuses[name] = 'error';
                                return;
                            }
                            statuses[name] = 'default';
                        }
                        if ( option.validate ) {
                            statuses[name] = !!String( input[name].match( option.validate ) )
                                ? 'success'
                                : 'error';
                        }
                    }
                    if (option.updmap) this.updMap( this.map );
                },
                onUpdateLookupValue = function( query, name, value ) {
                    fetchLookupResults( query, value )
                        .then( data => {
                            if ( input[name] !== value ) return;

                            // Reset the menu items if there are no results.
                            if ( !data || data.length === 0 ) {
                                lookupItems[name] = [];
                                return;
                            }

                            // Build an array of menu items.
                            const results = data.map( result => ( {
                                label: result.title,
                                value: result.title
                            }));

                            // Update menuItems.
                            lookupItems[name] = results;
                        })
                        .catch( () => {
                            lookupItems[name] = [];
                        });
                },
                onLoadLookupMore = function( query, name = '' ) {
                    if ( !input[name] ) return;

                    fetchLookupResults( query, input[name], lookupItems[name].length )
                        .then( data => {
                            if ( !data || data.length === 0 ) return;

                            const results = data.map( result => ( {
                                label: result.title,
                                value: result.title
                            }));

                            lookupItems[name] = lookupItems[name].concat( results );
                        });
                },
                onLookupSelection = function() {
                    // lookupSelection
                },
                onSummaryInput = function() {
                    console.log( 481 - summary.value.length )
                    console.warn( summary.value.slice(0, 482) )
                    if (481 - summary.value.length < 0) summary.value = summary.value.slice(0, 482);
                },
                onLoadPreview = function(isOpen) {
                    if (!isOpen) {
                        loadingPreviewCompleted.value = false;
                        return;
                    }
                    // Load preview here
                    //loadingPreviewCompleted.value = true
                },
                onHelpAction = function() {
                    window.open( Config.helpLink, '_blank' );
                },
                onNextAction = function() {
                    panel.value = 'preview';
                },
                onSaveSettingsAction = function() {
                    const api = new mw.Api();
                    const promises = Object.keys(settings).map( setting => {
                        mw.user.options.set( 'userjs-vcard-' + setting, settings[setting] );
                        options[setting] = settings[setting];
                        return api.saveOption('userjs-vcard-' + setting, settings[setting]);
                    });

                    Promise.all(promises)
                        .then(() => {
                            console.log('saved')
                            settingsSaved.value = true;
                            panel.value = 'main';
                        })
                        .catch(function(err) {
                            console.log("保存失敗", err);
                        });
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
                    statuses,
                    lookupSelection,
                    lookupItems,
                    isMinor,
                    watchThisPage,
                    watchExpiry,
                    summary,
                    settings,
                    options,
                    settingsSaved,
                    CATEGORIES,
                    onChangePage,
                    onInputBlur,
                    onUpdateLookupValue,
                    onLoadLookupMore,
                    onLookupSelection,
                    onSummaryInput,
                    onLoadPreview,
                    onHelpAction,
                    onNextAction,
                    onSaveSettingsAction,
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
            this.params = Object.assign( {}, PARAMS, params );
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
            button.addEventListener( 'click', _ => {
                this.openDialog()
            });
            link.append( button );
            elem.getElementsByClassName( 'listing-metadata-items' )[0].append( link );
        };

        openDialog() {
            const container = document.createElement( 'div' );
            container.classList.add( [ 'voy-vCard-dialog-container' ] );
            document.getElementById( 'mw-teleport-target' ).append( container );
            createMwApp( dialog( this ) )
                .component( 'CdxButton', Codex.CdxButton )
                .component( 'CdxDialog', Codex.CdxDialog )
                .component( 'CdxField', Codex.CdxField )
                .component( 'CdxIcon', Codex.CdxIcon )
                .component( 'CdxTextInput', Codex.CdxTextInput )
                .component( 'CdxTextArea', Codex.CdxTextArea )
                .component( 'CdxImage', Codex.CdxImage )
                .component( 'CdxLookup', Codex.CdxLookup )
                .component( 'CdxCheckbox', Codex.CdxCheckbox )
                .component( 'CdxSelect', Codex.CdxSelect )
                .component( 'CdxAccordion', Codex.CdxAccordion )
                .component( 'CdxProgressIndicator', Codex.CdxProgressIndicator )
                .component( 'CdxRadio', Codex.CdxRadio )
                .component( 'CdxButtonGroup', Codex.CdxButtonGroup )
                .component( 'CdxTooltip', Codex.CdxTooltip  )
                .component( 'CdxToast', Codex.CdxToast  )
                .mount( container );
        };

        /**
         * Parse the element of vCard and generate an instance of VCard class
         * @param {Element} elem div element of the vCard
         * @returns {VCard} Instance of VCard class.
         * 
         * @note params already covered:
         * - name
         * - name-local
         * - name-latin
         * - comment
         * - type
         * - subtype
         * - address
         * - address-local
         * - directions
         * - directions-local
         * - skype
         * - wikipedia
         * - wikidata
         * - commons
         * - url
         * - group
         * - phone
         * - tollfree
         * - mobile
         * - fax
         * - email
         * - social medias
         * - hours
         * - checkin
         * - checkout
         * - payment
         * - price
         * - description
         * - country
         * 
         * No support:
         * - name-map
         * - alt
         * - lat
         * - long
         * - zoom
         * - auto
         * - show
         * - map-group
         * - image
         * - before
         * - lastedit
         * - styles
         * - copy-marker
         * - status
         * - section-from
         */
        static parse( elem ) {
            let params = {};
            for (const child of elem.getElementsByTagName('*')) {
                child.classList?.forEach( c => {
                    const match = c.match(/^listing-(\D+)$/)?.[1]; // this can be undefined
                    if (!match) return;
                    const matchSister = match.match(/^sister-(\D+)$/)?.[1]
                    const matchSM = match.match(/^social-media-(\D+)$/)?.[1]
                    switch ( match ) {
                        case 'content': params['description'] = child.textContent; break;
                        case 'credit': params['payment'] = child.textContent; break;
                    }
                    if (
                        Object.keys( PARAMS ).includes( match ) &&
                        !Object.keys( params ).includes( match )
                    ) {
                        params[match] = child.textContent;
                    } else if (
                        Object.keys( PARAMS ).includes( matchSister ) &&
                        !Object.keys( params ).includes( matchSister )
                    ) {
                        params[match] = child.textContent;
                    } else if (
                        Object.keys( PARAMS ).includes( matchSM ) &&
                        !Object.keys( params ).includes( matchSM )
                    ) {
                        params[match] = child.textContent;
                    }
                });
            }
            for (const data in elem.dataset) {
                if ( // If the data attribute is included in PARAMS
                    Object.keys( PARAMS )
                        .includes( data.replace( /([A-Z])/g, "-$1" ).toLowerCase() )
                ) params[data.replace( /([A-Z])/g, "-$1" ).toLowerCase()] = elem.dataset[data];
            }
            return new VCard( params, elem );
        };
    };

    mw.loader.using( [], () => {
        const body = document.getElementsByClassName('mw-body-content')[0];
        const cardElems = body.getElementsByClassName( 'listing-edit' );
        /** @type {Array<VCard>} */
        let cards = [];
        for (let cardElem of cardElems) {
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
    flex-grow: 0;
}

.voy-vCard-dialog__index__menu {
    display: flex;
    flex-direction: column;
}

.voy-vCard-dialog__page {
    padding: 8px 24px;
    flex-grow: 1;
    overflow-y: scroll;
}

.voy-vCard-map-container {
    height: 50%;
}

.voy-vCard-dialog-summary__help-text {
    display: flex;
    justify-content: space-between;
}

.voy-vCard-dialog-summary__help-text__counter {
    margin-left: auto;
}

.voy-vCard-dialog-preview-container > .cdx-accordion__content {
    text-align: center;
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