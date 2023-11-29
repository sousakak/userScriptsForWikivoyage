// <source lang="javascript">
// 完成状況 : 完成
// 当スクリプトは完成しています。不具合は出ていませんが、使用する際には自己責任でお願い致します。
/******************************************************************************/
// ja>>ListingsOnWikiEditor
//   >>デスクトップ版のソースで編集時にリスティングを1クリックで追加できるボタンを付ける
//   >>
//   >>作者    : Tmv
//   >>URL     : https://ja.wikivoyage.org/w/index.php?title=User:Tmv/custom/Edit_toolbar.js
//   >>原典    : https://en.wikivoyage.org/w/index.php?oldid=4752473#L-55 (CC BY-SA 4.0 DEED)
//   >>
//   >>使用方法
//   >>[[Special:MyPage/common.js]]に以下のコードを追加 : 
//   >>mw.loader.load('//ja.wikivoyage.org/w/index.php?title=User:Tmv/custom/Edit_toolbar.js&action=raw&ctype=text/javascript');
/******************************************************************************/

if ( [ 'edit', 'submit' ].indexOf( mw.config.get( 'wgAction' ) ) !== -1 && mw.config.get( 'wgNamespaceNumber' ) % 2 == 0 && mw.config.get( 'wgPageContentModel' ) === 'wikitext' ) {
    var i18n = {
        lang: 'ja',
        SECTION_NAME: 'リスト',
        GROUP_NAME: 'リスティング',
        LISTING_TEMPLATES: {
            see: {
                name: 'see',
                label: '観る',
                icon: '//upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Italian_traffic_signs_-_icona_museo.svg/22px-Italian_traffic_signs_-_icona_museo.svg.png',
                disable: ['checkin', 'checkout']
            },
            do: {
                name: 'do',
                label: 'する',
                icon: '//upload.wikimedia.org/wikipedia/commons/thumb/3/30/Pictograms-nps-bicycle_trail-2.svg/22px-Pictograms-nps-bicycle_trail-2.svg.png',
                disable: ['checkin', 'checkout']
            },
            buy: {
                name: 'buy',
                icon: '//upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Italian_traffic_signs_-_icona_supermercato.svg/22px-Italian_traffic_signs_-_icona_supermercato.svg.png',
                disable: ['checkin', 'checkout']
            },
            eat: {
                name: 'eat',
                label: '食べる',
                icon: '//upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Italian_traffic_signs_-_icona_ristorante.svg/22px-Italian_traffic_signs_-_icona_ristorante.svg.png',
                disable: ['checkin', 'checkout']
            },
            drink: {
                name: 'drink',
                label: '飲む',
                icon: '//upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Verre_cocktail.svg/22px-Verre_cocktail.svg.png',
                disable: ['checkin', 'checkout']
            },
            sleep: {
                name: 'sleep',
                label: '泊まる',
                icon: '//upload.wikimedia.org/wikipedia/commons/thumb/2/25/Pictograms-nps-lodging.svg/22px-Pictograms-nps-lodging.svg.png',
                disable: ['hours']
            },
            go: {
                name: 'listing | type=go',
                label: '行く',
                icon: '//upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Pictograms-nps-airport.svg/22px-Pictograms-nps-airport.svg.png',
                disable: ['checkin', 'checkout']
            },
            listing: {
                name: 'listing',
                label: 'その他',
                icon: '//upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Italian_traffic_signs_-_icona_informazioni_%28figura_II_108%29.svg/22px-Italian_traffic_signs_-_icona_informazioni_%28figura_II_108%29.svg.png',
                disable: ['checkin', 'checkout']
            }
        },
        PARAMETERS: [ // Don't include 'name'
            'alt', 'url', 'email', 'address', 'lat', 'long', 'directions', 'phone', 'tollfree', 'checkin', 'checkout', 'hours', 'price', 'wikidata', 'lastedit', 'content'
        ],
        NEWLINE_AFTER: [
            'email', 'directions', 'tollfree', 'price', 'wikidata', 'lastedit', 'content'
        ],
        LASTEDIT: 'lastedit'
    };

    var CURRENT_LAST_EDIT_DATE;
    var currentLastEditDate = function () {
        // return the date as "2015-01-15"
        var d = new Date();
        var year = d.getFullYear();
        // Date.getMonth() returns 0-11
        var month = d.getMonth() + 1;
        if (month < 10) month = '0' + month;
        var day = d.getDate();
        if (day < 10) day = '0' + day;
        CURRENT_LAST_EDIT_DATE = year + '-' + month + '-' + day;
    };

	$.when(currentLastEditDate()).then(function() {
        mw.hook( 'wikiEditor.toolbarReady' ).add( function ( $textarea ) {
            $textarea.wikiEditor( 'addToToolbar', {
                sections: {
                    listings: {
                        type: 'toolbar',
                        label: i18n.SECTION_NAME
                    }
                }
            });
            $textarea.wikiEditor( 'addToToolbar', {
                section: 'listings',
                groups: {
                    templates: {
                        label: i18n.GROUP_NAME
                    }
                }
            });

            $.each(i18n.LISTING_TEMPLATES, function(_, value) {
                var post_text = " ";
                var unit = "| $1= ";
                for (let i = 0; i < i18n.PARAMETERS.length; i++) {
                    if (i18n.PARAMETERS[i] == i18n.LASTEDIT) {
                        post_text = (post_text + unit.replace('$1', i18n.PARAMETERS[i])).slice(0, -1) + CURRENT_LAST_EDIT_DATE;
                    } else if (!(value.disable.includes(i18n.PARAMETERS[i]))) {
                        post_text = post_text + unit.replace('$1', i18n.PARAMETERS[i]);
                    }
                    if (i18n.NEWLINE_AFTER.includes(i18n.PARAMETERS[i])) {
                        post_text = post_text.slice(0, -1) + "\n";
                    }
                }
                post_text = post_text + "}}";

                $textarea.wikiEditor( 'addToToolbar', {
                    section: 'listings',
                    group: 'templates',
                    tools: {
                        Listing: {
                            label: value.label,
                            type: 'button',
                            icon: value.icon,
                            action: {
                                type: 'encapsulate',
                                options: {
                                    pre: "{{" + value.name + "\n| name=",
                                    post: post_text
                                }
                            }
                        }
                    }
                });
            });

            // remove reference button
            if ( typeof $.fn.wikiEditor != 'undefined' ) {
                $( '#wpTextbox1' ).wikiEditor( 'removeFromToolbar', {
                    section: 'main',
                    group: 'insert',
                    tool: 'reference'
                });
            }
        });
    });
}
