// <source lang="javascript">
// 完成状況 : 完成
// 当スクリプトは完成しています。不具合は出ていませんが、使用する際には自己責任でお願い致します。
/******************************************************************************/
// ja>>purge
//   >>ページにキャッシュを破棄するリンク（表示は「更新」）を追加する
//   >>
//   >>作者    : Tmv
//   >>URL     : https://ja.wikivoyage.org/w/index.php?title=User:Tmv/custom/purge.js
//   >>
//   >>取り入れ方
//   >>[[Special:MyPage/common.js]]に以下のコードを追加 : 
//   >>mw.loader.load('//ja.wikivoyage.org/w/index.php?title=User:Tmv/custom/purge.js&action=raw&ctype=text/javascript');
/******************************************************************************/
$.when(mw.loader.using([ 'mediawiki.util', 'mediawiki.api' ]), $.ready).then(function($) {
	if (mw.config.get("wgUserLanguage") == "ja") { // 日本語版
		mw.messages.set({
			'purgeTabLabel': '更新', 
			'purgeTabTooltip': 'キャッシュを破棄', 
			'purgeAlert': 'キャッシュを破棄します。よろしいですか？', 
			'purgeError': 'キャッシュの破棄に失敗しました。'
		});
	} else if(mw.config.get("wgUserLanguage") == "fr") { // フランス語版
		mw.messages.set({
			'purgeTabLabel': 'Purger', 
			'purgeTabTooltip': 'Purger le cache', 
			'purgeAlert': 'Cela va purger le cache. OK?', 
			'purgeError': 'Échec de la purger du cache.'
		});
	} else /* if(mw.config.get("wgUserLanguage") == "en") */ { // 英語版 (規定)
		mw.messages.set({
			'purgeTabLabel': 'Purge', 
			'purgeTabTooltip': 'Purge cache', 
			'purgeAlert': 'This will purge the cache. OK?', 
			'purgeError': 'Failed to purge cache.'
		});
	}
	
	// モバイル版
	var isMobile = window.location.href.match(/^https?:\/\/[^.]+\.m\./);
	var addMobile = '<li class="toggle-list-item"><a class="toggle-list-item__anchor menu__item--page-actions-overflow-purge mw-ui-icon mw-ui-icon-before mw-ui-icon-minerva-page-actions-overflow-permalink  mw-ui-icon mw-ui-icon-before mw-ui-icon-minerva-link" href="https://' + document.domain + '/w/index.php?title=' + mw.config.get('wgPageName') + '&action=purge" data-event-name="menu.purge" data-mw="interface" title="' + mw.msg("purgeTabTooltip") + '"><span class="toggle-list-item__icon"><span class="toggle-list-item__label">' + mw.msg('purgeTabLabel') + '</span></span></a></li>';
	
	if(mw.config.get("skin") != "monobook" && mw.config.get("skin") != "modern" && !isMobile) { // モノブックスキンでもモダンスキンでもモバイル版でもなく
		if(mw.config.get("wgNamespaceNumber") != -1) { // 特別ページでない
			if(mw.config.get("wgAction") == "view") { // 閲覧画面
				$(mw.util.addPortletLink("p-cactions", "https://" + document.domain + "/w/index.php?title=" + mw.config.get('wgPageName') + "&action=purge", mw.msg('purgeTabLabel'), "ca-purge", mw.msg("purgeTabTooltip") + " [alt-shift-h]", "h"));
			} else switch(mw.config.get("wgAction")){
				case 'delete': // 削除画面
				case 'history': // 履歴画面
				case 'protect': // 保護画面
				case 'unprotect': // 保護変更画面
				case 'credits': // 帰属表示画面
				case 'info': // 情報画面
				case 'submit':
					$(mw.util.addPortletLink("p-cactions", "https://" + document.domain + "/w/index.php?title=" + mw.config.get('wgPageName') + "&action=purge", mw.msg('purgeTabLabel'), "ca-purge", mw.msg("purgeTabTooltip")));
					break;
			}
		} else if(mw.config.get("wgPageName").startsWith("特別:移動")) { // 移動画面
			$(mw.util.addPortletLink("p-cactions", "https://" + document.domain + "/w/index.php?title=" + mw.config.get('wgPageName') + "&action=purge", mw.msg('purgeTabLabel'), "ca-purge", mw.msg("purgeTabTooltip")));
		}
	} else if(mw.config.get("skin") != "monobook" && mw.config.get("skin") != "modern") { // モノブックスキン或いはモダンスキン
		if(mw.config.get("wgNamespaceNumber") != -1) { // 特別ページでない
			$(mw.util.addPortletLink("p-cactions", "https://" + document.domain + "/w/index.php?title=" + mw.config.get('wgPageName') + "&action=purge", mw.msg('purgeTabLabel'), "ca-purge", mw.msg("purgeTabTooltip"), null, "#ca-move"));
		}
	} else { // モバイル版
		$('.toggle-list__list--drop-down').append(addMobile);
	}
});

// キーボード操作を利用可能に
if(mw.config.get('wgAction') == 'purge') {
	$(function() {
		// 確認画面を自動化
		window.setTimeout(function(){
			if ( mw.config.get( 'wgAction' ) === 'purge' ) {
				$('form[action*="action=purge"]').submit();
			}
		}, -10);
	});
}