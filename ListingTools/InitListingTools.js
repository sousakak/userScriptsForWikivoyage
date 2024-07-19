//<nowiki>
/**	initListingTools v2.0-ja, 2024-07-19
	Initialization of listing editor and listing info
	Original author: Roland Unger
    Additional contributor: Tmv
	Support of desktop and mobile views
	Documentation: in preparation
	License: GPL-2.0+, CC-by-sa 3.0
*/

module.exports = await ( async ( $, mw ) => {
	'use strict';

	let initListingTools = (() => {
		// options for module import
		let options = [
			{
				page: 'Module:Marker utilities/Types', // name of module to import
				index: 'type',                         // name of key field
				start: /^.*types *= *{/g,              // to remove from start
				end: /,? *},? *} *$/g,                 // to remove at the end
				label: 'label',                        // second sort key
				alias: 'alias',                        // alias for index
				arrayName: 'types',                    // name of the new array
				defaultArray: [
					{ 'type': 'area', group: 'area', label: '地域' },
					{ 'type': 'buy', group: 'buy', label: '買う' },
					{ 'type': 'do', group: 'do', label: 'する' },
					{ 'type': 'drink', group: 'drink', label: '飲む' },
					{ 'type': 'eat', group: 'eat', label: '食べる' },
					{ 'type': 'go', group: 'go', label: '行く' },
					{ 'type': 'other', group: 'other', label: 'その他' },
					{ 'type': 'populated', group: 'populated', label: '都市' },
					{ 'type': 'see', group: 'see', label: '観る' },
					{ 'type': 'sleep', group: 'sleep', label: '泊まる' },
					{ 'type': 'view', group: 'view', label: '眺める' },
				]
			},
			{
				page: 'Module:Marker utilities/Groups',
				index: 'group',
				start: /^.*groups *= *{/g,
				end: /,? *},? *} *$/g,
				label: 'label',
				alias: 'alias',
				arrayName: 'groups',
				defaultArray: [
					{ group: 'area', label: '地域', color: '#0000FF' },
					{ group: 'buy', label: '買う', color: '#008080' },
					{ group: 'do', label: 'する', color: '#808080' },
					{ group: 'drink', label: '飲む', color: '#000000' },
					{ group: 'eat', label: '食べる', color: '#D2691E' },
					{ group: 'go', label: '行く', color: '#A52A2A' },
					{ group: 'other', label: 'その他', color: '#228B22' },
					{ group: 'populated', label: '都市', color: '#0000FF' },
					{ group: 'see', label: '観る', color: '#4682B4' },
					{ group: 'sleep', label: '泊まる', color: '#000080' },
					{ group: 'view', label: '眺める', color: '#4169E1' },
				]
			},
			{
				page: 'Module:VCard/Subtypes',
				index: 'type',
				start: /^.* f *= *{/g,
				end: /,? *} *, *g *=.*$/g,
				sortKey: 'sortkey', // first sort key
				label: 'n',         // second sort key
				arrayName: 'subtypes',
				defaultArray: [
					{ 'type': 'budget',   g: 1, w: '', n: '', f: '' },
					{ 'type': 'midrange', g: 1, w: '', n: '', f: '' },
					{ 'type': 'upmarket', g: 1, w: '', n: '', f: '' },
				]
			},
			{
				page: 'Module:VCard/Cards',
				index: '',                  // only import, no rearranging
				start: /^.*cards *= *{/g,
				end: /,? *},? *} *$/g,
				arrayName: 'payments',
				defaultArray: {}
			},
			{
				page: 'Module:Hours/i18n',
				index: '',
				start: /^.*dateIds *= *{/g,
				end: /,? *},? *} *$/g,
				arrayName: 'hours',
				defaultArray: {}
			},
			{
				page: 'Module:VCard/Qualifiers',
				index: '',
				start: /^.*labels *= *{/g,
				end: /,? *},? *} *$/g,
				arrayName: 'qualifiers',
				defaultArray: {}
			},
			{
				page: 'Module:CountryData/Currencies',
				index: '',
				start: /^.*currencies *= *{/g,
				end: /,? *} *, *isoToQid *=.*$/g,
				arrayName: 'currencies',
				defaultArray: {}
			}
		];
	
		// data: data array from module
		// item: single item from options array
		// isDefault: data are defaults from options array
		let analyzeAndCopyData = ( data, item, isDefault ) => {
			let i, dataItem;

			// adding missing label from index
			for ( i = 0; i < data.length; i++ ) {
				dataItem = data[ i ];
				dataItem[ item.label ] = dataItem[ item.label ] || '';
				if ( dataItem[ item.label ] === '' ) {
					if ( typeof dataItem[ item.alias ] === 'undefined' )
						dataItem[ item.label ] = dataItem[ item.index ].replace( /_/g, ' ' );
					else
						if ( typeof( dataItem[ item.alias ] ) === 'string' )
							dataItem[ item.label ] = dataItem[ item.alias ].replace( /_/g, ' ' );
						else if ( dataItem[ item.alias ][ 0 ] )
							dataItem[ item.label ] = dataItem[ item.alias ][ 0 ].replace( /_/g, ' ' );
				}
			}
			// sorting by label in alphabetic order
			data.sort( ( a, b ) => {
				if ( item.sortKey ) {
					a = a[ item.sortKey ] || a[ item.label ];
					b = b[ item.sortKey ] || b[ item.label ];
				} else {
					a = a[ item.label ];
					b = b[ item.label ];
				}
				return a.localeCompare( b );
			} );

			// copying
			if ( isDefault ) {
				// copy only if window.ListingEditor.array is empty
				if ( typeof window.ListingEditor[ item.arrayName ] === 'undefined' ||
					window.ListingEditor[ item.arrayName ].length < 1 ) {
					window.ListingEditor[ item.arrayName ] = [].concat( data );
				}
			} else {
				window.ListingEditor[ item.arrayName ] = [].concat( data );
			}

            return data;
		};
        // item: item from options array
		let getDataFromSingleModule = item => {
			return $.ajax( {
				type: 'GET',
				url: mw.util.wikiScript( '' ),
				data: { title: item.page, action: 'raw', ctype: 'text/plain' },
				timeout: 3000,
				dataType: 'text'
			} ).then(  data => {
				data = data.replace( /\-\-.*\n/g, '' )      // remove comments
					.replace( /[\s+\t+]/gm, ' ' );          // remove line breaks and tabs

				if ( item.index !== '' )
					// convert to (sortable) array
					data = data.replace( item.start, '[' )  // delete beginning
						.replace( item.end, ']' )           // delete end
						.replace( /([,{]) *(wd|alias) *= *\{([^}]*)\}/g, '$1 "$2": [$3]' )
						.replace( /( *\[ *")([\w\-]+)(" *\] *= *\{)/g, '{ "' + item.index + '": "$2", ' )
						.replace( /( *)([\w\-]+)( *= *\{)/g, '{ "' + item.index + '": "$2", ' )
						.replace( /(, *)([\w\-]+)( *=)/g, ', "$2":' );
				else
					// keep as object
					data = data.replace( item.start, '{' )  // delete beginning
						.replace( item.end, '}' )           // delete end
						.replace( /( *\[ *")([\w\-]+)(" *\] *= *)/g, '"$2":' )
						.replace( /([,\{]) *([\w\-]+)( *=)/g, '$1 "$2":' );

				// check if data string is valid JSON
				let isDefault = false, json, fmtData;
				try {
					json = JSON.parse( data );
				} catch ( e ) {
					// invalid JSON
					json = item.defaultArray;
					isDefault = true;
					let pos = e.message.match( /column (\d+) of/i )[ 1 ];
					pos = data.substring( pos - 10, pos + 10 );
					console.log( e.message + ', data: ' + item.page + ', text: ' + pos );
				}
				if ( item.index !== '' )
                    fmtData = analyzeAndCopyData( json, item, isDefault );
				else
                    fmtData = json;
					window.ListingEditor[ item.arrayName ] = json;
                let dataObj = {}; dataObj[ item.arrayName ] = fmtData;
                return dataObj;
			} ).catch( () => {
				let json = item.defaultArray, fmtData;
				if ( item.index !== '' )
                    fmtData = analyzeAndCopyData( json, item, true );
				else
                    fmtData = json;initListingToolsvar
					window.ListingEditor[ item.arrayName ] = json;
                let dataObj = {}; dataObj[ item.arrayName ] = fmtData;
                return dataObj;
			} );
		};

		let getDataFromModules = async () => {
			let i, allData = {};

			// mw already exists but maybe not the ListingEditor object
			if ( typeof window.ListingEditor === 'undefined' )
				window.ListingEditor = {};

			for ( i = 0; i < options.length; i++ ) 
                Object.assign(allData, await getDataFromSingleModule( options[ i ] ));

			return allData;
		};

		let init = async () => {
			return await getDataFromModules();
		};

		return { init: init };
	})();

	return await initListingTools.init();

})( jQuery, mediaWiki );
// </nowiki>