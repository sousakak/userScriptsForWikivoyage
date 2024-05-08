// <source lang="javascript">
// 完成状況 : 編集段階
// 当スクリプトは編集段階です。使用してもエラーが出る可能性が高く、未完成です。
/******************************************************************************/
// ja>>visibleCard
//   >>vCardの詳細情報を簡単に表示・編集できるツール
//   >>
//   >>作者    : Tmv
//   >>URL     : https://ja.wikivoyage.org/w/index.php?title=User:Tmv/custom/visibleCard.js
//   >>原典    : 以下の関数を下記より移入：
//   >>>    原典URL : https://de.wikivoyage.org/w/index.php?oldid=1614181
//   >>>    作者 : RolandUnger、Wrh2、Torty3、DerFussi、Globe-trotter、Krinkle、Alex Monk (WMF)、Nurg
//   >>>        function findSectionIndex()
//   >>>        function markHeaders()
//   >>
//   >>使用方法
//   >>[[Special:MyPage/common.js]]に以下のコードを追加 : 
//   >>mw.loader.load('//ja.wikivoyage.org/w/index.php?title=User:Tmv/custom/visibleCard.js&action=raw&ctype=text/javascript');
/******************************************************************************/
mw.loader.using( [ 'oojs', 'oojs-ui', 'mediawiki.ForeignApi', 'mediawiki.user' ] , function() {
    const Config = function() {
        /* Please translate and customize the following */
        const TEMPLATES = [ 'vCard', 'listing', 'go', 'see', 'do', 'buy', 'drink', 'eat', 'sleep' ],
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
                event: {
                    frequency: '',
                    date: '',
                    month: '',
                    year: '',
                    enddate: '',
                    endmonth: '',
                    endyear: '',
                    location: ''
                }
            },
            TRANSLATIONS = {
                en: {
                    catLabelAccess: "Access",
                    catLabelEntree: "Entree",
                    catLabelImages: "Images",
                    catLabelMap: "Map",
                    catLabelContact: "Contact",
                    catLabelOthers: "Others",
                    catLabelHidden: "Preferences",
                    catDescriptionAccess: "Info about the location",
                    catDescriptionEntree: "Info for visitors and participants",
                    catDescriptionImages: "",
                    catDescriptionMap: "",
                    catDescriptionContact: "Info to contact",
                    catDescriptionOthers: "Other information",
                    catDescriptionHidden: "Other template parameters",
                    dialogButtonClose: "Close",
                    dialogButtonSave: "Save",
                    dialogButtonToggle: "Menu",
                    dialogButtonDelete: "Delete",
                    dialogButtonConfig: "Settings",
                    errorInvalidDataSource: "Type of the data source is invalid",
                    errorInvalidWidget: "Unknown widget",
                    errorLabelNotExist: "The label text does not exist",
                    labelName: "Name",
                    "labelName-local": "Local Name",
                    "labelName-latin": "Latin Name",
                    "labelName-map": "Name On Map",
                    labelAlt: "Alt",
                    labelComment: "Comment",
                    labelType: "Type",
                    labelSubtype: "Subtype",
                    labelAddress: "Address",
                    "labelAddress-local": "Local Address",
                    labelDirections: "Directions",
                    "labelDirections-local": "Local Directions",
                    labelLat: "Latitude",
                    labelLong: "Longitude",
                    labelZoom: "Zoom",
                    labelWikidata: "Wikidata",
                    labelAuto: "Auto",
                    labelCommons: "Commons",
                    labelUrl: "Url",
                    labelShow: "Show",
                    labelGroup: "Group",
                    "labelMap-group": "Map Group",
                    labelImage: "Image",
                    labelPhone: "Phone",
                    labelTollfree: "Tollfree",
                    labelMobile: "Mobile Phone",
                    labelFax: "Fax",
                    labelEmail: "Email",
                    labelHours: "Hours",
                    labelCheckin: "Checkin",
                    labelCheckout: "Checkout",
                    labelPayment: "Payment",
                    labelPrice: "Price",
                    labelDescription: "Content",
                    labelBefore: "Prefix",
                    labelLastedit: "Date of Last Edit",
                    labelStyles: "CSS Style",
                    "labelCopy-marker": "Copy-Marker",
                    labelCountry: "Country",
                    labelStatus: "Status",
                    "labelSection-from": "Source Section",
                    linkOpen: "More",
                    placeholderName: "Name of this vCard",
                    "placeholderName-local": "Name in local tongue",
                    "placeholderName-latin": "Name in latin",
                    "placeholderName-map": "Name in map",
                    placeholderAlt: "Alias of this vCard",
                    placeholderComment: "Note about the name",
                    placeholderAddress: "Address of this vCard",
                    "placeholderAddress-local": "Address in local tongue",
                    placeholderDirections: "How to get the place",
                    "placeholderDirections-local": "How to access in local tongue",
                    placeholderHours: "Open hours of this vCard",
                    placeholderCheckin: "Check-in time",
                    placeholderCheckout: "Check-out time",
                    placeholderPayment: "Acceptable methods to pay",
                    placeholderPrice: "How much this costs",
                    placeholderCommons: "Category in commons",
                    placeholderLat: "Latitude of this vCard",
                    placeholderLong: "Longitude of this vCard",
                    placeholderZoom: "Zoom level when marker link clicked",
                    placeholderUrl: "Official website of this vCard",
                    placeholderPhone: "Phone number of this vCard",
                    placeholderTollfree: "Toll-free or freephone number",
                    placeholderMobile: "Mobile phone number",
                    placeholderFax: "Fax number of this vCard",
                    placeholderEmail: "Mail address of this vCard",
                    placeholderSubtype: "Subtype: additional info",
                    placeholderWikidata: "Wikidata item of this vCard",
                    placeholderDescription: "Description of this vCard",
                    placeholderLastedit: "Date of last update",
                    titleLinkOpen: "Display more info for this vCard"
                },
                /* 
                ja: {
                    catLabelAccess: "場所",
                    catLabelEntree: "利用",
                    catLabelImages: "画像",
                    catLabelMap: "地図",
                    catLabelContact: "連絡",
                    catLabelOthers: "その他",
                    catLabelHidden: "設定",
                    catDescriptionAccess: "場所についての情報",
                }
                */
            },
            CATEGORIES = {
                /* 
                    widget
                    type
                    ----
                    buttons
                    icon
                    placeholder (boolean)
                    label (boolean)
                    max (number)
                    min (number)
                    note (boolean)
                    title (boolean)
                    validate
                */
                Access: {
                    label: true,
                    description: true,
                    params: {
                        'name': {
                            widget: 'input',
                            placeholder: true
                        },
                        'name-local': {
                            widget: 'input',
                            placeholder: true
                        },
                        'name-latin': {
                            widget: 'input',
                            placeholder: true
                        },
                        'name-map': {
                            widget: 'input',
                            placeholder: true
                        },
                        'alt': {
                            widget: 'input',
                            placeholder: true
                        },
                        'comment': {
                            widget: 'input',
                            placeholder: true
                        },
                        'address': {
                            widget: 'input',
                            placeholder: true
                        },
                        'address-local': {
                            widget: 'input',
                            placeholder: true
                        },
                        'directions': {
                            widget: 'input',
                            placeholder: true
                        },
                        'directions-local': {
                            widget: 'input',
                            placeholder: true
                        }
                    }
                },
                Entree: {
                    label: true,
                    description: true,
                    params: {
                        'hours': {
                            widget: 'input',
                            placeholder: true
                        },
                        'checkin': {
                            widget: 'input',
                            placeholder: true
                        },
                        'checkout': {
                            widget: 'input',
                            placeholder: true
                        },
                        'payment': {
                            widget: 'input',
                            placeholder: true
                        },
                        'price': {
                            widget: 'input',
                            placeholder: true
                        }
                    }
                },
                Images: {
                    label: true,
                    description: true,
                    params: {
                        'image': {
                            widget: 'image',
                        },
                        'commons': {
                            widget: 'lookup',
                            placeholder: true,
                            query: 'commons'
                        }
                    }
                },
                Map: {
                    label: true,
                    description: true,
                    params: {
                        'lat': {
                            widget: 'input',
                            type: 'number',
                            max: 90,
                            min: -90,
                            placeholder: true
                        },
                        'long': {
                            widget: 'input',
                            type: 'number',
                            max: 180,
                            min: -180,
                            placeholder: true
                        },
                        'zoom': {
                            widget: 'input',
                            type: 'number',
                            max: 19,
                            min: 0,
                            placeholder: true
                        }
                    }
                },
                Contact: {
                    label: true,
                    description: true,
                    params: {
                        'url': {
                            widget: 'input',
                            placeholder: true,
                            validate: /^https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+\/?$/
                        },
                        'phone': {
                            widget: 'input',
                            placeholder: true,
                            validate: /^\+?[0-9\s]{1,4}([-\s]?[0-9]{1,4})*(\uff08.+?\uff09)?([,\u3001]\s?\+?[0-9]{1,4}(\-[0-9]{1,4})*)*$/
                        },
                        'tollfree': {
                            widget: 'input',
                            placeholder: true
                        },
                        'mobile': {
                            widget: 'input',
                            placeholder: true,
                            validate: /^0[5789]0[-\s]?\d{4}[-\s]?\d{4}$/
                        },
                        'fax': {
                            widget: 'input',
                            placeholder: true
                        },
                        'email': {
                            widget: 'input',
                            placeholder: true,
                            validate: /^[\w\+\-]+(.[\w\+\-]+)*@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/
                        }
                    }
                },
                //Events: {
                    //label: "イベント",
                    //params: Object.keys(PARAMS.event)
                //},
                Others: {
                    label: true,
                    description: true,
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
                Hidden: {
                    label: true,
                    description: true,
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
            },
            DATAS = {
                name              : '.listing-name',
                "name-local"      : 'data-name-local',
                "name-latin"      : '.listing-name-latin',
                "name-map"        : 'data-name',
                alt               : '.listing-alt',
                comment           : '.listing-comment',
                address           : '.listing-address',
                "address-local"   : 'data-address-local',
                directions        : '.listing-directions',
                "directions-local": 'data-directions-local',
                hours             : '.listing-hours',
                checkin           : '.listing-checkin',
                checkout          : '.listing-checkout',
                payment           : '.listing-payment',
                price             : '.listing-price',
                image             : 'data-image',
                commons           : 'data-commonscat',
                lat               : ['data-lat', '.mw-kartographer-maplink'],
                long              : ['data-lon', '.mw-kartographer-maplink'],
                zoom              : ['data-zoom', '.mw-kartographer-maplink'],
                url               : 'data-url',
                phone             : ['data-phone', '.listing-landline .listing-phone-number'],
                tollfree          : ['data-phone', '.listing-tollfree .listing-phone-number'],
                mobile            : ['data-phone', '.listing-mobile .listing-phone-number'],
                fax               : ['data-phone', '.listing-fax .listing-phone-number'],
                email             : '.listing-email a',
                subtype           : 'data-subtype',
                wikidata          : 'data-wikidata',
                description       : '.listing-content',
                lastedit          : '.listing-lastedit',

                type              : 'data-type',
                // auto           : '',
                // show           : '',
                group             : 'data-group',
                "map-group"       : 'data-map-group',
                prefix            : '.listing-before',
                // styles         : ['style', '.listing-name'],
                // copy-marker    : '',
                country           : 'data-country',
                // status         : ['class', '.listing-status'],
                // section-from   : ''
            },
            OTHERS = {
                en: {
                    lasteditRegex: /(?<month>[a-zA-Z]+?)\s(?<year>\d{4})/,
                    lasteditMonth: {
                        Jan: '1', Feb: '2', Mar: '3', Apr: '4',
                        May: '5', Jun: '6', Jul: '7', Aug: '8',
                        Sep: '9', Oct: '10', Nov: '11', Dec: '12'
                    }
                },
                ja: {
                    lasteditRegex: /(?<year>\d{4})\u5E74(?<month>\d{2})\u6708/
                }
            };
        let OPTIONS = { // default options that user can override
            lookupItemLimit: 5,
            mode: 'view', // 'view' | 'mini' | 'edit'
            textareaLine: 5
        };
        /* Please translate and customize the above */

        /* Here are constants and functions for system, which need no customization */
        for (let option in OPTIONS) {
            let userOption = mw.user.options.get( 'voy-vCard-' + option );
            if (userOption !== null) {
                OPTIONS[option] = userOption;
            }
        }

        const SYSTEM = {
            version: '0.0.0',
            lang: mw.config.get( 'wgUserLanguage' ) in TRANSLATIONS
                ? mw.config.get( 'wgUserLanguage' )
                : 'en',
            contentLang: mw.config.get( 'wgPageContentLanguage' ) in OTHERS
                ? mw.config.get( 'wgPageContentLanguage' )
                : 'en'
        };
        /* System settings end */

        return {
            TEMPLATES: TEMPLATES,
            PARAMS: PARAMS,
            CATEGORIES: CATEGORIES,
            TRANSLATIONS: TRANSLATIONS[SYSTEM.lang],
            DATAS: DATAS,
            OTHERS: OTHERS[SYSTEM.contentLang],
            OPTIONS: OPTIONS,
            SYSTEM: SYSTEM
        };
    }();

    const Utils = function() {
        const capitalize = function( str ) {
            if (typeof str !== 'string' || !str) return str;
            return str.charAt(0).toUpperCase() + str.slice(1);
        };

        const error = function( msg, extra = null ) {
            let extraMsg = (extra !== null) ? ': ' + extra : '';
            console.error(Config.TRANSLATIONS['error' + capitalize(msg)] + extraMsg);
        };

        const setUserOptions = function( options ) {
            for (let option in options) {
                if (options[option] !== Config.OPTIONS[option]) {
                    mw.user.options.set( 'voy-vCard-' + option, options[option] );
                }
            }
        };

        return {
            capitalize: capitalize,
            error: error,
            setUserOptions: setUserOptions
        };
    }();

    class vCard {
        /* 
            Arguments
                parameters  (Object) : object of key-value set with the template parameter name
                                        in key and its value in value.

            Variables
                name        (String) : name of the vCard
                params      (Object) : parameters of the vCard
                color       (String) : CSS-hexadecimal color code for the vCard
                catedParams (Object) : object including lists of valid parameters sorted by categories

            Functions
                newValue( p: Object ): void : set a new value `p.value` to the parameter `p.param`
                catLabel( cat: String ): String : returns the label for cat
                catDesc( cat: String ): String : returns the description for cat
                generatePage( cat, values ): jQuery : generate a page for the category.
                        values is a table including all template values with key of parameter name
                        and value of template value.
                generatePages( values ): OO.ui.PageLayout[] : 
        */
        constructor(parameters, color) {
            if (!parameters.name) {
                throw new Error('Could not get vCard name');
            }
            this.params = Config.PARAMS;

            this.name = parameters.name;
            Object.assign(this.params, parameters);
            this.color = color || 'transparent';
        }

        get catedParams() {
            let catedParams = {};
            for (let cat in Config.CATEGORIES) {
                catedParams[cat] = [];
                for (let param in Config.CATEGORIES[cat].params) {
                    if (this.params[param] !== '') {
                        catedParams[cat].push(param);
                    }
                }
            }
            return catedParams;
        }

        newValue( p ) {
            this.params[p.param] = p.value;
        }

        catLabel( cat ) {
            if (Config.CATEGORIES[cat].label)
                return Config.TRANSLATIONS['catLabel' + cat];
            else
                return null;
        }

        catDesc( cat ) {
            if (Config.CATEGORIES[cat].description)
                return Config.TRANSLATIONS['catDescription' + cat];
            else
                return null;
        }

        _generateImage( config ) {
            let value = config.value || "No image.svg";
            value = value.substring( value.indexOf(":") + 1 );
            return new OO.ui.Element( {
                $element: $( `<figure typeof="mw:File/Thumb"></figure>` ),
                classes: [ 'mw-halign-left', 'voy-vCard-dialog-image' ],
                content: [ new OO.ui.HtmlSnippet(`
                    <a
                        href="${ mw.config.get( 'wgArticlePath' ).replace( '$1', "File:" + value ) }"
                        class="mw-file-description voy-vCard-dialog-image-description"
                        title=""
                    >
                        <img
                            src="//commons.wikimedia.org/w/index.php?title=Special:Filepath/${ value }"
                            decoding="async"
                            class="mw-file-element voy-vCard-dialog-image-element"
                        >
                    </a>
                    <figcaption class="voy-vCard-dialog-image-caption">
                        ${ config.caption || config.value }
                    </figcaption>
                `)]
            });
        }

        _generateInput( config ) { // private method with '#' doesn't work on MediaWiki
            /* create a widget by type */
            if (config.type === 'multiline' || config.widget === 'textarea') {
                return  new OO.ui.MultilineTextInputWidget( {
                    icon: config.icon || undefined,
                    maxLength: config.max || undefined,
                    minLength: config.min || undefined,
                    placeholder: config.placeholder || undefined,
                    readOnly: (Config.OPTIONS.mode !== 'edit'),
                    rows: Config.OPTIONS.textareaLine,
                    title: config.title || config.placeholder || undefined,
                    validate: config.validate || (_ => true),
                    value: config.value || ''
                });
            } else if (config.type === 'number') {
                return new OO.ui.NumberInputWidget( {
                    icon: config.icon || undefined,
                    max: config.max || undefined,
                    min: config.min || undefined,
                    placeholder: config.placeholder || undefined,
                    readOnly: (Config.OPTIONS.mode !== 'edit'),
                    showButtons: config.buttons || false,
                    title: config.title || undefined,
                    validate: config.validate || (_ => true),
                    value: config.value || null
                });
            } else {
                return new OO.ui.TextInputWidget({
                    icon: config.icon || undefined,
                    maxLength: config.max || undefined,
                    minLength: config.min || undefined,
                    placeholder: config.placeholder || undefined,
                    readOnly: (Config.OPTIONS.mode !== 'edit'),
                    title: config.title || undefined,
                    validate: config.validate || undefined,
                    value: config.value || ''
                });
            }
        }

        _generateLookup( config ) {
            function LookupWidget( config ) {
                OO.ui.TextInputWidget.call( this, {
                    icon: config.icon || undefined,
                    maxLength: config.max || undefined,
                    minLength: config.min || undefined,
                    placeholder: config.placeholder || undefined,
                    readOnly: (Config.OPTIONS.mode !== 'edit'),
                    title: config.title || undefined,
                    validate: config.validate || undefined,
                    value: config.value || ''
                });
                OO.ui.mixin.LookupElement.call( this, config );
            }
            OO.inheritClass( LookupWidget, OO.ui.TextInputWidget );
            OO.mixinClass( LookupWidget, OO.ui.mixin.LookupElement );
            LookupWidget.prototype.getLookupRequest = function () {
                var value = this.getValue(),
                    deferred = $.Deferred(),
                    delay = 250 + Math.floor( Math.random() * 250 );
                if (value === '') {
                    deferred.resolve( [] );
                } else {
                    ( function () {
                        let url;
                        let params;
                        let callback;
                        switch (config.query) {
                            case 'wikidata':
                                url = '//www.wikidata.org/w/api.php';
                                params = {
                                    action: "wbsearchentities",
                                    format: "json",
                                    limit: String(Config.OPTIONS.lookupItemLimit),
                                    language: Config.SYSTEM.lang,
                                    search: value
                                };
                                callback = function( data ) {
                                    return data.search.map( result => {
                                        return {
                                            label: result.label,
                                            value: result.id
                                        };
                                    });
                                };
                                break;
                            case 'commons':
                                url = '//commons.wikimedia.org/w/api.php';
                                params = {
                                    action: "opensearch",
                                    format: "json",
                                    formatversion: "2",
                                    limit: String(Config.OPTIONS.lookupItemLimit),
                                    namespace: "14",
                                    redirects: "resolve",
                                    search: value
                                };
                                callback = function( data ) {
                                    return data[1].map( result => {
                                        return {
                                            label: result,
                                            value: result
                                        };
                                    });
                                };
                                break;
                        }
                        new mw.ForeignApi( url ).get( params ).then( function( data ) {
                            setTimeout( function () {
                                deferred.resolve(
                                    callback( data )
                                );
                            }, delay );
                        });
                    })();
                }
                return deferred.promise( { abort: function () {} } );
            };
            LookupWidget.prototype.getLookupCacheDataFromResponse = function ( response ) {
                return response || [];
            };
            LookupWidget.prototype.getLookupMenuOptionsFromData = function ( data ) {
                return data.map( item => {
                    return new OO.ui.MenuOptionWidget( {
                        data: item.value,
                        label: item.label
                    });
                });
            };
            return new LookupWidget( config );
        }

        _generateSelect( config ) {
            if (Config.OPTIONS.mode === 'edit') {
                return new OO.ui.MenuTagMultiselectWidget( {
                    allowArbitrary: false,
                    allowReordering: true,
                    icon: config.icon || undefined,
                    options: config.options || [],
                    placeholder: config.placeholder || undefined,
                    readOnly: (Config.OPTIONS.mode !== 'edit'),
                    selected: config.value || [],
                    title: config.title || undefined
                });
            } else {
                return this._generateInput( config );
            }
        }

        generatePage( cat, values ) {
            let catConfig = Config.CATEGORIES[cat];
            let element = [];
            function getTranslatedString( table, part, param ) {
                if (table[part]) {
                    return Config.TRANSLATIONS[part + Utils.capitalize( param )];
                }
                return table[part];
            }

            for (let param in catConfig.params) {
                let paramConfig = catConfig.params[param];
                paramConfig.param = param;
                paramConfig.note = getTranslatedString(paramConfig, 'note', param);
                paramConfig.placeholder = getTranslatedString(paramConfig, 'placeholder', param);
                paramConfig.title = getTranslatedString(paramConfig, 'title', param);
                paramConfig.value = values[param];
                /* Fill in the label */
                let transl = 'label' + Utils.capitalize( paramConfig.param );
                if (
                    paramConfig.label === undefined
                    && Config.TRANSLATIONS[transl] !== undefined
                ) {
                    paramConfig.label = Config.TRANSLATIONS[transl];
                } else if (
                    paramConfig.label === undefined
                    && Config.TRANSLATIONS[transl] === undefined
                ) {
                    Utils.error( 'labelNotExist' );
                }
                /* Generate widgets and put those into the field layout */
                switch (paramConfig.widget) {
                    case 'image':
                        element.push(
                            this._generateImage( paramConfig )
                        );
                        break;
                    case 'input':
                    case 'textarea':
                        element.push(
                            new OO.ui.FieldLayout(
                                this._generateInput( paramConfig ),
                                {
                                    align: 'top',
                                    classes: [ 'voy-vCard-dialog-field' ],
                                    label: paramConfig.label,
                                    notices: (paramConfig.note !== undefined)
                                        ? [paramConfig.note]
                                        : undefined
                                }
                            )
                        );
                        break;
                    case 'lookup':
                        element.push(
                            new OO.ui.FieldLayout(
                                this._generateLookup( paramConfig ),
                                {
                                    align: 'top',
                                    classes: [ 'voy-vCard-dialog-field' ],
                                    label: paramConfig.label,
                                    notices: (paramConfig.note !== undefined)
                                        ? [paramConfig.note]
                                        : undefined
                                }
                            )
                        );
                        break;
                    case 'select':
                        element.push(
                            new OO.ui.FieldLayout(
                                this._generateSelect( paramConfig ),
                                {
                                    align: 'top',
                                    classes: [ 'voy-vCard-dialog-field' ],
                                    label: paramConfig.label,
                                    notices: (paramConfig.note !== undefined)
                                        ? [paramConfig.note]
                                        : undefined
                                }
                            )
                        );
                        break;
                    default:
                        Utils.error( 'invalidWidget', paramConfig.widget );
                }
            }
            let fieldBody = new OO.ui.FieldsetLayout( { 
                label: this.catDesc( cat ),
                classes: [ 'voy-vCard-dialog-fieldset', 'voy-vCard-dialog-' + cat.toLowerCase() ]
            }).addItems( element );

            return fieldBody.$element;
        }

        generatePages( values = this.params ) {
            let pages = [];
            let self = this;
            for (let cat in Config.CATEGORIES) {
                let item = this.generatePage( cat, values );
                let PageLayout = function( name, config ) {
                    PageLayout.super.call( this, name, config );
                    this.$element.append( item );
                };
                OO.inheritClass( PageLayout, OO.ui.PageLayout );
                PageLayout.prototype.setupOutlineItem = function () {
                    this.outlineItem.setLabel( self.catLabel( cat ) );
                };
                pages.push(
                    new PageLayout(
                        self.catLabel( cat ),
                        {
                            classes: [ 'voy-vCard-dialog-page', 'voy-vCard-dialog-page-'+cat.toLowerCase() ]
                        }
                    )
                );
            }
            return pages;
        }
    }

    /**
     * Core function loaded after initializing that add click event
     * and process values includeing both of local one and one in Wikidata.
     * 
     * @todo This function is not completed.
     * @example
     * // add click event to button elements in `.voy-vCard-dialog-link`
     * core( $('.voy-vCard-dialog-link'), 'button' );
     * @param {(jQuery.Object | String)[]} buttonElems
     * see documentation of return value of initializer function
     * @returns {void}
     */
    const core = function( buttonElems ) {
        console.log( buttonElems )

        /**
         * Get values from data attributes of vCard element.
         * 
         * @param {jQuery.Object} container
         * the jQuery object which is a container element of vCard.
         * @returns {Object}
         * Object of unformatted values to pass to the constructor of vCard class.
         */
        const getValues = function( container ) {
            let values = {};

            /**
             * Detect the source of data and return source type.
             * 
             * @param {String | String[]} source 
             * @returns {String} 'child' | 'class' | 'id' | 'attr'
             */
            const detectSource = function( source ) {
                if ( typeof( source ) === 'object' || Array.isArray( source ) ) {
                    return 'child';
                } else if ( source.startsWith( '.' ) ) {
                    return 'class';
                } else if ( source.startsWith( '#' ) ) {
                    return 'id';
                } else {
                    return 'attr';
                }
            };

            for ( let param in Config.DATAS ) {
                const source = Config.DATAS[param];
                let value;
                switch ( detectSource(source) ) {
                    case 'child':
                        value = container.find( source[1] ).attr( source[0] );
                        break;
                    case 'class':
                    case 'id':
                        value = container.find( source ).text() || null;
                        break;
                    case 'attr':
                        value = container.attr( source ) || null;
                        break;
                    default:
                        Utils.error( 'invalidDataSource' );
                }
                values[param] = value;
            }

            console.log( values )

            return values;
        };

        /**
         * Format row values retrieved from DOM or source text in wikitext.
         * Comma-separated strings will be converted to lists.
         * 
         * @param { {[key: String]: String} } rowValues
         * Object of row values retrieved from DOM elements or source wikitext.
         * @returns { {[key: String]: String | String[]} }
         * Formatted values
         */
        const formatValues = function( rowValues ) {
            let values = {};

            const paramType = function( param ) {
                if ( typeof( param ) === 'object' ) {
                    return Array.isArray( param ) ? 'array' : 'object';
                }
                return typeof( param );
            };

            for ( let param in rowValues ) {
                let rowValue = rowValues[param];
                let value;

                if ( [ undefined, null ].includes( rowValue ) ) {
                    rowValue = '';
                }

                switch (paramType( Config.PARAMS[param] ) ) {
                    case 'string':
                        value = rowValue;
                        break;
                    case 'array':
                        console.log( rowValue )
                        value = rowValue.split( ',' ).map( ( item ) => {
                            return item.trim();
                        });
                        break;
                    default:
                        value = rowValue;
                }

                values[param] = value;
            }

            return values;
        };

        /**
         * Create dialog class inheriting {OO.ui.ProcessDialog}, set content into it,
         * and then open dialog after prepare a few buttons for edit and config.
         * 
         * @param {vCard} vCard Instance of vCard class, which contain values of vCard
         * and some function to create content of dialog.
         */
        function openDialog( vCard ) {
            function vCardDialog( config ) {
                vCardDialog.super.call( this, config );
            }
            OO.inheritClass( vCardDialog, OO.ui.ProcessDialog );
            vCardDialog.static.name = 'vCardDialog';
            vCardDialog.static.title = vCard.name;
            vCardDialog.static.actions = [
                {
                    action: 'close',
                    label: Config.TRANSLATIONS.dialogButtonClose,
                    flags: [ 'safe', 'close' ]
                },
                {
                    action: 'save',
                    label: Config.TRANSLATIONS.dialogButtonSave,
                    flags: [ 'primary', 'progressive' ]
                },
                {
                    action: 'toggle',
                    title: Config.TRANSLATIONS.dialogButtonToggle,
                    icon: 'menu'
                },
                {
                    action: 'delete',
                    title: Config.TRANSLATIONS.dialogButtonDelete,
                    flags: [ 'primary', 'destructive' ],
                    icon: 'trash'
                },
                {
                    action: 'config',
                    title: Config.TRANSLATIONS.dialogButtonConfig,
                    icon: 'settings'
                }
            ];
            vCardDialog.prototype.initialize = function() {
                vCardDialog.super.prototype.initialize.apply( this, arguments );

                // Generate booklet with instances of page layout
                this.dialogMenu = new OO.ui.BookletLayout( {
                    classes: [ 'voy-vCard-dialog-menu' ],
                    outlined: true
                });
                this.pages = vCard.generatePages();

                // Add the booklet to the dialog
                this.dialogMenu.addPages( this.pages );
                this.dialogMenu.connect( this, {
                    set: 'onBookletLayoutSet'
                });
                this.$body.append( this.dialogMenu.$element );
            };
            vCardDialog.prototype.getActionProcess = function( action ) {
                if ( action === 'toggle' ) {
                    this.dialogMenu.toggleOutline();
                } else if ( action ) {
                    return new OO.ui.Process( function() {
                        this.close( { action: action } );
                    }, this );
                }
                return vCardDialog.super.prototype.getActionProcess.call( this, action );
            };
            vCardDialog.prototype.onBookletLayoutSet = function( page ) {
                this.setSize( 'full' );
            };
            vCardDialog.prototype.getSetupProcess = function( data ) {
                return vCardDialog.super.prototype.getSetupProcess.call( this, data ).next( function () {
                    this.dialogMenu.setPage( this.getSize() );
                }, this );
            };

            let windowManager = new OO.ui.WindowManager();
            $( document.body ).append( windowManager.$element );
            let dialogInstance = new vCardDialog({
                $element: $( `<div data-mode="${ Config.OPTIONS.mode }"></div>` ),
                classes: [ 'voy-vCard-dialog' ],
                id: 'visibleCard',
                size: 'full'
            });
            windowManager.addWindows( [ dialogInstance ] );
            windowManager.openWindow( dialogInstance );
        }

        buttonElems[0].on('click', buttonElems[1], function() {
            const clickedCard = $(this).closest( '.vCard' );
            const rowValues = getValues( clickedCard );
            const values = formatValues( rowValues );
            openDialog( new vCard( values ) );
        });
    };

    /**
     * Initializer function that adds a link to open the dialog and some CSS classes
     * to use in the process of saving changes.
     * 
     * @returns {jQuery.Promise<any[]>} This contains a list
     *      where the parent jquery method to add click event is at first
     *      and a string of CSS class of child element is at secound.
     */
    const initializer = function() {
        let deferred = $.Deferred();

        const dialogLink = function() {
            return $(`
                <span
                    class="listing-metadata-item listing-dialog-button voy-vCard-dialog-link noprint"
                >
                </span>
            `).append(`
                <button
                    title="${ Config.TRANSLATIONS.titleLinkOpen }"
                >
                    ${ Config.TRANSLATIONS.linkOpen }
                </button>
            `);
        }();

        const addOpenLink = function() {
            $( 'span.listing-metadata-items' ).append( dialogLink.clone( true ) );
        };

        /**
            Given an editable heading, examine it to determine what section index
            the heading represents.  First heading is 1, second is 2, etc.
        */
        const findSectionIndex = function( heading ) {
            if ( heading === undefined )
                return 0;

            // Vector etc. skins
            var link = heading.find('.mw-editsection a').attr('href');
            var section = (link !== undefined) ? link.split('=').pop() : 0;
            if (section > 0) return section;

            // MinervaNeue
            link = heading.find('a[data-section]');
            section = link.attr('data-section');
            if (section !== undefined) return section;

            // Mobile view: Minerva support
            link = heading.find('.section-heading a').attr('href');
            return (link !== undefined) ? link.split('=').pop() : 0;
        };

        /**
            Add classes and data attribute to each headers whose levels are 1 - 3
        */
        const markHeaders = function() {
            $( 'h1, h2, h3' ).each( function() {
                var _this = $( this );
                var section = findSectionIndex( _this );
                if ( section > 0 ) {
                    _this.addClass( 'voy-editsection' )
                        .attr( 'data-section', section );
                }
            });
        };

        markHeaders();
        addOpenLink();
        deferred.resolve( [$('.voy-vCard-dialog-link'), 'button'] );

        return deferred.promise();
    };

    mw.util.addCSS(`
    .voy-vCard-dialog:not([data-mode="edit"])
    .oo-ui-outlineSelectWidget
    > .oo-ui-outlineOptionWidget:last-child {
       display: none;
   }
   
   .voy-vCard-dialog:not([data-mode="edit"])
   .oo-ui-inputWidget-input {
       border: none;
       background-color: transparent !important;
   }
   
   .voy-vCard-dialog:not([data-mode="edit"])
   .voy-vCard-dialog-field:has(input[value=""]) {
       display: none;
   }
   
   .voy-vCard-dialog-image {
       width: 100%;
   }
   
   .voy-vCard-dialog-image-element {
       max-width: 90%;
       max-height: 70vh;
   }
   
   .listing-dialog-button {
       position: relative;
       padding-left: 15px;
   }
   
   .listing-dialog-button button::before {
       content: "";
       display: block;
       position: absolute;
       left: 0;
       top: 0;
       height: 100%;
       width: 15px;
       background-image: url(https://upload.wikimedia.org/wikipedia/commons/4/4f/Faenza-edit-find-symbolic.svg);
       background-repeat: no-repeat;
       background-position: 0 25%;
       background-size: 12px;
   }
    `);
    initializer().then( core );
});
