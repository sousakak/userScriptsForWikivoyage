//<nowiki>
/** Listing Editor i18n Definitions
	2024-07-29

	Original authors:
	- ausgehe
	- torty3
	Additional contributors:
	- Andyrom75
	- Wrh2
	- RolandUnger
	- Jdlrobson
	Documentation and version history:
	- https://de.wikivoyage.org/wiki/Wikivoyage:ListingEditor.js

	License: GPL-2.0+, CC-by-sa 3.0
*/
/* eslint-disable mediawiki/class-doc */

( function() {
	'use strict';

	var i18n = function() {

		// --------------------------------------------------------------------
		// TRANSLATE THE FOLLOWING BASED ON THE USER/WIKI LANGUAGE IN USE
		// --------------------------------------------------------------------

		const SYSTEM = {
			lang:          'ja',
			listingEditor: 'ListingEditor'
		};

		var STRINGS = {
			add: '追加',
			addTitle: 'リストを追加',
			edit: '編集',
			editTitle: 'リストを編集',
			markerTitle: '既存のマーカーを編集',
			loading: 'エディターを起動中...',
			loadingMarker: 'エディターを起動中...',
			sectionNotFound: 'エラー：vCardのあるセクションが見つかりません',
			ajaxInitFailure: 'エラー：エディターに情報を補完できません',
			ajaxSectionError: 'エラー：セクションロード時にエラーが発生しました',
			saving: '保存中...',
			enterCaptcha: 'CAPTCHAを入力',
			externalLinks: '貴方の編集に新しい外部リンクが含まれています',

			cancel: '中止',
			cancelTitle: '変更を破棄',
			cancelMessage: 'エディターを閉じると、記述内容は破棄されます。本当によろしいですか？',
			deleteMessage: 'ウィキデータへのリンクを削除します。よろしいですか？',
			help: 'ヘルプ',
			helpPage: '//ja.wikivoyage.org/wiki/ヘルプ:Listing Editor',
			helpPageMarker: '//ja.wikivoyage.org/wiki/ヘルプ:Listing Editor',
			helpTitle: 'ヘルプ',
			helpTitleMarker: 'ヘルプ',
			preview: 'プレビュー',
			previewTitle: 'vCardをプレビューします。保存前に使用してください',
			previewTitleMarker: 'マーカーをプレビューします。保存前に使用してください',
			previewOff: 'プレビューを消去',
			previewOffTitle: 'プレビューを消去',
			refresh: 'プレビューの更新',  //  \ue031 not yet working
			refreshTitle: 'プレビューを更新',
			submit: '送信',
			submitTitle: '変更を保存',
			// license text should match MediaWiki:Wikimedia-copyrightwarning
			licenseText: '変更内容を保存すると、あなたは[https://foundation.wikimedia.org/wiki/Special:MyLanguage/Policy:Terms_of_Use 利用規約]に同意するとともに、自分の投稿内容を[https://creativecommons.org/licenses/by-sa/4.0/deed.ja CC BY-SA 4.0ライセンス]および[https://www.gnu.org/copyleft/fdl.html GFDL]のもとの公開に同意したことになります。この同意は取り消せません。\nまた、あなたはハイパーリンクまたはURLがクリエイティブ・コモンズライセンスにおける帰属表示として十分であると認めたことになります。',

			ifNecessary: '（必要に応じて）',
			severalGroups: '（推奨：複数のグループ）',
			searchOnMap: '地図で探す',
			deleteWikidataId: '除去',
			deleteWikidataIdTitle: 'vCardからウィキデータIDを削除',
			deleteWikidataIdTitleMarker: 'マーカーからウィキデータIDを削除',
			fillFromWikidata: 'ウィキデータの情報を補完',

			validationCategory: '接頭辞なしで有効なカテゴリ名を入力してください。',
			validationCoord: '緯度・経度が間違っています。',
			validationEmail: 'メールアドレスが間違っています。',
			validationEmptyListing: '名前か住所のどちらかを入力してください。',
			validationFacebook: 'FacebookのプロフィールIDまたはURLが正しくありません。',
			validationFax: 'ファックス番号が間違っています。',
			validationFlickr: 'FlickrユーザーIDまたはURLが間違っています。',
			validationImage: '接頭辞なしで有効なファイル名を入力してください。',
			validationInstagram: 'Instagramのユーザー名またはURLが間違っています。',
			validationLastEdit: '最終更新日が間違っています。',
			validationMapGroup: 'groupの名前が間違っています。',
			validationMissingCoord: '緯度と経度を両方入力してください。',
			validationMobile: '携帯電話番号が間違っています。',
			validationName: '名前または記事リンクが間違っています。',
			validationNames: '名前、住所、道順などの重複した識別子を削除しました。',
			validationPhone: '電話番号が間違っています。',
			validationSkype: 'Skypeのユーザー名が間違っています。',
			validationTollfree: 'フリーダイヤルが間違っています。',
			validationTiktok: 'TikTokのユーザー名またはURLが間違っています。',
			validationTwitter: 'Twitterのユーザー名またはURLが間違っています。',
			validationType: 'typeを指定してください。',
			validationUrl: 'URLが間違っています。',
			validationYoutube: 'YoutubeのチャンネルIDまたはURLが間違っています。',
			validationZoom: 'ズーム（0-19）が間違っています。',

            commonscat: 'カテゴリ',
			image: 'ファイル|画像', //Local prefix for Image (or File)
			added: '$1のvCardを追加',
			updated: '$1のvCardを更新',
			updatedMarker: '$1のマーカーを更新',
			removed: '$1のvCardを削除',

			submitApiError: 'エラー：リストの保存に失敗しました。再試行してください。',
			submitBlacklistError: 'エラー：内容がブラックリストに抵触しました。該当部を除去して再度保存してください。',
			submitUnknownError: 'エラー：予期しないエラーが発生しました。再試行してください。',
			submitHttpError: 'エラー：サーバーからHTTPエラーが返りました。再試行してください。',
			submitEmptyError: 'エラー：サーバーが空文字列を返しました。再試行してください。',

			viewCommonsPageTitle: 'コモンズで画像を表示',
			viewCommonscatPageTitle: 'コモンズのファイルカテゴリへのリンク',
			viewWikidataPage: 'ウィキデータの項目を表示',
			wikidataShared: 'ウィキデータに以下のデータが見つかりました。反映させますか？',
			wikidataSharedNotFound: 'ウィキデータにはデータが見つかりませんでした。',

            natlCurrencyTitle: '現地通貨の記号を挿入',
			intlCurrencyTitle: '国際通貨記号を挿入',
			callingCodeTitle: '市外局番を挿入',
			contentCharsTitle: '特殊文字を挿入',
			linkTitle: 'サイトへのリンク',
			linkText: '<img src="//upload.wikimedia.org/wikipedia/commons/thumb/2/29/OOjs_UI_icon_link-ltr-progressive.svg/64px-OOjs_UI_icon_link-ltr-progressive.svg.png" height="16" width="16" />',
			contentStatus: '文字数：$1',
			additionalSubtypes: 'ウィキデータから追加情報を取得',
			unknownSubtypes: '既知の追加情報は見当たりませんでした',

			deleteListingLabel: 'このvCardを削除',
			deleteListingTitle: 'このvCardの掲載をやめるべき、削除するべきならば、ボックスにチェックを入れてください。リストが除去されます。',
			minorEditLabel: '細部の編集',
			minorEditTitle: '誤字の修正のような小さな編集ならばボックスにチェックを入れてください。',
			statusLabel: 'ステータス',
			statusTitle: '削除や更新などの項目のステータスに関する情報',
			summaryLabel: '編集の要約',
			summaryTitle: '追加・編集についての簡便な要約',
			summaryPlaceholder: '編集の要約を入力',
            summaryPlaceholderMarker: '編集の要約を入力',
			updateLastedit: '最終更新日の更新',
			updateTodayLabel: '最終更新日を今日に設定',
			updateTodayTitle: '情報がすべて最新であることを確認したら、ここにチェックを入れてください。入力された日付か今日の日付が保存されます。',

			textPreviewLabel: 'Preview',
			textPreviewTitle: 'Preview of the listing with the current form data',
			textPreviewTitleMarker: 'Preview of the marker with the current form data',
			syntaxPreviewLabel: 'Wiki syntax',
			syntaxPreviewTitle: 'Wiki syntax of the listing with the current form data',
			syntaxPreviewTitleMarker: 'Wiki syntax of the marker with the current form data',
			toContentLabel: 'Description',
			toContentTitle: 'Show description',
			chosenNoResults: 'No match with',

			optionYes: 'はい（既定）',
			optionNo: 'いいえ',

			optionCoordinatesGroup: '座標',
			optionAll: 'マーカーと座標',
			optionPoi: 'マーカーのみ（既定）',
			optionCoordinates: '座標',
			optionNone: '座標なし',
			optionOptionsGroup: 'Listingのオプション',
			optionOptionsGroupMarker: 'マーカーのオプション',
			optionCopyMarker: 'マーカーを複製',
			optionMakiIcon: 'MAKIアイコン',
			optionNoAirport: '空港コードなし',
			optionNoSitelinks: 'サイトリンク無し',
			optionNoSocialmedia: 'SNSなし',
			optionSocialmedia: 'SNSあり',
			optionFeaturesGroup: '場所の追加情報',
			optionNoSubtype: '追加情報なし',
			optionNoWdSubtype: 'ウィキデータからの追加情報なし',
			optionDisplayGroup: 'テンプレート表示',
			optionNoName: '名前なし',
			optionOutdent: 'インデントしない',
			optionInline: 'インライン',
			optionWikilink: '転送ページへのリンクを使用',
			optionNoPeriod: '説明文の前に読点をつけない'
		};

		/** The arrays below must include entries for each listing template
		parameter in use for each Wikivoyage language version - for example
		"name", "address", "phone", etc.  If all listing template types use
		the same parameters then a single configuration array is sufficient,
		but if listing templates use different parameters or have different
		rules about which parameters are required then the differences must
		be configured - for example, German Wikivoyage uses "checkin" and
		"checkout" in the "sleep" template, so a separate HIDE_AND_SHOW
		array has been created below to define the different requirements
		for that listing template type.

		Once arrays of parameters are defined, the TEMPLATES
		mapping is used to link the configuration to the listing template
		type, so in the German Wikivoyage example all listing template
		types use the PARAMETERS configuration.

		Fields that can used in the configuration array(s):
		-	label.
		-	title.
		-	ph: placeholder.

		Additional fields are stored in PARAMETERS_ADD and ALIASES.

		Please translate only the label, title, the placeholder string ph and
		the option text but not the tags itselves. */
        
		var PARAMETERS = {
			name: { label: '名前', title: 'この場所の名前', ph: '  この場所の名前' },
			'name-local': { label: '現地語の名前', title: '現地語での名前', ph: '  現地語での名前' },
			'name-latin': { label: 'ラテン文字名', title: 'ラテン文字での名前', ph: '  ラテン文字での名前' },
			'name-map' : { label: '地図上の名前', title: '地図上で表示される名前', ph: '地図上での名前' },
            alt: { label: '別名', title: 'この場所の別名', ph: '  この場所の別名' },
			comment: { label: 'コメント', title: '元から、あるいはもはや名前の一部ではない名前や組織についての注記', ph: '  呼称についての注記' },

			type: { label: '種類', title: 'この場所の種類', ph: 'この場所の種類' },
			group: { label: 'グループ', title: '上書き時のみ使用', ph: '訪問の目的。例：see' },
			wikidata: { label: 'ウィキデータ', title: 'ウィキデータID', ph: 'ウィキデータID' },
			auto: { label: '自動', title: 'ウィキデータから全データを自動取得', ph: 'ウィキデータから取得' },

			url: { label: '外部リンク', title: '公式サイトのURL', ph: '  公式サイトのURL' },
			address: { label: '住所', title: 'この場所の住所', ph: '  この場所の住所' },
			'address-local': { label: '現地語の住所', title: '現地語での住所', ph: '  現地語での住所' },
			directions: { label: '道順', title: 'この場所への道順', ph: '  この場所への道順' },
			'directions-local': { label: '現地語の道順', title: '現地語での道順', ph: '  現地語での道順' },
			lat: { aliases: [ 'coord', '緯度' ], label: '緯度', title: 'この場所の緯度', ph: '  この場所の緯度' },
			long: { aliases: [ '経度' ], label: '経度', title: 'この場所の経度', ph: '  この場所の経度' },

			phone: { label: '電話番号', title: 'この場所の電話番号', ph: '  この場所の電話番号' },
			mobile: { label: '携帯電話', title: '携帯電話番号', ph: '  携帯電話番号' },
			tollfree: { label: 'フリーダイヤル', title: 'フリーダイヤル番号', ph: '  フリーダイヤル番号' },
			fax: { label: 'ファックス', title: 'ファックスの番号', ph: '  ファックスの番号' },
			email: { label: 'メール', title: 'メールアドレス', ph: '  メールアドレス' },
			// skype: { label: 'Skype-Name', title: 'Skype-Benutzername der Einrichtung', ph: '  Beispiel: myskype' },
			// facebook: { label: 'Facebook-URL', title: 'Facebook-Profil-ID oder Facebook-Webadresse der Einrichtung', ph: '  Beispiele: myfacebook, https://www.facebook.com/myfacebook' },
			// flickr: { label: 'flickr-Gruppe', title: 'Name der flickr-Gruppe oder flickr-Webadresse der Einrichtung', ph: '  Beispiel: myflickr' },
			// instagram: { label: 'Instagram-Name', title: 'Instagram-Benutzername oder Instagram-Webadresse der Einrichtung', ph: '  Beispiel: myinstagram' },
			// tiktok: { label: 'TikTok-URL', title: 'TikTok-Benutzername ohne „@“ oder TikTok-Webadresse der Einrichtung', ph: '  Beispiel: mytiktok' },
			// twitter: { label: 'Twitter-URL', title: 'Twitter-Benutzername oder Twitter-Webadresse der Einrichtung', ph: '  Beispiel: mytwitter' },
			// youtube: { label: 'YouTube-Kanal', title: 'Kennung oder Webadresse des YouTube-Kanals der Einrichtung', ph: '  Beispiel: myyoutube' },

            hours: { label: '営業時間', title: '営業している時間', ph: '  営業している時間' },
			checkin: { label: 'チェックイン', title: 'チェックインの時間', ph: '  チェックインの時間' },
			checkout: { label: 'チェックアウト', title: 'チェックアウトの時間', ph: '  チェックアウトの時間' },
			price: { label: '値段', title: '利用にかかる値段', ph: '  利用にかかる値段' },
			payment: { label: '支払方法', title: '利用できる支払方法', ph: '  利用できる支払方法' },
			subtype: { label: '追加情報', title: '追加の細かな情報', ph: '追加の情報' },
			image: { label: '画像', title: '地図上で表示される画像', ph: '  地図上で表示される画像' },
			commonscat: { label: 'コモンズのカテゴリ', title: 'この場所の画像のカテゴリ', ph: '  この場所の画像のカテゴリ' },
            show: { label: '表示', title: '地図上に表示するもの', ph: '地図上に表示するもの' },
			zoom: { label: '縮尺', title: '表示される地図の縮尺レベル（0～19）。', ph: '  既定：17' },
			'map-group': { label: '所属レイヤー', title: '地図のレイヤー名（グループ名）。vCardを既定とは違う地図に表示したい場合に用います。半角英数字のみを用い、先頭の文字は数字ではいけません。', ph: '  例：group1' },
			lastedit: { label: '最終更新', title: 'ISO 8601拡張形式（yyyy-mm-dd）で記入。このvCardの最終更新日です。空にした場合、今日の日付が自動挿入されます。', ph: '例：2020-01-15' },

			before: { label: '接頭辞', title: 'vCardの前に置かれる文字や記号', ph: '例：[[ファイル:Sternchen.jpg]]' },
			description: { label: '内容', title: 'この場所の説明。1000文字以内に収めてください。', ph: '場所の説明' },
        };

		function init() {
			window[ SYSTEM.listingEditor ].LANG = SYSTEM.lang;
			window[ SYSTEM.listingEditor ].STRINGS = STRINGS;
			window[ SYSTEM.listingEditor ].PARAMETERS = PARAMETERS;
		}

		return { init };
	} ();

	$( i18n.init );

} () );

//</nowiki>
