//<nowiki>
/**	initListingTools v1.1, 2024-07-28
	Loading Lua modules and i18n strings
	Original author: Roland Unger
	Support of desktop and mobile views
	Documentation: https://de.wikivoyage.org/wiki/Wikivoyage:initListingTools.js
	License: GPL-2.0+, CC-by-sa 3.0
*/

( function( $, mw ) {
	'use strict';

	var initListingTools = function() {

		var SYSTEM = {
			version:        '1.1-ja',
			listingEditor:  'ListingEditor', // key of the window variable
			script:         'MediaWiki:Gadget-ListingEditor$1.js',
			isMobile:       ( /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test( navigator.userAgent.toLowerCase() ) ),

			Wikidata_API:   '//www.wikidata.org/w/api.php',
			wikiLang:       mw.config.get( 'wgPageContentLanguage' ),
			userLang:       mw.config.get( 'wgUserLanguage' ),
			intl:           { ja: 1, en: 1 },
			fallbackLang:   'ja',
			localPhoneCode: 'P473'
		};

		// allowed namespaces for Listing Editor
		var allowedNamespaces = [
			0, // Main
			2, // User
			4  // Wikivoyage
		];

		// definitions for module import
		var defaultArray = [
			{ 'type': 'area', group: 'area', label: '地域', color: '#0000FF' },
			{ 'type': 'buy', group: 'buy', label: '買う', color: '#008080' },
			{ 'type': 'do', group: 'do', label: 'する', color: '#808080' },
			{ 'type': 'drink', group: 'drink', label: '飲む', color: '#000000' },
			{ 'type': 'eat', group: 'eat', label: '食べる', color: '#D2691E' },
			{ 'type': 'go', group: 'go', label: '行く', color: '#A52A2A' },
			{ 'type': 'other', group: 'other', label: 'その他', color: '#228B22' },
			{ 'type': 'populated', group: 'populated', label: '都市', color: '#0000FF' },
			{ 'type': 'see', group: 'see', label: '観る', color: '#4682B4' },
			{ 'type': 'sleep', group: 'sleep', label: '泊まる', color: '#000080' },
			{ 'type': 'view', group: 'view', label: '眺める', color: '#4169E1' },
		];
		var luaModules = [
			// select-list options for types, groups, and subtypes
			{
				title: 'Module:Marker utilities/Types', // name of module to import
				index: 'type',                          // name of key field, rearranging
				start: /^.*types *= *{/g,               // to remove from start
				end: /,? *},? *} *$/g,                  // to remove at the end
				label: 'label',                         // second sort key
				alias: 'alias',                         // alias for index
				arrayName: 'types',                     // name of the new array
				defaultArray: defaultArray
			},
			{
				title: 'Module:Marker utilities/Groups',
				index: 'group',
				start: /^.*groups *= *{/g,
				end: /,? *},? *} *$/g,
				label: 'label',
				alias: 'alias',
				arrayName: 'groups',
				defaultArray: defaultArray
			},
			{
				title: 'Module:VCard/Subtypes',
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

			// Wikidata Q-identifier translation tables which are used for
			// Wikidata-content placeholders
			{
				title: 'Module:VCard/Cards',
				start: /^.*cards *= *{/g,
				end: /,? *},? *} *$/g,
				arrayName: 'payments'
			},
			{
				title: 'Module:Hours/i18n',
				start: /^.*dateIds *= *{/g,
				end: /,? *},? *} *$/g,
				arrayName: 'hours'
			},
			{
				title: 'Module:VCard/Qualifiers',
				start: /^.*labels *= *{/g,
				end: /,? *},? *} *$/g,
				arrayName: 'qualifiers'
			},
			{
				title: 'Module:CountryData/Currencies',
				start: /^.*currencies *= *{/g,
				end: /,? *} *, *isoToQid *=.*$/g,
				arrayName: 'currencies'
			}
		];
	
		// index may be type, group
		var addAlias = function( tab, aliasObj, index ) {
			if ( !tab || !aliasObj || !aliasObj.alias ) return null;

			var t = aliasObj[ index ].replace( /[_\s]+/g, '_' );
			if ( typeof( aliasObj.alias ) === 'string' )
				tab[ aliasObj.alias ] = t;
			else
				for ( var alias of aliasObj.alias )
					tab[ alias ] = t;
		};

		// data: data array from module
		// luaModule: single module definition from luaModules array
		// isDefault: data are defaults from luaModules array
		var analyzeAndCopyData = function( data, luaModule, isDefault ) {
			var alias, i, item, assoc = {}, aliases = {};

			// adding missing label from index, generating additional objects
			for ( i = 0; i < data.length; i++ ) {
				item = data[ i ];
				if ( ( item[ luaModule.label ] || '' ) === '' )
					item[ luaModule.label ] = item[ luaModule.index ].replace( /_/g, ' ' );
				if ( luaModule.label !== 'label' )
					item.label = item[ luaModule.label ];

				assoc[ item[ luaModule.index ] ] = item;
				addAlias( aliases, item, luaModule.index );
			}

			// sorting by label in alphabetic order
			data.sort( function( a, b ) {
				if ( luaModule.sortKey ) {
					a = a[ luaModule.sortKey ] || a[ luaModule.label ];
					b = b[ luaModule.sortKey ] || b[ luaModule.label ];
				} else {
					a = a[ luaModule.label ];
					b = b[ luaModule.label ];
				}
				return a.localeCompare( b );
			} );

			// copying
			var win = window[ SYSTEM.listingEditor ];
			if ( !isDefault || !win[ luaModule.arrayName ] || !win[ luaModule.arrayName ].length ) {
					win[ luaModule.arrayName ] = [].concat( data );
					win[ `${luaModule.arrayName}-assoc` ] = assoc;
					win[ `${luaModule.arrayName}-aliases` ] = aliases;
			}
		};

		// luaModule: single module definition from luaModules array
		var getDataFromSingleModule = function( luaModule ) {
			return $.ajax( {
				url: mw.util.wikiScript( '' ),
				method: 'GET',
				data: {
					title: luaModule.title,
					action: 'raw',
					ctype: 'text/plain'
				},
				timeout: 3000
			} ).done( function( data ) {
				data = data.replace( /\-\-.*\n/g, '' ) // remove comments
					.replace( /\s+/gm, ' ' )           // remove line breaks and tabs
					.replace( luaModule.start, ' ' )   // delete beginning
					.replace( luaModule.end, ' ' );    // delete end

				if ( luaModule.index )
					// convert to (sortable) array [ … ]
					data = '[' + data.replace( /([,{]) *(\[ *")?(wd|alias)(" *\])? *= *\{([^}]*)\}/g, '$1 "$3": [$5]' )
						// ["xyz"] { --> { "index": "xyz"
						.replace( / *(\[ *")?([\w\-]+)(" *\])? *= *\{/g, `{ "${luaModule.index}": "$2", ` )
						.replace( /, *(\[ *")?([\w\-]+)(" *\])? *=/g, ', "$2":' ) + ']';
				else
					// keep as object { … }
					data = '{' + data.replace( /([ ,\{]) *(\[ *")?([\w\-]+)(" *\])? *=/g, '$1 "$3":' ) + '}';

				// check if data string is valid JSON
				var isDefault = false, dataArray, win = window[ SYSTEM.listingEditor ];
				try {
					dataArray = JSON.parse( data );
				} catch ( e ) {
					// invalid JSON
					dataArray = luaModule.defaultArray || {};
					isDefault = true;
					var pos = e.message.match( /column (\d+) of/i )[ 1 ];
					pos = data.substring( pos - 10, pos + 10 );
					console.log( `${e.message}, data: ${luaModule.title}, text: ${pos}` );
				}
				if ( luaModule.index )
					analyzeAndCopyData( dataArray, luaModule, isDefault );
				else
					win[ luaModule.arrayName ] = dataArray;
			} ).fail( function() {
				var dataArray = luaModule.defaultArray || {};
				if ( luaModule.index )
					analyzeAndCopyData( dataArray, luaModule, true );
				else
					win[ luaModule.arrayName ] = dataArray;
			} );
		};

		var getScript = function ( inset ) {
			var script = mw.format( SYSTEM.script, inset || '' );
			return `/w/index.php?title=${script}&action=raw&ctype=text/javascript`;
		};

		var loadEditor = function() {
			mw.loader.using( [ 'mediawiki.util', 'mediawiki.api', 'jquery.ui', 'jquery.chosen' ] ).then( function() {
				mw.loader.load( getScript( 'Main' ) );
			});
		};

		var getDataFromModules = function() {
			var promiseArray = [], i;
			var lang = SYSTEM.fallbackLang;
			if ( SYSTEM.intl[ SYSTEM.userLang ] ) {
				lang = SYSTEM.userLang;
			}
			promiseArray.push( mw.loader.load( getScript( '-i18n-' + lang ) ) );
			promiseArray.push( mw.loader.load( getScript( '-Config' ) ) );

			// mw already exists but maybe not the ListingEditor object
			if ( !window[ SYSTEM.listingEditor ] )
				window[ SYSTEM.listingEditor ] = {};

			var startTime = performance.now();
			for ( i = 0; i < luaModules.length; i++ )
				promiseArray.push( getDataFromSingleModule( luaModules[ i ] ) );

			// wait for getting all external data
			var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
			if ( isIE11 )
				$.when.apply( $, promiseArray ).then( function() {
					loadEditor();
				} );
			else
				if ( typeof Promise !== 'undefined' )
					Promise.all( promiseArray )
						.then( function() {
							var endTime = performance.now();
							console.log( `Call to get Lua arrays took ${endTime - startTime} milliseconds` );
							loadEditor();
						} )
						.catch( function() {
							console.log( 'Error loading listing editor modules' );
						} );
			return;
		};

		// *********************************************************************
		// getting first value of a set of Wikidata statements
		var getWikidataValue = function( jsonObj, id, property ) {
			var entity = jsonObj && jsonObj.entities ? jsonObj.entities[ id ] : null;
			if ( entity && entity.claims ) {
				var statements = entity.claims[ property ];
				if ( statements && statements.length && statements[ 0 ].mainsnak )
					return statements[ 0 ].mainsnak.datavalue.value;
			}
			return null;
		};

		// adding currency, country calling code and local calling code to
		// body-tag data attributes for use in listing editor
		var addDataToBodyTag = function() {
			var body = $( 'body' ), data;

			// copying data-currency data-country-calling-code, etc. from
			// indicator or listings to body tag for use in listing editor
			var dataTags = $( '.voy-coord-indicator' );
			if ( !dataTags.length || dataTags.attr( 'data-country' ) === undefined )
				dataTags = $( '.vCard' );
			var list = [ 'data-currency', 'data-country-calling-code', 'data-lang',
				'data-lang-name', 'data-dir', 'data-trunk-prefix' ];
			for ( var i = 0; i < list.length; i++ ) {
				data = dataTags.attr( list [ i ] ) || '';
				if ( data !== '' )
					body.attr( list [ i ], data );
			}

			// copying local calling code from Wikidata to body tag
			// if the Wikidata id of the current page exists
			var id = mw.config.get( 'wgWikibaseItemId' );
			if ( id ) {
				var success = function( jsonObj ) {
					var value = getWikidataValue( jsonObj, id, SYSTEM.localPhoneCode );
					if ( value )
						body.attr( 'data-local-calling-code', value );
				};

				// getting JSON object from Wikidata search
				$.ajax( {
					url: SYSTEM.Wikidata_API,
					data: {
						action: 'wbgetentities',
						ids: id,
						languages: SYSTEM.wikiLang,
						format: 'json'
					},
					dataType: 'jsonp',
					success: success,
					cache: false, // it will force requested pages not to be cached by
					              // the browser in case of script and jsonp data types
					timeout: 3000
				} );
			}
		};
		
		// *********************************************************************
		/**	Return false if the current page should not enable the listing editor.
			Examples where the listing editor should not be enabled include talk
			pages, edit pages, history pages, etc.
		*/
		var checkIfAllowed = function() {
			var namespace = mw.config.get( 'wgNamespaceNumber' );
			return ( !SYSTEM.isMobile && allowedNamespaces.includes( namespace ) &&
				mw.config.get( 'wgAction' ) === 'view' && $( '#mw-revision-info' ).length === 0 &&
				mw.config.get( 'wgCurRevisionId' ) === mw.config.get( 'wgRevisionId' ) &&
				mw.config.get( 'wgRelevantPageIsProbablyEditable' ) &&
				$( '#ca-viewsource' ).length === 0 );
		};

		var init = function() {
			if ( checkIfAllowed() ) {
				addDataToBodyTag();
				getDataFromModules();
			}
		};

		return { init: init };
	} ();

	$( initListingTools.init );

} ( jQuery, mediaWiki ) );
// </nowiki>
