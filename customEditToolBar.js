// <source lang="javascript">
// 完成状況 : 校正段階
// 当スクリプトは校正段階です。使用できますが、予期せぬ挙動をする可能性があります。
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

mw.loader.using(['vue', '@wikimedia/codex' ]).then( ( require ) => {
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
        inlinedCheckboxLabel: "インライン",
        bulletedCheckboxLabel: "箇条書き",

        goLabel: "行く",
        goIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Pictograms-nps-airport.svg/22px-Pictograms-nps-airport.svg.png",
        religionLabel: "信仰",
        religionIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Japanese_Map_symbol_%28Shrine%29.svg/22px-Japanese_Map_symbol_%28Shrine%29.svg.png",
        natureLabel: "自然",
        natureIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/8/82/Pictograms-nps-land-wildlife_viewing.svg/22px-Pictograms-nps-land-wildlife_viewing.svg.png",
        seeLabel: "観る",
        seeIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Italian_traffic_signs_-_icona_museo.svg/22px-Italian_traffic_signs_-_icona_museo.svg.png",
        doLabel: "する",
        doIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/3/30/Pictograms-nps-bicycle_trail-2.svg/22px-Pictograms-nps-bicycle_trail-2.svg.png",
        buyLabel: "買う",
        buyIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Italian_traffic_signs_-_icona_supermercato.svg/22px-Italian_traffic_signs_-_icona_supermercato.svg.png",
        eatLabel: "食べる",
        eatIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Italian_traffic_signs_-_icona_ristorante.svg/22px-Italian_traffic_signs_-_icona_ristorante.svg.png",
        drinkLabel: "飲む",
        drinkIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Verre_cocktail.svg/22px-Verre_cocktail.svg.png",
        sleepLabel: "泊まる",
        sleepIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/2/25/Pictograms-nps-lodging.svg/22px-Pictograms-nps-lodging.svg.png",
        healthLabel: "健康",
        healthIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Pictograms-nps-first_aid.svg/22px-Pictograms-nps-first_aid.svg.png",
        populatedLabel: "都市",
        populatedIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/1/15/Bootstrap_geo-alt.svg/22px-Bootstrap_geo-alt.svg.png",
        viewLabel: "眺める",
        viewIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/0/07/Pictograms-nps-misc-camera.svg/22px-Pictograms-nps-misc-camera.svg.png",
        areaLabel: "地域",
        areaIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Bootstrap_compass.svg/22px-Bootstrap_compass.svg.png",
        otherLabel: "その他",
        otherIcon: "//upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Italian_traffic_signs_-_icona_informazioni_%28figura_II_108%29.svg/22px-Italian_traffic_signs_-_icona_informazioni_%28figura_II_108%29.svg.png"
    };
    const TYPES = {
        go: [],
        religion: [],
        nature: [],
        see: [
            {
                label: "円形劇場",
                value: "amphitheater"
            },
            {
                label: "用水路",
                value: "aqueduct"
            },
            {
                label: "遺跡",
                value: "archaeological_site"
            },
            {
                label: "建築",
                value: "architecture"
            },
            {
                label: "アーカイブ",
                value: "archive"
            },
            {
                label: "芸術作品",
                value: "artwork"
            },
            {
                label: "バラック",
                value: "barracks"
            },
            {
                label: "船舶昇降機",
                value: "boat_lift"
            }
        ],
        do: [],
        buy: [],
        eat: [],
        drink: [],
        sleep: [],
        health: [],
        populated: [],
        view: [],
        area: [],
        other: []
    };

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
                >
                    <cdx-lookup
                        v-model:selected="selection"
                        :menu-items="menuItems"
                        :menu-config="menuConfig"
                        aria-label="vCard selecting type dialog"
                        placeholder="` + i18n.lookupPlaceholder + `"
                        @input="onInput"
                    >
                        <template #menu-item="{ menuItem }">
                            <strong>{{ menuItem.label }}</strong> (` + i18n.lookupValueLabel + `: {{ menuItem.value }})
                        </template>
                    </cdx-lookup>
                    <cdx-checkbox
                        v-model="inlined"
                    >
                        ` + i18n.inlinedCheckboxLabel + `
                    </cdx-checkbox>
                    <cdx-checkbox
                        v-model="bulleted"
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
                        inlined = ref( false ),
                        bulleted = ref( true );

                const insertVCard = () => {
                    open.value = false;
                    post = post_text
                    pre = "{{vCard | type=" + selection.value + "\n| name="
                    if (inlined.value) {
                        post = post.replace(/\n/g, " ")
                        pre = pre.replace(/\n/g, " ")
                    }
                    if (bulleted.value) {
                        pre = "* " + pre
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
                }

                const onInput = ( value ) => {
                    if ( !value ) {
                        menuItems.value = [];
                        return;
                    }
                    if ( value ) {
                        menuItems.value = TYPES[group].filter( ( item ) =>
                            item.label.includes( value )
                        );
                        primaryAction.disabled = false;
                    }
                }

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
        $( 'body' ).prepend( '<div class="voy-buttonsVCard-dialog voy-buttonsVCard"></div>' );
        Vue.createMwApp( dialog ).mount( '.voy-buttonsVCard-dialog' );
    }

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
                do: {
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