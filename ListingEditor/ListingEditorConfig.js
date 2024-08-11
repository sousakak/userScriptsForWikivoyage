//<nowiki>
/** Listing Editor Configuration
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
	- https://de.wikivoyage.org/wiki/Wikivoyage:ListingEditor.js

	License: GPL-2.0+, CC-by-sa 3.0
*/
/* eslint-disable mediawiki/class-doc */

( function() {
	'use strict';

	var EditorConfig = function() {

		const SYSTEM = {
			listingEditor: 'ListingEditor'
		};

		var Config = {
			// --------------------------------------------------------------------
			//	STRINGS AND DEFINITIONS DEPENDING ON WIKI LANGUAGE
			//	TRANSLATE THE FOLLOWING BASED ON THE WIKIVOYAGE LANGUAGE IN USE
			// --------------------------------------------------------------------

			//	SECTION_TO_DEFAULT_TYPE and DISALLOW_ADD_LISTING_IF_PRESENT are
			//	only used to add edit buttons to page-map section headers
            SECTION_TO_DEFAULT_TYPE: {
                '着く': 'station', // go
                '移動する': 'public transport', // go
                '観る': 'monument', // see
                'する': 'sports', // do
                '買う': 'shop', // buy
                '食べる': 'restaurant', // eat
                '飲む': 'bar', // drink
                // dummy line (es) // drink and night life
                '泊まる': 'hotel', // sleep
                '学ぶ': 'education', // education
                '働く': 'administration', // work
                '安全を確保する': 'administration', // security
                '健康を維持する': 'health', // health
                '困ったときは': 'office' // practicalities
            },

			//	If any of these patterns are present on a page then no 'add listing'
			//	buttons will be added to the page
			DISALLOW_ADD_LISTING_IF_PRESENT:
                ['#都市', '#その他の目的地', '地域', '#島', '#print-districts'],

			//	names of the listing templates
			TEMPLATES: {
				listing: [ 'vCard', 'listing', 'go', 'see', 'do', 'buy', 'drink', 'eat', 'sleep' ],
				marker:  [ 'Marker' ]
			},
			
			//	Aliases for vCard or Marker parameters
			//	see: https://de.wikivoyage.org/wiki/Module:VCard/i18n
			PARAM_ALIASES: {
                commonscat: [ 'commons' ],
				description: [ 'content' ],
				lat: [ 'latitude', 'coord' ],
				long: [ 'lon', 'longitude' ],
				subtype: [ 'subtypes' ],
				// twitter: [ 'x' ],
				type: [ 'types' ]
			},

			//	Type dependent hide / show
			HIDE_AND_SHOW: {
				sleep: { 
						hide: [], // 'div_hours'; needed for campsites etc.
						show: ['div_checkin', 'div_checkout']
				},
				'default':  { 
						hide: ['div_checkin', 'div_checkout'],
						show: [] // 'div_hours'
				}
			},

			//	hideDivIfEmpty: id of a <div> in the EDITOR_FORM_HTML for this
			//	element that should be hidden if the corresponding template
			//	parameter has no value. For example, lastedit.
			hideDivIfEmpty: {},

			//	keepIt: Include the parameter in the wiki template syntax that
			//	is saved to the article if the parameter has no value. For
			//	example, the "description" tag is not included by default.
			keepIt: { description: 1 },

			//	newline: Append a newline after the parameter in the listing
			//	template syntax when the article is saved.
			newline: {},

			COORD_LETTERS:  {
                N: { factor:  1, dir: 'lat' },
                S: { factor: -1, dir: 'lat' },
                E: { factor:  1, dir: 'long' },
                W: { factor: -1, dir: 'long' },
            },

			MISC: {
				intlCurrencies: [ '¥', '$', '€', '£', '₩', '&amp;#x202F;' ],
				contentChars: [ 'Ä', 'Ö', 'Ü', 'ä', 'ö', 'ü', 'ß', 'ç', 'ñ', '„', '“',
						'‚', '‘', '’', '–', '—', '…', '·', '&amp;nbsp;', '&amp;#x202F;' ],
				spaceBeforeCurrencies: true,
				spaceAfterCallingCodes: true,

				yes: [ 'y', 'yes', 'はい' ],
			    no: [ 'n', 'no', 'いいえ' ],

				from: '%sから',
                fromTo: '%s–%s',
                to: '%sまで',

                sep: ',|;| and | or |、|，|；',
                skypeSep: ';| and | or '
			},

			// ----------------------- Stop translation here -----------------------

			// --------------------------------------------------------------------
			//	CONFIGURE THE FOLLOWING BASED ON WIKIVOYAGE COMMUNITY PREFERENCES
			// --------------------------------------------------------------------

			OPTIONS: {
				//	in pixels, otherwise available space
				MaxDialogWidth: 1200,
				//	Set the following flag to false if the listing editor should
				//	strip away any listing template parameters that are not
				//	explicitly configured in the TEMPLATES parameter arrays.
				AllowUnrecognizedParameters: true,
				//	write empty parameters to listing template text
				inlineFormat: false,

				CopyToAliases: false,
				CopyToTypeAliases: false,

				//	handle punctuation marks at string end
				withoutPunctuation:
                [ 'address', 'address-local', 'alt', 'checkin', 'checkout', 'comment', 'hours', 'payment', 'price' ],
				//	vCard default auto mode
				defaultAuto: true,
				//	proposed maximum description length
				contentLimit: 1000
			},

			INPUT_COLUMNS: {
				listing: [
					[ 'name', 'alt', 'comment', 'url', 'address', 'directions', 'lat',
						'long', 'phone', 'tollfree', 'mobile', 'fax', 'email', /* 'skype',
                        'facebook', 'flickr', 'instagram', 'tiktok', 'twitter', 'youtube' */ ],
					[ 'type', 'group', 'subtype', 'show', 'wikidata-label', 'auto', 'hours',
						'checkin', 'checkout', 'price', 'payment', 'image', 'commonscat',
						'zoom', 'map-group', 'before', 'name-local', 'name-latin',
						'address-local', 'directions-local' ]
				],
				marker: [
					[ 'name', 'name-map', 'alt', 'url', 'lat', 'long', 'name-local',
						'name-latin' ],
					[ 'type', 'group', 'show', 'wikidata-label', 'image', 'commonscat',
						'zoom', 'map-group' ]
				]
			},

			SHOW_OPTIONS: {
				listing: {
					all: 1,
					coord: 1,
					none: 1,
					poi: 1,

					copy: 1,
					inline: 1, // only listing
					noairport: 1,
					noperiod: 1, // only listing
					nositelinks: 1,
					nosocialmedia: 1, // only listing
					nosubtype: 1, // only listing
					nowdsubtype: 1, // only listing
					outdent: 1, // only listing
					symbol: 1,
					wikilink: 1,
				},
				marker: {
					all: 1,
					coord: 1,
					none: 1,
					poi: 1,
					
					copy: 1,
					noairport: 1,
					noname: 1, // only marker
					nositelinks: 1,
					socialmedia: 1, // only marker
					symbol: 1,
					wikilink: 1,
				}
			},

			//	lastedit is set if the following parameters were changed
			PARAMETERS_FOR_LASTEDIT: {
				hours: 1,
				checkin: 1,
				checkout: 1,
				price: 1
			},

			//	The following variables should usually not be changed

			//	Wikidata claim definitions for parameters
			WIKIDATA_CLAIMS: {
				name:        { type: 'label', which: 'wiki' },
				'name-local':{ type: 'label', which: 'local' },
				url:         { p:  'P856' },
				address:     { p: 'P6375', type: 'monolingual', which: 'wiki', max: 10 },
				'address-local': { p: 'P6375', type: 'monolingual', which: 'local', max: 10 },
				directions:  { p: 'P2795', type: 'monolingual', which: 'wiki', max: 10 },
				'directions-local': { p: 'P2795', type: 'monolingual', which: 'local', max: 10 },
				lat:         { p:  'P625', type: 'coordinate', which: 'latitude' },
				long:        { p:  'P625', type: 'coordinate', which: 'longitude' },

				phone:       { p: 'P1329', type: 'contact', max: 5 },
				fax:         { p: 'P2900', type: 'contact', max: 3 },
				email:       { p:  'P968', type: 'email', max: 5 },
				skype:       { p: 'P2893' },
				facebook:    { p: 'P2013' },
				flickr:      { p: 'P3267' },
				instagram:   { p: 'P2003' },
				tiktok:      { p: 'P7085' },
				twitter:     { p: 'P2002' },
				youtube:     { p: 'P2397' },

				// type:     {},
				subtype:     { p: [ 'P912', 'P2012', 'P2846', 'P2848', 'P5023', 'P10290' ],
								label: 'Features', type: 'subtype', table: '', result: 'table', max: 50 },
				hours:       { p: 'P3025', type: 'hours', max: 5 },
				checkin:     { p: 'P8745', type: 'id' },
				checkout:    { p: 'P8746', type: 'id' },
				price:       { p: 'P2555', type: 'au', max: 5 },
				payment:     { p: 'P2851', type: 'id', max: 10 },
				image:       { p:   'P18' },
				commonscat:  { p:  'P373' }
			},

			//	property aliases
			PROPERTIES: {
				quantity:   'P1114',
				minimumAge: 'P2899',
				maximumAge: 'P4135',
				dayOpen:    'P3027',
				dayClosed:  'P3028',
				hourOpen:   'P8626',
				hourClosed: 'P8627'
			},

			//	properties to be used for comments for contacts, fees, and hours
			COMMENTS: {
				contact: [ 'P366', 'P518', 'P642', 'P1001', 'P1559', 'P106' ],
				fee:     [ 'P5314', 'P518', 'P6001', 'P1264', 'P585', 'P2899', 'P4135', 'P642'],
				hours:   [ 'P8626', 'P8627', 'P3027', 'P3028' ]
			},

			//	social media and url link formatters
			LINK_FORMATTERS: {
				// facebook: 'https://www.facebook.com/$1',
				// flickr: 'https://www.flickr.com/photos/$1',
				// instagram: 'https://www.instagram.com/$1/',
				// tiktok: 'https://www.tiktok.com/@$1',
				// twitter: 'https://twitter.com/$1',
				// youtube: 'https://www.youtube.com/channel/$1',
				// youtubeAlias: 'https://www.youtube.com/$1',
				url: '$1'
			}
		};

		function init() {
			window[ SYSTEM.listingEditor ].Config = Config;
		}

		return { init };
	} ();

	$( EditorConfig.init );

} () );

//</nowiki>
