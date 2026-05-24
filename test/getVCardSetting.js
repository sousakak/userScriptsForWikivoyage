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

func().then( r => {console.log(r)} );