(function (d, nav, $) {

	"use strict";

	var Namespace = 'Lingual';
	var IsServer = (typeof module !== 'undefined' && module.exports);

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
			variants: false,
			debug: true
		};

		cache = {
			localeStrings: {}
		};

		utils = {

			/**
			 * Our logging abstraction
			 * @param  {Variable} what Anything you'd want to log
			 * @return {null}
			 */
			log: function(what){
				if(self.defaults.debug){
					console.log(what);
				}
			},

			/**
			 * Only runs the function if on the Client
			 * @param  {Function} fn The function to run
			 */
			client: function(fn){
				if($ && d){
					return fn.call();
				}
			},

			/**
			 * Parses a string to compare against the existance of a like hash
			 * @param  {String} target String to compare against, i.e. "path.within.a.hash"
			 * @param  {Object} path   The hash to search within
			 * @return {Boolean}       Returns the existance of the object
			 */
			parsePath: function(target, path){
				if (!path){
					return false;
				}
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
			initLanguage: function(lang){
				utils.setLang( lang || self.defaults.lang );
			},

			/**
			 * Sets the language on the HTML tag and within our library
			 * @param {null} lang
			 */
			setLang: function(lang){
				utils.client(function(){
					cache.html.attr('lang', lang);
				});
				self.defaults.lang = lang;
			},

			/**
			 * Sets translations to be used
			 * @param {String} localeStrings A Hash of strings to be used for injecting into the page
			 */
			setLocales: function(localeStrings){
				cache.localeStrings = localeStrings;
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
						var translation = utils.parsePath( cache.localeStrings[self.defaults.lang], translateKey );

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

				// Trigger our translated event on our element or the document
				($el || $(d)).trigger('translated');
			}
		};

		init = {

			/**
			 * Client side initializer
			 * @param  {Object|String}  Hash of locale strings to set
			 * @param  {Object} opts    Lingual.js options
			 * @return {null}
			 */
			client: function(locales, opts){

				// Extend our options
				self.defaults = $.extend(self.defaults, opts);
				cache.html = $('html');

				// Set our current language
				var detected = (self.defaults.variants) ? nav.language : nav.language.split('-')[0];
				utils.initLanguage( self.defaults.lang || cache.html.attr('lang') || detected || 'en' );

				// Set locales
				if(typeof locales === "string" ){
					$.getJSON( locales.replace('%LANG%', self.defaults.lang) , function(locales){
						init.finish( locales );
					});
					return;
				}
				init.finish(locales);
			},

			/**
			 * Server side initializer
			 * @param  {Object} locales Hash of locale strings to set
			 * @param  {Object} opts    Lingual.js options
			 * @return {null}
			 */
			server: function(locales, opts){

				// Extend our options
				var extend = require('node.extend');
				self.defaults = extend(self.defaults, opts);

				// Set our current language
				utils.initLanguage();

				// Set locales
				init.finish(locales);

			},

			/**
			 * Finishes setting locales once they have been downloaded
			 * @param  {Object} locales The hash of locales to be set for use
			 * @return {null}
			 */
			finish: function(locales){

				// Make sure our locales are stored under their language key
				if(typeof locales[self.defaults.lang] === "undefined"){
					var newLocales = {};
					newLocales[self.defaults.lang] = locales;
					locales = newLocales;
				}

				// Set locales
				utils.setLocales( locales );

				// If we're on the client, translate automatically
				utils.client(function(){
					action.translate();
				});
			}
		};

		/**
		 * Sets the language
		 * @param  {String} locale The language key to set to
		 * @return {null}
		 */
		self.locale = function(locale){
			if(typeof locale == 'undefined'){
				return self.defaults.lang;
			}
			if( typeof cache.localeStrings[locale] !== "undefined" ){
				self.defaults.lang = locale;
			}
		};

		/**
		 * Translates all elements on the page
		 * @return {null}
		 */
		self.translate = function($el){
			utils.client(function(){
				action.translate($el);
			});
		};

		/**
		 * Translates the specified key
		 * @param  {String} key  The languages text key in your locale hash
		 * @param  {Object} vars A hash of the variables you want replaced within the text
		 * @return {String} The translated text
		 */
		self.gettext = function(key, vars){
			return utils.injectVars(utils.parsePath(cache.localeStrings[self.defaults.lang], key), vars);
		};

		// Initialize shit
		if( IsServer ){
			init.server(locales, opts);
		} else {
			init.client(locales, opts);
		}
	};

	// Assign Lingual to the global namespace
	if (IsServer) {
		module.exports = App;
	} else {
		this[Namespace] = App;
	}

}).apply(this, (typeof document !== "undefined") ? [document, navigator, jQuery] : [] );
