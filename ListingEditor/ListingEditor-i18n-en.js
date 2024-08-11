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
			lang:          'en',
			listingEditor: 'ListingEditor'
		};

		var STRINGS = {
			add: 'add',
			addTitle: 'Add New Listing',
			edit: 'edit',
			editTitle: 'Edit Existing Listing',
			markerTitle: 'Edit Existing Marker',
			loading: 'Loading Listing Editor…',
			loadingMarker: 'Loading Marker Editor…',
			sectionNotFound: 'Error: Section with listing not found.',
			ajaxInitFailure: 'Error: Unable to initialize the listing editor.',
			ajaxSectionError: 'Error: Error occured while loading the section.',
			saving: 'Saving…',
			enterCaptcha: 'Enter CAPTCHA',
			externalLinks: 'Your edit includes new external links.',

			cancel: 'Cancel',
			cancelTitle: 'Discard changes',
			cancelMessage: 'Closing the editor will discard your previous entries. Are you sure you want to do that?',
			deleteMessage: 'Do you really want to delete the link to Wikidata?',
			help: '?',
			helpPage: '//de.wikivoyage.org/wiki/Help:Erstellen_einer_VCard',
			helpPageMarker: '//de.wikivoyage.org/wiki/Help:Erstellen_einer_VCard',
			helpTitle: 'Help with the listing editor',
			helpTitleMarker: 'Help with the marker editor',
			preview: 'Preview',
			previewTitle: 'Listing preview. Please use before saving!',
			previewTitleMarker: 'Marker preview. Please use before saving!',
			previewOff: 'Preview off',
			previewOffTitle: 'Turn off preview.',
			refresh: '↺',  //  \ue031 not yet working
			refreshTitle: 'Update preview',
			submit: 'Submit',
			submitTitle: 'Save Changes',
			// license text should match MediaWiki:Wikimedia-copyrightwarning
			licenseText: 'By clicking "Submit", you agree to the <a class="external" target="_blank" href="//wikimediafoundation.org/wiki/Terms_of_use">Terms of use</a>, and you irrevocably agree to release your contribution under the <a class="external" target="_blank" href="//en.wikivoyage.org/wiki/Wikivoyage:Full_text_of_the_Attribution-ShareAlike_3.0_license">CC-BY-SA 3.0 License</a>. You agree that a hyperlink or URL is sufficient attribution under the Creative Commons license.',

			ifNecessary: '(only if necessary)',
			severalGroups: '(several groups)',
			searchOnMap: 'Search on map',
			deleteWikidataId: 'Delete',
			deleteWikidataIdTitle: 'Remove Wikidata record from listing',
			deleteWikidataIdTitleMarker: 'Remove Wikidata record from marker',
			fillFromWikidata: 'Fill out input fiels using Wikidata',

			validationCategory: 'Please enter a valid category name without a prefix',
			validationCoord: 'Please ensure the coordinates are valid',
			validationEmail: 'Please ensure the email address is valid',
			validationEmptyListing: 'Please enter either a name or an address',
			validationFacebook: 'Please ensure the Facebook id is valid',
			validationFax: 'Please correct the invalid fax number(s)',
			validationFlickr: 'Please ensure the Flickr id is valid',
			validationImage: 'Please insert the Commons image title only without any prefix',
			validationInstagram: 'Please ensure the Instagram id is valid',
			validationLastEdit: 'Please correct the invalid date of the last update.',
			validationMapGroup: 'Please correct the invalid name of the map group',
			validationMissingCoord: 'Please enter both latitude and longitude',
			validationMobile: 'Please correct the invalid mobile phone number(s)',
			validationName: 'Please correct the incorrect name or article link',
			validationNames: 'Removed duplicate identifiers for names, addresses and/or directions',
			validationPhone: 'Please correct the invalid phone number(s)',
			validationSkype: 'Please ensure the Skype user name is valid',
			validationTollfree: 'Please correct the invalid tollfree number(s)',
			validationTiktok: 'Please ensure the Tiktok id is valid',
			validationTwitter: 'Please ensure the Twitter id is valid',
			validationType: 'Please specify a type',
			validationUrl: 'Please ensure the web address is valid',
			validationYoutube: 'Please ensure the Youtube channel id is valid',
			validationZoom: 'Please enter a valid zoom level (0–19)',

			commonscat: '[Cc]ategory',
			image: '[Ff]ile|[Ii]mage', //Local prefix for Image (or File)
			added: 'Added listing for $1',
			updated: 'Updated listing for $1',
			updatedMarker: 'Updated marker for $1',
			removed: 'Deleted listing for $1',

			submitApiError: 'Error: The server returned an error while attempting to save the listing, please try again',
			submitBlacklistError: 'Error: A value in the data submitted has been blacklisted, please remove the blacklisted pattern and try again',
			submitUnknownError: 'Error: An unknown error has been encountered while attempting to save the listing, please try again',
			submitHttpError: 'Error: The server responded with an HTTP error while attempting to save the listing, please try again',
			submitEmptyError: 'Error: The server returned an empty response while attempting to save the listing, please try again',

			viewCommonsPageTitle: 'View Wikimedia Commons page and file',
			viewCommonscatPageTitle: 'Link to file category on Wikimedia Commons',
			viewWikidataPage: 'View Wikidata record',
			wikidataShared: 'The following data was fetched in the Wikidata record. Should the fetched values fetched inserted?',
			wikidataSharedNotFound: 'No data found in the Wikidata record.',

			natlCurrencyTitle: 'Insert local currency symbol',
			intlCurrencyTitle: 'Insert international currency symbol',
			callingCodeTitle: 'Insert calling code',
			contentCharsTitle: 'Insert special character',
			linkTitle: 'Web link',
			linkText: '<img src="//upload.wikimedia.org/wikipedia/commons/thumb/2/29/OOjs_UI_icon_link-ltr-progressive.svg/64px-OOjs_UI_icon_link-ltr-progressive.svg.png" height="16" width="16" />',
			contentStatus: 'Characters count: $1',
			additionalSubtypes: 'Extra features from Wikidata',
			unknownSubtypes: 'No known features found',

			deleteListingLabel: 'Remove this listing?',
			deleteListingTitle: 'Check this option if this place no longer exists or if the listing should be deleted for any other reason. The listing will then be removed from the article.',
			minorEditLabel: 'Only minor changes',
			minorEditTitle: 'Select this option if only minor changes such as typos were made.',
			statusLabel: 'Status',
			statusTitle: 'Information about article status such as deletion or update',
			summaryLabel: 'Summary',
			summaryTitle: 'Short summary on reason of change or addition',
			summaryPlaceholder: 'Reason listing was changed or added',
			summaryPlaceholderMarker: 'Reason marker was changed',
			updateLastedit: 'Should the last update date be set to today’s date?',
			updateTodayLabel: 'Set last update to today’s date',
			updateTodayTitle: 'Check this option if the information has been verified as current and error-free. The today’s date will be used as the update date.',

			textPreviewLabel: 'Preview',
			textPreviewTitle: 'Preview of the listing with the current form data',
			textPreviewTitleMarker: 'Preview of the marker with the current form data',
			syntaxPreviewLabel: 'Wiki syntax',
			syntaxPreviewTitle: 'Wiki syntax of the listing with the current form data',
			syntaxPreviewTitleMarker: 'Wiki syntax of the marker with the current form data',
			toContentLabel: 'Description',
			toContentTitle: 'Show description',
			chosenNoResults: 'No match with',

			optionYes: 'yes (default)',
			optionNo: 'no',

			optionCoordinatesGroup: 'Coordinates',
			optionAll: 'Marker and coordinates',
			optionPoi: 'Marker only (default)',
			optionCoordinates: 'Coordinates',
			optionNone: 'no coordinates',
			optionOptionsGroup: 'Listing options',
			optionOptionsGroupMarker: 'Marker options',
			optionCopyMarker: 'Copy marker',
			optionMakiIcon: 'MAKI icon',
			optionNoAirport: 'No airport codes',
			optionNoSitelinks: 'No sitelinks',
			optionNoSocialmedia: 'No social media',
			optionSocialmedia: 'With social media',
			optionFeaturesGroup: 'Features of the place',
			optionNoSubtype: 'Hide features',
			optionNoWdSubtype: 'No features from Wikidata',
			optionDisplayGroup: 'Template display',
			optionNoName: 'No name',
			optionOutdent: 'Outdent',
			optionInline: 'Inline',
			optionWikilink: 'Use redirect as article link',
			optionNoPeriod: 'No period before description'
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
			name: { label: 'Name', title: 'Name of the place or location', ph: 'name of place' },
			'name-local': { label: 'Local name', title: 'Local name of the place or location. Addition for', ph: 'Example: المتحف المصري' },
			'name-latin': { label: 'Romanized name', title: 'Local name of the local place or location name', ph: 'Example: al-Matḥaf al-Miṣrī' },
			'name-map' : { label: 'Map name', title: 'Alternative name of the place for display on maps', ph: 'Alternative name for display on maps' },
			alt: { label: 'Alt', title: 'Alternative current name of the place', ph: 'also known as' },
			comment: { label: 'Comment', title: 'Notes about the name or institution that are not or are no longer part of the name. For example, previous names.', ph: 'Note about the name' },

			type: { label: 'Type', title: 'Type of the place', ph: 'Select one or more types…' },
			group: { label: 'Type group', title: 'Use only for overwriting! Overwrites the roup membership automatically estimated for instance with buy, do, drink, eat, go, see and sleep.', ph: 'Select a group…' },
			wikidata: { label: 'Wikidata', title: 'Name of the Wikidata record', ph: 'Wikidata record' },
			auto: { label: 'Auto', title: 'Automatic fetch of all information from Wikidata', ph: 'data fetch from Wikidata…' },

			url: { label: 'Website', title: 'Web address of the place', ph: 'Example: https://www.example.com/' },
			address: { label: 'Address', title: 'Address of the place with street, postcode and city', ph: 'address of place' },
			'address-local': { label: 'Local address', title: 'Local address of the place. Addition to address.', ph: 'Example: ميدان التحرير' },
			directions: { label: 'Directions', title: 'Directions of the place', ph: 'how to get here' },
			'directions-local': { label: 'Local directions', title: 'Directions in lacal language', ph: 'Example: بوسط البلد' },
			lat: { label: 'Latitude', title: 'Geographical latitude of the location', ph: 'Example: 11.11111' },
			long: { label: 'Longitude', title: 'Geographical longitude of the location', ph: 'Example: 111.11111' },

			phone: { label: 'Phone', title: 'Phone numbers of the place, separated by commas', ph: 'Example: +55 555 555-5555' },
			mobile: { label: 'Mobile', title: 'Mobile phone numbers of the place, separated by commas', ph: 'Example: +55 123 555-555' },
			tollfree: { label: 'Tollfree', title: 'Tollfree numbers of the place, separated by commas', ph: 'Example: +49 800 100-1000' },
			fax: { label: 'Fax', title: 'Fax numbers of the place, separated by commas', ph: 'Example: +55 555 555-555' },
			email: { label: 'Email', title: 'Email addresses of the place, separated by commas', ph: 'Example: hallo@example.com' },
			skype: { label: 'Skype name', title: 'Skype user name of the place', ph: 'Example: myskype' },
			facebook: { label: 'Facebook', title: 'Facebook profile id of the place', ph: 'Example: myfacebook' },
			flickr: { label: 'flickr group', title: 'flickr group of the place', ph: 'Example: myflickr' },
			instagram: { label: 'Instagram username', title: 'Instagram user name of the place', ph: 'Example: myinstagram' },
			tiktok: { label: 'TikTok username', title: 'TikTok user name without „@“', ph: 'Example: mytiktok' },
			twitter: { label: 'Twitter username', title: 'Twitter username of the place', ph: 'Example: mytwitter' },
			youtube: { label: 'YouTube channel', title: 'Youtube channel id or alias of the place', ph: 'Examples: UCchanelA, @alias' },

			hours: { label: 'Hours', title: 'Opening hours of the place', ph: 'Example: 9AM-5PM or 09:00-17:00' },
			checkin: { label: 'Check-in', title: 'Earliest check-in time', ph: 'check in time' },
			checkout: { label: 'Check-out', title: 'Latest check-out time', ph: 'check out time' },
			price: { label: 'Price', title: 'Entrance, service or overnight prices of the place', ph: 'entry or service price' },
			payment: { label: 'Payment', title: 'Payment methods accepted by the institution', ph: 'Example: Master, Visa, Amex' },
			subtype: { label: 'Features', title: 'Features of the place', ph: 'Select one or more features…' },
			image: { label: 'Image', title: 'Image to be displayed when clicking on the number on the map', ph: 'image of place' },
			commonscat: { label: 'Commons Category', title: 'Category with additional files of this place. Use only if Wikidata has not been set', ph: 'Category containing files of this place' },
			show: { label: 'Display options', title: 'Specifies the display of coordinate markers, coordinates and features of the place. Only necessary if the display options differ from the default (e.g. "markers only").', ph: 'Select one or more options…' },
			zoom: { label: 'Zoom level', title: 'Zoom level of the map to be displayed between 0 and 19. The default is 17.', ph: 'Example: 17' },
			'map-group': { label: 'Map group', title: 'Name of a map group. This information is only needed if markers are to be distributed across different maps. It may only consist of the characters A–Z, a–z and 0–9 and must begin with a letter.', ph: 'Example: Kartengruppe1' },
			lastedit: { label: 'Last Updated', title: 'Date of the last update in the form yyyy-mm-dd (ISO date)', ph: 'Example: 2020-01-15' },

			before: { label: 'Before', title: 'Text before the listing marker', ph: 'Example: [[File:Star.jpg]]' },
			description: { label: 'Description', title: 'Description of the place. The recommended text length is 1000 characters.', ph: 'description of place' }
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
