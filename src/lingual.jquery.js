(function (w, d, $) {

	"use strict";

	var Lingual = Lingual || function(locales, opts) {

		var self = this,
			defaults,
			cache,
			utils,
			action,
			init;

		defaults = {
			lang: '',
			pathDelimiter: '.',
			selectorKey: 'translate'
		};

		cache = {
			strings: {}
		};

		utils = {

			/**
			 * Parses a string to compare against the existance of a like hash
			 * @param  {String} target String to compare against, i.e. "path.within.a.hash"
			 * @param  {Object} path   The hash to search within
			 * @return {Boolean}       Returns the existance of the object
			 */
			parsePath: function(target, path){
				if (!path) return false;
				var parts = path.split( defaults.pathDelimiter ),
					exists = true,
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
				defaults.lang = lang;
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
                    str = str.replace(':'+key, args[key]);
                }
                return str;
			}
		};

		action = {

			/**
			 * Translates all of the elements on a page
			 * @return {null}
			 */
			translate: function(){


				var selectorKey = defaults.selectorKey,
					$toTranslate = $('[data-'+selectorKey+']');

				$toTranslate.each(function(){
					var $this = $(this),
						key = $this.attr('data-'+selectorKey);

					if(key){
						var translation = utils.parsePath( cache.strings[defaults.lang], key );

						if(translation){
							var vars = $this.attr('data-vars');
							if(vars){
								translation = utils.injectVars(translation, JSON.parse(vars));
							}
							var target = $this.attr('data-'+selectorKey+'-target');

							if(!target){
								$this.html(translation);
							} else {
								if(target == 'text' ){
									$this.text(translation);
								} else {
									$this.attr(target, translation);
								}
							}
						}
					}
				});
			}
		};

		init = {

			/**
			 * Initializes options and settings before potentially sending a request for locales
			 * @param  {Object} opts The options for the Lingual API
			 * @return {null}
			 */
			pre: function(opts){
				defaults = $.extend(defaults, opts);
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
				defaults.lang = locale;
			}
		};

		/**
		 * Translates all elements on the page
		 * @return {null}
		 */
		self.translate = function(){
			action.translate();
		};

		/**
		 * The Javascript API for translating certain keys
		 * @param  {String} key  The languages text key in your locale hash
		 * @param  {Object} vars A hash of the variables you want replaced within the text
		 * @return {String} The translated text
		 */
		self.gettext = function(key, vars){
			return utils.injectVars(utils.parsePath(cache.strings[defaults.lang], key), vars);
		};

		// Initialize shit
		init.pre(opts);

		if(typeof locales === "string" ){

			locales = locales.replace('%LANG%', defaults.lang);

			$.getJSON(locales, function(res){
				locales = JSON.parse(res);
				if(typeof locales[defaults.lang] === "undefined"){
					var newLocales = {};
					newLocales[defaults.lang] = locales;
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
	this.Lingual = Lingual;

}).call(this, window, document, jQuery);
