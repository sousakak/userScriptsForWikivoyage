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
            templateName : "駅一覧",
            dialogTitleEdit : "駅一覧を編集",
            dialogTitleAdd : "駅一覧を追加",
            dialogButtonClose : "閉じる",
            dialogButtonPrimary : "挿入",
            dialogButtonDefault : "キャンセル",
            dialogButtonAddTable : "追加",
            dialogMenuAddTable : "表を追加",
            dialogInputOptional : "任意",
            dialogInputRouteQID : "路線のウィキデータID",
            dialogInputRouteTitle : "タイトルに表示する路線名",
            dialogInputRouteColor : "路線の色",
            labelButtonEdit : "編集",
            labelButtonAdd : "追加",
            tooltipButtonAdd : "駅一覧を追加",
            errorUnknownMenuClicked : "不明なメニューボタンが押されました",
            errorUnexpectedString : "予期せぬ文字列が指定されました",
            errorInvalidQID : "wikidataにウィキデータIDを指定してください",
            errorUnknownTypeOfRouteItem : "指定されたウィキデータIDの分類プロパティに、既定の鉄道路線の分類に使われるアイテムが見つかりませんでした",
            errorOccuredToAddTable : "エラーを修正してから再度ボタンを押してください"
        },
        localizations : {
            lang : 'ja',
            outputLang : ['en'],
            helpPage : 'https://ja.wikivoyage.org/wiki/テンプレート:駅一覧/doc',
            visibleItemLimit : 6,
            routeTypeList : ['Q728937', 'Q10928149', 'Q15141321', 'Q91908084'],
            checkInputStrictly : true,
            wikitextDefaultInline : false,
            wikitextDefaultComment : true
        }
    };

    console.log("i18n done")

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
        CdxButtonGroup,
        CdxTextArea
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
    `,
        cdxIconEdit = `
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
        </svg>
    `;

    console.log("icon done")

    var openDialog = (plaintext = null) => {
        plaintext = ref( plaintext );
        const wbapi = new mw.ForeignApi( 'https://www.wikidata.org/w/api.php' );
        const dialogTitle = (plaintext.value === null) ? i18n.translations.dialogTitleAdd : i18n.translations.dialogTitleEdit;
        let itemTable = { stations: [] }; // { title: String, wikidata: String, color: String, stations: Station[] }
        const Station = class {
            constructor(id, i, {image = null, name = null, tfr = null, spot = null}) {
                this.index = i;
                this.id = id; this.image = image; this.name = name; this.tfr = tfr; this.spot = spot;
                this.autoname = false; // this.name automatically assigned
                if (this.name === null) {
                    wbapi.get({
                        action: 'wbgetentities',
                        ids: this.id,
                        props: 'labels',
                        languages: i18n.localizations.lang
                    }).done(( label ) => {
                        i18n.localizations.outputLang.push(i18n.localizations.lang).forEach( lang => {
                            if (this.name === null && lang in label) {
                                this.autoname = true;
                                this.name = label[lang].value;
                            }
                        });
                    });
                }
            }

            get wikitext() {
                let wikitext = "";
                if (i18n.localizations.wikitextDefaultInline) wikitext = wikitext + "\n";
                if (i18n.localizations.wikitextDefaultComment) wikitext = wikitext + "<!-- " + this.name + " -->";
                wikitext = wikitext + "|" + this.name;
                if (this.image) wikitext = wikitext + "|image" + this.index + "=" + this.image;
                if (this.name && !(this.autoname)) wikitext = wikitext + "|name" + this.index + "=" + this.name;
                if (this.tfr) wikitext = wikitext + "|tfr" + this.index + "=" + this.tfr;
                if (this.spot) wikitext = wikitext + "|spot" + this.index + "=" + this.spot;
                return wikitext;
            }
        };

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
                                <template v-if="plaintext === null">
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
                                        <cdx-field :status="routeQIDStat" :messages="routeQIDMsg">
                                            <cdx-lookup
                                                v-model:selected="routeQID"
                                                :menu-items="routeQIDOptions"
                                                :menu-config="menuConfig"
                                                @input="routeQIDInput"
                                                @load-more="routeQIDLoadedMore"
                                            >
                                                <template #no-results>
                                                    ` + mw.message( 'search-nonefound' ).text() + `
                                                </template>
                                            </cdx-lookup>
                                            <template #label>
                                                wikidata
                                            </template>
                                            <template #description>
                                                ` + i18n.translations.dialogInputRouteQID + `
                                            </template>
                                            <div style="display: none;" v-bind:data-warned="warnedQID"></div>
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
                                            <template #help-text>
                                                ` + i18n.translations.dialogInputOptional + `
                                            </template>
                                        </cdx-field>
                                        <cdx-message
                                            v-if="errorOccuredToAddTable"
                                            type="error"
                                            inline
                                            dismiss-button-label="` + i18n.translations.dialogButtonClose + `"
                                            :fade-in="true"
                                            :auto-dismiss="true"
                                            :display-time="2400"
                                        >
                                            ` + i18n.translations.errorOccuredToAddTable + `
                                        </cdx-message>
                                        <cdx-button
                                            action="progressive"
                                            weight="primary"
                                            @click="addNewStalist"
                                            class="voy-stalist-stalist-button voy-stalist-stalist-button-right"
                                        >
                                            ` + i18n.translations.dialogButtonAddTable + `
                                        </cdx-button>
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
                                <cdx-text-area v-model="plaintext" autosize readonly rows="5"></cdx-text-area>
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
                CdxButtonGroup,
                CdxTextArea
            },
            props: {
                framed: {
                    type: Boolean,
                    default: true
                }
            },
            watch: {
                plaintext: function (newone, oldone) {
                    if (oldone === null) {
                        for (i = 1; i < 3; i++) {
                            this.tabsData[i].disabled = (newone === null); // this works on wiki!
                        }
                    }
                }
            },
            setup() {
                /* utils */
                const isColor = str => /^#[a-f0-9]{1,6}$/i.test(str);
                const isQID = str => /^[qQ]\d+$/.test(str);

                const fetchResults = ( term, offset ) => {
                    const params = new URLSearchParams({
                        origin: '*',
                        action: 'wbsearchentities',
                        format: 'json',
                        limit: String(i18n.localizations.visibleItemLimit),
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

                const generateWikitext = () => {
                    let newline = i18n.localizations.wikitextDefaultInline ? "" : "\n";

                    let wikitext = "{{" + i18n.translations.templateName;
                    if (itemTable.wikidata) wikitext = wikitext + "|wikidata=" + itemTable.wikidata;
                    if (itemTable.title) wikitext = wikitext + "|title=" + itemTable.title;
                    if (itemTable.color) wikitext = wikitext + "|color=" + itemTable.color;

                    itemTable.stations.forEach( staclass => {
                        wikitext = staclass.wikitext;
                    });
                    wikitext = wikitext + newline + "}}";
                    return wikitext;
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
                const routeQIDStat = ref( 'default' );
                const routeQIDMsg = computed( () => {
                    return {
                        error: i18n.translations.errorInvalidQID,
                        warning: i18n.translations.errorUnknownTypeOfRouteItem
                    };
                });
                const routeQID = ref( null );
                const routeQIDOptions = ref( [] );
                const routeQIDCurrent = ref( "" );
                const routeTitleStat = ref( 'default' );
                const routeTitleMsg = computed( () => {
                    return {};
                });
                const routeTitle = ref( "" );
                const routeTitleAutomatic = ref( true );
                const routeColorStat = computed( () => isColor(routeColor.value) || routeColor.value === "" ? 'default' : 'unexpected' );
                const routeColorMsg = {
                    unexpected: i18n.translations.errorUnexpectedString
                };
                const routeColor = ref( "" );
                const menuConfig = {
                    visibleItemLimit: i18n.localizations.visibleItemLimit
                };
                const warnedQID = ref( null );
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
                const errorOccuredToAddTable = ref( false );

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

                    if (routeTitleAutomatic.value && routeQID.value !== null) {
                        routeTitle.value = routeQIDCurrent.value;
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

                        const seen = new Set( routeQIDOptions.value.map( result => result.value ) );
                        const dedupled = results.filter( result => !seen.has( result.value ) );
                        routeQIDOptions.value.push( ...dedupled );
                    });
                };

                const routeTitleEntered = () => {
                    if (routeTitle.value !== "") {
                        routeTitleAutomatic.value = false;
                    } else {
                        routeTitleAutomatic.value = true;
                    }
                };

                const routeTitleChanged = () => {
                    if (routeTitle.value === "") {
                        routeTitle.value = routeQIDCurrent.value;
                    }
                };

                const addNewStalist = () => {
                    new Promise( (resolve) => {
                        if ( isQID( routeQID.value ) ) {
                            if ( i18n.localizations.checkInputStrictly && warnedQID.value !== routeQID.value ) {
                                let isRouteItem = false;
                                wbapi.get({
                                    action: 'wbgetentities',
                                    ids: routeQID.value,
                                    props: 'claims',
                                    languages: i18n.localizations.lang
                                }).done( ( routeItem ) => {
                                    const instanceOf = routeItem.entities[routeQID.value].claims.P31;
                                    if (instanceOf !== undefined) {
                                        isRouteItem = instanceOf.some(
                                            value => i18n.localizations.routeTypeList.includes(value.mainsnak.datavalue.value.id)
                                        );
                                    }
                                    routeQIDStat.value = isRouteItem ? 'default' : 'warning';
                                    if (routeQIDStat.value === 'warning') {
                                        warnedQID.value = routeQID.value;
                                    }
                                    resolve();
                                });
                            } else if ( warnedQID.value === routeQID.value ) {
                                routeQIDStat.value = 'default'; // if save is pressed again with a warning, try saving
                                resolve();
                            } else {
                                resolve();
                            }
                        } else {
                            routeQIDStat.value = 'error';
                        }
                        console.log("plaintext.value: " + plaintext.value);
                    }).then( () => {
                        if ([routeQIDStat.value, routeTitleStat.value, routeColorStat.value].includes( 'error' )) {
                            errorOccuredToAddTable.value = true;
                        } else if (!([routeQIDStat.value, routeTitleStat.value, routeColorStat.value].includes( 'warning' ))) {
                            console.log("routeQIDStat.value: " + routeQIDStat.value);
                            itemTable["wikidata"] = routeQID.value || null;
                            itemTable["title"] = routeTitle.value || null;
                            itemTable["color"] = routeColor.value || null;
                            plaintext.value = generateWikitext();
                        }
                    });
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
                    plaintext,
                    open,
                    primaryAction,
                    defaultAction,
                    routeQIDStat,
                    routeQIDMsg,
                    routeQID,
                    routeQIDOptions,
                    routeQIDCurrent,
                    routeTitleStat,
                    routeTitleMsg,
                    routeTitle,
                    routeColorStat,
                    routeColorMsg,
                    routeColor,
                    menuConfig,
                    warnedQID,
                    editMenu,
                    errorOccuredToAddTable,
                    cdxIconAdd,
                    cdxIconHelp,
                    insertStalist,
                    routeQIDInput,
                    routeQIDLoadedMore,
                    routeTitleEntered,
                    routeTitleChanged,
                    addNewStalist,
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
                        disabled: (this.plaintext === null)
                    },
                    {
                        name: 'others',
                        label: "その他",
                        class: "voy-stalist-dialog-others",
                        disabled: (this.plaintext === null)
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

    console.log("open dialog done");

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

    console.log("hook done");

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
        
        .voy-stalist-dialog .cdx-tabs__content {
            padding-top: 0.8em;
        }
        
        .voy-stalist-stalist-button-right {
            float: right;
        }
        
        .voy-stalist-dialog-menu {
            margin: 0 auto;
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

    console.log("test code done");
});
