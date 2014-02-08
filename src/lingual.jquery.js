(function (d, $) {

	"use strict";

	var Namespace = 'Lingual';

	var App = App || function(locales, opts) {

		var self = this,
			cache,
			utils,
			action,
			init;

		self.defaults = {
			lang: '',
			pathDelimiter: '.',
			selectorKey: 'translate',
			fixFloats: true,
			debug: true
		};

		cache = {
			strings: {}
		};

		utils = {

			log: function(what){
				if(self.defaults.debug){
					console.log(what);
				}
			},

			/**
			 * Parses a string to compare against the existance of a like hash
			 * @param  {String} target String to compare against, i.e. "path.within.a.hash"
			 * @param  {Object} path   The hash to search within
			 * @return {Boolean}       Returns the existance of the object
			 */
			parsePath: function(target, path){
				if (!path) return false;
				var parts = path.split( self.defaults.pathDelimiter ),
					i;
				for(i=0; i<parts.length; i++){
					var part = parts[i];
					if( typeof target[ part ] !== "undefined" ){
						target = target[ part ];
					} else {
						return false;
					}
				}
				return target;
			},

			/**
			 * Sets up our default language based off of various conditions
			 * @return {null}
			 */
			initLanguage: function(){
				utils.setLang( cache.html.attr('lang') || navigator.language.split('-')[0] || "en" );
			},

			/**
			 * Sets the language on the HTML tag and within our library
			 * @param {null} lang
			 */
			setLang: function(lang){
				cache.html.attr('lang', lang);
				self.defaults.lang = lang;
			},

			/**
			 * Sets translations to be used
			 * @param {String} localeStrings A Hash of strings to be used for injecting into the page
			 */
			setStrings: function(localeStrings){
				cache.strings = localeStrings;
			},

			/**
			 * Replaces named variables in a string with their respective values
			 * @param  {String} str  The string to replace text within
			 * @param  {Object} args The values to inject into the string
			 * @return {String}      The updated string
			 */
			injectVars: function(str, args) {
				args = args || {};
				var key;
				for(key in args){
		  if(args.hasOwnProperty(key)){
						str = str.replace(':'+key, args[key]);
		  }
				}
				return str;
			}
		};

		action = {

			/**
			 * Translates all of the elements on a page
			 * @return {null}
			 */
			translate: function($el){

				// Gather our elements
				var selectorKey = self.defaults.selectorKey,
					attributeName = 'data-'+selectorKey,
					$toTranslate = $('['+attributeName+']', $el);

				$toTranslate.each(function(){
					var $this = $(this),
						translateAttr = $this.attr(attributeName);

					if(translateAttr){

						// Check if we are setting an attribute: my.translate.key
						var keyData = translateAttr.split(':');

						// If there is a translateAttr, set it to translateTarget
						var translateTarget = (keyData.length>1) ? keyData[0] : false;

						// If there is a translateTarget, move over one index
						var translateKey = translateTarget ? keyData[1] : keyData[0];

						// Make sure our translate key is valid
						if(!translateKey || translateTarget == attributeName){
							return;
						} else {
							translateKey = translateKey.trim();
						}

						// Fetch our translation
						var translation = utils.parsePath( cache.strings[self.defaults.lang], translateKey );

						if(translation){

							// Check if we need to inject data into our  translation
							var translateVars = $this.attr('data-vars');
							if(translateVars){
								try{
									translateVars = JSON.parse(translateVars);
									translation = utils.injectVars(translation, translateVars);
								} catch(e){
									if(self.defaults.debug){
										utils.log('Invalid JSON: ' + translateVars);
									}
								}
							}

							// If we don't have a translation target, default to html
							if( translateTarget === false || translateTarget == 'html' ){
								$this.html(translation);
							} else {

								// a translate target of "text" does not mean an attribute "text"
								if(translateTarget == 'text' ){
									$this.text(translation);
								} else {
									// Set our translated attribute
									$this.attr(translateTarget, translation);
								}
							}

							// Some browsers freak out with floated elements that have no "layout"
							if(self.defaults.fixFloats){
								$this.css('display', $this.css('display'));
								setTimeout(function(){
									$this.css('display', '');
								}, 1);
							}
						}
					}
				});
				($el || $(d)).trigger('translated');
			}
		};

		init = {

			/**
			 * Initializes options and settings before potentially sending a request for locales
			 * @param  {Object} opts The options for the Lingual API
			 * @return {null}
			 */
			pre: function(opts){
				self.defaults = $.extend(self.defaults, opts);
				cache.html = $('html');
				utils.initLanguage();
			},

			/**
			 * Finishes setting locales once they have been downloaded
			 * @param  {Object} locales The hash of locales to be set for use
			 * @return {null}
			 */
			post: function(locales){
				utils.setStrings( locales );
				action.translate();
			}
		};

		/**
		 * Sets the language
		 * @param  {String} locale The language key to set to
		 * @return {null}
		 */
		self.locale = function(locale){
			if( typeof cache.strings[locale] !== "undefined" ){
				self.defaults.lang = locale;
			}
		};

		/**
		 * Translates all elements on the page
		 * @return {null}
		 */
		self.translate = function($el){
			action.translate($el);
		};

		/**
		 * The Javascript API for translating certain keys
		 * @param  {String} key  The languages text key in your locale hash
		 * @param  {Object} vars A hash of the variables you want replaced within the text
		 * @return {String} The translated text
		 */
		self.gettext = function(key, vars){
			return utils.injectVars(utils.parsePath(cache.strings[self.defaults.lang], key), vars);
		};

		// Initialize shit
		init.pre(opts);

		if(typeof locales === "string" ){

			locales = locales.replace('%LANG%', self.defaults.lang);

			$.getJSON(locales, function(locales){
				if(typeof locales[self.defaults.lang] === "undefined"){
					var newLocales = {};
					newLocales[self.defaults.lang] = locales;
					locales = newLocales;
				}
				init.post( locales );
			});
		} else {
			init.post(locales);
		}
	};

	/**
	 * Assign Lingual to the global namespace
	 * @type {Object}
	 */
	this[Namespace] = App;

}).call(this, document, jQuery);
