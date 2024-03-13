// <source lang="javascript">
// 完成状況 : 編集段階
// 当スクリプトは編集段階です。使用してもエラーが出る可能性が高く、未完成です。
/******************************************************************************/
// ja>>transportEditor
//   >>交通の記事で視覚的にいくつかの編集を行うツール
//   >>
//   >>作者    : Tmv
//   >>URL    : https://github.com/sousakak/userScriptsForWikivoyage/blob/master/transportEditor.js
//   >>
//   >>使用方法
//   >>[[Special:MyPage/common.js]]に以下のコードを追加 : 
//   >>mw.loader.load('//ja.wikivoyage.org/w/index.php?title=User:Tmv/custom/transportEditor.js&action=raw&ctype=text/javascript');
/******************************************************************************/

mw.loader.using([ 'vue', '@wikimedia/codex' ]).then( require => {
    const i18n = {
        translations : {
            dialogTitleEdit : "駅一覧を編集",
            dialogTitleAdd : "駅一覧を追加",
            dialogButtonClose : "閉じる",
            dialogButtonPrimary : "挿入",
            dialogButtonDefault : "キャンセル",
            dialogMenuAddTable : "表を追加",
            dialogInputRouteQID : "路線のウィキデータID",
            dialogInputRouteTitle : "タイトルに表示する路線名",
            dialogInputRouteColor : "路線の色",
            labelButtonEdit : "編集",
            labelButtonAdd : "追加",
            tooltipButtonAdd : "駅一覧を追加",
            errorUnknownMenuClicked : "不明なメニューボタンが押されました",
            errorUnexpectedString : "予期せぬ文字列が指定されました"
        },
        localizations : {
            lang : 'ja',
            helpPage : 'https://ja.wikivoyage.org/wiki/テンプレート:駅一覧/doc'
        }
    };

    const { ref, computed } = require( 'vue' );
	const {
        CdxDialog,
        CdxButton,
        CdxTabs,
        CdxTab,
        CdxIcon,
        CdxField,
        CdxLookup,
        CdxTextInput,
        CdxButtonGroup
    } = require( '@wikimedia/codex' );
    const cdxIconAdd = `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            aria-hidden="true"
        >
            <!---->
            <g>
                <path d="M11 9V4H9v5H4v2h5v5h2v-5h5V9z"></path>
            </g>
        </svg>
    `,
        cdxIconHelp = `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            aria-hidden="true"
        >
            <!---->
            <g>
                <path d="M10.06 1C13 1 15 2.89 15 5.53a4.59 4.59 0 01-2.29 4.08c-1.42.92-1.82 1.53-1.82 2.71V13H8.38v-.81a3.84 3.84 0 012-3.84c1.34-.9 1.79-1.53 1.79-2.71a2.1 2.1 0 00-2.08-2.14h-.17a2.3 2.3 0 00-2.38 2.22v.17H5A4.71 4.71 0 019.51 1a5 5 0 01.55 0"></path>
                <circle cx="10" cy="17" r="2"></circle>
            </g>
        </svg>
    `;

    var openDialog = (item = undefined) => {
        const dialogTitle = (item === undefined) ? i18n.translations.dialogTitleAdd : i18n.translations.dialogTitleEdit;
        
        const dialog = {
            template: `
                <cdx-dialog
                    v-model:open="open"
                    title="` + dialogTitle + `"
                    close-button-label="` + i18n.translations.dialogButtonClose + `"
                    :primary-action="primaryAction"
                    :default-action="defaultAction"
                    @default="open = false"
                    @primary="insertStalist"
                    class="voy-stalist-dialog"
                >
                    <cdx-tabs
                        v-model:active="currentTab"
                        :framed="framed"
                    >
                        <cdx-tab
                            v-for="( tab, index ) in tabsData"
                            :key="index"
                            :name="tab.name"
                            :label="tab.label"
                            :disabled="tab.disabled"
                            class="voy-stalist-dialog-tab"
                        >
                            <template v-if="tab.name === 'content'">
                                <template v-if="item === undefined">
                                    <div
                                        class="voy-stalist-dialog-menu"
                                        style="
                                            width: -webkit-fit-content;
                                            width: -moz-fit-content;
                                            width: fit-content;
                                        "
                                        v-if="!(addMenuOpened)"
                                    >
                                        <cdx-button v-on:click="addMenuOpened = true">
                                            <cdx-icon :icon="cdxIconAdd" /> `
                                                + i18n.translations.dialogMenuAddTable +
                                            `</cdx-button>
                                    </div>
                                    <div v-else>
                                        <cdx-field>
                                            <cdx-lookup
                                                v-model:selected="routeQID"
                                                :menu-items="routeQIDOptions"
                                                :menu-config="menuConfig"
                                                @input="routeQIDInput"
                                                @load-more="routeQIDLoadedMore"
                                            >
                                                <template #no-results>
                                                    ` + mw.message( 'Search-nonefound' ).text() + `
                                                </template>
                                            </cdx-lookup>
                                            <template #label>
                                                wikidata
                                            </template>
                                            <template #description>
                                                ` + i18n.translations.dialogInputRouteQID + `
                                            </template>
                                        </cdx-field>
                                        <cdx-field :status="routeTitleStat" :messages="routeTitleMsg">
                                            <cdx-text-input
                                                v-model="routeTitle"
                                                @input="routeTitleEntered"
                                                @change="routeTitleChanged"
                                            >
                                            </cdx-text-input>
                                            <template #label>
                                                title
                                            </template>
                                            <template #description>
                                                ` + i18n.translations.dialogInputRouteTitle + `
                                            </template>
                                        </cdx-field>
                                        <cdx-field :status="routeColorStat" :messages="routeColorMsg">
                                            <cdx-text-input
                                                v-model="routeColor"
                                            >
                                            </cdx-text-input>
                                            <template #label>
                                                color
                                            </template>
                                            <template #description>
                                                ` + i18n.translations.dialogInputRouteColor + `
                                            </template>
                                        </cdx-field>
                                    </div>
                                </template>
                                <template v-else>
                                    <cdx-button-group
                                        :buttons="editMenu"
                                        @click="menuAction"
                                        class="voy-stalist-dialog-menu"
                                    >
                                    </cdx-button-group>
                                </template>
                            </template>
                            <template v-if="tab.name === 'source'">
                                <pre>` + item + `</pre>
                            </template>
                            <template v-if="tab.name === 'others'">
                                <!---->
                            </template>
                        </cdx-tab>
                    </cdx-tabs>
                </cdx-dialog>
            `,
            components: {
                CdxDialog,
                CdxTabs,
                CdxTab,
                CdxButton,
                CdxIcon,
                CdxField,
                CdxLookup,
                CdxTextInput,
                CdxButtonGroup
            },
            props: {
                framed: {
                    type: Boolean,
                    default: true
                }
            },
            methods: {},
            setup() {
                /* utils */
                const isColor = str => /^#[a-f0-9]{1,6}$/i.test(str);

                const fetchResults = ( term, offset ) => {
                    const params = new URLSearchParams({
                        origin: '*',
                        action: 'wbsearchentities',
                        format: 'json',
                        limit: '6',
                        props: 'url',
                        language: i18n.localizations.lang,
                        search: term
                    });
                    if ( offset ) {
                        params.set( 'continue', String( offset ) );
                    }
                    return fetch(
                        `https://www.wikidata.org/w/api.php?${ params.toString() }`
                    ).then( ( re ) => re.json() );
                };
                /* utils end */

                const open = ref( true );
                const primaryAction = {
                    label: i18n.translations.dialogButtonPrimary,
                    actionType: 'progressive',
                    disabled: true
                };
                const defaultAction = {
                    label: i18n.translations.dialogButtonDefault
                };
                const routeQID = ref( null );
                const routeQIDOptions = ref( [] );
                const routeQIDCurrent = ref( "" );
                const routeTitle = ref( "" );
                const routeTitleAutomatic = ref( true );
                const routeColor = ref( "" );
                const routeColorStat = computed( () => isColor(routeColor.value) || routeColor.value === "" ? 'default' : 'unexpected' );
                const routeColorMsg = {
                    unexpected: i18n.translations.errorUnexpectedString
                }
                const menuConfig = {
                    visibleItemLimit: 6
                };
                const editMenu = [
                    {
                        value: 'edit',
                        label: null,
                        icon: cdxIconAdd,
                        ariaLabel: "Add"
                    },
                    {
                        value: 'help',
                        label: null,
                        icon: cdxIconHelp,
                        ariaLabel: "Help"
                    }
                ];

                const insertStalist = () => {
                    // pass
                };

                const routeQIDInput = value => {
                    routeQIDCurrent.value = value;

                    if ( !value ) {
                        routeQIDOptions.value = [];
                        return;
                    }
        
                    fetchResults( value ).then( data => {
                        if ( routeQIDCurrent.value !== value ) {
                            return;
                        }

                        if ( !data.search || data.search.length === 0 ) {
                            routeQIDOptions.value = [];
                            return;
                        }

                        const results = data.search.map( result => {
                            return {
                                label: result.label,
                                value: result.id,
                                description: result.description
                            };
                        });

                        routeQIDOptions.value = results;
                    }).catch( () => { routeQIDOptions.value = []; });

                    if (routeTitleAutomatic.value) {
                        routeTitle.value = routeQID.value
                    }
                };

                const routeQIDLoadedMore = () => {
                    if ( !routeQIDCurrent.value ) {
                        return;
                    }
        
                    fetchResults(
                        routeQIDCurrent.value,
                        routeQIDOptions.value.length
                    ).then( data => {
                        if ( !data.search || data.search.length === 0 ) {
                            return;
                        }
    
                        const results = data.search.map( result => {
                            return {
                                label: result.label,
                                value: result.id,
                                description: result.description
                            };
                        });
    
                        // Update menuItems.
                        const seen = new Set( menuItems.value.map( result => result.value ) );
                        const dedupled = results.filter( result => !seen.has( result.value ) );
                        routeQIDOptions.value.push( ...dedupled );
                    });
                }

                const routeTitleEntered = () => {
                    if (routeTitle.value !== "") {
                        routeTitleAutomatic.value = false
                    } else {
                        routeTitleAutomatic.value = true
                    }
                };

                const routeTitleChanged = () => {
                    if (routeTitle.value === "") {
                        routeTitle.value = routeQID.value
                    }
                };

                const menuAction = menuButton => {
                    switch ( menuButton ) {
                        case 'edit':
                            // pass
                            break;
                        case 'help':
                            window.open( i18n.localizations.helpPage );
                            break;
                        default:
                            throw new Error( i18n.translations.errorUnknownMenuClicked );
                    }
                };

                return {
                    item,
                    open,
                    primaryAction,
                    defaultAction,
                    routeQID,
                    routeQIDOptions,
                    routeQIDCurrent,
                    routeColor,
                    routeColorStat,
                    routeColorMsg,
                    menuConfig,
                    routeTitle,
                    editMenu,
                    cdxIconAdd,
                    cdxIconHelp,
                    insertStalist,
                    routeQIDInput,
                    routeQIDLoadedMore,
                    routeTitleEntered,
                    routeTitleChanged,
                    menuAction
                };
            },
            data() {
                const tabsData = [
                    {
                        name: 'content',
                        label: "内容",
                        class: "voy-stalist-dialog-content",
                        disabled: false
                    },
                    {
                        name: 'source',
                        label: "ソース",
                        class: "voy-stalist-dialog-source",
                        disabled: (item === undefined)
                    },
                    {
                        name: 'others',
                        label: "その他",
                        class: "voy-stalist-dialog-others",
                        disabled: (item === undefined)
                    }
                ];
                const currentTab = tabsData[0].name;
                const addMenuOpened = false;

                return {
                    currentTab,
                    tabsData,
                    addMenuOpened
                };
            }
        };

        $( 'body' ).prepend( '<div class="voy-stalist-dialog-area"></div>' );
        Vue.createMwApp( dialog ).mount( '.voy-stalist-dialog-area' );
    };

    if ( $(".voy-stalist").length ) {
        const editStalist = {
            template: `
                <cdx-button
                    weight="quiet"
                    aria-label="` + i18n.translations.labelButtonEdit + `"
                    class="voy-stalist-edit"
                    @click="onClick"
                >
                    <cdx-icon
                        :icon="cdxIconEdit"
                    >
                    </cdx-icon>
                </cdx-button>
            `,
            components: {
                CdxButton,
                CdxIcon
            },
            setup() {
                const cdxIconEdit = `
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                    >
                        <!---->
                        <g>
                            <path d="m16.77 8 1.94-2a1 1 0 000-1.41l-3.34-3.3a1 1 0 00-1.41 0L12 3.23zM1 14.25V19h4.75l9.96-9.96-4.75-4.75z"></path>
                        </g>
                    </svg>`;

                const onClick = () => {
                    openDialog('edit');
                };

                return {
                    cdxIconEdit,
                    onClick
                };
            }
        };
        Vue.createMwApp( editStalist ).mount( '.voy-stalist-title' );
    } else if ( $(".mw-headline#乗る").length ) {
        const addStalist = {
            template: `
                <span class="mw-editsection-bracket">[</span>
                <a href="javascript:" title="` + i18n.translations.tooltipButtonAdd + `" class="voy-stalist-add" @click="onClick()">` + i18n.translations.labelButtonAdd + `</a>
                <span class="mw-editsection-bracket">]</span>
            `,
            components: {},
            setup() {
                const onClick = () => {
                    openDialog('add');
                };

                return {
                    onClick
                };
            }
        };
        Vue.createMwApp( addStalist ).mount( '.mw-editsection' );
    }

    /*** For the test ***/
    var styleTag = document.createElement('style');
    document.head.appendChild(styleTag);
    styleTag.textContent = `
        .voy-stalist-edit {
            float: right;
        }

        .voy-stalist-dialog {
            max-width: none;
            max-height: none;
            width: 100vw;
            height: 100vh;
        }

        .voy-stalist-dialog-menu {
            margin: 0 auto;
        }

        .voy-stalist-dialog-tab {
            padding: 0.3em;
        }
    `;

    $( '#wikiPreview' ).append(`
        <button type="button" class="voy-stalist-test-button" data-stalist="edit">Click to edit</button>
        <button type="button" class="voy-stalist-test-button">Click to add</button>
    `);
    $( '.voy-stalist-test-button' ).click( e => {
        e.preventDefault();
        openDialog($(e.currentTarget).data( 'stalist' ));
    });
});
