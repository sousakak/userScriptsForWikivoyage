// <source lang="javascript">
// 完成状況 : 校正段階
// 当スクリプトは校正段階です。使用できますが、予期せぬ挙動をする可能性があります。その際はTmvの会話ページにお知らせください。
/******************************************************************************/
// ja>>purge
//   >>ページにキャッシュを破棄するリンク（表示は「更新」）を追加する
//   >>
//   >>作者    : Tmv
//   >>URL     : https://ja.wikivoyage.org/w/index.php?title=User:Tmv/custom/Edit_toolbar.js
//   >>原典    : https://en.wikivoyage.org/w/index.php?oldid=4752473#L-55 (CC BY-SA 4.0 DEED)
//   >>
//   >>使用方法
//   >>[[Special:MyPage/common.js]]に以下のコードを追加 : 
//   >>mw.loader.load('//ja.wikivoyage.org/w/index.php?title=User:Tmv/custom/Edit_toolbar.js&action=raw&ctype=text/javascript');
/******************************************************************************/

// Add listing buttons in edit toolbar
var i18n = {
    lang: 'ja',
    SECTION_NAME: 'リスト',
    LISTING_TEMPLATES: {
        see: {
            name: 'see',
            label: '観る',
            icon: '//upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Italian_traffic_signs_-_icona_museo.svg/22px-Italian_traffic_signs_-_icona_museo.svg.png',
            disable: ['chekin', 'checkout']
        },
        do: {
            name: 'do',
            label: 'する',
            icon: '//upload.wikimedia.org/wikipedia/commons/thumb/3/30/Pictograms-nps-bicycle_trail-2.svg/22px-Pictograms-nps-bicycle_trail-2.svg.png',
            disable: ['chekin', 'checkout']
        },
        buy: {
            name: 'buy',
            icon: '//upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Italian_traffic_signs_-_icona_supermercato.svg/22px-Italian_traffic_signs_-_icona_supermercato.svg.png',
            disable: ['chekin', 'checkout']
        },
        eat: {
            name: 'eat',
            label: '食べる',
            icon: '//upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Italian_traffic_signs_-_icona_ristorante.svg/22px-Italian_traffic_signs_-_icona_ristorante.svg.png',
            disable: ['chekin', 'checkout']
        },
        drink: {
            name: 'drink',
            label: '飲む',
            icon: '//upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Verre_cocktail.svg/22px-Verre_cocktail.svg.png',
            disable: ['chekin', 'checkout']
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
            disable: ['chekin', 'checkout']
        },
        listing: {
            name: 'listing',
            label: 'その他',
            icon: '//upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Italian_traffic_signs_-_icona_informazioni_%28figura_II_108%29.svg/22px-Italian_traffic_signs_-_icona_informazioni_%28figura_II_108%29.svg.png',
            disable: ['chekin', 'checkout']
        }
    },
    PARAMETERS: [ // Don't include 'name'
        'alt', 'url', 'email', 'address', 'lat', 'long', 'directions', 'phone', 'tollfree', 'checkin', 'checkout', 'hours', 'price', 'wikidata', 'lastedit', 'content'
    ],
    NEWLINE_AFTER: [
        'email', 'directions', 'tollfree', 'price', 'wikidata', 'lastedit', 'content'
    ],
    LASTEDIT: 'lastedit',
    LISTING_TOOLBAR_ITEMS: {
        'see': {
            label: '観る',
            icon: '//upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Italian_traffic_signs_-_icona_museo.svg/22px-Italian_traffic_signs_-_icona_museo.svg.png',
            options: {
                pre: '* \{\{see\n| name=',
                post: ' | alt= | url= | email=\n| address= | lat= | long= | directions=\n| phone= | tollfree=\n| hours= | price=\n| wikidata=\n| lastedit=' + CURRENT_LAST_EDIT_DATE + '\n| content=\n}}' // text to be inserted
            }
        },
        'do': {
            label: 'する',
            icon: '//upload.wikimedia.org/wikipedia/commons/thumb/3/30/Pictograms-nps-bicycle_trail-2.svg/22px-Pictograms-nps-bicycle_trail-2.svg.png',
            options: {
                pre: '* \{\{do\n| name=',
                post: ' | alt= | url= | email=\n| address= | lat= | long= | directions=\n| phone= | tollfree=\n| hours= | price=\n| wikidata=\n| lastedit=' + CURRENT_LAST_EDIT_DATE + '\n| content=\n}}' // text to be inserted
            }
        },
        'buy': {
            label: '買う',
            icon: '//upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Italian_traffic_signs_-_icona_supermercato.svg/22px-Italian_traffic_signs_-_icona_supermercato.svg.png',
            options: {
                pre: '* \{\{buy\n| name=',
                post: ' | alt= | url= | email=\n| address= | lat= | long= | directions=\n| phone= | tollfree=\n| hours= | price=\n| wikidata=\n| lastedit=' + CURRENT_LAST_EDIT_DATE + '\n| content=\n}}' // text to be inserted
            }
        },
        'eat': {
            label: '食べる',
            icon: '//upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Italian_traffic_signs_-_icona_ristorante.svg/22px-Italian_traffic_signs_-_icona_ristorante.svg.png',
            options: {
                pre: '* \{\{eat\n| name=',
                post: ' | alt= | url= | email=\n| address= | lat= | long= | directions=\n| phone= | tollfree=\n| hours= | price=\n| wikidata=\n| lastedit=' + CURRENT_LAST_EDIT_DATE + '\n| content=\n}}' // text to be inserted
            }
        },
        'drink': {
            label: '飲む',
            icon: '//upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Verre_cocktail.svg/22px-Verre_cocktail.svg.png',
            options: {
                pre: '* \{\{drink\n| name=',
                post: ' | alt= | url= | email=\n| address= | lat= | long= | directions=\n| phone= | tollfree=\n| hours= | price=\n| wikidata=\n| lastedit=' + CURRENT_LAST_EDIT_DATE + '\n| content=\n}}' // text to be inserted
            }
        },
        'sleep': {
            label: '泊まる',
            icon: '//upload.wikimedia.org/wikipedia/commons/thumb/2/25/Pictograms-nps-lodging.svg/22px-Pictograms-nps-lodging.svg.png',
            options: {
                pre: '* \{\{sleep\n| name=',
                post: ' | alt= | url= | email=\n| address= | lat= | long= | directions=\n| phone= | tollfree= | fax=\n| checkin= | checkout= | price=\n| wikidata=\n| lastedit=' + CURRENT_LAST_EDIT_DATE + '\n| content=\n}}' // text to be inserted
            }
        },
        'go': {
            label: '行く',
            icon: '//upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Pictograms-nps-airport.svg/22px-Pictograms-nps-airport.svg.png',
            options: {
                pre: '* \{\{listing| type=go\n| name=',
                post: ' | alt= | url= | email=\n| address= | lat= | long= | directions=\n| phone= | tollfree=\n| hours= | price=\n| wikidata=\n| lastedit=' + CURRENT_LAST_EDIT_DATE + '\n| content=\n}}' // text to be inserted
            }
        },
        'listing': {
            label: 'その他',
            icon: '//upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Italian_traffic_signs_-_icona_informazioni_%28figura_II_108%29.svg/22px-Italian_traffic_signs_-_icona_informazioni_%28figura_II_108%29.svg.png',
            options: {
                pre: '* \{\{listing\n| name=',
                post: ' | alt= | url= | email=\n| address= | lat= | long= | directions=\n| phone= | tollfree=\n| hours= | price=\n| wikidata=\n| lastedit=' + CURRENT_LAST_EDIT_DATE + '\n| content=\n}}' // text to be inserted
            }
        }
    }
}

if ( [ 'edit', 'submit' ].indexOf( mw.config.get( 'wgAction' ) ) !== -1 ) {
    var CURRENT_LAST_EDIT_DATE;
    $( function () {
        // return the date as "2015-01-15"
        var d = new Date();
        var year = d.getFullYear();
        // Date.getMonth() returns 0-11
        var month = d.getMonth() + 1;
        if (month < 10) month = '0' + month;
        var day = d.getDate();
        if (day < 10) day = '0' + day;
        CURRENT_LAST_EDIT_DATE = year + '-' + month + '-' + day;
    });

	mw.hook( 'wikiEditor.toolbarReady' ).add( function ( $textarea ) {
		$textarea.wikiEditor( 'addToToolbar', {
			sections: {
                listings: {
                    type: 'toolbar',
                    label: i18n.SECTION_NAME,
                    filters: [ 'body.ns-subject' ]
                }
            }
		});

        $.each(i18n.LISTING_TEMPLATES, function(_, value) {
            var post_text = ""
            var unit = " | $1="
            for (let i = 0; i18n.PARAMETERS.length; i++) {
                if (i18n.PARAMETERS[i] == i18n.LASTEDIT) {
                    post_text = post_text + unit.replace('$1', i18n.PARAMETERS[i]) + CURRENT_LAST_EDIT_DATE
                } else if (not(i18n.PARAMETERS[i] in value.disable)) {
                    post_text = post_text + unit.replace('$1', i18n.PARAMETERS[i])
                }
                if (i18n.PARAMETERS[i] in i18n.NEWLINE_AFTER) {
                    post_text = post_text + "\n"
                }
            }
            post_text = post_text + "}}"

            $textarea.wikiEditor( 'addToToolbar', {
                section: 'listings',
                tools: {
                    Listing: {
                        label: value.label,
                        type: 'button',
                        icon: value.icon,
                        action: {
                            type: 'encapsulate',
                            options: {
                                pre: "{{" + value.name + "\n|name=",
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
}