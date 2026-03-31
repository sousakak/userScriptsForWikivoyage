//<nowiki>
/**
 * Dependencies library. The code should be restructured to load only when needed.
 */
const dependencies = [
    'jquery.makeCollapsible',
    'mediawiki.api',
    'oojs-ui-core',
    'oojs-ui-widgets'
];

const systemMsgs = [
    'confirmdeletetext',
    'policy-url',
    'revdelete-hide-comment',
    'revdelete-hide-restricted',
    'revdelete-hide-text',
    'revdelete-hide-user',
    'revdelete-legend',
    'revdelete-log',
    'revdelete-otherreason',
    'revdelete-radio-same',
    'revdelete-radio-set',
    'revdelete-radio-set-suppress',
    'revdelete-radio-unset',
    'revdelete-radio-unset-suppress',
    'revdelete-reasonotherlist',
    'revdelete-reason-dropdown',
    'revdelete-submit',
    'rollback-confirmation-yes'
]

$.when( mw.loader.using( dependencies ), $.ready )
    .then( () => { return new mw.Api().loadMessagesIfMissing( systemMsgs )} )
    .then( function() {
        /**
         * Following bullets are locations needing internationalization.
         * 
         * @note Use mw.message.set()?
         * 
         * @readonly
         */
        const i18n = {}

        const api = new mw.Api();
        /**
         * Information used in this script.
         * I didn't pass a list to mw.config.get() to get the object to unify key names.
         * 
         * @readonly
         */
        let infos = {
            page: {
                action: mw.config.values.wgAction,
                canonTitle: mw.config.values.wgCanonicalSpecialPageName,
                lang: mw.config.values.wgContentLanguage,
                ns: mw.config.values.wgNamespaceNumber
            },
            user: {
                group: mw.config.values.wgUserGroups,
                globalGroup: mw.config.values.wgGlobalGroups,
                lang: mw.config.values.wgUserLanguage,
                options: mw.user.options.values
            }
        };
        mw.user.getRights( r => { infos.user.rights = r }).then( function() {
            /*** Utility Functions ***/
            /**
             * Evaluate whether any element in arr matches any one in tar.
             * 
             * @param {Array<*>} arr 
             * @param {*} tar 
             * @returns {Boolean}
             */
            const isIncludes = (arr, tar) => arr.some( elem => tar.includes(elem) );

            /**
             * Evaluate whether all elements in arr matches any one in tar.
             * 
             * @param {Array<*>} arr 
             * @param {Array<*>} tar 
             * @returns {Boolean}
             */
            const isAllIncludes = (arr, tar) => arr.every( elem => tar.includes(elem) );

            OO.ui.local = {};
            /**
             * 
             * @file https://gerrit.wikimedia.org/g/oojs/ui/+/master/demos/classes/DynamicLabelTextInputWidget.js
             * @copyright Bartosz Dziewoński, Volker E, James D. Forrester, Ed Sanders; 2024
             * 
             * @class
             * @extends OO.ui.TextInputWidget
             * 
             * @constructor
             * @param {Object} config Configuration options
             * @param {Function} config.getLabelText A function which returns the label text
             */
            OO.ui.local.DynamicLabelTextInputWidget = function DynamicLabelTextInputWidget( config ) {
                // Configuration initialization
                config = Object.assign( { getLabelText: function () {} }, config );
                // Parent constructor
                OO.ui.local.DynamicLabelTextInputWidget.super.call( this, config );
                // Properties
                this.getLabelText = config.getLabelText;
                // Events
                this.connect( this, {
                    change: 'onChange'
                } );
                // Initialization
                this.setLabel( this.getLabelText( this.getValue() ) );
            };
            /* Setup */
            OO.inheritClass( OO.ui.local.DynamicLabelTextInputWidget, OO.ui.TextInputWidget );
            OO.ui.local.DynamicLabelTextInputWidget.prototype.onChange = function ( value ) {
                this.setLabel( this.getLabelText( value ) );
            };

            OO.ui.local.CollapsibleFieldsetLayout = function OoUiCollapsibleFieldsetLayout( config ) {
                // Configuration initialization
                config = config || {};

                // Parent constructor
                OO.ui.FieldsetLayout.super.call( this, config );

                // Mixin constructors
                OO.ui.mixin.IconElement.call( this, config );
                OO.ui.mixin.LabelElement.call( this, config );
                OO.ui.mixin.GroupElement.call( this, config );

                // Properties and Initialization
                if (!this.$header) {
                    this.$header = $( '<legend>' );
                    this.$header
                        .addClass( 'oo-ui-fieldsetLayout-header' )
                        .append( this.$icon, this.$label );
                }
                if (!this.$group.hasClass('oo-ui-fieldsetLayout-group'))
                    this.$group.addClass( 'oo-ui-fieldsetLayout-group' );
                if (!this.$element.hasClass('oo-ui-fieldsetLayout'))
                    this.$element.addClass( 'oo-ui-fieldsetLayout' );
                if ( !this.$header.parent().is( this.$element ) )
                    this.$element.prepend( this.$header );
                if ( !this.$group.parent().is( this.$element ) )
                    this.$element.append( this.$group );

                //
                this.$element
                    .addClass( 'mw-collapsibleFieldsetLayout' );
                if (config.collapsed) this.$element.addClass( 'mw-collapsed' );
                if (this.$header) this.$header.addClass( ['mw-collapsible-toggle', 'almight-cp-header'] );
                if (this.$group) this.$group.addClass( ['mw-collapsible-content', 'almight-cp-main'] );
                if (this.$header) this.$header.append(
                    new OO.ui.IconWidget( {
                        icon: 'expand',
                        title: mw.msg( 'collapsible-expand' )
                    }).$element,
                    new OO.ui.IconWidget( {
                        icon: 'collapse',
                        title: mw.msg( 'collapsible-collapse' )
                    }).$element
                );
                if (this.$header) this.$header.attr( 'role', 'button' );

                this.$element
                    .addClass( 'almight-cp-fieldset' )
                    .makeCollapsible();

                if (config.items) {
                    this.addItems(config.items); // 必ず addItems を呼び出す
                }
            };
            /* Setup */
            OO.inheritClass( OO.ui.local.CollapsibleFieldsetLayout, OO.ui.FieldsetLayout );
            OO.mixinClass( OO.ui.local.CollapsibleFieldsetLayout, OO.ui.mixin.IconElement );
            OO.mixinClass( OO.ui.local.CollapsibleFieldsetLayout, OO.ui.mixin.LabelElement );
            OO.mixinClass( OO.ui.local.CollapsibleFieldsetLayout, OO.ui.mixin.GroupElement );

            OO.ui.local.HorizontalRule = function OoUiHorizontalRule( config ) {
                // Configuration initialization
	            config = config || {};

                // Parent constructor
                OO.ui.local.HorizontalRule.super.call( this, config );

                // Initialization
                this.$element.addClass( 'oo-ui-hr' );
            }
            /* Setup */
            OO.inheritClass( OO.ui.local.HorizontalRule, OO.ui.Widget );
            OO.ui.local.HorizontalRule.static.tagName = 'hr';

            class Targets {
                /**
                 * @constructor
                 * @param {Function} getData Give a function to get data from this.checkedboxes
                 *                           instead of specifying pageType. The class itself (`this`)
                 *                           is passed as the argument.
                 */
                constructor() {
                    this.checkedboxes = $( '#almight-checkbox-element:checked' );
                    this.apilimit = 'apihighlimits' in infos.user.rights ? 500 : 50;
                    this.noSelection, this.reachLimit = false, false;
                    if (this.checkedboxes.length === 0) this.noSelection = true;
                    if (this.checkedboxes.length > this.apilimit) {
                        this.reachLimit = true;
                        this.checkedboxes.slice(0, this.apilimit);
                    }
                    this._getData();
                };

                /**
                 * 
                 * @abstract
                 */
                _getData() {
                    throw new Error(`Can't instantiate abstract class ${this.constructor.name} with abstract methods sound`);
                };
            };

            class ContribTargets extends Targets {
                constructor() {
                    super();
                };

                /**
                 * Get data of selected items in the contribution page.
                 * Actual private method added on ES2022 is slower than figmentary one.
                 * 
                 * @method
                 * @private
                 */
                _getData() {
                    this.targets = {
                        ids: {},
                        users: {}
                    };
                    console.log( this.targets );
                    this.user = $( '.mw-contributions-user-tools > a' ).text();
                    this.checkedboxes.each( function(_) {
                        const item = $( this ).closest('li');
                        const title = item.find('.mw-contributions-title').text();
                        if (this.targets.ids[title]) this.targets.ids[title].push(item.data('mw-revid'));
                        else {
                            this.targets.ids[title] = [ item.data('mw-revid') ];
                            this.targets.users[title] = [ user ];
                        }
                    });
                };
            };

            /**
             * Collect selected checkboxes and extract the necessary information.
             * 
             * @argument {Boolean} returnElem
             * @returns {Array<Object|jQuery|Boolean>}
             */
            const preprocessCheckbox = function( returnElem ) {
                const checkedboxes = $( '#almight-checkbox-element:checked' );
                let reachLimit = false;
                if (checkedboxes.length === 0) return [null, null];
                if (checkedboxes.length > apilimit) {
                    reachLimit = true;
                    checkedboxes.slice(0, apilimit);
                }
                if (returnElem) return [checkedboxes, reachLimit];
                const targets = {};
                checkedboxes.each( function(_) {
                    const item = $( this ).closest('li');
                    const title = item.find('.mw-contributions-title').text();
                    if (targets.ids[title]) targets.ids[title].push(item.data('mw-revid'))
                    else targets.ids[title] = [item.data('mw-revid')];
                });
                return [targets, reachLimit];
            };

            /**
             * Creates an instance of a control panel tab by passing a label and content.
             * 
             * @param {String} label Label used for the tab name.
             * @returns {Tab} An instance of Tab class, which inherits {OO.ui.TabPanelLayout}.
             */
            function generateTabInstance( label, content ) {
                function Tab( name, config ) {
                    Tab.super.call( this, name, config );
                    if ( this.$element.is( ':empty' ) )
                        this.$element.text( 'Nothing yet' );
                }
                OO.inheritClass( Tab, OO.ui.TabPanelLayout );
                Tab.prototype.setupTabItem = function() {
                    this.tabItem.setLabel( label );
                };
                return new Tab( label, {
                    classes: [ 'almight-cp-tabbox-tab' ],
                    content: content ? [ content ] : undefined,
                    expanded: false
                });
            };

            /*** Main functions ***/
            // User should have rights to see deleted revisions and change their visibility.
            if (!isAllIncludes(['deleterevision', 'deletedtext'], infos.user.rights)) return;
            if (infos.page.ns !== -1 || infos.page.canonTitle !== 'Contributions') return;

            // Add checkboxes to each contribution logs.
            const checkbox = new OO.ui.CheckboxInputWidget( {
                classes: [ 'almight-checkbox', 'almight-checkbox-contributions' ],
                inputId: 'almight-checkbox-element',
                //flags: [ 'invert' ]
            });
            $( '.mw-revdelundel-link' ).html( checkbox.$element );

            // Generate control panels for revision deletion.
            let revisionRadios = [];
            const revisionRadiosName = [ 'content', 'comment', 'user', 'restricted' ];
            for (let i = 0; i < revisionRadiosName.length - 1; i++) {
                revisionRadios[i] = new OO.ui.RadioSelectInputWidget( {
                    options: [
                        {
                            data: 'same',
                            label: mw.msg( 'revdelete-radio-same' )
                        },
                        {
                            data: 'unset',
                            label: mw.msg( 'revdelete-radio-unset' )
                        },
                        {
                            data: 'set',
                            label: mw.msg( 'revdelete-radio-set' )
                        }
                    ],
                    inputId: 'almight-cp-revdel',
                    classes: [ 'almight-cp-revdel-wrapper' ]
                })
            };
            revisionRadios[revisionRadiosName.length - 1] = new OO.ui.RadioSelectInputWidget( {
                options: [
                    {
                        data: 'nochange',
                        label: mw.msg( 'revdelete-radio-same' )
                    },
                    {
                        data: 'no',
                        label: mw.msg( 'revdelete-radio-unset-suppress' )
                    },
                    {
                        data: 'yes',
                        label: mw.msg( 'revdelete-radio-set-suppress' )
                    }
                ],
                inputId: 'almight-cp-revdel',
                classes: [ 'almight-cp-revdel-wrapper' ],
                disabled: !('suppressrevision' in infos.user.rights)
            });
            const revisionReasons = mw.msg( 'revdelete-reason-dropdown' )
                .split('\n')
                .map( line => {
                    const parsedLine = line.match(/(\*+)\s?(.+)/);
                    switch (true) {
                        case parsedLine[1].length >= 2:
                            return { data: parsedLine[2], label: parsedLine[2] };
                        case parsedLine[1].length === 1:
                            return { optgroup: parsedLine[2] };
                        default:
                            return null;
                    }
                })
                .filter(Boolean)
            revisionReasons.unshift({
                data: mw.msg( 'revdelete-reasonotherlist' ),
                label: mw.msg( 'revdelete-reasonotherlist' )
            });
            const revisionReasonDropdown = new OO.ui.DropdownInputWidget( {
                options: revisionReasons,
                value: mw.msg( 'revdelete-reasonotherlist' ),
                classes: [ 'almight-cp-revdel-wrapper' ]
            });
            const revisionAddlReasonInput = new OO.ui.local.DynamicLabelTextInputWidget( {
                getLabelText: function ( value ) {
                    return String( value.length );
                },
                maxLength: 50
            });
            const submitButton = new OO.ui.ButtonWidget( {
                label: mw.msg( 'revdelete-submit' ),
                flags: [
                    'primary',
                    'progressive'
                ]
            });
            submitButton.on( 'click', function() {
                submitButton.setDisabled(true);
                const params = {};
                params.reason = revisionAddlReasonInput.getValue()
                    ? revisionReasonDropdown.getValue() + ' : ' + revisionAddlReasonInput.getValue()
                    : revisionReasonDropdown.getValue();
                const radioValues = revisionRadios.map( radio => radio.getValue() ).slice(0, -1);
                params.hide = revisionRadiosName.filter( (_, i) => radioValues[i] === 'set' );
                params.show = revisionRadiosName.filter( (_, i) => radioValues[i] === 'unset' );
                params.suppress = revisionRadios.at(-1).getValue();
                const selected = new ContribTargets();
                //const [targets, reachLimit] = preprocessCheckbox();
                if (selected.noSelection) { submitButton.setDisabled(false); return }
                params.ids = selected.targets.ids;
                Object.keys(params.ids).forEach( k => {
                    /*
                    api.postWithToken( 'csrf', {
                        action: 'revisiondelete',
                        type: 'revision',
                        target: k,
                        ids: params.ids[k].join('|'),
                        hide: params.hide.join('|'),
                        show: params.show.join('|'),
                        suppress: params.suppress,
                        reason: params.reason,
                        tags: 'almight'
                    });
                    */
                    console.log({
                        action: 'revisiondelete',
                        type: 'revision',
                        target: k,
                        ids: params.ids[k].join('|'),
                        hide: params.hide.join('|'),
                        show: params.show.join('|'),
                        suppress: params.suppress,
                        reason: params.reason,
                        tags: 'almight'
                    });
                    submitButton.setDisabled(false);
                });
            });

            const revisionDeleteFieldset = new OO.ui.FieldsetLayout();
            api.parse(
                mw.message( 'confirmdeletetext' )
                    .text()
                    .replace(
                        '{{MediaWiki:Policy-url}}',
                        mw.msg( 'policy-url' )
                    )
            ).done( function(note) {
                revisionDeleteFieldset.addItems( [
                    new OO.ui.Widget( {
                        content: [ new OO.ui.HtmlSnippet(note) ]
                    }),
                    new OO.ui.local.HorizontalRule(),
                    new OO.ui.FieldLayout(
                        revisionRadios[0],
                        {
                            label: mw.msg( 'revdelete-hide-text' )
                        }
                    ),
                    new OO.ui.FieldLayout(
                        revisionRadios[1],
                        {
                            label: mw.msg( 'revdelete-hide-comment' )
                        }
                    ),
                    new OO.ui.FieldLayout(
                        revisionRadios[2],
                        {
                            label: mw.msg( 'revdelete-hide-user' )
                        }
                    ),
                    new OO.ui.FieldLayout(
                        revisionRadios[3],
                        {
                            label: mw.msg( 'revdelete-hide-restricted' )
                        }
                    ),
                    new OO.ui.FieldLayout(
                        revisionReasonDropdown,
                        {
                            label: mw.msg( 'revdelete-log' )
                        }
                    ),
                    new OO.ui.FieldLayout(
                        revisionAddlReasonInput,
                        {
                            label: mw.msg( 'revdelete-otherreason' )
                        }
                    ),
                    new OO.ui.FieldLayout(
                        submitButton
                    )
                ]);
            });
            
            // Generate control panels for rollback.
            const rollbackFieldset = new OO.ui.FieldsetLayout();
            const rollbackWidgets = {
                bot: new OO.ui.CheckboxInputWidget( {
                    selected: true
                }),
                hide: new OO.ui.CheckboxInputWidget( {
                    selected: true
                }),
                custom: new OO.ui.CheckboxInputWidget( {
                    selected: false
                }),
                summary: new OO.ui.local.DynamicLabelTextInputWidget( {
                    getLabelText: function ( value ) {
                        return String( value.length );
                    },
                    maxLength: 50,
                    disabled: true
                }),
                submit: new OO.ui.ButtonWidget( {
                    label: mw.msg( 'rollback-confirmation-yes' ),
                    flags: [
                        'primary',
                        'progressive'
                    ]
                })
            };
            rollbackWidgets.custom.on( 'change', function(selected) {
                rollbackWidgets.hide.setDisabled(selected);
                rollbackWidgets.summary.setDisabled(!selected);
            });
            rollbackWidgets.submit.on( 'click', function() {
                rollbackWidgets.hide.setDisabled(true);
                const [targets, reachLimit] = preprocessCheckbox();
            });
            rollbackFieldset.addItems( [
                new OO.ui.FieldLayout(
                    rollbackWidgets.bot,
                    {
                        label: 'Mark as bot edit(s)'
                    }
                ),
                new OO.ui.FieldLayout(
                    rollbackWidgets.hide,
                    {
                        label: 'Hide user name'
                    }
                ),
                new OO.ui.FieldLayout(
                    rollbackWidgets.custom,
                    {
                        label: 'Use custom summary'
                    }
                ),
                new OO.ui.FieldLayout(
                    rollbackWidgets.summary,
                    {
                        label: 'Custom summary'
                    }
                ),
                new OO.ui.FieldLayout(
                    rollbackWidgets.submit
                ),
            ]);

            // Prepare and assemble components
            const tabRevisionDelete = generateTabInstance(
                    'Revision Deletion',
                    revisionDeleteFieldset
                ),
                tabRollback = generateTabInstance(
                    'Rollback',
                    rollbackFieldset
                ),
                tabProtect = generateTabInstance( 'Protection' ),
                tabDelete = generateTabInstance( 'Deletion' ),
                tabPatrol = generateTabInstance( 'Patroll' ),
                tabEditTags = generateTabInstance( 'Editing Tags' ),
                tabContainer = new OO.ui.IndexLayout({
                    expanded: false,
                    classes: [ 'almight-cp-tabbox' ]
                });
            tabContainer.addTabPanels( [
                tabRevisionDelete,
                tabRollback,
                tabProtect,
                tabDelete,
                tabPatrol,
                tabEditTags
            ]);
            const controlPanelLayout = new OO.ui.PanelLayout({
                classes: [ 'almight-cp-tabpanel' ],
                content: [ tabContainer ],
                expanded: false
            });
            const controlPanelContent = new OO.ui.Widget({
                classes: [ 'almight-cp-content' ],
                content: [ controlPanelLayout ]
            });

            const controlPanelFieldset = new OO.ui.local.CollapsibleFieldsetLayout( {
                items: [
                    controlPanelContent
                ],
                label: 'Take an action to selected item(s)',
                collapsed: true
            });
            const controlPanel = new OO.ui.PanelLayout( {
                $content: controlPanelFieldset.$element,
                classes: [ 'mw-htmlform-ooui-wrapper', 'almight-cp' ],
                padded: true,
                expanded: false,
                framed: true
            });
            $( '.mw-pager-navigation-bar' ).eq(0).before( controlPanel.$element );
        });
    });

mw.util.addCSS(`
.mw-special-ContributionsSpecialPage .oo-ui-fieldsetLayout-group:not(:first-child) {
  max-width: unset;
}
.mw-special-ContributionsSpecialPage .almight-cp-tabbox > .oo-ui-menuLayout-content {
  border: #eaecf0 1px solid;
  border-top: none;
}
.mw-special-ContributionsSpecialPage .almight-cp-tabbox .almight-cp-revdel-wrapper .oo-ui-radioOptionWidget {
  display: inline-block;
  margin-right: 12px;
}/*# sourceMappingURL=contrib.css.map */
`)
//</nowiki>