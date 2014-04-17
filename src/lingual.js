(function (w, d, nav, $) {

    "use strict";

    var Namespace = 'Lingual';
    var IsServer = (typeof module !== 'undefined' && module.exports);

    var App = App || function(locales, opts, cb) {

        var self = this,
            cache,
            utils,
            action,
            init;

        self.defaults = {
            lang: '',
            fallbackLang: 'en',
            pathDelimiter: '.',
            selectorKey: 'translate',
            cache: false,
            fixFloats: true,
            variants: false,
            allowFallbackTranslations: true,
            debug: false,
            autoTranslate: true
        };

        cache = {
            initialized: false,
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

            cache: {

                /**
                 * Determines if localStorage is supported by the current browser
                 * @return {Boolean} If true, browser supports localStorage
                 */
                supported: function(){
                    return 'localStorage' in w;
                },

                /**
                 * Gets an item from local storage
                 * @param  {String} key The key name to fetch
                 * @return {Object}     The data that was stored
                 */
                get: function(key){
                    return JSON.parse( w.localStorage.getItem(key) );
                },

                /**
                 * Sets an item in local storage
                 * @param {String} key The key name to save data as
                 * @param {Object} val The data to save
                 */
                set: function(key, val){
                    return w.localStorage.setItem( key, JSON.stringify(val) );
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
            initLang: function(lang){
                utils.setLang( lang || self.defaults.lang );
            },

            /**
             * Attepmts to detect the users default language
             * @return {String} The language the user is using (or 'en')
             */
            detectLang: function(){

                // IE 10 fix
                if( !nav.language && nav.browserLanguage ){
                    nav.language = nav.browserLanguage;
                }

                var detected = (self.defaults.variants) ? nav.language : nav.language.split('-')[0];
                return self.defaults.lang || cache.html.attr('lang') || detected || 'en';
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
             * Gets translations to be used
             * @return {String}
             */
            getLocales: function(){
                return cache.localeStrings;
            },

            loader: {

                /**
                 * Begins the loading routine for json data
                 * @param  {String|Array} locales  The urls of the locales to load
                 * @param  {Function} complete Callback when all locales have been loaded
                 * @return {null}
                 */
                routine: function(locales, complete){

                    // Set locales
                    if(typeof locales === "string" ){
                        utils.loader.fetch(locales, function(localeData){
                            complete(localeData);
                        });
                    } else if( $.isArray(locales) ){
                        var len = locales.length;
                        var loaded = 0;
                        var finalLocaleData = {};

                        $(locales).each(function(){
                            utils.loader.fetch(this, function(localeData){
                                finalLocaleData = $.extend(true, finalLocaleData, localeData);
                                loaded++;
                                if(loaded == len){
                                    complete(finalLocaleData);
                                }
                            });
                        });

                    }
                },

                /**
                 * Fetch the given data
                 * @param  {String}   url The url of the data to retrieve
                 * @param  {Function} cb  The callback once data has been fetched
                 */
                fetch: function(url, cb){

                    // Check if we have cached data. If so, use it
                    if( self.defaults.cache && utils.cache.supported() ){
                        var cached = utils.cache.get(url);
                        if( cached ){
                            return cb( cached );
                        }
                    }

                    return $.getJSON( url , function(locales){

                        // Set cache data
                        if( self.defaults.cache && utils.cache.supported() ){
                            utils.cache.set(url, locales);
                        }
                        cb( locales );
                    });
                },
            },

            translate: {

                /**
                 * Replaces named variables in a string with their respective values
                 * @param  {String} str  The string to replace text within
                 * @param  {Object} args The values to inject into the string
                 * @return {String}      The updated string
                 */
                inject: function(str, args) {
                    args = args || {};
                    var key;
                    for(key in args){
                        if(args.hasOwnProperty(key)){
                            str = str.replace(':'+key, args[key]);
                        }
                    }
                    return str;
                },

                /**
                 * Retrieves the string to use for a given translateKey
                 * @param  {String} translateKey     The path in your json file to the desired translation
                 * @param  {String|Boolean} resetTranslation False by defailt, if set to a string (any string), it will override the json string.
                 * @return {[type]}                  [description]
                 */
                fetch: function(translateKey, resetTranslation){

                    resetTranslation = ( typeof(resetTranslation) == 'undefined' ) ? false : resetTranslation;

                    var translation = (resetTranslation !== false) ? resetTranslation : utils.parsePath( cache.localeStrings[self.defaults.lang], translateKey );

                    // Check if we have a fallback translation for the specified translateKey
                    if(translation === false && resetTranslation === false && self.defaults.allowFallbackTranslations){

                        // No fallback exists
                        if( !(self.defaults.fallbackLang in cache.localeStrings) ){
                            return translation;
                        }
                        var fallbackTranslation = utils.parsePath( cache.localeStrings[self.defaults.fallbackLang], translateKey );
                        if( fallbackTranslation ){
                            utils.log("Fallback translation for "+translateKey+" exists");
                            translation = fallbackTranslation;
                        }
                    }
                    return translation;
                }
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
                    $toTranslate = $('['+attributeName+']', $el),
                    resetTranslation = false;

                if( self.defaults.fixFloats && $('#'+Namespace+'-styles').length === 0 ){
                    var hideClass = Namespace+'-hide';
                    $('head').append('<style type="text/css" id="'+Namespace+'-styles">.'+hideClass+'{display: none !important}</style>');
                }

                // Do we need to reset our translations?
                if(cache.reset){
                    cache.reset = false;
                    resetTranslation = '';
                }

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
                        var translation = utils.translate.fetch(translateKey, resetTranslation);

                        if(translation!==false){

                            // Check if we need to inject data into our  translation
                            var translateVars = $this.attr('data-vars');
                            if(translateVars){
                                try{
                                    translateVars = JSON.parse(translateVars);
                                    translation = utils.translate.inject(translation, translateVars);
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
                            if(self.defaults.fixFloats && ( $.inArray( $this.css('float'), ["left", "right"] ) === -1 ) ){

                                // Hide the element
                                $this.addClass(hideClass);

                                // Thread for new browser reflow
                                setTimeout(function(){

                                    // Dirty check to restore original display
                                    var hax0r = setInterval(function(){
                                        $this.removeClass(hideClass);
                                        if( !$this.hasClass(hideClass)){
                                            clearInterval(hax0r);
                                        }
                                    }, 50);
                                }, 0);
                            }
                        } else {
                            utils.log('Could not find translation for '+translateKey);
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
                utils.initLang( utils.detectLang() );

                utils.loader.routine(locales, function(localeData){
                    init.finish(localeData);
                });
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
                utils.initLang();

                // Set locales
                init.finish(locales);

            },

            /**
             * Finishes setting locales once they have been downloaded
             * @param  {Object} locales The hash of locales to be set for use
             * @return {null}
             */
            finish: function(locales){

                // Make sure our language exists, elsewise default to "en"
                if(!locales[self.defaults.lang]){

                    utils.log('Locales "'+self.defaults.lang+'" do not exist');

                    // Does our fallback even exist?
                    if( locales[self.defaults.fallbackLang] && (self.defaults.fallbackLang !== self.defaults.lang) ){

                        utils.log('Falling back to "'+self.defaults.fallbackLang+'"');
                        utils.setLang(self.defaults.fallbackLang);

                    } else {

                        // Try and fallback to anything available
                        if( Object.keys && Object.keys(locales).length ){
                            var lastFallbackLang = Object.keys(locales)[0];

                            utils.log('Falling back to "'+lastFallbackLang+'"');

                            utils.setLang(lastFallbackLang);


                        } else {
                            utils.log('Invalid Locale File');
                        }
                    }
                }

                // Set locales
                utils.setLocales( locales );

                // If we're on the client, translate automatically
                if(self.defaults.autoTranslate){
                    utils.client(function(){
                        action.translate();
                    });
                }

                // Set some initialized variables
                cache.initialized = true;
                cache.finish = new Date().getTime();

                utils.client(function(){
                    $(d).trigger('lingual:ready');
                });

                if( typeof cb == "function" ){
                    cb.call(self);
                }
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
            return self;
        };

        /**
         * Adds more locales to the working translations
         * @param {[type]} locales [description]
         */
        self.addLocales = function(locales, cb){
            utils.loader.routine(locales, function(localeData){
                utils.setLocales( $.extend(true, utils.getLocales(), localeData) );
                self.translate();
                if(typeof cb =="function"){
                    cb();
                }
            });
        };

        /**
         * Returns the locale data currently being used
         * @return {Object} The locales being used
         */
        self.data = function(){
            return utils.getLocales();
        };

        /**
         * Toggles the visibility of elements that were translated through the data API
         * @return {null}
         */
        self.debug = function(){
            var debug = Namespace+'-debug';
            if( cache.debugging ){
                cache.debugging = false;
                $('#'+debug).remove();
            } else {
                cache.debugging = true;
                $('head').append('<style type="text/css" id="'+debug+'">[data-'+self.defaults.selectorKey+'], .'+debug+'{outline: 1px solid red;}</style>');
            }
            return self;
        };

        /**
         * Reset the language and the translations
         * @return {null}
         */
        self.reset = function(){
            cache.reset = true;
            utils.setLang( utils.detectLang() );
            self.translate();
            return self;
        };

        /**
         * Translates all elements on the page
         * @return {null}
         */
        self.translate = function($el){
            utils.client(function(){
                action.translate($el);
            });
            return self;
        };

        /**
         * Translates the specified key
         * @param  {String} translateKey  The languages text key in your locale hash
         * @param  {Object} vars A hash of the variables you want replaced within the text
         * @return {String} The translated text
         */
        self.gettext = function(translateKey, vars){

            // Fetch our translation
            var translation = utils.translate.fetch(translateKey);
            return cache.initialized ? utils.translate.inject(translation, vars) : undefined;
        };


        // Set some performance variables
        cache.start = new Date().getTime();

        // Initialize shit
        if( IsServer ){
            init.server(locales, opts);
        } else {
            init.client(locales, opts);
        }

        // Call any/all plugins
        self.plugins.forEach(function(fn){
            fn.apply(self);
        });
    };

    // Assign Lingual to the global namespace
    if (IsServer) {
        module.exports = App;
    } else {
        App.prototype.plugins = [];
        this[Namespace] = App;
    }

}).apply(this, (typeof document !== "undefined") ? [window, document, navigator, jQuery] : [] );
