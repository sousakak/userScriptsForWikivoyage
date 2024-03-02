// <source lang="javascript">
// 完成状況 : 編集段階
// 当スクリプトは編集段階です。使用してもエラーが出る可能性が高く、未完成です。
/******************************************************************************/
// ja>>transportEditor
//   >>交通の記事で視覚的にいくつかの編集を行うツール
//   >>
//   >>作者    : Tmv
//   >>URL    : https://github.com/sousakak/userScriptsForWV/blob/master/transportEditor.js
//   >>
//   >>使用方法
//   >>[[Special:MyPage/common.js]]に以下のコードを追加 : 
//   >>mw.loader.load('//ja.wikivoyage.org/w/index.php?title=User:Tmv/custom/transportEditor.js&action=raw&ctype=text/javascript');
/******************************************************************************/
const i18n = {
    translations : {
        labelButtonEdit : "編集",
        labelButtonAdd : "追加",
    }
}

mw.loader.using(['vue', '@wikimedia/codex' ]).then( ( require ) => {
    const { ref } = require( 'vue' );
	const { CdxButton, CdxIcon } = require( '@wikimedia/codex' );
    const { cdxIconEdit } = require( './icons.json' );

    if ( $(".voy-stalist").length() ) {
        const editStalist = {
            template: `
                <cdx-button
                    weight="quiet"
                    aria-label="` + i18n.translations.labelButtonEdit + `"
                    style="float: right;"
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
                    openDialog('edit')
                }

                return {
                    cdxIconEdit,
                    onClick
                }
            }
        }
        Vue.createMwApp( editStalist ).mount( '.voy-stalist-title' );
    } else if ( $(".mw-headline#乗る").length() ) {
        const addStalist = {
            template: `
            <cdx-button
                weight="quiet"
                aria-label="` + i18n.translations.labelButtonAdd + `"
                @click="onClick"
            >
                <cdx-icon
                    :icon="cdxIconAdd"
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
                    openDialog('add')
                }

                return {
                    cdxIconEdit,
                    onClick
                }
            }
        }
    }
});
