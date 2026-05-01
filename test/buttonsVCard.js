// <source lang="javascript">
// 完成状況 : 完成
// 当スクリプトは完成しています。不具合は出ていませんが、使用する際には自己責任でお願い致します。
/******************************************************************************/
// ja>>ButtonsVCard
//   >>デスクトップ版でソース編集をする時に、vCardを簡単に追加できるボタンを実装
//   >>
//   >>作者    : Tmv
//   >>URL     : https://ja.wikivoyage.org/w/index.php?title=User:Tmv/custom/ButtonsVCard.js
//   >>
//   >>使用方法
//   >>[[Special:MyPage/common.js]]に以下のコードを追加 : 
//   >>mw.loader.load('//ja.wikivoyage.org/w/index.php?title=User:Tmv/custom/ButtonsVCard.js&action=raw&ctype=text/javascript');
/******************************************************************************/
// <source lang="javascript">
// 完成状況 : 完成
// 当スクリプトは完成しています。不具合は出ていませんが、使用する際には自己責任でお願い致します。
/******************************************************************************/
// ja>>getVCardSetting
//   >>vCardの地域化された設定をLuaモジュールから取得する関数を提供します。
//   >>
//   >>作者    : Tmv
//   >>URL     : 
//   >>
//   >>使用方法
//   >>[[Special:MyPage/common.js]]に以下のコードを追加 : 
//   >>
/******************************************************************************/

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

const func =  () => {
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
};

func().then( vCardConfig => {
    mw.loader.using([ 'mediawiki.util', 'vue', '@wikimedia/codex' ]).then( require => {
        const { ref } = require( 'vue' );
        const { CdxLookup, CdxDialog, CdxCheckbox } = require( '@wikimedia/codex' );

        const i18n = {
            dialogTitle: "タイプを検索",
            dialogSubtitle: "$1のタイプを検索中",
            closeButtonLabel: "閉じる",
            insertButtonLabel: "挿入",
            cancelButtonLabel: "中止",
            lookupPlaceholder: "日本語で入力",
            lookupValueLabel: "入力",
            lookupNoResults: "一致する結果はありません",
            inlinedCheckboxLabel: "インライン",
            bulletedCheckboxLabel: "箇条書き",

            goLabel: "行く",
            goIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Pictograms-nps-airport.svg/120px-Pictograms-nps-airport.svg.png",
            religionLabel: "信仰",
            religionIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Japanese_Map_symbol_(Shrine).svg/250px-Japanese_Map_symbol_(Shrine).svg.png",
            natureLabel: "自然",
            natureIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/8/82/Pictograms-nps-land-wildlife_viewing.svg/250px-Pictograms-nps-land-wildlife_viewing.svg.png",
            seeLabel: "観る",
            seeIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Italian_traffic_signs_-_icona_museo.svg/250px-Italian_traffic_signs_-_icona_museo.svg.png",
            doLabel: "する",
            doIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/3/30/Pictograms-nps-bicycle_trail-2.svg/250px-Pictograms-nps-bicycle_trail-2.svg.png",
            buyLabel: "買う",
            buyIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Italian_traffic_signs_-_icona_supermercato.svg/250px-Italian_traffic_signs_-_icona_supermercato.svg.png",
            eatLabel: "食べる",
            eatIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Italian_traffic_signs_-_icona_ristorante.svg/250px-Italian_traffic_signs_-_icona_ristorante.svg.png",
            drinkLabel: "飲む",
            drinkIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Verre_cocktail.svg/500px-Verre_cocktail.svg.png",
            sleepLabel: "泊まる",
            sleepIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/2/25/Pictograms-nps-lodging.svg/250px-Pictograms-nps-lodging.svg.png",
            healthLabel: "健康",
            healthIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Pictograms-nps-first_aid.svg/250px-Pictograms-nps-first_aid.svg.png",
            populatedLabel: "都市",
            populatedIcon: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Bootstrap_geo-alt.svg/250px-Bootstrap_geo-alt.svg.png",
            viewLabel: "眺める",
            viewIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/0/07/Pictograms-nps-misc-camera.svg/250px-Pictograms-nps-misc-camera.svg.png",
            areaLabel: "地域",
            areaIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Bootstrap_compass.svg/250px-Bootstrap_compass.svg.png",
            otherLabel: "その他",
            otherIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Italian_traffic_signs_-_icona_informazioni_%28figura_II_108%29.svg/250px-Italian_traffic_signs_-_icona_informazioni_%28figura_II_108%29.svg.png"
        };
        const TYPES = vCardConfig.types;
        let TYPESBYGROUP = {};
        for (let type in TYPES) {
            TYPES[type].value = type;
            if (TYPESBYGROUP[TYPES[type].group] === undefined) {
                TYPESBYGROUP[TYPES[type].group] = [TYPES[type]];
            } else {
                TYPESBYGROUP[TYPES[type].group].push(TYPES[type]);
            }
        }

        const currentLastEditDate = () => {
            // return the date as "2015-01-15"
            var d = new Date();
            var year = d.getFullYear();
            // Date.getMonth() returns 0-11
            var month = d.getMonth() + 1;
            if (month < 10) month = '0' + month;
            var day = d.getDate();
            if (day < 10) day = '0' + day;
            return year + '-' + month + '-' + day;
        };
        let post_text = " | name-local= | name-latin= | alt= | comment=\n| address= | address-local= | directions= | directions-local= | lat= | long=\n| wikidata= | commons= | url=\n| image= | phone= | tollfree= | mobile= | fax= | email=\n| hours= | checkin= | checkout=\n| payment= | price=\n| content=\n| lastedit=" + currentLastEditDate() + "\n}}";

        const selectType = ( context, group ) => {
            const dialog = {
                template: `
                    <cdx-dialog
                        v-model:open="open"
                        title="` + i18n.dialogTitle + `"
                        subtitle="` + i18n.dialogSubtitle.replace("$1", group) + `"
                        close-button-label="` + i18n.closeButtonLabel + `"
                        :primary-action="primaryAction"
                        :default-action="defaultAction"
                        @default="open = false"
                        @primary="insertVCard"
                        class="voy-buttonsVCard-dialog"
                    >
                        <cdx-lookup
                            v-model:selected="selection"
                            :menu-items="menuItems"
                            :menu-config="menuConfig"
                            aria-label="vCard selecting type dialog"
                            placeholder="` + i18n.lookupPlaceholder + `"
                            @input="onInput"
                            class="voy-buttonsVCard-lookup"
                        >
                            <template #menu-item="{ menuItem }">
                                <strong>{{ menuItem.label }}</strong> (` + i18n.lookupValueLabel + `: {{ menuItem.value }})
                            </template>
                            <template #no-results>
                                ` + i18n.lookupNoResults + `
                            </template>
                        </cdx-lookup>
                        <cdx-checkbox
                            v-model="inlined"
                            class="voy-buttonsVCard-checkbox"
                        >
                            ` + i18n.inlinedCheckboxLabel + `
                        </cdx-checkbox>
                        <cdx-checkbox
                            v-model="bulleted"
                            class="voy-buttonsVCard-checkbox"
                        >
                            ` + i18n.bulletedCheckboxLabel + `
                        </cdx-checkbox>
                    </cdx-dialog>
                `,
                components: {
                    CdxLookup,
                    CdxDialog,
                    CdxCheckbox
                },
                setup() {
                    const   open = ref( true ),
                            primaryAction = {
                                label: i18n.insertButtonLabel,
                                actionType: 'progressive',
                                disabled: true
                            },
                            defaultAction = {
                                label: i18n.cancelButtonLabel,
                            },
                            selection = ref( null ),
                            menuItems = ref( [] ),
                            menuConfig = {
                                visibleItemLimit: null
                            },
                            inlined = ref( true ),
                            bulleted = ref( true );

                    const insertVCard = () => {
                        open.value = false;
                        post = post_text;
                        pre = "{{vCard | type=" + selection.value + "\n| name=";
                        if (inlined.value) {
                            post = post.replace(/\n/g, " ");
                            pre = pre.replace(/\n/g, " ");
                        }
                        if (bulleted.value) {
                            pre = "* " + pre;
                        }
                        $.wikiEditor.modules.toolbar.fn.doAction(
                            context,
                            {
                                type: 'encapsulate',
                                options: {
                                    pre: pre,
                                    post: post
                                }
                            }
                        );
                    };

                    const onInput = ( value ) => {
                        if ( !value ) {
                            menuItems.value = [];
                            return;
                        }
                        menuItems.value = TYPESBYGROUP[group].filter( ( item ) =>
                            item.label.includes( value )
                        );
                        primaryAction.disabled = false;
                    };

                    return {
                        open,
                        primaryAction,
                        defaultAction,
                        insertVCard,
                        selection,
                        menuItems,
                        menuConfig,
                        onInput,
                        inlined,
                        bulleted
                    };
                }
            };
            mw.util.addCSS( '.voy-buttonsVCard-lookup { margin-bottom: 6px; }' )
            $( 'body' ).prepend( '<div class="voy-buttonsVCard-dialog voy-buttonsVCard"></div>' );
            Vue.createMwApp( dialog ).mount( '.voy-buttonsVCard-dialog' );
        };

        mw.hook( 'wikiEditor.toolbarReady' ).add( ( $textarea ) => {
            $textarea.wikiEditor( 'addToToolbar', {
                sections: {
                    listings: {
                        type: 'toolbar',
                        label: "リスト"
                    }
                }
            });
            $textarea.wikiEditor( 'addToToolbar', {
                section: 'listings',
                groups: {
                    templates: {
                        label: "リスティング"
                    }
                }
            });
            $textarea.wikiEditor( 'addToToolbar', {
                section: 'listings',
                group: 'templates',
                tools: {
                    go: {
                        label: i18n.goLabel,
                        type: 'button',
                        icon: i18n.goIcon,
                        action: {
                            type: 'callback',
                            execute: ( context ) => {
                                selectType( context, "go" );
                            }
                        }
                    },
                    religion: {
                        label: i18n.religionLabel,
                        type: 'button',
                        icon: i18n.religionIcon,
                        action: {
                            type: 'callback',
                            execute: ( context ) => {
                                selectType( context, "religion" );
                            }
                        }
                    },
                    nature: {
                        label: i18n.natureLabel,
                        type: 'button',
                        icon: i18n.natureIcon,
                        action: {
                            type: 'callback',
                            execute: ( context ) => {
                                selectType( context, "nature" );
                            }
                        }
                    },
                    see: {
                        label: i18n.seeLabel,
                        type: 'button',
                        icon: i18n.seeIcon,
                        action: {
                            type: 'callback',
                            execute: ( context ) => {
                                selectType( context, "see" );
                            }
                        }
                    },
                    'do': {
                        label: i18n.doLabel,
                        type: 'button',
                        icon: i18n.doIcon,
                        action: {
                            type: 'callback',
                            execute: ( context ) => {
                                selectType( context, "do" );
                            }
                        }
                    },
                    buy: {
                        label: i18n.buyLabel,
                        type: 'button',
                        icon: i18n.buyIcon,
                        action: {
                            type: 'callback',
                            execute: ( context ) => {
                                selectType( context, "buy" );
                            }
                        }
                    },
                    eat: {
                        label: i18n.eatLabel,
                        type: 'button',
                        icon: i18n.eatIcon,
                        action: {
                            type: 'callback',
                            execute: ( context ) => {
                                selectType( context, "eat" );
                            }
                        }
                    },
                    drink: {
                        label: i18n.drinkLabel,
                        type: 'button',
                        icon: i18n.drinkIcon,
                        action: {
                            type: 'callback',
                            execute: ( context ) => {
                                selectType( context, "drink" );
                            }
                        }
                    },
                    sleep: {
                        label: i18n.sleepLabel,
                        type: 'button',
                        icon: i18n.sleepIcon,
                        action: {
                            type: 'callback',
                            execute: ( context ) => {
                                selectType( context, "sleep" );
                            }
                        }
                    },
                    health: {
                        label: i18n.healthLabel,
                        type: 'button',
                        icon: i18n.healthIcon,
                        action: {
                            type: 'callback',
                            execute: ( context ) => {
                                selectType( context, "health" );
                            }
                        }
                    },
                    populated: {
                        label: i18n.populatedLabel,
                        type: 'button',
                        icon: i18n.populatedIcon,
                        action: {
                            type: 'callback',
                            execute: ( context ) => {
                                selectType( context, "populated" );
                            }
                        }
                    },
                    view: {
                        label: i18n.viewLabel,
                        type: 'button',
                        icon: i18n.viewIcon,
                        action: {
                            type: 'callback',
                            execute: ( context ) => {
                                selectType( context, "view" );
                            }
                        }
                    },
                    area: {
                        label: i18n.areaLabel,
                        type: 'button',
                        icon: i18n.areaIcon,
                        action: {
                            type: 'callback',
                            execute: ( context ) => {
                                selectType( context, "area" );
                            }
                        }
                    },
                    other: {
                        label: i18n.otherLabel,
                        type: 'button',
                        icon: i18n.otherIcon,
                        action: {
                            type: 'callback',
                            execute: ( context ) => {
                                selectType( context, "other" );
                            }
                        }
                    }
                }
            });
        });
    });
});