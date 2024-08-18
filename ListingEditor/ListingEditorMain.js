//<nowiki>
/** Listing Editor v2.7.12-ja
	2024-07-28

	Original authors:
	- ausgehe
	- torty3
	Additional contributors:
	- Andyrom75
	- Wrh2
	- RolandUnger
	- Jdlrobson
	Documentation and version history:
	- https://de.wikivoyage.org/wiki/Wikivoyage:Gadget-ListingEditor.js
*/
/* eslint-disable mediawiki/class-doc */

/** CUSTOMIZATION INSTRUCTIONS:

	Different Wikivoyage language versions have different implementations of
	the listing template, so this module must be customized for each.  The
	Config and Callbacks modules should be the ONLY code that requires
	customization - Core should be shared across all language versions. If for
	some reason the Core module must be modified, ideally the module should be
	modified for all language versions so that the code can stay in sync.

	In future, div.mw-h2section and div.mw-h3section sections can be removed if
	the parsoid parser is used. To test it add ?useparsoid=1 to the titles url.

	Modules: Config, EDITOR_FORM_HTML, Sister, Wikibase, Callbacks, Core.
	Functions to check: getListingWikitextBraces, getLatlngStr.
	Needed: new coordinate picker.
	vCard, Marker: TEMPLATES, INPUT_COLUMNS, SHOW_OPTIONS.
*/

var wvListingEditor = ( function( mw, $ ) {
	'use strict';

// ---------------------------------- Config ----------------------------------

	/** Config contains properties that will likely need to be
		modified for each Wikivoyage language version.  Properties in this
		module will be referenced from the other ListingEditor modules.
	*/

	const _Commons    = '//commons.wikimedia.org/',
		  _Wikidata   = '//www.wikidata.org/';

	var SYSTEM = {
		version:        '2.7.12-ja',

		Commons_Wiki:   `${_Commons}wiki/`,
		Commons_API:    `${_Commons}w/api.php`,
		Wikidata_Wiki:  `${_Wikidata}wiki/`,
		Wikidata_API:   `${_Wikidata}w/api.php`,
		Wikivoyage_API: `${mw.config.get( 'wgScriptPath' )}/api.php`,
		geomap:         '//wikivoyage.toolforge.org/w/geomap.php',
		// key at global window variable
		listingEditor:  'ListingEditor',

		wikiLang:       mw.config.get( 'wgPageContentLanguage' ),
		isNewMarkup:    $( '.mw-heading').length > 0,
		isParsoid:      $( 'section .mw-heading2, section .mw-heading3' ).length > 0,
		addSearchLang:  [ 'en' ], // for Wikidata search
		localLang:      '', // this and the following one are filled by script
		searchLang:     []
	};

	// general utilities
	var win = window[ SYSTEM.listingEditor ];
	// i18n
	var getAllParams = function() {
		return win.PARAMETERS || {};
	};
	var getParams = function( key ) {
		return win.PARAMETERS[ key ] || {};
	};
	var translate = function( key ) {
		return win.STRINGS[ key ] || key;
	};
	var getInputId = function( id ) {
		return `input-${id}`;
	};
	var Config = win.Config;

	// dialogue elements
	var ELEMENTS = {};

	var LUA_MODULES = {
		types: win.types || [],
		groups: win.groups || [],
		subtypes: win.subtypes,
		subtypeGroups: 12,

		currencies: win.currencies,
		q_ids: [ win.payments, win.hours, win.qualifiers ],

		typeList: win[ 'types-assoc' ],
		groupList: win[ 'groups-assoc' ],
		subtypeList: win[ 'subtypes-assoc' ],

		typeAliases: win[ 'types-aliases' ],
		groupAliases: win[ 'groups-aliases' ],
		subtypeAliases: win[ 'subtypes-aliases' ]
	};

	var CHOSEN_OPTIONS = {
		no_results_text: translate( 'chosenNoResults' ),
		width: '100%',
		rtl: false,
		allow_single_deselect: true,
		disable_search_threshold: 5
	};

	var SELECTORS = {
		/** these selectors should match a value defined in the EDITOR_FORM_HTML
			if the selector refers to a field that is not used by a Wikivoyage
			language version the variable should still be defined, but the
			corresponding element in EDITOR_FORM_HTML can be removed and thus
			the selector will not match anything and the functionality tied to
			the selector will never execute. */
		editorDelete: '#checkbox-delete',
		editorForm: '#listingeditor-form',
		editorLastedit: '#checkbox-lastedit',
		editorMinorEdit: '#checkbox-minor',
		editorSummary: '#input-summary',
		wikidataLabel: '#input-wikidata-label',

		templateClass: '.vcard', // common template class, hCard 1.0 microformat
		                         // for listings and markers
		listingClass: 'vCard',   // for listings only
		markerClass: 'Marker',   // for markers only

		editLink: '.listing-edit-button button',
		saveForm: '#progress-dialog',
		loadingForm: '#loading-dialog',
		captchaForm: '#captcha-dialog',
		addButton: 'listing-add-button',
		content: '.mw-parser-output',

		// document selectors
		geoIndicator: '#mw-indicator-i3-geo .wv-coord-indicator',
		// selector that identifies the listing elements into which the
		// 'edit' link will be placed
		metadataSelector: '.listing-edit .listing-metadata-items'
	};

	var REGEX = {
		name:     /^([^\[\]\|\*]+|\[\[[^\[\]\|\*]+\]\]|\[\[[^\[\]\|]+\|[^\[\]\|\*]+\]\])$/,
		url:      /^(https?:\/\/|\/\/)(\d{1,3}(\.\d{1,3}){0,3}|([^.\/:;<=>?\\@|\s\x00-\x2C\x7F]+\.)+[^.\/:;<=>?\\@|\d\s\x00-\x2C\x7F]{2,10}(:\d+)?)(\/?|\/[-A-Za-z0-9_.,~%+&:;#*?!=()@\/\x80-\xFF]*)$/,
		// protocol:       (https?:\/\/|\/\/)
		// domain:         (\d{1,3}(\.\d{1,3}){0,3}|([^.\/:;<=>?\\@|\s\x00-\x2C\x7F]+\.)+[^.\/:;<=>?\\@|\d\s\x00-\x2C\x7F]{2,10}(:\d+)?)
		// residual:       (\/?|\/[-A-Za-z0-9_.,~%+&:;#*?!=()@\/\x80-\xFF]*)
		// not considered: logins like login:password@, IPv6 addresses; will be added if necessary

		phone:    /^(\+[1-9]|[\d\(])([\dA-Z \-\(\)\.]+[\dA-Z ])(( ([Ee][Xx][Tt]\.? |[Aa][Pp][Pp]\.? |x)\d+)?)( *\([^\)]+\))?$/,
		email:    /^[^@^\(^\)\s]+@[^@^\(^\)\s]+\.[^@^\(^\)\s]+( *\([^\)]+\))?$/,
		// skype:    /^[a-z][a-z0-9\.,\-_]{5,31}(\?(add|call|chat|sendfile|userinfo|voicemail))?( *\([^\)]+\))?$/,
		// facebook: /^(https:\/\/www\.facebook\.com\/.+|(?!.*\.(?:com|net))[a-z\d.]{5,}|[-.\w\d]+\-\d+)$/i,
		// flickr:   /^(https:\/\/www\.flickr\.com\/.+|\d{5,11}@N\d{2})$/,
		// instagram:/^(https:\/\/www\.instagram\.com\/.+|explore\/locations\/[1-9]\d{0,15}|[0-9a-z_][0-9a-z._]{0,28}[0-9a-z_])$/,
		// tiktok:   /^(https:\/\/www\.tiktok\.com\/@.+|[0-9A-Za-z_][0-9A-Za-z_.]{1,23})$/i,
		// twitter:  /^(https:\/\/twitter\.com\/.+|[0-9a-z_]{1,15})$/i,
		// youtube:  /^(https:\/\/www\.youtube\.com\/.+|UC[-_0-9A-Za-z]{21}[AQgw]|@[A-Za-z0-9_\-\.]{3,30})$/,

		image:    new RegExp( '^(?!([Ff]ile|[Ii]mage|' + translate( 'image' ) + '):)' + '.+\.(tif|tiff|gif|png|jpg|jpeg|jpe|webp|xcf|ogg|ogv|svg|pdf|stl|djvu|webm|mpg|mpeg)$', 'i' ),
		commonscat: new RegExp( '^(?!(category|' + translate( 'commonscat' ) + '):)' + '.+$', 'i' ),
		zoom:     /^1?[0-9]$/,
		mapgroup: /^[A-Za-z][A-Za-z0-9]*$/,
		lastedit: /^((20\d{2}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01]))|((0?[1-9]|[12][0-9]|3[01])\.(0?[1-9]|1[012])\.20\d{2}))$/
	};

	var FIELDS = {
		name:        { regex: REGEX.name, m: 'validationName', wd: false },
		url:         { regex: REGEX.url, m: 'validationUrl', wd: true },
		phone:       { regex: REGEX.phone, m: 'validationPhone', wd: true, sep: Config.MISC.sep },
		mobile:      { regex: REGEX.phone, m: 'validationMobile', wd: false, sep: Config.MISC.sep },
		tollfree:    { regex: REGEX.phone, m: 'validationTollfree', wd: false, sep: Config.MISC.sep },
		fax:         { regex: REGEX.phone, m: 'validationFax', wd: true, sep: Config.MISC.sep },
		email:       { regex: REGEX.email, m: 'validationEmail', wd: true, sep: Config.MISC.sep },
		// skype:       { regex: REGEX.skype, m: 'validationSkype', wd: true, sep: Config.MISC.skypeSep },
		// facebook:    { regex: REGEX.facebook, m: 'validationFacebook', wd: true },
		// flickr:      { regex: REGEX.flickr, m: 'validationFlickr', wd: true },
		// instagram:   { regex: REGEX.instagram, m: 'validationInstagram', wd: true },
		// tiktok:      { regex: REGEX.tiktok, m: 'validationTiktok', wd: true },
		// twitter:     { regex: REGEX.twitter, m: 'validationTwitter', wd: true },
		// youtube:     { regex: REGEX.youtube, m: 'validationYoutube', wd: true },
		image:       { regex: REGEX.image, m: 'validationImage', wd: true },
		commonscat:  { regex: REGEX.commonscat, m: 'validationCategory', wd: false },
		zoom:        { regex: REGEX.zoom, m: 'validationZoom', wd: false },
		'map-group': { regex: REGEX.mapgroup, m: 'validationMapGroup', wd: false },
		lastedit:    { regex: REGEX.lastedit, m: 'validationLastEdit', wd: false }
	};

// -------------------------------- Editor Form -------------------------------

	//	Creating Editor Form
	var EDITOR_FORM_HTML = function( isListing ) {

		/** Fields that can used in the configuration array(s):
		-	cl: tag class(es).
		-	tp: input type (select, textarea, default: input).
		-	multiple: multiple select fields.
		-	text: text between opening and closing tags.
		-	add: HTML code to add after the input fields. */

		var options = Config.SHOW_OPTIONS[ isListing ? 'listing' : 'marker' ];
		var PARAMETERS_ADD = {
			'name-local': { cl: 'editor-foreign addLocalLang' },

			type: { tp: 'select', multiple: true },
			group: { tp: 'select', cl: 'addGroupHint' },
			wikidata: { add: '<div class="input-other" id="wikidata-tools">' +
						'<input type="hidden" id="input-wikidata"><span id="wikidata-value-link"></span> | ' +
						`<a href="javascript:" id="wikidata-remove" title="${translate( isListing ? 'deleteWikidataIdTitle' : 'deleteWikidataIdTitleMarker' )}">${translate( 'deleteWikidataId' )}</a>` +
					'</div>' },
			auto: { tp: 'select',
				text: '<option value=""></option>' +
					`<option value="y">${translate( 'optionYes' )}</option>` +
					`<option value="n">${translate( 'optionNo' )}</option>`,
				add: `<div id="div_wikidata_update" class="input-other"><a href="javascript:" id="wikidata-shared">${translate( 'fillFromWikidata' )}</a></div>`},

			url: { cl: 'addLink' },
			'address-local': { cl: 'editor-foreign' },
			'directions-local': { cl: 'editor-foreign' },
			long: { cl: 'addMaplink' },

			phone: { cl: 'addCC addLocalCC' },
			mobile: { cl: 'addCC' },
			tollfree: { cl: 'addCC' },
			fax: { cl: 'addCC addLocalCC' },
			// facebook: { cl: 'addLink' },
			// flickr: { cl: 'addLink' },
			// instagram: { cl: 'addLink' },
			// tiktok: { cl: 'addLink' },
			// twitter: { cl: 'addLink' },
			// youtube: { cl: 'addLink' },

			price: { cl: 'addCurrencies' },
			subtype: { tp: 'select', multiple: true,
				add: `<div class="input-other" id="listingeditor-additionalSubtypes" style="display: none"><a href="javascript:" title="${translate( 'additionalSubtypes' )}">[ + ]</a></div>` },
			image: { cl: 'addImgLink' },
			commonscat: { cl: 'addCommonsLink' },
			show: { tp: 'select', multiple: true,
				text: `<optgroup label="${translate( 'optionCoordinatesGroup' )}" id="listing-show-coordinate">` +
					`<option value="all">${translate( 'optionAll' )}</option>` +
					`<option value="poi">${translate( 'optionPoi' )}</option>` +
					`<option value="coord">${translate( 'optionCoordinates' )}</option>` +
					`<option value="none">${translate( 'optionNone' )}</option>` +
				'</optgroup>' +
				`<optgroup label="${translate( isListing ? 'optionOptionsGroup' : 'optionOptionsGroupMarker' )}" id="listing-show-symbol">` +
					`<option value="copy">${translate( 'optionCopyMarker' )}</option>` +
					`<option value="symbol">${translate( 'optionMakiIcon' )}</option>` +
					`<option value="noairport">${translate( 'optionNoAirport' )}</option>` +
					`<option value="nositelinks">${translate( 'optionNoSitelinks' )}</option>` +
					( options.nosocialmedia ? `<option value="nosocialmedia">${translate( 'optionNoSocialmedia' )}</option>` : '' ) +
					( options.socialmedia ? `<option value="socialmedia">${translate( 'optionSocialmedia' )}</option>` : '' ) +
				'</optgroup>' +
				( options.nosubtype ? `<optgroup label="${translate( 'optionFeaturesGroup' )}" id="listing-show-subtypes">` +
					`<option value="nosubtype">${translate( 'optionNoSubtype' )}</option>` +
					`<option value="nowdsubtype">${translate( 'optionNoWdSubtype' )}</option>` +
				'</optgroup>' : '' ) +
				`<optgroup label="${translate( 'optionDisplayGroup' )}" id="listing-show-block">` +
					( options.noname ? `<option value="noname">${translate( 'optionNoName' )}</option>` : '' ) +
					( options.outdent ? `<option value="outdent">${translate( 'optionOutdent' )}</option>` : '' ) +
					( options.inline ? `<option value="inline">${translate( 'optionInline' )}</option>` : '' ) +
					`<option value="wikilink">${translate( 'optionWikilink' )}</option>` +
					( options.noperiod ? `<option value="noperiod">${translate( 'optionNoPeriod' )}</option>` : '' ) +
				'</optgroup>' },

			description: { tp: 'textarea' }
		};

		// adding input/textarea elements to form
		function addInput( id ) {
			if ( !id || id === '' ) return '';

			var el, tagId = getInputId( id );
			id = id === 'wikidata-label' ? 'wikidata' : id;
			var	p = getParams( id ),
				q = PARAMETERS_ADD[ id ] || {},
				attr = `id="${tagId}"` + ( q.cl ? ` class="${q.cl}"` : '' );

			switch ( q.tp || '' ) {
				case 'select':
					if ( !q.text && !q.multiple )
						q.text = '<option value=""></option>';
					attr += ( q.multiple ? ' multiple="multiple"' : '' ) +
						( p.ph ? ` data-placeholder="${p.ph}"` : '' );
					el = `<select class="chosen-select" title="${p.title}" ${attr}>${q.text || ''}</select>`;
					break;
				case 'textarea':
					el = `<textarea rows="8" title="${p.title}" ${attr}></textarea>`;
					break;
				default:
					el = `<input type="text" title="${p.title}" ${attr}>`;
			}

			return `<div id="div_${id}" class="editor-row">` +
				`<div><label for="${tagId}" title="${p.title}">${p.label}</label></div>` +
				`<div class="editor-input">${el + ( q.add || '' )}</div>` +
			'</div>';
		}

		// adding set of inputs
		function addInputs( arr ) {
			var s = '';
			for ( var id of arr )
				s += addInput( id );
			return s;
		}

		function addInputColumns() {
			var s = '',
				cols = Config.INPUT_COLUMNS[ isListing ? 'listing' : 'marker' ];
			for ( var i = 0; i < cols.length; i++ )
				s += `<div class="listingeditor-col listingeditor-col${i}">${addInputs( cols[ i ] )}</div>`;
			return s;
		}

		/** The below HTML is the UI that will be loaded into the listing editor
			dialog box when a listing is added or edited. EACH WIKIVOYAGE LANGUAGE
			SITE CAN CUSTOMIZE THIS HTML - fields can be removed, added, displayed
			differently, etc. Note that it is important that any changes to the HTML
			structure are also made to the TEMPLATES parameter arrays since that
			array provides the mapping between the editor HTML and the listing
			template fields. */

		return '<form id="listingeditor-form">' +
			`<div class="listingeditor-container">${addInputColumns()}</div>` +

			( isListing ? addInput( 'description' ) : '' ) +

			'<div id="listingeditor-preview" style="display: none;">' +
				'<div class="editor-row">' +
					'<div>' +
						`<input type="radio" name="previewSelect" id="select-preview" value="Template preview" checked="checked" /> <label for="select-preview" title="${translate( isListing ? 'textPreviewTitle' : 'textPreviewTitleMarker' )}">${translate( 'textPreviewLabel' )}</label><br />` +
						`<input type="radio" name="previewSelect" id="select-syntax" value="Wiki syntax" /> <label for="select-syntax" title="${translate( isListing ? 'syntaxPreviewTitle' : 'syntaxPreviewTitleMarker' )}">${translate( 'syntaxPreviewLabel' )}</label><br />` +
						( isListing ? `<input type="radio" name="previewSelect" id="to-content" value="Description" /> <label for="to-content" title="${translate( 'toContentTitle' )}">${translate( 'toContentLabel' )}</label>` : '' ) +
					'</div>' +
					'<div>' +
						'<div id="listingeditor-preview-text" class="listingeditor-preview-div"></div>' +
						'<div id="listingeditor-preview-syntax" class="listingeditor-preview-div" style="display: none"></div>' +
					'</div>' +
				'</div>' +
			'</div>' +

			( isListing ?

			// update the Callbacks.hideEditOnlyFields method if
			// the status and/or summary rows are removed or modified
			'<div id="div_status" class="editor-row">' +
				`<div title="${translate( 'statusTitle' )}">${translate( 'statusLabel' )}</div>` +
				'<div>' +
					// update the Callbacks.updateLastEditDate
					// method if the last edit input is removed or modified
					'<span id="div_lastedit">' +
						`<label for="${getInputId( 'lastedit' )}" title="${getParams( 'lastedit' ).title}">${getParams( 'lastedit' ).label}</label> ` +
						`<input type="text" size="10" id="${getInputId( 'lastedit' )}">` +
					'</span>' +
					'<span id="span-lasteditToday">' +
						'<input type="checkbox" id="checkbox-lastedit" />' +
						`<label for="checkbox-lastedit" class="listingeditor-tooltip" title="${translate( 'updateTodayTitle' )}">${translate( 'updateTodayLabel' )}</label>` +
					'</span>' +
					'<span id="span-delete">' +
						'<input type="checkbox" id="checkbox-delete">' +
						`<label for="checkbox-delete" class="listingeditor-tooltip" title="${translate( 'deleteListingTitle' )}">${translate( 'deleteListingLabel' )}</label>` +
					'</span>' +
				'</div>' +
			'</div>'

			: '' ) +

			'<div id="div_summary">'+
				'<div class="listingeditor-divider"></div>' +
				'<div class="editor-row">' +
					`<div><label for="input-summary" title="${translate( 'summaryTitle' )}">${translate( 'summaryLabel' )}</label></div>` +
					'<div class="editor-input">' +
						`<input type="text" id="input-summary" placeholder="${translate( isListing ? 'summaryPlaceholder' : 'summaryPlaceholderMarker' )}">` +
						`<div id="span-minor" class="input-other"><input type="checkbox" id="checkbox-minor"><label for="checkbox-minor" class="listingeditor-tooltip" title="${translate( 'minorEditTitle' )}">${translate( 'minorEditLabel' )}</label></div>` +
					'</div>' +						
				'</div>' +
			'</div>' +

			'</form>';
	};

// ---------------------------------- Sister ----------------------------------

	//	Sister implements functionality for information interchange to
	//	Wikimedia sister websites

	var Sister = function() {
		// perform an ajax query of a sister site
		var ajaxQuery = function( url, data, success ) {
			data.format = 'json';
			$.ajax({
				url: url,
				data: data,
				dataType: 'jsonp',
				success: success
			});
		};

		function _initializeAutocomplete( siteData, ajaxData, parseAjaxResponse ) {
			var autocompleteOptions = {
				source: function( request, response ) {
					ajaxData.search = request.term;
					var ajaxSuccess = function( jsonObj ) {
						response( parseAjaxResponse( jsonObj ) );
					};
					ajaxQuery( siteData.apiUrl, ajaxData, ajaxSuccess );
				}
			};
			if ( siteData.selectFunction )
				autocompleteOptions.select = siteData.selectFunction;
			siteData.selector.autocomplete( autocompleteOptions )
				.data( 'ui-autocomplete' )._renderItem = function( ul, item ) {
					var isImage = item.label.match( /^File:/i );
					var label = mw.html.escape( item.label.replace( /^(File:|Category:)/i, '' ) );
					if ( isImage )
						label = '<span class="autocomplete-thumbnail" style="background-image: url(&quot;https://commons.wikimedia.org/wiki/Special:FilePath/' +
							label.replace( /' '/g, '_' ) + '?width=200&quot;);"></span> ' + label;
					return $( '<li>' ).data( 'ui-autocomplete-item', item )
						.append( $( '<a>' ).html( label ) ).appendTo( ul );
				};
		}

		var initializeAutocomplete = function( siteData ) {
			var sel = $( siteData.selector );
			var currentValue = sel.val();
			if ( currentValue )
				siteData.updateLinkFunction( currentValue, siteData.form );
			sel.change( function() {
				siteData.updateLinkFunction( sel.val(), siteData.form );
			});
			siteData.selectFunction = function(event, ui) {
				siteData.updateLinkFunction(ui.item.value, siteData.form);
			};
			var ajaxData = siteData.ajaxData;
			ajaxData.action = 'opensearch';
			ajaxData.list = 'search';
			ajaxData.limit = 10;
			ajaxData.redirects = 'resolve';
			var parseAjaxResponse = function( jsonObj ) {
				var results = [], i, title;
				var titleResults = $( jsonObj[ 1 ] );
				for ( i = 0; i < titleResults.length; i++ ) {
					title = titleResults[ i ];
					results.push( {
						value: title.replace( /^(File:|Category:)/i, '' ),
						label: title,
						description: $( jsonObj[ 2 ] )[ i ],
						link: $( jsonObj[ 3 ] )[ i ]
					} );
				}
				return results;
			};
			_initializeAutocomplete( siteData, ajaxData, parseAjaxResponse );
		};


		// expose public members
		return {
			ajaxQuery,
			initializeAutocomplete
		};
	}();

// --------------------------------- Wikibase ---------------------------------

	//	Wikidata implements functionality for data fetch from Wikidata

	var Wikibase = function() {
		// get a Wikidata entity object
		var getEntity = function( id, success, props ) {
			props = props || 'labels|claims|datatype';
			var languages = [].concat( SYSTEM.searchLang );
			if ( SYSTEM.localLang !== '' )
				languages.push( SYSTEM.localLang );
			languages = languages.join( '|' );
			var data = {
				action: 'wbgetentities',
				ids: id,
				languages: languages,
				props: props
			};
			Sister.ajaxQuery( SYSTEM.Wikidata_API, data, success );
		};

		// parse the wikidata "entity" object from the wikidata response
		function checkEntity( id, jsonObj ) {
			return jsonObj && jsonObj.entities ? jsonObj.entities[ id ] : null;
		}

		// parse the wikidata display label from the wikidata response
		var getLabels = function( id, jsonObj ) {
			var entityObj = checkEntity( id, jsonObj );
			if ( !entityObj || !entityObj.labels )
				return null;
			var wiki = '', local = '', lang;
			for ( lang of SYSTEM.searchLang )
				if ( entityObj.labels[ lang ] ) {
					wiki = entityObj.labels[ lang ].value;
					break;
				}
			if ( SYSTEM.localLang !== '' && entityObj.labels[ SYSTEM.localLang ] )
				local = entityObj.labels[ SYSTEM.localLang ].value;
			return { wiki: wiki, local: local };
		};

		// get Wikidata Id label from array
		function getIdLabel( id ) {
			for ( var arr of LUA_MODULES.q_ids ) {
				if ( arr && arr[ id ] )
					return arr[ id ];
			}
			return id;
		}

		function getAllStatements( entityClaims, property ) {
			var obj, propertyObj, statements = [];
			if ( !entityClaims || !entityClaims[ property ] )
				return statements;
			propertyObj = entityClaims[ property ];
			if ( !propertyObj || propertyObj.length === 0 )
				return statements;

			for ( obj of propertyObj )
				if ( obj.mainsnak && obj.mainsnak.snaktype === 'value' &&
					obj.mainsnak.datavalue )
					statements.push( {
						value: obj.mainsnak.datavalue.value,
						qualifiers: obj.qualifiers,
//						references: obj.references,
						rank: obj.rank
					} );
			return statements;
		}

		function getBestStatements( entityClaims, property ) {
			var statements = [];
			var allStatements = getAllStatements( entityClaims, property );
			if ( !allStatements || allStatements.length === 0 )
				return statements;

			var rank = 'normal', statement;
			for ( statement of allStatements )
				if ( statement.rank === rank )
					statements.push( { value: statement.value, qualifiers: statement.qualifiers } );
				else if ( statement.rank === 'preferred' ) {
					rank = 'preferred';
					// remove all previous statements
					statements = [ { value: statement.value, qualifiers: statement.qualifiers } ];
				}
			return statements;
		}

		function getUnit( unit ) {
			var u = ( '' + unit ).replace( /https?:\/\/www.wikidata.org\/entity\//ig, '' );
			return u === '1' ? '' : u;
		}

		function htmlDecode( s ) {
			var tag = document.createElement( 'textarea' );
			tag.innerHTML = s;
			return tag.value;
		}

		function getQuantity( value ) {
			var val = 1 * value.amount;
			if ( val === 0 ) return '0';
			var unit = getUnit( value.unit );

			if ( unit !== '' ) {
				var item = LUA_MODULES.currencies[ unit ];
				if ( item ) {
					val = ( item.mul ? item.mul : 1 ) * val;
					unit = ( item.f || LUA_MODULES.currencies.default || '%s unit' )
						.replace( /unit/g, item.iso );
				} else
					unit = '%s ' + getIdLabel( unit );
			} else
				unit = '%s';
			val = new Intl.NumberFormat( SYSTEM.wikiLang,
				{ minimumFractionDigits: val % 1 == 0 ? 0 : 2 }
				).format( val );
			return htmlDecode( unit.replace( /%s/g, val ) );
		}

		function getHours( statement ) {
			function getItems( parts, prop1, prop2 ) {
				var arr = [], end, i, start;
				var count = Math.max( parts[ prop1 ].length, parts[ prop2 ].length );
				for ( i = 0; i < count; i++ ) {
					start = parts[ prop1 ][ i ];
					end = parts[ prop2 ][ i ];
					if ( start && end )
						arr.push( start + '–' + end );
					else
						arr.push( start || end );
				}
				return arr.join( ',' );
			}

			var i, item, parts = {}, property;
			var result = getIdLabel( statement.value.id );

			var dayOpen = Config.PROPERTIES.dayOpen;
			var dayClosed = Config.PROPERTIES.dayClosed;
			var hourOpen = Config.PROPERTIES.hourOpen;
			var hourClosed = Config.PROPERTIES.hourClosed;

			if ( statement.qualifiers ) {
				for ( property of Config.COMMENTS.hours ) {
					parts[ property ] = [];
					if ( statement.qualifiers[ property ] )
						for ( item of statement.qualifiers[ property ] )
							if ( item.snaktype === 'value' && item.datavalue.type === 'wikibase-entityid' )
								parts[ property ].push( getIdLabel( item.datavalue.value.id ) );
				}
				item = getItems( parts, hourOpen, hourClosed );
				if ( item !== '' ) result += ' ' + item;
				item = getItems( parts, dayOpen, dayClosed );
				if ( item !== '' ) result += ' (' + item + ')';
			}
			return result;
		}

		function getComments( qualifiers, properties ) {
			if ( typeof( qualifiers ) == 'undefined' ) return '';
			var comments = [], item, minAge, maxAge, property, value;
			var minimumAge = Config.PROPERTIES.minimumAge;
			var maximumAge = Config.PROPERTIES.maximumAge;
			for ( property of properties ) {
				if ( typeof( qualifiers[ property ] ) == 'undefined' ) continue;

				if ( property === minimumAge )
					minAge = getQuantity( qualifiers[ property ][ 0 ].datavalue.value );
				else if ( property === maximumAge )
					maxAge = getQuantity( qualifiers[ property ][ 0 ].datavalue.value );
				else
					for ( item of qualifiers[ property ] )
						if ( item.snaktype === 'value' ) {
							value = item.datavalue.value;
							switch( item.datavalue.type ) {
								case 'monolingual':
									value = value.text;
									break;
								case 'wikibase-entityid':
									value = getIdLabel( value.id );
									break;
							}
							if ( typeof( value ) === 'string' && value !== '' )
								comments.push( value );
							
						}
			}

			if ( minAge && maxAge )
				comments.push( Config.MISC.fromTo
					.replace( '%s', parseInt( minAge ) ).replace( '%s', maxAge ) );
			else if ( minAge )
				comments.push( Config.MISC.from.replace( '%s', minAge ) );
			else if ( maxAge )
				comments.push( Config.MISC.to.replace( '%s', maxAge ) );

			return ( comments.length === 0 ) ? '' : ` (${comments.join( ', ' )})`;
		}

		// parse the wikidata "claim" object from the wikidata response
		var getStatements = function( id, jsonObj, claim ) {
			if ( claim.type === 'label' ) {
				var labels = getLabels( id, jsonObj );
				if ( labels ) {
					if ( claim.which === 'wiki' && labels.wiki && labels.wiki !== '' )
						return labels.wiki;
					if ( claim.which === 'local' && labels.local && labels.local !== '' )
						return labels.local;
				}
				return null;
			}

			var entity = checkEntity( id, jsonObj );
			if ( !entity || !entity.claims )
				return null;

			var count, lang, pos, property, properties, val, values, results = [],
				statement, statements;

			properties = typeof claim.p == 'string' ? [ claim.p ] : claim.p;
			for ( property of properties ) {
				statements = getBestStatements( entity.claims, property );
				if ( statements.length === 0 )
					continue;
				claim.max = claim.max || 1;
				if ( claim.max < statements.length )
					statements.splice( claim.max, statements.length );

				switch( claim.type ) {
					case 'monolingual':
						values = {};
						for ( statement of statements ) {
							lang = statement.value.language;
							pos = lang.indexOf( '-' );
							if ( pos >= 0 )
								lang = lang.substr( 0, pos );
							values[ lang ] = statement.value.text;
						}
						if ( claim.which == 'wiki' )
							for ( lang of SYSTEM.searchLang ) {
								val = values[ lang ];
								if ( val ) {
									results.push( val );
									break;
								}
							}
						else {
							val = values[ SYSTEM.localLang ];
							if ( val )
								results.push( val );
						}
						break;
					case 'au': // fees
						for ( statement of statements )
							results.push( getQuantity( statement.value ) +
								getComments( statement.qualifiers, Config.COMMENTS.fee ) );
						break;
					case 'subtype':
					case 'id':
						for ( statement of statements ) {
							if ( typeof claim.table == 'object' )
								if ( claim.table[ statement.value.id ] ) {
									// subtype
									count = 1;
									var quantity = Config.PROPERTIES.quantity;
									if ( statement.qualifiers && statement.qualifiers[ quantity ] ) {
										count = parseInt( getQuantity( statement.qualifiers[ quantity ][ 0 ].datavalue.value ) );
										if ( typeof( count ) != 'number' || count < 2 )
											count = 1;
									}
									val = claim.table[ statement.value.id ];
									if ( count > 1 ) val += ':' + count;
									results.push( val );
								} else
									results.push( getIdLabel( statement.value.id ) );
							else
								results.push( getIdLabel( statement.value.id ) );
						}
						break;
					case 'hours':
						for ( statement of statements ) {
							val = getHours( statement );
							if ( val !== '' ) results.push( val );
						}
						break;
					default:
						for ( statement of statements ) {
							switch( claim.type ) {
								case 'coordinate':
									if ( claim.which == 'latitude' )
										val = Math.round( statement.value.latitude * 1E5 ) / 1E5;
									else
										val = Math.round( statement.value.longitude * 1E5 ) / 1E5;
									break;
								case 'email':
								case 'contact':
									val = statement.value.replace( 'mailto:', '' ) +
										getComments( statement.qualifiers, Config.COMMENTS.contact );
									break;
								default:
									val = statement.value;
							}
							results.push( val );
						}
				} // switch type
			} // for property

			if ( results.length === 0 )
				return null;
			else {
				if ( claim.result && claim.result == 'table' )
					return results;
				else			
					return results.join( ', ' );
			}
		};

		// expose public members
		return {
			getEntity,
			getLabels,
			getStatements
		};
	}();

// -------------------------------- Callbacks ---------------------------------

	/** Callbacks implements custom functionality that may be
		specific to how a Wikivoyage language version has implemented the
		listing template.  For example, English Wikivoyage uses a "last edit"
		date that needs to be populated when the listing editor form is
		submitted, and that is done via custom functionality implemented as a
		SUBMIT_FORM_CALLBACK function in this module. */

	var Callbacks = function() {
		// array of functions to invoke when creating the listing editor form.
		// these functions will be invoked with the form DOM object as the
		// first element and the mode as the second element.
		var CREATE_FORM_CALLBACKS = [];

		// array of functions to invoke when submitting the listing editor
		// form but prior to validating the form. these functions will be
		// invoked with the mapping of listing attribute to value as the first
		// element and the mode as the second element.
		var SUBMIT_FORM_CALLBACKS = [];

		// array of validation functions to invoke when the listing editor is
		// submitted. these functions will be invoked with an array of
		// validation messages as an argument; a failed validation should add a
		// message to this array, and the user will be shown the messages and
		// the form will not be submitted if the array is not empty.
		var VALIDATE_FORM_CALLBACKS = [];

		// storage for Wikidata results
		var wdResults = {};

		// Helper functions

		// check if only yes or no is entered
		var checkYesNo = function( value ) {
			var v = value.toLowerCase();
			return Config.MISC.yes.includes( v ) ? 'y' :
				( Config.MISC.no.includes( v ) ? 'n' : '' );
		};

		// sort subtypes by groups
		var sortSubtypesByGroups = function( s ) {
			return s.sort( function( a, b ) {
				var aa = a.replace( /:.*$/g, '' );
				var bb = b.replace( /:.*$/g, '' );
				var subtypeList = LUA_MODULES.subtypeList;
				if ( subtypeList[ aa ] && subtypeList[ bb ] ) {
					if ( subtypeList[ aa ].g < subtypeList[ bb ].g )
						return -1;
					if ( subtypeList[ aa ].g > subtypeList[ bb ].g )
						return 1;
				}
				return aa.localeCompare( bb );
			});
		};

		// remove comments from a parameter
		var removeComments = function( s ) {
			return s.replace( /<!--.*?-->/g, '' ).trim();
		};

		// --------------------------------------------------------------------
		// LISTING EDITOR UI INITIALIZATION CALLBACKS
		// --------------------------------------------------------------------
		
		// character count for description
		var characterCount = function( form, isEditMode ) {
			ELEMENTS.description.keyup( function( e ) {
				var count = $( this ).val().length;
				$( '#counter-description', form )
					.html( mw.format( translate( 'contentStatus' ), count ) )
					.toggleClass( 'input-content-limit', count > Config.OPTIONS.contentLimit );
			}).trigger( 'keyup' );	
		};
		CREATE_FORM_CALLBACKS.push( characterCount );

		// Add listeners to the currency symbols, calling codes and special
		// characters so that clicking on a symbol will insert it into the input.
		var initSymbolFormFields = function( form, isEditMode ) {
			$( '.editor-charinsert', form ).click( function() {
				var _this = $( this );
				var input = $( '#' + _this.attr( 'data-for' ) );
				var caretPos = input[ 0 ].selectionStart;
				var oldValue = input.val();
				var symbol = _this.find( 'a' ).text();
				var charType = _this.attr( 'data-type' ) || '';
				var char = oldValue.substring( caretPos-1, caretPos );
				if ( Config.MISC.spaceBeforeCurrencies && symbol != '&#x202F;' &&
					charType == 'currency-char' && caretPos > 0 &&
					char >= '0' && char <= '9' )
					symbol = '&#x202F;' + symbol;
				else if ( Config.MISC.spaceAfterCallingCodes && charType == 'phone-char' )
					symbol = symbol + ' ';

				var newValue = oldValue.substring(0, caretPos) + symbol + oldValue.substring( caretPos );
				input.val( newValue ).select();
				// now setting the cursor behind the symbol inserted
				caretPos = caretPos + symbol.length;
				input[ 0 ].setSelectionRange( caretPos, caretPos );
			});
		};
		CREATE_FORM_CALLBACKS.push( initSymbolFormFields );

		// handling coordinates
		function checkForSplit() {
			var long = ELEMENTS.long;
			if ( removeComments( long.val() ) !== '' ) return;

			var lat = ELEMENTS.lat;
			var value = removeComments( lat.val().toUpperCase() );
			var coords = value.split( /[,;\|]/ );
			if ( coords.length === 2 ) {
				lat.val( coords[ 0 ].trim() );
				long.val( coords[ 1 ].trim() );
				return;
			}
			for ( var d of [ 'N', 'S' ] ) {
				coords = value.split( d );
				if ( coords.length === 2 ) {
					lat.val( coords[ 0 ].trim() + ' ' + d );
					long.val( coords[ 1 ].trim() );
					return;
				}
			}
		}

		function parseCoord( coord, aDir ) {
			var s = coord.trim(), v, l;
			var result = { coord: s, error: 2 }; // 2 = is error
			if ( s === '' ) {
				result.error = 1;
				return result;
			}

			var mx = aDir === 'lat' ? 90 : 180;
			if ( isNaN( coord ) ) { // try conversion dms -> dec
				s = s.toUpperCase()
					.replace( /[‘’′´`]/ig, "'" )
					.replace( /''/ig, '"' )
					.replace( /[“”″]/ig, '"' )
					.replace( /[−–—]/ig, '-' )
					.replace( /[_\\\/\s\0]/ig, ' ' )
					.replace( /([A-Z])/ig, ' $1' )
					.replace( /\s*([°"\'])/ig, '$1 ' )
					.split( ' ' );
				for ( var i = s.length - 1; i >= 0; i-- ) {
					s[ i ] = s[ i ].trim();
					if ( s[ i ] === null || s[ i ] === '' )
						s.splice( i, 1 );
				}

				if ( s.length < 1 || s.length > 4 )
					return result;

				var units = [ '°', "'", '"', ' ' ];
				var res   = [ 0, 0, 0, 1 ]; // 1 = positive direction

				for ( i = 0; i < s.length; i++ ) {
					v = s[ i ].replace( units[ i ], '' );
					if ( !isNaN( v ) ) { // a number
						v = parseFloat( v );
						switch( i ) {
							case 3: // only for direction letter
								return result;
							case 0:
								res[ 0 ] = v;
								break;
							case 1:
							case 2:
								if ( v < 0 || v >= 60 || res[ i - 1 ] != Math.round( res[ i - 1 ] ))
									return result;
								res[ i ] = v;
						}
					} else { // not a number: allowed only at the last position
						if ( i == 0 || ( i + 1 ) != s.length || res[ 0 ] < 0 ||
							v.length !== 1 || !Config.COORD_LETTERS[ v ] )
							return result;
						l = Config.COORD_LETTERS[ v ];
						if ( aDir !== l.dir )
							return result;
						res[ 3 ] = l.factor;
					}
				}

				if ( res[ 0 ] < 0 ) {
					res[ 0 ] = -res[ 0 ];
					res[ 3 ] = -1;
				}
				result.coord = ( res[ 0 ] + res[ 1 ] / 60 + res[ 2 ] / 3600 ) * res[ 3 ];
				result.coord = Math.round( result.coord * 1E5 ) / 1E5; // only 5 digits
			}
			if ( coord < -mx || coord > mx || coord <= -180 )
				return result;

			result.error = 0;
			return result;
		}

		function checkCoordinates() {
			var lat = ELEMENTS.lat;
			var long = ELEMENTS.long;
			var latVal = removeComments( lat.val() );
			var longVal = removeComments( long.val() );

			var r = parseCoord( latVal, 'lat' );
			if ( r.coord !== latVal )
				lat.val( r.coord );
			var result = r.error;
			lat.toggleClass( 'listingeditor-invalid-input', r.error > 1 );

			r = parseCoord( longVal, 'long' );
			if ( r.coord !== longVal )
				long.val( r.coord );
			result += r.error;
			long.toggleClass( 'listingeditor-invalid-input', r.error > 1 );
			return result;
		}

		var checkCoordInput = function( form, isEditMode ) {
			ELEMENTS.long.blur(function() {
				checkCoordinates();
			});
			ELEMENTS.lat.blur(function() {
				checkForSplit();
				checkCoordinates();
			}).trigger( 'blur' );
		};
		CREATE_FORM_CALLBACKS.push( checkCoordInput );

		// Add listeners on various fields to update the "find on map" link.
		function getValFromInput( sel ) {
			var el = ELEMENTS[ sel ];
			if ( el.val() === '' && el.hasClass( 'listingeditor-wikidata-placeholder' ) )
				return el.attr( 'placeholder' );
			else
				return removeComments( el.val() );			
		}

		function getLatlngStr( form ) {
			var latlngStr = '?lang=' + SYSTEM.wikiLang;
//			// page & location cause the geomap-link crash
//			latlngStr += '&page=' + encodeURIComponent( mw.config.get( 'wgTitle' ) );

			var lat = getValFromInput( 'lat' );
			var long = getValFromInput( 'long' );
			if ( lat === '' || long === '' ) {
				var indicator = $( SELECTORS.geoIndicator );
				lat = indicator.attr( 'data-lat' ) || '';
				long = indicator.attr( 'data-lon' ) || '';
			}
			lat = parseCoord( lat, 'lat' );
			long = parseCoord( long, 'long' );
			if ( lat.error === 0 && long.error === 0 )
				latlngStr += `&lat=${lat.coord}&lon=${long.coord}&zoom=15`;

//			var address = getValFromInput( 'address' );
//			var name = getValFromInput( 'name' );
//			if ( address !== '' )
//				latlngStr += '&location=' + encodeURIComponent( address );
//			else if ( name !== '' )
//				latlngStr += '&location=' + encodeURIComponent( name );

			return latlngStr;	
		}

		var initFindOnMapLink = function( form, isEditMode ) {
			$( '.addMaplink', form ).parent()
				.append( $( `<div class="input-other"><a id="geomap-link" target="_blank">${translate( 'searchOnMap' )}</a></div>` ) );

			var geolink = $( '#geomap-link', form );
			function updateGeolink() {
				geolink.attr( 'href', SYSTEM.geomap + getLatlngStr( form ) );
			}

			if ( geolink.length ) {
				ELEMENTS.address.change( updateGeolink );
				ELEMENTS.lat.change( updateGeolink );
				ELEMENTS.long.change( updateGeolink ).trigger( 'change' );
			}
		};
		CREATE_FORM_CALLBACKS.push( initFindOnMapLink );

		// Add listeners on type selector field.
		function typesChanged( values, form ) {
			var color, different = false, first = '', group, i, obj, sleep = false, val;

			// make firstType first if existent
			if ( ELEMENTS.firstType !== '' ) {
				for ( i = 0; i < values.length; i++ ) {
					if ( values[ i ] == ELEMENTS.firstType ) {
						values.splice( i, 1 );
						values.unshift( ELEMENTS.firstType );
						break;
					}
					if ( i == values.length - 1 )
						ELEMENTS.firstType = '';
				}
			}

			for ( i = 0; i < values.length; i++ ) {
				val = values[ i ];
				for ( obj of LUA_MODULES.types )
					if ( obj.type === val ) {
						group = obj.group;
						break;
					}
				if ( i === 0 )
					first = group;
				else if ( group != first )
					different = true;
				if ( group == 'sleep' )
					sleep = true;
			}
			obj = ( sleep ? Config.HIDE_AND_SHOW.sleep : Config.HIDE_AND_SHOW[ first ] ) ||
				Config.HIDE_AND_SHOW.default;
			for( i of obj.show )
				$( '#' + i, form ).show();
			for( i of obj.hide )
				if ( $( '#' + i + ' input', form ).val() === '' )
					$( '#' + i, form ).hide();

			// set input shadow
			color = '#f0f0f0';
			for ( obj of LUA_MODULES.groups )
				if ( obj.group === first ) {
					color = obj.color;
					break;
				}
			obj = $( '#div_type .chosen-choices', form );
			if ( obj.length )
				obj.css( 'box-shadow', `20px 0 0 0 ${color} inset` );
			else {
				// chosen plugin is maybe not yet active
				var style = `#div_type .chosen-choices { box-shadow: 20px 0 0 0 ${color} inset }`;
				$( 'head' ).append( `<style type="text/css">${style}</style>` );
			}

			// set hint to group
			$( '.group-hint', form ).text( different ? translate( 'severalGroups' ) : translate( 'ifNecessary' ) );
		}

		var initTypeSelector = function( form, isEditMode ) {
			ELEMENTS.group.parent().append( $( '<div class="input-other group-hint"></div>' ) );
			ELEMENTS.type.on( 'keydown keyup change click' , function() {
				typesChanged( $( this ).val(), form );
			}).trigger( 'keyup' );
		};
		CREATE_FORM_CALLBACKS.push( initTypeSelector );
		
		var initGroupSelector = function( form, isEditMode ) {
			ELEMENTS.group.on( 'keydown keyup change click', function() {
				var color = '#f0f0f0', obj;
				for ( obj of LUA_MODULES.groups )
					if ( obj.group === this.value ) {
						color = obj.color;
						break;
					}
				$( '#input_group_chosen .chosen-single', form )
					.css( 'box-shadow', `20px 0 0 0 ${color} inset` );
			}).trigger( 'keyup' );
		};
		CREATE_FORM_CALLBACKS.push( initGroupSelector );
		
		var initLastEditCheckBox = function( form, isEditMode ) {
			$( SELECTORS.editorLastedit, form ).change( function() {
				if ( this.checked && $( '#div_lastedit', form ).is( ':visible' ) )
					ELEMENTS.lastedit.val( getCurrentDate() );
			});
		};
		CREATE_FORM_CALLBACKS.push( initLastEditCheckBox );

		// set lastedit check box if some parameters are changed
		var setLastEditCheckBox = function( form, isEditMode ) {
			var editorLastedit = $( SELECTORS.editorLastedit, form );
			for ( var p in Config.PARAMETERS_FOR_LASTEDIT ) {
				ELEMENTS[ p ].on( 'change keyup', function() {
					editorLastedit.prop( 'checked', true );
					if ( ELEMENTS.lastedit.val() == '' )
						ELEMENTS.lastedit.val( getCurrentDate() );
				});
			}
		};
		CREATE_FORM_CALLBACKS.push( setLastEditCheckBox );

		var hideEditOnlyFields = function( form, isEditMode ) {
			if ( !isEditMode )
				$( '#span-delete', form ).hide();
		};
		CREATE_FORM_CALLBACKS.push( hideEditOnlyFields );

		// Check against regex
		function regexTest( field, val ) {
			var i, s, sRegex, test = true, valTab;
			val = val.trim();
			if ( field.sep ) {
				sRegex = new RegExp( '(' + field.sep + ')(?![^(]*\\))', 'ig' );
				valTab = val.split( sRegex );
				sRegex = new RegExp( '^(' + field.sep.replace( / /g , '' ) + ')$', 'ig' );
				for ( i = valTab.length - 1; i >= 0; i-- ) {
					valTab[ i ] = valTab[ i ].trim().replace( sRegex, '' );
					if ( valTab[ i ] === '' ) valTab.splice( i, 1 );
				}
			} else
				valTab = [ val ];
			for ( s of valTab ) {
				test = field.regex.test( s );
				if ( !test ) break;
			}
			return test;
		}

		// Field checks against regex
		function initCheckAgainstRegex( key, field, form ) {
			var val10;
			ELEMENTS[ key ].blur( function() {
				var _this = $( this, form );
				var val = removeComments( _this.val() );
				if ( field.wd && val !== '' && checkYesNo( val ) !== '' )
					_this.removeClass( 'listingeditor-invalid-input' );
				else {
					val10 = val.substr( 0, 10 );
					if ( key === 'url' && !regexTest( field, val ) &&
						val.search( 'ht' ) !== 0 && val10.search( ':' ) < 0 &&
						val10.search( '//' ) < 0 ) {
						val10 = 'http://' + val;
						if ( regexTest( field, val10 ) ) {
							val = val10;
							_this.val( val );
						}
					}
					_this.toggleClass( 'listingeditor-invalid-input',
						val !== '' && !regexTest( field, val ) );
				}
			}).trigger( 'blur' );
		}

		var checkFields = function( form, isEditMode ) {
			for ( var parameter in FIELDS )
				initCheckAgainstRegex( parameter, FIELDS[ parameter ], form);
		};
		CREATE_FORM_CALLBACKS.push( checkFields );

		function setDefaultPlaceholders( form ) {
			for ( var parameter in getAllParams() ) {
				var obj = getParams( parameter ),
					tag = ELEMENTS[ parameter ].prop( 'tagName' );
				if ( obj.ph && tag !== 'SELECT' )
					ELEMENTS[ parameter ].attr( 'placeholder', ' ' + obj.ph )
						.addClass( 'listingeditor-default-placeholder' )
						.removeClass( 'listingeditor-wikidata-placeholder' );
			}
			$( SELECTORS.wikidataLabel, form )
				.attr( 'placeholder', ' ' + getParams( 'wikidata' ).ph )
				.addClass( 'listingeditor-default-placeholder' );
		}

		function updatePlaceholder( key, value ) {
			if ( value && ELEMENTS[ key ] )
				ELEMENTS[ key ].attr( 'placeholder', value )
					.addClass( 'listingeditor-wikidata-placeholder' )
					.removeClass( 'listingeditor-default-placeholder' )
					.trigger( 'change' );
		}

		function updatePlaceholders( id, form ) {
			setDefaultPlaceholders( form );

			var success = function( jsonObj ) {
				var item, key, res;
				var addSubtypes = $( '#listingeditor-additionalSubtypes' );
				addSubtypes.hide();
				wdResults = {};
				for ( key in Config.WIKIDATA_CLAIMS ) {
					item = Config.WIKIDATA_CLAIMS[ key ];
					res = Wikibase.getStatements( id, jsonObj, item );
					if ( res )
						wdResults[ key ] = res;
				}
				if ( !wdResults.address && wdResults[ 'address-local' ] ) {
					wdResults.address = wdResults[ 'address-local' ];
					delete wdResults[ 'address-local' ];
				}
				for ( key in wdResults ) {
					if ( key === 'subtype' ) {
						wdResults.subtype = sortSubtypesByGroups( wdResults.subtype );
						addSubtypes.show();
						continue;
					}
					updatePlaceholder( key, wdResults[ key ] );
					if ( key === 'name' )
						$( SELECTORS.wikidataLabel ).attr( 'placeholder', wdResults.name )
							.addClass( 'listingeditor-default-placeholder' );				}
			};
			Wikibase.getEntity( id, success );
		}

		function wikidataLink( form, value ) {
			$( '#wikidata-value-link', form ).html( $( '<a />', {
				target: '_new',
				href: SYSTEM.Wikidata_Wiki + mw.util.wikiUrlencode(value),
				title: translate( 'viewWikidataPage' ),
				text: value
			}) );
			if ( !Config.OPTIONS.defaultAuto )
				ELEMENTS.auto.val( 'y' ).trigger( 'chosen:updated' );
			$( '#wikidata-value-display-container', form ).show();
			$( '#div_auto', form ).show();
		}

		function updateSiteLink(siteLinkData, form) {
			var input = $( siteLinkData.inputSelector, form );
			var siteLink = $( siteLinkData.linkSelector, form );
			var val = removeComments( input.val() || '' );
			if ( val === '' && input.hasClass( 'listingeditor-wikidata-placeholder' ) )
				val = input.attr( 'placeholder' );
			if ( val === '' )
				siteLink.hide();
			else {
				siteLinkData.href = SYSTEM.Commons_Wiki +
					mw.util.wikiUrlencode(siteLinkData.namespace + val);
				var link = $("<a />", {
					target: "_new",
					href: siteLinkData.href,
					title: siteLinkData.linkTitle
				}).append( $( siteLinkData.text ) );
				siteLink.html(link).show();
			}
		}

		function commonsLink(value, form) {
			var siteLinkData = {
				inputSelector: '#input-image',
				linkSelector: '#image-value-link',
				namespace: 'File:',
				linkTitle: translate( 'viewCommonsPageTitle' ),
				text: translate( 'linkText' )
			};
			updateSiteLink( siteLinkData, form );
		}

		function commonscatLink(value, form) {
			var siteLinkData = {
				inputSelector: '#input-commonscat',
				linkSelector: '#commonscat-value-link',
				namespace: 'Category:',
				linkTitle: translate( 'viewCommonscatPageTitle' ),
				text: translate( 'linkText' )
			};
			updateSiteLink( siteLinkData, form );
		}

		function updateFieldIfNotNull( key, value ) {
			if ( value )
				ELEMENTS[ key ].val( value );
		}

		function updateWikidataSharedFields( form ) {
			var key, msg = '';

			for ( key in wdResults )
				msg += `\n${getParams( key ).label}: ` +
					( typeof wdResults[ key ] == 'object' ? wdResults[ key ].join( ', ' ) : wdResults[ key ] );

			if ( msg !== '' ) {
				if ( confirm( translate( 'wikidataShared' ) + '\n' + msg ) ) {
					for ( key in wdResults ) {
						switch( key ) {
							case 'image':
								updateFieldIfNotNull( 'image', wdResults.image );
								commonsLink( wdResults.image, form );
								break;
							case 'commonscat':
								updateFieldIfNotNull( 'commonscat', wdResults.commonscat );
								commonscatLink( wdResults.commonscat, form );
								break;
							case 'subtype':
								if ( wdResults.subtype.length ) {
									var sel = ELEMENTS.subtype, i, j;
									var old = sel.val();
									for ( i = 0; i < old.length; i++ ) {
										for ( j = wdResults.subtype.length - 1; j >= 0; j-- ) {
											if ( wdResults.subtype[ j ] == old[ i ] ) {
												wdResults.subtype.splice( j, 1 );
												break;
											}
										}
									}
									sel.val( old.concat( wdResults.subtype ) )
										.trigger( 'chosen:updated' );
								}
								break;
							default:
								updateFieldIfNotNull( key, wdResults[ key ] );
						}
					}
					ELEMENTS.auto.val( '' ).trigger( 'chosen:updated' );
					ELEMENTS.name.focus();
				}
			} else
				alert( translate( 'wikidataSharedNotFound' ) );
		}

		function parseWikiDataResult( jsonObj ) {
			var results = [];
			for ( var result of $( jsonObj.search ) ) {
				var label = result.label;
				if ( result.match && result.match.text )
					label = result.match.text;
				var data = {
					value: label,
					label: label,
					description: result.description,
					id: result.id
				};
				results.push( data );
			}
			return results;
		}

		var wikidataLookup = function( form, isEditMode ) {
			// get the display value for the pre-existing wikidata record ID
			var wikidataRemove = function(form) {
				ELEMENTS.wikidata.val('');
				$( SELECTORS.wikidataLabel, form ).val('');
				$('#input-auto').val('');
				$('#wikidata-tools', form).hide();
				$('#div_auto', form).hide();
				setDefaultPlaceholders(form);
			};

			var id = removeComments( ELEMENTS.wikidata.val() );
			if ( id ) {
				wikidataLink( form, id );
				var success = function( jsonObj ) {
					var id = ELEMENTS.wikidata.val();
					var label = Wikibase.getLabels( id, jsonObj ) || '';
					label = label.wiki !== '' ? label.wiki : id;
					$( SELECTORS.wikidataLabel ).val( label );
				};
				Wikibase.getEntity( id, success, 'labels' );
				updatePlaceholders( id, form );
			} else
				wikidataRemove(form);
			// set up autocomplete to search for results as the user types
			$( SELECTORS.wikidataLabel, form ).autocomplete({
				source: function( request, response ) {
					var ajaxUrl = SYSTEM.Wikidata_API;
					var ajaxData = {
						action: 'wbsearchentities',
						search: request.term,
						language: SYSTEM.wikiLang,
						uselang: SYSTEM.wikiLang
					};
					var ajaxSuccess = function( jsonObj ) {
						response(parseWikiDataResult(jsonObj));
					};
					Sister.ajaxQuery( ajaxUrl, ajaxData, ajaxSuccess );
				},
				select: function(event, ui) {
					ELEMENTS.wikidata.val(ui.item.id);
					wikidataLink('', ui.item.id);

					updatePlaceholders(ui.item.id, form );
				}
			}).data( 'ui-autocomplete' )._renderItem = function( ul, item ) {
				var label = `${mw.html.escape( item.label )} <small>${item.id}</small>`;
				if ( item.description )
					label += `<br /><small>${mw.html.escape( item.description )}</small>`;
				return $( '<li>' ).data( 'ui-autocomplete-item', item )
					.append( $( '<a>' ).html( label )).appendTo( ul );
			};
			// add a listener to the "remove" button so that links can be deleted
			$('#wikidata-remove', form).click(function() {
				if ( confirm( translate( 'deleteMessage' ) ) )
					wikidataRemove(form);
			});
			$( SELECTORS.wikidataLabel, form ).change(function() {
				if ( !$(this).val() )
					wikidataRemove(form);
			});
			$( '#listingeditor-additionalSubtypes a', form ).click( function() {
				var msg = [], t;
				if ( wdResults.subtype )
					for ( t of wdResults.subtype ) {
						t = t.split( ':' );
						t[ 1 ] = t.length > 1 ? parseInt( t[ 1 ] ) : 1;
						if ( LUA_MODULES.subtypeList[ t[ 0 ] ] )
							t[ 0 ] = LUA_MODULES.subtypeList[ t[ 0 ] ].n; // translate subtypes
						if ( t[ 0 ].indexOf( '[' ) > -1 ) {
							if ( t[ 1 ] > 1 )
								t[ 0 ] = t[ 1 ] + ' ' + t[ 0 ].replace( /\[([^\[\]]*)(\|[^\[\]]*)?\]/g, '$1' );
							else
								t[ 0 ] = t[ 0 ].replace( /\[([^\[\]]*)\|([^\[\]]*)\]/g, '$2' );
						}
						msg.push( t[ 0 ].replace( /\[([^\[\]]*)\]/g, '' )
							.replace( /[,;\/].*$/ig, '' ) );
					}
				msg = msg.join( ', ' );
				if ( msg === '' )
					msg = translate( 'unknownSubtypes' );
				alert( translate( 'additionalSubtypes' ) + ':\n\n' + msg );
			});
			$('#wikidata-shared', form).click(function() {
				updateWikidataSharedFields( form );
			});
			ELEMENTS.image.parent().append( $( '<div id="image-value-link" class="input-other"></div>' ) );
			Sister.initializeAutocomplete( {
				apiUrl: SYSTEM.Commons_API,
				selector: ELEMENTS.image,
				form: form,
				ajaxData: { namespace: 6 },
				updateLinkFunction: commonsLink
			} );
			ELEMENTS.commonscat.parent().append( $( '<div id="commonscat-value-link" class="input-other"></div>' ) );
			Sister.initializeAutocomplete( {
				apiUrl: SYSTEM.Commons_API,
				selector: ELEMENTS.commonscat,
				form: form,
				ajaxData: { namespace: 14 },
				updateLinkFunction: commonscatLink
			} );
		};
		CREATE_FORM_CALLBACKS.push( wikidataLookup );

		var selectPreview = function(form, isEditMode) {
			$( 'input[name=previewSelect]', form ).click( function() {
				if ( $( '#to-content' ).prop( 'checked' ) ) {
					$( '#listingeditor-preview-off' ).trigger( 'click' );
				}

				var checked = $( '#select-preview', form ).prop( 'checked' );
				$( '#listingeditor-preview-text', form ).toggle( checked );
				$( '#listingeditor-preview-syntax', form ).toggle( !checked );
			});
		};
		CREATE_FORM_CALLBACKS.push( selectPreview );

		var addLinks = function( form, isEditMode ) {
			$( '.addLink', form ).each( function() {
				var _this = $( this );
				var id = _this.attr('id').replace( 'input-', '' );
				_this.parent().append( $( '<div class="input-other"></div>' )
					.attr( 'id', 'link-' + id ) );
				_this.change( function() {
					var val = removeComments( _this.val() );
					if ( val === '' && _this.hasClass( 'listingeditor-wikidata-placeholder' ) )
						val = _this.attr( 'placeholder' );
					if ( val !== '' && checkYesNo( val ) === '' ) {
						if ( val.indexOf( 'http' ) )
							if ( id === 'youtube' && val.match( /^@.*$/ ) )
								val = mw.format( Config.LINK_FORMATTERS.youtubeAlias, val );
							else
								val = mw.format( Config.LINK_FORMATTERS[ id ], val );
						var link = $( '<a />', {
							target: '_new',
							href: val,
							title: translate( 'linkTitle' ),
						}).append( $( translate( 'linkText' ) ) ) ;
						$( '#link-' + id, form ).html( link );
					} else
						$( '#link-' + id, form ).empty();
					var tabables = $( "input[tabindex != '-1']:visible", form );
					var index = tabables.index( this );
					if ( !ELEMENTS.name.is( ':focus' ) )
						tabables.eq( index + 1 ).focus();
				}).trigger( 'change' );
			});
		};
		CREATE_FORM_CALLBACKS.push( addLinks );

		var chosenInit = function( form, isEditMode ) {
			$( '.chosen-select', form ).chosen( CHOSEN_OPTIONS );
			ELEMENTS.show.change( function() {
				var coordGroup = $( '#listing-show-coordinate option', form );
				var isCoord = false;
				coordGroup.each( function() {
					if ( $( this ).is( ':selected' ) )
						isCoord = true;
				});
				if ( isCoord )
					coordGroup.each( function() {
						if ( !$( this ).is( ':selected' ) )
							$( this ).prop( 'disabled', true );
					});
				else
					coordGroup.prop( 'disabled', false );

				var showGroup = $( '#listing-show-block option', form );
				var isShow = false;
				showGroup.each( function() {
					if ( $( this ).is( ':selected' ) )
						isShow = true;
				});
				if ( isShow )
					showGroup.each( function() {
						if ( !$( this ).is( ':selected' ) )
							$( this ).prop( 'disabled', true );
					});
				else
					showGroup.prop( 'disabled', false );

				$( this ).trigger( 'chosen:updated' );
			}).trigger( 'change' );
			ELEMENTS.group.trigger( 'keyup' );
		};
		CREATE_FORM_CALLBACKS.push( chosenInit );
		
		// --------------------------------------------------------------------
		// LISTING EDITOR FORM SUBMISSION CALLBACKS
		// --------------------------------------------------------------------

		// Return the current date in the format "2020-01-31".
		var getCurrentDate = function() {
			var today = new Date();
			var date = today.getFullYear() + '-';
			// Date.getMonth() returns 0-11
			date += ( today.getMonth() + 1 ).toString().padStart( 2, '0' ) + '-';
			return date + today.getDate().toString().padStart( 2, '0' );
		};

		// Only update last edit date if this is a new listing or if the
		// "information up-to-date" box checked.
		var updateLastEditDate = function( listing, origListing, isEditMode ) {
			var currentDate = getCurrentDate(),
				editorLastedit = $( SELECTORS.editorLastedit );

			if ( editorLastedit.is( ':checked' ) ) {
				listing.lastedit = currentDate;
			} else if ( listing.lastedit && listing.lastedit !== '' ) {
				listing.lastedit = listing.lastedit.replace( /\-(\d)\-/g, '-0$1-' )
					.replace( /\-(\d)$/g, '-0$1' );
				if ( listing.lastedit !== currentDate && confirm( translate( 'updateLastedit' ) ) )
					// with OK/Cancel buttons, Yes/No is more complex
					listing.lastedit = currentDate;
			}
		};
		SUBMIT_FORM_CALLBACKS.push( updateLastEditDate );

		// --------------------------------------------------------------------
		// LISTING EDITOR FORM VALIDATION CALLBACKS
		// --------------------------------------------------------------------

		// Verify all listings have at least a name, address or alt value.
		var validateListingHasData = function( validationFailureMessages ) {
			var name = ELEMENTS.name;
			var wikidata = ELEMENTS.wikidata.val();
			// Fill name field from Wikidata
			if ( name.val() === '' && wikidata !== '' &&
				name.filter( '.listingeditor-wikidata-placeholder' ).length > 0 ) {
				name.val( name.attr( 'placeholder' ) );
				return;
			}
			if ( name.val() === '' && ELEMENTS.address.val() === '' &&
				ELEMENTS.alt.val() === '' && wikidata === '' ) 
				validationFailureMessages.push( translate( 'validationEmptyListing' ) );
		};
		VALIDATE_FORM_CALLBACKS.push( validateListingHasData );

		// Delete group parameter if identical to types group.
		var isGroupNecessary = function( validationFailureMessages ) {
			var types = ELEMENTS.type.val(),
				group = ELEMENTS.group,
				wikidata = ELEMENTS.wikidata.val();

			if ( types.length === 0 && group.val() === '' && wikidata === '' ) {
				validationFailureMessages.push( translate( 'validationType' ) );
				return;
			}
			if ( types.length === 0 )
				return;

			var different = false, first = '', i, obj;
			for ( i = 0; i < types.length; i++ )
				for ( obj of LUA_MODULES.types )
					if ( types[ i ] === obj.type ) {
						if ( i === 1 )
							first = obj.group;
						if ( first !== obj.group )
							different = true;
						break;
					}
			if ( different )
				return;
			// if type group equals group then delete group
			if ( first === group )
				group.val( '' );
		};
		VALIDATE_FORM_CALLBACKS.push( isGroupNecessary );

		// Validate coordinates
		var validateCoords = function( validationFailureMessages ) {
			var lat = removeComments( ELEMENTS.lat.val() );
			var long = removeComments( ELEMENTS.long.val() );
			if ( lat === '' && long === '' )
				return;
			if ( lat === '' ) {
				validationFailureMessages.push( translate( 'validationMissingCoord' ) );
				return;
			}
			checkForSplit();
			if ( long === '' ) {
				validationFailureMessages.push( translate( 'validationMissingCoord' ) );
				return;
			}
			if ( checkCoordinates() > 0 )
				validationFailureMessages.push( translate( 'validationCoord' ) );
		};
		VALIDATE_FORM_CALLBACKS.push( validateCoords );
		
		// Implement SIMPLE RegExp validation. Invalid entries can
		// still get through, but this method implements a minimal amount of
		// validation in order to catch the worst offenders.
		var validateFields = function( validationFailureMessages ) {
			var field, parameter, val;
			for ( parameter in FIELDS ) {
				field = FIELDS[ parameter ];
				val = ELEMENTS[ parameter ].val();
				if ( val ) {
					val = val.trim();
					if ( field.wd && val !== '' && checkYesNo( val ) !== '' )
						return;
					if ( val !== '' && !regexTest( field, val ) )
						validationFailureMessages.push( translate( field.m ) );
				}
			}
		};
		VALIDATE_FORM_CALLBACKS.push( validateFields );

		// remove identical names
		var ckeckNames = function( key1, key2 ) {
			var val1 = ELEMENTS[ key1 ].val(), val2 = ELEMENTS[ key2 ].val();
			if ( val1 && val2 ) {
				var val = removeComments( val1.toLowerCase() ); // case-insensitve check
				if ( val !== '' && val === removeComments( val2.toLowerCase() ) ) {
					ELEMENTS[ key2 ].val( '' );
					return 1;
				}
			}
			return 0;
		};

		var checkMultipleNames = function( validationFailureMessages ) {
			var result = ckeckNames( 'name', 'name-local' );
			result += ckeckNames( 'alt', 'comment' );
			result += ckeckNames( 'name', 'alt' );
			result += ckeckNames( 'name', 'comment' );
			result += ckeckNames( 'address', 'address-local' );
			result += ckeckNames( 'directions', 'directions-local' );
			if ( result > 0 )
				validationFailureMessages.push( translate( 'validationNames' ) );
		};
		VALIDATE_FORM_CALLBACKS.push( checkMultipleNames );

		// expose public members
		return {
			CREATE_FORM_CALLBACKS,
			SUBMIT_FORM_CALLBACKS,
			VALIDATE_FORM_CALLBACKS,
			checkYesNo,
			removeComments,
			sortSubtypesByGroups
		};
	}();

// ----------------------------------- Core -----------------------------------

	/** Core contains code that should be shared across different Wikivoyage
		languages. This code uses the custom configurations in the Config and
		Callback modules to initialize the listing editor and process add and
		update requests for listings. */

	var Core = function() {
		var api = new mw.Api(),
			displayBlock = false,
			inlineListing, inlineDetected,
			replacements = {}, selectComments = {}, sectionText;

		// Form additions before populating the form inputs

		var additionsToForm = function( isEditMode, listingTag, form ) {
			var c, data, dataFor, obj, t, body = $( 'body' );

			// getting attribute from listing or body tag
			var getAttr = function( attr ) {
				var d = isEditMode ? listingTag.attr( attr ) : null;
				return d || body.attr( attr ) || '';
			};

			// adding Wikidata Q id to qualifier-subtype list
			var addQualifier = function( qualifiers, obj ) {
				if ( typeof obj.wd === 'string' && obj.wd !== '' )
					qualifiers[ obj.wd ] = obj.type;
				else if ( obj.wd )
					for ( t of obj.wd )
						qualifiers[ t ] = obj.type;
			};

			// add option to select list
			var addOption = function( selector, value, label ) {
				selector.append( $( '<option></option>' ).attr( 'value', value ).text( label ) );
			};

			// adding clickable character for input insertion
			var addChar = function( char, dataFor, title, dataType ) {
				return ` <span class="editor-charinsert" data-for="${dataFor}" data-type="${dataType || ''}"><a href="javascript:" title="${title}">${char}</a></span>`;
			};

			// setting search languages
			var localLang = getAttr( 'data-lang' );
			SYSTEM.localLang = '';
			if ( SYSTEM.wikiLang != localLang )
				SYSTEM.localLang = localLang;
			SYSTEM.searchLang = [ SYSTEM.wikiLang ];
			for ( c of SYSTEM.addSearchLang )
				if ( c != SYSTEM.wikiLang && c != localLang )
					SYSTEM.searchLang.push( c );

			// adding language to local names
			$( '.editor-foreign', form ).attr( 'dir', getAttr( 'data-dir' ) ).attr( 'lang', localLang );
			$( '.addLocalLang', form ).each( function() {
				$( this ).parent().append( $( '<div class="input-other editor-local-lang"></div>' ) );
			});
			data = getAttr( 'data-lang-name' );
			if ( data !== '' && localLang != SYSTEM.wikiLang )
				$( '.editor-local-lang', form ).text( data );

			// adding national and international currency symbols
			$( '.addCurrencies', form ).each( function() {
				$( this ).parent().append( $( '<div class="input-other currency-chars"></div>' ) );
			});

			var html = '';
			data = getAttr( 'data-currency' );
			if ( data !== '' ) {
				var natlCurrencies = data.split( ',' ).map( function( item ) {
					return addChar( item.trim(), 'input-price', translate( 'natlCurrencyTitle' ), 'currency-char' );
				});
				if ( natlCurrencies.length )
					html += natlCurrencies.join( '' ) + ' |';
			}
			for ( c of Config.MISC.intlCurrencies )
				html += addChar( c, 'input-price', translate( 'intlCurrencyTitle' ), 'currency-char' );
			$( '.currency-chars', form ).append( html );

			// adding country and local calling codes
			$( '.addCC', form ).each( function() {
				var _this = $( this );
				_this.parent().append(
					$(`<div class="input-other input-cc${_this.hasClass( 'addLocalCC' ) ? ' input-cc-local' : ''}" data-for="${_this.attr( 'id' )}"></div>` )
				);
			});

			var ccLocal = [];
			data = getAttr( 'data-local-calling-code' );
			if ( data !== '' ) {
				var trunkPrefix = getAttr( 'data-trunk-prefix' );
				ccLocal = data.split( ',' ).map( function( item ) {
					item = item.trim();
					// adding trunk prefix if missing
					if ( trunkPrefix !== '' && item.substr( 0, trunkPrefix.length ) !== trunkPrefix )
						item = trunkPrefix + item;
					return item;
				});
			}

			data = getAttr( 'data-country-calling-code' );
			if ( data !== ''  || ccLocal.length > 0 ) {
				$( '.input-cc', form ).each( function() {
					html = '';
					dataFor = $( this ).attr( 'data-for' );
					if ( data !== '' )
						html += addChar( data, dataFor, translate( 'callingCodeTitle' ), 'phone-char' );
					$( this ).append( html );
				});
				$( '.input-cc-local', form ).each( function() {
					html = '';
					dataFor = $( this ).attr( 'data-for' );
					for ( c of ccLocal ) {
						// exception for Italy and San Marino
						if ( data !== '+39' && data !== '+378' )
							c = c.replace(/^0/ig, '(0)');
						html += addChar( c, dataFor, translate( 'callingCodeTitle' ), 'phone-char' );
					}
					$( this ).append( html );
				});
			}

			// adding counter and special chars to description label
			html = '<br /><br />';
			for ( c of Config.MISC.contentChars )
				html += addChar( c, 'input-description', translate( 'contentCharsTitle' ) );
			$( '#div_description label', form ).parent()
				.append( $( '<br /><span id="counter-description"></span>' ) )
				.append( html );

			// populating select fields
			var subtypeQualifiers = {},
				subtypeOptions = [],
				newObj;

			// group select: non-color groups at the beginning
			for ( obj of LUA_MODULES.groups ) {
				if ( !obj.is )
					addOption( ELEMENTS.group, obj.group, obj.label );
			}
			for ( obj of LUA_MODULES.groups )
				if ( obj.is && obj.is === 'color' )
					addOption( ELEMENTS.group, obj.group, obj.label );

			// subtype select: collect qualifiers and select options
			for ( obj of LUA_MODULES.subtypes ) {
				addQualifier( subtypeQualifiers, obj );
				subtypeOptions.push( obj );
			}
				
			// type select: populate select, merge types to subtypes
			for ( obj of LUA_MODULES.types ) {
				addOption( ELEMENTS.type, obj.type, obj.label );

				// merge types into subtypes
				if ( !LUA_MODULES.subtypeList[ obj.type ] ) {
					newObj = { g: LUA_MODULES.subtypeGroups + 1, wd: obj.wd, label: obj.label };
					LUA_MODULES.subtypeList[ obj.type ] = newObj;
					addQualifier( subtypeQualifiers, newObj );
					subtypeOptions.push( { type: obj.type, label: obj.label } );
				}
			}

			// subtype select: sorting and populating
			subtypeOptions.sort( function( a, b ) {
				a = a.sortkey || a.label;
				b = b.sortkey || b.label;
				return a.localeCompare( b );
			} );
			for ( obj of subtypeOptions ) {
				addOption( ELEMENTS.subtype, obj.type, obj.label
					// simplifying labels
					.replace( /\[([^\[\]]*)\|([^\[\]]*)\]/ig, '$2' )
					.replace( /\[([^\[\]]*)\]/ig, '' ) );
			}

			Config.WIKIDATA_CLAIMS.subtype.table = subtypeQualifiers;
		};

		// Generate the form UI for the listing editor.  If editing an existing
		// listing, pre-populate the form input fields with the existing values.
		var createForm = function( isEditMode, isListing, listingTag ) {
			var form = $( EDITOR_FORM_HTML( isListing ) );

			for ( var parameter in getAllParams() )
				ELEMENTS[ parameter ] = $( '#' + getInputId( parameter ), form );

			additionsToForm( isEditMode, listingTag, form );
			return form;
		};

		var splitParameters = function( parameter, table, aliases, aliases2, form, selector ) {
			parameter = parameter.toLowerCase()
				.split( ',' ).map( function( item ) {
					return item.trim();
				});
			// translate aliases to types
			for ( var i in parameter ) {
				parameter[ i ] = parameter[ i ].replace(/[_\s]+/g, '_');
				if ( aliases2 && aliases2[ parameter[ i ] ] )
					parameter[ i ] = aliases2[ parameter[ i ] ];
				if ( aliases && aliases[ parameter[ i ] ] )
					parameter[ i ] = aliases[ parameter[ i ] ];
			}
			// remove duplicates
			parameter = parameter.filter( function( value, index, self ) {
				return self.indexOf( value ) === index;
			});
			for ( i = parameter.length - 1; i >= 0; i-- ) {
				// remove empty items
				if ( !parameter[ i ] || parameter[ i ] === '' ) {
					parameter.splice( i, 1 );
					continue;
				}
				// handle unknown items (custom types)
				if ( !table[ parameter[ i ] ] ) {
					if ( !selector || selector === '' )
						parameter.splice( i, 1 );
					else
						$( selector, form )
							.append( $( '<option></option>' ).attr( 'value', parameter[ i ] ).text( parameter[ i ] ) );
				}
			}
			return parameter;
		};

		var checkShowOptions = function( parameter ) {
			var options = {}, i, par;
			for ( par of parameter )
				options[ par ] = 'o';
			if ( options.poi && options.coord && !options.all ) {
				options.all = 'o';
				parameter.push( 'all' );
			}
			for ( i = parameter.length - 1; i >= 0; i-- ) {
				if ( ( options.none || options.all ) &&
					( parameter[ i ] === 'poi' || parameter[ i ] === 'coord' ) )
					parameter.splice( i, 1 );
				if ( options.none && parameter[ i ] === 'all' )
					parameter.splice( i, 1 );
				if ( options.inline && parameter[ i ] === 'outdent' )
					parameter.splice( i, 1 );
			}
			return parameter;
		};

		var populateForm = function( listingAsMap, form, isEditMode, isListing, listingTag ) {
			// multiple select lists
			listingAsMap.type = splitParameters( listingAsMap.type || '', LUA_MODULES.typeList,
				LUA_MODULES.typeAliases, LUA_MODULES.groupAliases, form, '#input-type' );
			if ( listingAsMap.type.length ) ELEMENTS.firstType = listingAsMap.type[ 0 ];

			listingAsMap.subtype = splitParameters( listingAsMap.subtype || '', LUA_MODULES.subtypeList,
				LUA_MODULES.subtypeAliases, LUA_MODULES.typeAliases, form, '#input-subtype' );

			listingAsMap.show = splitParameters( listingAsMap.show || '',
				Config.SHOW_OPTIONS[ isListing ? 'listing' : 'marker' ], null,
				null, form, null );
			listingAsMap.show = checkShowOptions( listingAsMap.show );

			var l = listingAsMap.group;
			if ( l && LUA_MODULES.groupAliases[ l ] )
				listingAsMap.group = LUA_MODULES.groupAliases[ l ];
			if ( l && l !== '' && !LUA_MODULES.groupList[ l ] )
				ELEMENTS.group.append( `<option value="${l}">${l}</option>` );

			l = listingAsMap.name || '';
			if ( l === '' && isEditMode )
				listingAsMap.name = listingTag.attr( 'data-name' ) || '';
			if ( !Config.OPTIONS.defaultAuto && listingAsMap.wikidata && !listingAsMap.auto )
				listingAsMap.auto = 'y';

			// populate the empty form with existing values
			for ( var parameter in getAllParams() )
				if ( listingAsMap[ parameter] )
					ELEMENTS[ parameter ].val( listingAsMap[ parameter ] );
				else if ( Config.hideDivIfEmpty[ parameter ] )
					$( '#div_' + parameter, form ).hide();
			for ( var f of Callbacks.CREATE_FORM_CALLBACKS )
				f( form, isEditMode );
		};

		/** Wrap the h2/h3 heading tag and everything up to the next section
			(including sub-sections) in a div to make it easier to traverse the DOM.
			This change introduces the potential for code incompatibility should the
			div cause any CSS or UI conflicts.
		*/
		var wrapContent = function() {
			// useparsoid=1 set?
			if ( SYSTEM.isParsoid )
				return;

			unwrapContent();

			// to access first and last sections
			var content = SELECTORS.content;
			$( content ).prepend( '<h2 class="mw-helperheader mw-heading2" style="display: none">Beginning</h2>' )
				.append( '<h2 class="mw-helperheader mw-heading2" style="display: none">End</h2>' );

			// MobileFrontend use-case
			if ( $( '.mw-parser-output > h2.section-heading' ).length ) {
				$( '.mw-parser-output > section' ).addClass( 'mw-h2section' );
			} else {
				if ( SYSTEM.isNewMarkup ) {
					$(content + ' .mw-heading2').each(function(){
						$(this).nextUntil('.mw-heading1, .mw-heading2').addBack().wrapAll('<div class="mw-h2section" />');
					});
				} else {
					$(content + ' h2').each(function(){
						$(this).nextUntil('h1, h2').addBack().wrapAll('<div class="mw-h2section" />');
					});
				}
			}
			if ( SYSTEM.isNewMarkup ) {
				$(content + ' .mw-heading3').each(function(){
					$(this).nextUntil('.mw-heading1, .mw-heading2, .mw-heading3').addBack().wrapAll('<div class="mw-h3section" />');
				});
			} else {
				$(content + ' h3').each(function(){
					$(this).nextUntil('h1, h2, h3').addBack().wrapAll('<div class="mw-h3section" />');
				});
			}
		};

		var unwrapContent = function() {
			// useparsoid=1 set?
			if ( SYSTEM.isParsoid )
				return;

			// do not unwrap <section> tag
			$( 'div.mw-h3section, div.mw-h2section' ).replaceWith( function() {
				return $( this ).contents();
			});

			$( 'h2.mw-helperheader' ).remove();
		};

		// Place an "add listing" link at the top of each section heading next to
		// the "edit" link in the section heading.
		var addListingButtons = function() {
			if ( $( Config.DISALLOW_ADD_LISTING_IF_PRESENT.join( ',' ) ).length )
				return false;

			for ( var sectionId in Config.SECTION_TO_DEFAULT_TYPE ) {
				
				// do not search using "#id" for two reasons. First, the article might
				// re-use the same heading elsewhere and thus have two of the same ID.
				// Second, unicode headings are escaped ("è" becomes ".C3.A8") and the
				// dot is interpreted by JQuery to indicate a child pattern unless it
				// is escaped
				var headings,
					nodeWithId = $( `[id="${sectionId}"]` ),
					topHeading = nodeWithId.is( 'h2' ) ? nodeWithId :
						nodeWithId.closest( 'h2' );
				if ( topHeading.length ) {
					insertAddListingPlaceholder( topHeading );

					if ( SYSTEM.isNewMarkup ) {
						headings = topHeading.closest( '.mw-heading' )
							.nextUntil( '.mw-heading1, .mw-heading2' )
							.find( '.mw-heading3' ).addBack( '.mw-heading3' ) // itself and descendants
							.find( 'h3' );
					} else {
						headings = topHeading.nextUntil( 'h1, h2' )
							.find( 'h3' ).addBack( 'h3' );
					}
					insertAddListingPlaceholder( headings );
				}
			}
		};

		var buttonLink = function( text, title, bClass, isEditMode ) {
			return $( isEditMode ? '<button/>' : '<a href="javascript:" />' )
				.addClass( bClass || '' )
				.attr( 'title', title )
				.text( text )
				.click( function() {
					initListingEditorDialog( $( this ) );
				});
		};

		// Append the "add listing" link text to a heading.
		var insertAddListingPlaceholder = function( parentHeading ) {
			parentHeading.each( function() {
				var _this = $( this ),
					headline = _this.find( '.mw-headline' ),
					editSection = headline.length ? headline.next( '.mw-editsection' ) :
						_this.next( '.mw-editsection' ),
					addButton = buttonLink( translate( 'add' ), translate( 'addTitle' ),
						SELECTORS.addButton, false );
				
				editSection.append( '<span class="mw-editsection-bracket">[ </span>',
					addButton, '<span class="mw-editsection-bracket">]</span>' );
			} );
		};

		// Place an "edit" link next to all existing listing templates.
		var addEditButtons = function() {
			var editButton = buttonLink( translate( 'edit' ),
				translate( 'editTitle' ), '', true );
			editButton = $( '<span class="listing-metadata-item listing-edit-button noprint"></span>' )
				.append( editButton );
			$( SELECTORS.metadataSelector ).append( editButton );
		};

		// replace loading by listingEditorDialog listeners
		var replaceEventListeners = function() {
			$( '.' + SELECTORS.addButton + ',' + SELECTORS.editLink ).each( function() {
				_this = $( this );
				_this.off( 'click', '**' )
					.click( function() {
						initListingEditorDialog( _this );
					} );
			} );
		};

		// Determine whether a listing entry is within a paragraph rather than
		// an entry in a list
		var isInline = function( clicked ) {
			return clicked.closest( 'p' ).length && clicked.closest( 'span.vcard' ).length;
		};

		// Given an editable heading, examine it to determine what section index
		// the heading represents.  First heading is 1, second is 2, etc.
		var findSectionIndex = function( sectionHeading ) {
			if ( sectionHeading === undefined )
				return 0;

			// old markup
			var link = sectionHeading.find( '.mw-editsection a' ).attr( 'href' );
			var section = ( link !== undefined ) ? link.split( '=' ).pop() : 0;
			if ( section > 0 ) return section;

			// new markup
			var next = sectionHeading.next();
			if ( next.hasClass( 'mw-editsection' ) ) {
				link = next.find( 'a' ).attr( 'href' );
				return ( link !== undefined ) ? link.split( '=' ).pop() : 0;
			}
			
			return 0;
		};

		// Given an edit link that was clicked for a listing, determine what index
		// that listing is within a section.  First listing is 0, second is 1, etc.
		var findListingIndex = function( sectionHeading, clicked, isListing ) {
			var count = 0, found = false, template;
			$( SELECTORS.editLink, sectionHeading ).each(function() {
				if (clicked.is( $(this) )) {
					found = true;
					return false; // stop iterating
				}
				template = $(this).closest( SELECTORS.templateClass );
				// separate count for listings and markers 
				if ( ( isListing && template.hasClass( SELECTORS.listingClass ) ) ||
					( !isListing && template.hasClass( SELECTORS.markerClass ) ) )
					count++;
			});
			return found ? count : -1;
		};

		/** Return the listing template type appropriate for the section that
			contains the provided DOM element (example: "see" for "See" sections,
			etc).  If no matching type is found then the default listing template
			type is returned.
		*/
		var findListingTypeForSection = function( clicked ) {
			var section = clicked.closest( 'div.mw-h2section' ), sectionType;
			if ( SYSTEM.isNewMarkup )
				sectionType = $( 'h2', section ).attr( 'id' );
			else
				sectionType = $( '.mw-headline', section ).attr( 'id' );
			for ( var sectionId in Config.SECTION_TO_DEFAULT_TYPE )
				if ( sectionType == sectionId )
					return Config.SECTION_TO_DEFAULT_TYPE[ sectionId ];
			return 'listing'; // fall back
		};

		var replaceSpecial = function(str) {
			return str.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
		};

		/** Return a regular expression that can be used to find all listing
			template invocations (as configured via the TEMPLATES map)
			within a section of wikitext.  Note that the returned regex simply
			matches the start of the template ("{{listing") and not the full
			template ("{{listing|key=value|...}}").
		*/
		var getListingTypesRegex = function( isListing ) {
			var templates = Config.TEMPLATES[ isListing ? 'listing' : 'marker' ];
			return new RegExp('({{\\s*(' + templates.join('|') + ')\\b)(\\s*[\\|}])','ig');
		};

		/** Given a listing index, return the full wikitext for that listing
			("{{listing|key=value|...}}"). An index of 0 returns the first listing
			template invocation, 1 returns the second, etc.
		*/
		var getListingWikitextBraces = function( listingIndex, isListing ) {
			sectionText = sectionText.replace(/[^\S\n]+/g,' ');
			// find the listing wikitext that matches the same index as the listing index
			var listingRegex = getListingTypesRegex( isListing );
			// look through all matches for "{{listing|see|do...}}" within the section
			// wikitext, returning the nth match, where 'n' is equal to the index of the
			// edit link that was clicked

			// if sectionText is wrong or corrupt the following lines may cause
			// a crash
			var listingSyntax, regexResult, listingMatchIndex;
			for (var i = 0; i <= listingIndex; i++) {
				regexResult = listingRegex.exec( sectionText );
				if ( regexResult ) {
					listingMatchIndex = regexResult.index;
					listingSyntax = regexResult[ 1 ];
				}
			}
			// listings may contain nested templates, so step through all section
			// text after the matched text to find MATCHING closing braces
			// the first two braces are matched by the listing regex and already
			// captured in the listingSyntax variable
			var matchFound = false;
			if ( listingMatchIndex && listingSyntax ) {
				var curlyBraceCount = 2;
				var endPos = sectionText.length;
				var startPos = listingMatchIndex + listingSyntax.length;
				for (var j = startPos; j < endPos; j++) {
					if (sectionText[j] === '{')
						++curlyBraceCount;
					else if (sectionText[j] === '}')
						--curlyBraceCount;
					if (curlyBraceCount === 0 && (j + 1) < endPos) {
						listingSyntax = sectionText.substring(listingMatchIndex, j + 1);
						matchFound = true;
						break;
					}
				}
			}
			if ( !matchFound )
				listingSyntax = sectionText.substring( listingMatchIndex );
			return (listingSyntax || '').trim();
		};

		// Convert raw wiki listing syntax into a mapping of key-value pairs
		// corresponding to the listing template parameters.
		var wikiTextToListing = function( listingWikiSyntax, isListing ) {
			var typeRegex = getListingTypesRegex( isListing ),
				templates = Config.TEMPLATES[ isListing ? 'listing' : 'marker' ],
				comments, key, tag;
			// convert "{{see|" to {{listing|" etc.
			listingWikiSyntax = listingWikiSyntax
				.replace( typeRegex, '{{' + templates[ 0 ] + '$3' )
				.slice(0,-2); // remove the trailing braces
			var listingAsMap = parseListing( listingWikiSyntax );
			// replace comment placeholders by its original values
			for ( key in listingAsMap )
				listingAsMap[ key ] = restoreComments(listingAsMap[ key ], false);

			// remove comments from select list and store it
			for ( key in getAllParams() ) {
				tag = ELEMENTS[ key ].prop( 'tagName' );
				if ( listingAsMap[ key ] && listingAsMap[ key ] !== '' && tag === 'SELECT' ) {
					comments = listingAsMap[ key ].match( /<!--.*?-->/g );
					if ( comments ) {
						selectComments[ key ] = comments;
						listingAsMap[ key ] = Callbacks.removeComments( listingAsMap[ key ] );
					}
				}
			}
			// convert paragraph tags to newlines
			if ( listingAsMap.description && displayBlock )
				listingAsMap.description = listingAsMap.description.replace(/\s*<p>\s*/g, '\n\n');
			// remove control characters
			for ( key in listingAsMap )
				listingAsMap[ key ] = removeCtrls( listingAsMap[ key ], key == 'description' );

			// sanitize the listing type param to match the configured values, so
			// if the listing contained "Do" it will still match the configured "do"
			if ( !listingAsMap.type )
				listingAsMap.type = '';
			for ( key of templates )
				if ( listingAsMap.type.toLowerCase() === key.toLowerCase() ) {
					listingAsMap.type = key;
					break;
				}
			for ( key in listingAsMap ) {
				var c = Callbacks.checkYesNo( listingAsMap[ key ] );
				if ( c !== '' ) listingAsMap[ key ] = c;
			}

			// copying parameter aliases if possible
			var arr, j, key2;
			for ( key in getAllParams() ) {
				arr = Config.PARAM_ALIASES[ key ] || [];
				for ( key2 of arr ) {
					if ( ( !listingAsMap[ key ] || listingAsMap[ key ] === '' ) &&
						listingAsMap[ key2 ] ) {
						listingAsMap[ key ] = listingAsMap[ key2 ];
						delete( listingAsMap[ key2 ] );
					}
				}
			}

			return listingAsMap;
		};

		/** Split the raw template wikitext into an array of params. The pipe
			symbol delimits template params, but this method will also inspect the
			content to deal with nested templates or wikilinks that might contain
			pipe characters that should not be used as delimiters.
		*/

		// masking pipes in templates and wiki links by \x00
		var maskPipes = function( s ) {
			var regex1, regex2, regex3, regex4, t;
			function replacePipes( name, offset, str ) {
				return name.replace( /\|/g, '\x00' ).replace( regex2, '\x01' ).replace( regex3, '\x02' );
			}
			function masking( str, start, end ) {
				regex1 = new RegExp( '\\' + start + '{2}[^\\' + start + '\\' + end + ']*\\' + end + '{2}', 'g' );
				regex2 = new RegExp( '\\' + start, 'g' );
				regex3 = new RegExp( '\\' + end, 'g' );
				regex4 = new RegExp( '\\' + end + '{2}$' );

				str += end + end;
				do {
					t = str;
					str = str.replace( regex1, replacePipes );
				} while ( t !== str );
				return str.replace( regex4, '' ).replace( /\x01/g, start ).replace( /\x02/g, end );
			}
			s = masking( s, '{', '}' );
			return masking( s, '[', ']' );
		};

		var parseListing = function( listingWikiSyntax ) {
			var listingAsMap = {};
			var str = listingWikiSyntax.replace( /[\x00-\x02]/g, '' ).slice( 2 ); // remove {{
			str = maskPipes( str );

			// splitting each parameter
			var results = str.split( '|' );
			results.shift();
			var at, index = 1, match, name, result;
			for ( result of results ) {
				result = result.trim().replace( /\x00/g, '|' );
				match = result.match( /[^<=\{\[]*\s*=/ );
				if ( match && match[ 0 ] !== '=' ) {
					at = match[ 0 ].length;
					name = match[ 0 ].substr( 0, at - 1 )
						.replace( /[\x00-\x0F\x7F]+/g, '')
						.replace( / +/g, ' ').trim();
					listingAsMap[ name ] = result.substr( at ).trim();
				} else {
					listingAsMap[ '' + index ] = result.replace( /^=/, '' ).trim();
					index++;
				}
			}

			return listingAsMap;
		};

		/** This method is invoked when an "add" or "edit" listing button is
			clicked and will execute an Ajax request to retrieve all of the raw wiki
			syntax contained within the specified section.  This wiki text will
			later be modified via the listing editor and re-submitted as a section
			edit.
		*/
		var initListingEditorDialog = function( clicked ) {
			var isEditMode = clicked.closest( SELECTORS.metadataSelector ).length > 0,
				listingTag = clicked.closest( SELECTORS.templateClass ), // markers and listings
				isListing = true, listingType;

			wrapContent();
			if ( isEditMode ) {
				// listing or marker?
				isListing = listingTag.hasClass( SELECTORS.listingClass ); // otherwise Marker
				listingType = listingTag.attr( 'data-type' );
				displayBlock = listingTag.prop( 'tagName' ) === 'DIV';
			} else // add mode
				listingType = findListingTypeForSection( clicked );

			// find the nearest editable section (h2 or h3) that it is contained within.
			// remove mw-h3section and mw-h2section when ?useparsoid=1 is everywhere
			var sectionHeading = clicked.closest( 'div.mw-h3section, div.mw-h2section, section' ),
				sectionIndex = findSectionIndex( sectionHeading );
			inlineDetected = isEditMode && isInline( clicked );
			inlineListing = Config.OPTIONS.inlineFormat || inlineDetected;
			var listingIndex = isEditMode ? findListingIndex( sectionHeading, clicked, isListing ) : -1;
			unwrapContent();

			if ( isEditMode && listingIndex < 0 ) {
				// to prevent a crash by getListingWikitextBraces()
				alert( translate( 'sectionNotFound' ) );
				return;
			}

			progressForm( SELECTORS.loadingForm,
				translate( isListing ? 'loading' : 'loadingMarker' ) );
			$.ajax({
				url: SYSTEM.Wikivoyage_API,
				data: {
					prop: 'revisions',
					format: 'json',
					formatversion: 2,
					titles:  mw.config.get( 'wgPageName' ),
					action: 'query',
					rvprop: 'content',
					origin: '*',
					rvsection: sectionIndex
				},
				cache: false // required
			}).done( function( data ) {
				closeForm( SELECTORS.loadingForm );
				try {
					sectionText = data.query.pages[ 0 ].revisions[ 0 ].content;
				} catch ( e ) {
					alert( translate( 'ajaxSectionError' ) );
					return;
				}
				openListingEditorDialog( isEditMode, sectionIndex, listingIndex,
					listingType, isListing, listingTag );
			}).fail( function( jqXHR, textStatus, errorThrown ) {
				closeForm( SELECTORS.loadingForm );
				alert( `${translate( 'ajaxInitFailure' )}: ${textStatus} ${errorThrown}` );
			});
		};

		/** This method is called asynchronously after the initListingEditorDialog()
			method has retrieved the existing wiki section content that the
			listing is being added to (and that contains the listing wiki syntax
			when editing).
		*/
		var openListingEditorDialog = function( isEditMode, sectionNumber, listingIndex,
			listingType, isListing, listingTag ) {
			// Not working in Minerva skin because of missing modules

			const windw = $( window ),
				// wide dialogs on huge screens look terrible
				dialogWidth = windw.width() > Config.OPTIONS.MaxDialogWidth ? Config.OPTIONS.MaxDialogWidth : 'auto',
				pageX = window.scrollX, pageY = window.scrollY;

			// if a listing editor dialog is already open, get rid of it
			closeForm( SELECTORS.editorForm );
			var form = $( createForm( isEditMode, isListing, listingTag ) );

			sectionText = stripComments(sectionText);
			var listingAsMap = {}, listingWikiSyntax, t;
			if ( isEditMode ) {
				listingWikiSyntax = getListingWikitextBraces( listingIndex, isListing );
				listingAsMap = wikiTextToListing( listingWikiSyntax, isListing );
				t = listingAsMap.type;
				if ( listingType && ( !t || t === "" ) )
					listingAsMap.type = listingType;
				listingType = listingAsMap.type;
			} else
				listingAsMap.type = listingType;
			populateForm( listingAsMap, form, isEditMode, isListing, listingTag );

			form.dialog({
				// modal form - must submit or cancel
				modal: true,
				height: 'auto',
				width: dialogWidth,
				title: isListing ? translate( isEditMode ? 'editTitle' : 'addTitle' ) :
					translate( 'markerTitle' ),
				dialogClass: 'listingeditor-dialog ' +
					( isListing ? SELECTORS.listingClass : SELECTORS.markerClass ),
				close: function() {
				},
				buttons: [
				{
					text: translate( 'help' ),
					title: translate( isListing ? 'helpTitle' : 'helpTitleMarker' ),
					id: 'listingeditor-help',
					click: function() { window.open(
						translate( isListing ? 'helpPage' : 'helpPageMarker' ) ); }
				},
				{
					text: translate( 'submit' ),
					title: translate( 'submitTitle' ),
					click: function() {
						if ($( SELECTORS.editorDelete ).is(':checked')) {
							// no validation
							formToText( isEditMode, listingWikiSyntax, listingAsMap,
								sectionNumber, false, isListing );
							$(this).dialog('close');
						}
						else if (validateForm()) {
							formToText( isEditMode, listingWikiSyntax, listingAsMap,
								sectionNumber, true, isListing );
							$(this).dialog('close');
						}
					}
				},
				{
					text: translate( 'preview' ),
					title: translate( isListing ? 'previewTitle' : 'previewTitleMarker' ),
					id: 'listingeditor-preview-button',
					click: function() {
						startPreview( listingAsMap, isListing );
						$( '#select-preview', form ).trigger( 'click' );
						$( '#div_description' ).hide();
					}
				},
				{
					text: translate( 'previewOff' ),
					title: translate( 'previewOffTitle' ),
					id: 'listingeditor-preview-off',
					style: 'display: none',
					click: function() {
						togglePreview( true );
						$( '#div_description' ).show();
					}
				},
				{
					text: translate( 'refresh' ),
					title: translate( 'refreshTitle' ),
					icon: 'ui-icon-refresh',
					id: 'listingeditor-refresh',
					style: 'display: none',
					click: function() {
						refreshPreview( listingAsMap, isListing );
					}
				},
				{
					text: translate( 'cancel' ),
					title: translate( 'cancelTitle' ),
					click: function() {
						if ( !checkForChanges( listingAsMap ) || confirm( translate( 'cancelMessage' ) ) ) {
							$(this).dialog('destroy').remove();
						}
					}
				}
				],
				create: function() {
					$( '.ui-dialog-buttonpane' )
						.append( `<div class="listingeditor-license" data-listingeditor-version="${SYSTEM.version}" data-listingeditor-lang="${SYSTEM.wikiLang}-${window[ SYSTEM.listingEditor ].LANG}">${translate( 'licenseText' )}</div>` );
				}
			});

			window.scroll(pageX, pageY);
			var windowHeight = windw.height();
			if ( windowHeight < 720 ) {
				var fontSize = parseFloat( $( '.listingeditor-dialog' ).css( 'font-size' ) );
				$( '.listingeditor-dialog' )
					.css( 'font-size', fontSize * windowHeight / 720 );
				fontSize = parseFloat( $( '.chosen-container' ).css( 'font-size' ) );
				$( '.chosen-container' )
					.css( 'font-size', fontSize * windowHeight / 720 );
			}

			// start preview if Marker editor
			if ( !isListing )
				$( '#listingeditor-preview-button' ).trigger( 'click' );
		};

		/** Commented-out listings can result in the wrong listing being edited, so
			strip out any comments and replace them with placeholders that can be
			restored prior to saving changes.
		*/
		var stripComments = function( text ) {
			// /s supports line break characters in .*
			var regex = [ /<!--.*?-->/gs, /<nowiki>.*?<\/nowiki>/gis, /<pre>.*?<\/pre>/gis ],
				comments, i, j, rep;
			for ( j = 0; j < regex.length; j++ ) {
				comments = text.match( regex[ j ] );
				if ( comments )
					for ( i = 0; i < comments.length; i++ ) {
						rep = `<<<COMMENT${i};${j}>>>`;
						text = text.replace(comments[ i ], rep);
						replacements[rep] = comments[ i ];
					}
			}
			return text;
		};

		// Search the text provided, and if it contains any text that was
		// previously stripped out for replacement purposes, restore it.
		var restoreComments = function(text, resetReplacements) {
			for ( var key in replacements )
				text = text.replace(key, replacements[key]);
			if ( resetReplacements )
				replacements = {};
			return text;
		};

		// Logic invoked on form submit to analyze the values entered into the
		// editor form and to block submission if any fatal errors are found.
		var validateForm = function() {
			var validationFailureMessages = [];
			for ( var f of Callbacks.VALIDATE_FORM_CALLBACKS )
				f( validationFailureMessages );
			if ( validationFailureMessages.length ) {
				alert( validationFailureMessages.join( '\n' ) );
				return false;
			}
			return true;
		};

		/** Convert the listing editor form entry fields into wiki text.  This
			method converts the form entry fields into a listing template string,
			replaces the original template string in the section text with the
			updated entry, and then submits the section text to be saved on the
			server.
		*/
		var getValues = function( listing ) {
			var l = $.extend( true, {}, listing ), val;
			for ( var parameter in getAllParams() ) {
				val = ELEMENTS[ parameter ].val();
				if ( val )
					l[ parameter ] = val;
				else
					l[ parameter ] = null;
			}
			return l;
		};

		var formToText = function( isEditMode, listingWikiSyntax, listingAsMap,
			sectionNumber, withCallbacks, isListing ) {

			var listing = getValues( listingAsMap );
			if ( withCallbacks )
				for ( var f of Callbacks.SUBMIT_FORM_CALLBACKS )
					f( listing, listingAsMap, isEditMode );
			var text = listingToStr( listing, isListing );
			var summary = editSummarySection();
			var name = listingAsMap.name;
			if ( listing.name.trim() !== '' )
				name = listing.name.trim();
			if ( isEditMode )
				summary = updateSectionTextWithEditedListing( summary, text,
					listingWikiSyntax, name, isListing );
			else
				summary = updateSectionTextWithAddedListing( summary, text, listing, name );
			if ( $( SELECTORS.editorSummary ).val() !== '' )
				summary += ' – ' + $( SELECTORS.editorSummary ).val();
			var minor = $( SELECTORS.editorMinorEdit ).is(':checked') ? true : false;
			saveForm(summary, minor, sectionNumber, '', '');
		};

		var showPreview = function( listingAsMap, isListing ) {
			var text = listingToStr( getValues( listingAsMap ), isListing );
			$( '#listingeditor-preview-syntax' ).text( text );

			$.ajax({
				url: SYSTEM.Wikivoyage_API,
				data: {
					action: 'parse',
					prop: 'text',
					contentmodel: 'wikitext',
					format: 'json',
					text: text
				},
				success: function( data ) {
					$( '#listingeditor-preview-text' ).html( data.parse.text[ '*' ] );
				},
				error: function() {
					$( '#listingeditor-preview' ).hide();
				},
			});
		};

		// Preview

		var togglePreview = function( visible ) {
			$( '#listingeditor-preview' ).toggle( !visible );
			$( '#listingeditor-refresh' ).toggle( !visible );
			$( '#listingeditor-preview-off' ).toggle( !visible );
			$( '#listingeditor-preview-button' ).toggle( visible );
		};

		var startPreview = function( listingAsMap, isListing ) {
			var visible = $( '#listingeditor-preview' ).is( ':visible' );
			togglePreview( visible );
			if ( !visible )
				showPreview( listingAsMap, isListing );
		};
		
		var refreshPreview = function( listingAsMap, isListing ) {
			if ( $( '#listingeditor-preview' ).is( ':visible' ) )
				showPreview( listingAsMap, isListing );
		};

		// For cancel button: check if any changes were made for warning msg.
		var checkForChanges = function( listingAsMap ) {
			var i, p, val;
			for ( var parameter in getAllParams() ) {
				p = listingAsMap[ parameter ];
				val = ELEMENTS[ parameter ].val();
				if ( val ) {
					if ( typeof( val ) === 'string' ) {
						if ( val !== ( p || '' ) ) {
							return true;
						}
					} else { // multiple select
						p = p || [];
						if ( val.length !== p.length ) {
							return true;
						}
						for ( i = 0; i < val.length; i++ )
							if ( !p.includes( val[ i ] ) ) {
								return true;
							}
					}
				}
			}
			return false;
		};

		// Begin building the edit summary by trying to find the section name.
		var editSummarySection = function() {
			var sectionName = getSectionName();
			return ( sectionName.length ) ? `/* ${sectionName} */ ` : '';
		};

		var getSectionName = function() {
			var HEADING_REGEX = /^=+\s*([^=]+)\s*=+\s*\n/;
			var result = HEADING_REGEX.exec(sectionText);
			return ( result !== null ) ? result[ 1 ].trim() : '';
		};

		/** After the listing has been converted to a string, add additional
			processing required for adds (as opposed to edits), returning an
			appropriate edit summary string.
		*/
		var updateSectionTextWithAddedListing = function( originalEditSummary, listingWikiText, listing, name ) {
			var summary = originalEditSummary + mw.format( translate( 'added' ), name );
			// add the new listing to the end of the section.  if there are
			// sub-sections, add it prior to the start of the sub-sections.
			var index = sectionText.indexOf('===');
			if (index === 0)
				index = sectionText.indexOf('====');
			if (index > 0)
				sectionText = sectionText.substr(0, index) + '* ' + listingWikiText +
					'\n' + sectionText.substr(index);
			else
				sectionText += '\n'+ '* ' + listingWikiText;

			sectionText = restoreComments( sectionText, true );
			return summary;
		};

		/** After the listing has been converted to a string, add additional
			processing required for edits (as opposed to adds), returning an
			appropriate edit summary string.
		*/
		var updateSectionTextWithEditedListing = function( originalEditSummary,
			listingWikiText, listingWikiSyntax, name, isListing ) {

			var summary = originalEditSummary;

			// '$&' like in '$&nbsp;' will be misinterpreted in regex replacements
			listingWikiSyntax = listingWikiSyntax.replace( /\$&/ig, '&#36;&');
			sectionText = sectionText.replace( /\$&/ig, '&#36;&');
			listingWikiText = listingWikiText.replace( /\$&/ig, '&#36;&');

			if ( $( SELECTORS.editorDelete ).is( ':checked' ) ) {
				summary += mw.format( translate( 'removed' ), name );
				var listRegex = new RegExp('(\\n+[\\:\\*\\#]*)?\\s*' + replaceSpecial( listingWikiSyntax ));
				sectionText = sectionText.replace( listRegex, '' );
			} else {
				summary += mw.format( translate( isListing ? 'updated' : 'updatedMarker' ), name );
				sectionText = sectionText.replace( listingWikiSyntax, listingWikiText );
			}
			sectionText = restoreComments(sectionText, true).replace( /&#36;/ig, '$$' ); // restore $
			return summary;
		};

		// Render a dialog that notifies the user that the listing editor is
		// loaded or changes are being saved.
		var closeForm = function(selector) {
			if ( $(selector).length )
				$(selector).dialog('destroy').remove();
		};

		var progressForm = function(selector, text) {
			// if a progress dialog is already open, get rid of it
			closeForm(selector);
			var progress = $(`<div id="${selector.replace( '#', '' )}">${text}</div>`);
			progress.dialog({
				modal: true,
				height: 110,
				width: 300,
				title: ''
			});
			$('.ui-dialog-titlebar').hide();
		};

		/** Execute the logic to post listing editor changes to the server so that
			they are saved.  After saving the page is refreshed to show the updated
			article.
		*/
		var saveForm = function(summary, minor, sectionNumber, cid, answer) {
			var editPayload = {
				action: 'edit',
				title: mw.config.get( 'wgPageName' ),
				section: sectionNumber,
				text: sectionText,
				summary: summary,
				captchaid: cid,
				captchaword: answer,
				tags: 'Listing Editor'
			};
			if ( minor )
				editPayload.minor = 'true';
			api.postWithToken(
				"csrf",
				editPayload
			).done(function(data, jqXHR) {
				if (data && data.edit && data.edit.result == 'Success') {
					// since the listing editor can be used on diff pages, redirect
					// to the canonical URL if it is different from the current URL
					var canonicalUrl = $("link[rel='canonical']").attr("href");
					var currentUrlWithoutHash = window.location.href.replace(window.location.hash, "");
					if (canonicalUrl && currentUrlWithoutHash != canonicalUrl) {
						var sectionName = mw.util.escapeIdForLink(getSectionName());
						if (sectionName.length)
							canonicalUrl += "#" + sectionName;
						window.location.href = canonicalUrl;
					} else
						window.location.reload();
				} else if (data && data.error) {
					saveFailed(translate( 'submitApiError' ) + ' "' + data.error.code + '": ' + data.error.info );
				} else if (data && data.edit.spamblacklist) {
					saveFailed(translate( 'submitBlacklistError' ) + ': ' + data.edit.spamblacklist );
				} else if (data && data.edit.captcha) {
					closeForm( SELECTORS.saveForm );
					captchaDialog(summary, minor, sectionNumber, data.edit.captcha.url, data.edit.captcha.id);
				} else
					saveFailed(translate( 'submitUnknownError' ));
			}).fail(function(code, result) {
				if (code === "http")
					saveFailed(translate( 'submitHttpError' ) + ': ' + result.textStatus );
				else if (code === "ok-but-empty") {
					saveFailed(translate( 'submitEmptyError' ));
				} else
					saveFailed(translate( 'submitUnknownError' ) + ': ' + code );
			});
			progressForm( SELECTORS.saveForm, translate( 'saving' ) );
		};

		/** If an error occurs while saving the form, remove the "saving" dialog,
			restore the original listing editor form (with all user content), and
			display an alert with a failure message.
		*/
		var saveFailed = function(msg) {
			closeForm( SELECTORS.saveForm );
			$( SELECTORS.editorForm ).dialog('open');
			alert(msg);
		};

		/** If the result of an attempt to save the listing editor content is a
			Captcha challenge then display a form to allow the user to respond to
			the challenge and resubmit.
		*/
		var captchaDialog = function(summary, minor, sectionNumber, captchaImgSrc, captchaId) {
			// if a captcha dialog is already open, get rid of it
			closeForm( SELECTORS.captchaForm );
			var captcha = $('<div id="captcha-dialog">').text(translate( 'externalLinks' ));
			var image = $('<img class="fancycaptcha-image">')
				.attr('src', captchaImgSrc)
				.appendTo(captcha);
			var label = $('<label for="input-captcha">').text(translate( 'enterCaptcha' )).appendTo(captcha);
			var input = $('<input id="input-captcha" type="text">').appendTo(captcha);
			captcha.dialog({
				modal: true,
				title: translate( 'enterCaptcha' ),
				buttons: [
					{
						text: translate( 'submit' ), click: function() {
							saveForm(summary, minor, sectionNumber, captchaId, $('#input-captcha').val());
							$(this).dialog('destroy').remove();
						}
					},
					{
						text: translate( 'cancel' ), click: function() {
							$(this).dialog('destroy').remove();
						}
					}
				]
			});
		};

		// remove controls and illegal chars
		var removeCtrls = function( str, isContent ) {
			str = str.trim();
			if ( str === '' ) return '';
			if ( displayBlock && isContent ) {
				// remove controls from tags at first
				str = str.replace( /(<[^>]+>)/g, function( name, offset, str ) {
					return name.replace( /[\x00-\x0F\x7F]/g, ' ' );
				});
				str = str.replace( /[\x00-\x09\x0B\x0C\x0E\x0F\x7F]/g, ' ' );
			} else
				str = str.replace( /(<\/?br[^%/>]*\/*>|<\/?p[^%/>]*\/*>)/g, ' ' )
					.replace( /[\x00-\x0F\x7F]/g, ' ' );
			return str.trim().replace( / {2,}/g, ' ' );
		};

		var getAlias = function( value, aliases ) {
			for ( var key in aliases )
				if ( aliases[ key ] === value ) {
					value = key;
					break;
				}
			return value;
		};

		var listingToStr = function( listing, isListing ) {
			var arr, i, l, par;

			// values cleanup
			for ( var parameter in listing ) {
				l = listing[ parameter ];
					if ( l ) {
					if ( typeof l == 'object' )
						for ( i = l.length - 1; i >= 0 ; i-- ) {
							if ( !l[ i ] || l[ i ] === '' )
								l.splice( i, 1 );
						}
					else {
						l = removeCtrls( l, parameter == 'description' )
							.trim()
							.replace( / {2,}/g, ' ' );
						l = maskPipes( l ).replace( /\|/g, '{{!}}' ).replace( /\x00/g, '|' );
						// handle punctuation marks
						if ( Config.OPTIONS.withoutPunctuation.includes( parameter ) )
							l = l.replace( /[。、；！？]+$/, '' );
						if ( parameter === 'description' && l !== '' && !l.match( /[。！？]$/ ) )
							l = l + '。';
					}
					listing[ parameter ] = l;
				}
			}

			var templates = Config.TEMPLATES[ isListing ? 'listing' : 'marker' ],
				saveStr = '{{' + templates[ 0 ] + ' ';
			for ( parameter in getAllParams() ) {
				// recognized parameters only
				l = listing[ parameter ];
				if ( !l ) continue;

				switch( parameter ) {
					case 'type':
						if ( ELEMENTS.firstType !== '' )
							for ( i = 0; i < l.length; i++ )
								if ( l[ i ] == ELEMENTS.firstType ) {
									l.splice( i, 1 );
									l.unshift( ELEMENTS.firstType );
									break;
								}
						if ( Config.OPTIONS.CopyToTypeAliases )
							for ( i = 0; i < l.length; i++ )
								l[ i ] = getAlias( l[ i ], LUA_MODULES.typeAliases );
						l = l.join( ', ' ).replace( /_/g, ' ' );
						break;
					case 'group':
						if ( Config.OPTIONS.CopyToTypeAliases )
							l = getAlias( l, LUA_MODULES.groupAliases );
						break;
					case 'subtype':
						// sorting subtypes by groups
						l = Callbacks.sortSubtypesByGroups( l );
						if ( Config.OPTIONS.CopyToTypeAliases )
							for ( i = 0; i < l.length; i++ )
								l[ i ] = getAlias( l[ i ], LUA_MODULES.subtypeAliases );
						l = l.join( ', ' ).replace( /_/g, ' ' );
						break;
					case 'show':
						l = checkShowOptions( l );
						l = l.join( ', ' ).replace( /_/g, ' ' );
				}

				if ( selectComments[ parameter ] )
					l = l + selectComments[ parameter ].join( '' );
				par = parameter;
				arr = Config.PARAM_ALIASES[ par ] || [];

				// renaming parameter
				if (Config.OPTIONS.CopyToAliases && arr[0] && !listing[ arr[0] ])
					par = arr[0];
				if ( l !== '' || Config.keepIt[ parameter ] )
					saveStr += '| ' + par + ' = ' + l;
				if ( !saveStr.match( /\n$/ ) ) {
					saveStr = saveStr.replace(/\s+$/, '');
					saveStr += !inlineListing && Config.newline[ parameter ] ?
						'\n' : ' ';
				}
			}
			if ( Config.OPTIONS.AllowUnrecognizedParameters )
				// append any unexpected values
				for ( parameter in listing )
					if ( !getParams( parameter ) && listing[ parameter ] !== '' )
						saveStr += '| ' + parameter + ' = ' + listing[ parameter ] +
							( inlineListing ) ? ' ' : '\n';

			return inlineDetected ? saveStr.replace( /\s+$/, ' }}' ) : saveStr.replace( /\s+$/, '\n}}' );
		};

		// Called on DOM ready, this method initializes the listing editor and
		// adds the "add/edit listing" links to sections and existing listings.
		var init = function() {
			$('head').append('<link rel="stylesheet" type="text/css" href="/w/index.php?title=MediaWiki:Gadget-ListingEditor.css&action=raw&ctype=text/css">');
			addEditButtons();
			addListingButtons();
		};

		// expose public members
		return {
			init,
			initListingEditorDialog
		};
	}();

	$( Core.init );

	return {
		initListingEditorDialog: Core.initListingEditorDialog
	};

} ( mediaWiki, jQuery ) );

//</nowiki>
