//<nowiki>
/**
 * Dependencies library. The code should be restructured to load only when needed.
 */
const dependencies = [
    'mediawiki.api',
    'mediawiki.ForeignApi',
    'mediawiki.user'
];

mw.loader.using( dependencies, _ => {
    /**
     * Information used in this script.
     * I didn't pass a list to mw.config.get() to get the object to unify key names.
     * 
     * @readonly
     */
    const infos = mw.user.getRights( r => {
        return {
            page: {
                action: mw.config.values.wgAction,
                lang: mw.config.values.wgContentLanguage,
                ns: mw.config.values.wgNamespaceNumber,
                title: mw.config.values.wgTitle
            },
            user: {
                group: mw.config.values.wgUserGroups,
                globalGroup: mw.config.values.wgGlobalGroups,
                lang: mw.config.values.wgUserLanguage,
                options: mw.user.options.values,
                rights: r
            }
        };
    });

    /**
     * Following bullets are locations needing internationalization.
     ** 保存しました
     ** 
     */
    const i18n = {}

    if (infos.user.group === null || !'edit' in mw.user.rights) return;

    const Api = {
        local: new mw.Api(),
        global: new mw.ForeignApi( 'https://meta.wikimedia.org/w/api.php' )
    };

    const Utils = (() => {
        /**
         * Set preferences.
         * 
         * @param {Object} options Object of options to save.
         * @param {Boolean} global if true, options are set globally.
         */
        const setOptions = (options, global = true) => {
            const savingApi = global ? Api.global : Api.local;
            const params = {
                action: 'option',
                change: Object.keys(options)
                    .map( key => `${key}=${options[key]}|` )
                    .join('')
                    .slice(0, -1),
                format: 'json'
            };
            savingApi.postWithToken( 'csrf', params ).done( r => {
                mw.notify( 'Almightの設定を保存しました。', { title: '保存しました' } );
            });
        }

        return {
            setOptions
        }
    })();
});
//</nowiki>