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
//   >>mw.loader.load('https://raw.githubusercontent.com/sousakak/userScriptsForWikivoyage/refs/heads/master/test/getVCardSetting.js');
/******************************************************************************/

/**
 * Fetch the setting data from the specified lua module.
 * @param {Object} scribunto       Information about the target lua module.
 * @param {string} scribunto.title Title of the target lua module.
 * @param {RegExp} scribunto.start To remove from start
 * @param {RegExp} scribunto.end   To remove at the end
 * @param {string} scribunto.name  Name of the new array in json format
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

/**
 * Returns a Promise with the vCard settings.
 * This function is designed to be loaded as a gadget from an external script
 * via `mw.loader.using()`.
 * @returns {jQuery.Promise} With settings object.
 */
module.exports =  () => {
    'use strict';

    if (typeof window.voy === 'undefined') window.voy = {};

    if (typeof window.voy.VCardSetting !== 'undefined') { // avoid duplicate loading
        const deferred = $.Deferred();
        deferred.resolve( window.voy.VCardSetting );
        return deferred.promise();
    };
    return mw.loader.using( 'mediawiki.api' ).then( _ => {
        /** @type {Object<string, Object>} */
        let setting = {};
        /** @type {Object<string, string|RegExp>[]} */
        const scribuntos = [
            {
                title: 'Module:Marker utilities/Types', // name of module to import
                start: /^.*types={/g,                   // to remove from start
                end: /,?},?}$/g,                        // to remove at the end
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
        for (const scribunto of scribuntos) {
            fetchData( scribunto ).done( data => {
                setting[scribunto.name] = data;
            });
        }
        window.voy = Object.assign( window.voy, { VCardSetting: setting } );
        return setting;
    });
};