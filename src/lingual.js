(function (w, d, undef) {

    "use strict";

    var Lingual = Lingual || function(locales) {

        var settings = {
                lang: undef
            },
            
            cache = {
                strings: {}
            },

            utils = {

                ajax: {
                    get: function(url, fn){
                        var jx;
                        if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
                            jx = new XMLHttpRequest();
                        } else { // code for IE6, IE5
                            jx = new ActiveXObject("Microsoft.XMLHTTP");
                        }
                        jx.onreadystatechange = function () {
                            if (jx.readyState == 4 && jx.status == 200) {
                                fn.call(null, jx.responseText);
                            }
                        }
                        jx.open("GET", url, true);
                        jx.send();
                    }
                },
                
                parsePath: (function(input) {
    
                    var delimiter = input.delimiter || '/',
                        paths = input.path.split(delimiter),
                        check = input.target[paths.shift()],
                        exists = typeof check != 'undefined',
                        isLast = paths.length == 0;
                
                    if (exists) {
                        if (isLast) {
                            input.parsed.call(undefined, {
                                exists: true,
                                type: typeof check,
                                obj: check
                            });
                        } else {
                            utils.parsePath({
                                path: paths.join(delimiter), 
                                target: check,
                                delimiter: delimiter,
                                parsed: input.parsed
                            });
                        }
                    } else {
                        input.parsed.call(undefined, {
                            exists: false
                        });
                    }
                }),
                
                setHooks: function(){
                    var i;
                    for(i=0; i<settings.hooks.length; i++){
                        var curMethod = settings.hooks[i];
                        settings.hooks[i] = alert;
                    }
                },
                
                hasMutationEvents: function(){
                    return ("MutationEvent" in w);
                },
                
                initLanguage: function(){
                    utils.setLang( cache.html.getAttribute('lang') || navigator.language.split('-')[0] || "en" );
                },
                setLang: function(lang){
                    cache.html.setAttribute('lang', lang);
                    settings.lang = lang;
                },
                tag: function(t){
                    return d.getElementsByTagName(t)[0];
                },
                setStrings: function(locales){
                    cache.strings = locales;//cache.strings[settings.lang] = ( typeof locales[settings.lang] !== 'undefined' ) ? locales[settings.lang] : locales;
                    return this;
                },
                getByAttr: function(attr, el){

                    if( el ){ return el.getAttribute(attr); }

                    if( d.querySelectorAll ){
                        return d.querySelectorAll('['+attr+']');
                    } else {
                        var els = d.all,
                            toTranslate = [],
                            i;
                        for(i=0; i<els.length; i++){
                            var cur = els[i],
                                attr = cur.getAttribute(attr);
                            if( attr ){
                                toTranslate.push( cur );
                            }
                        }
                        return toTranslate;
                    }
                },

                // https://github.com/recurser/jquery-i18n/blob/master/src/jquery.i18n.js#L67-L97
                injectVars: function(str, args) {

                    if(args instanceof Array){
                        if (!args){
                            return str;
                        }
                        var result = '',
                            search = /%(\d+)\$s/g,
                            matches = search.exec(str);
                        while (matches) {
                            var index = parseInt(matches[1], 10) - 1;
                            str = str.replace('%' + matches[1] + '\$s', (args[index]));
                            matches = search.exec(str);
                        }
                        var parts = str.split('%s');

                        if(parts.length > 1) {
                            for(var i = 0; i < args.length; i++) {
                                if (parts[i].length > 0 && parts[i].lastIndexOf('%') == (parts[i].length - 1)) {
                                    parts[i] += 's' + parts.splice(i + 1, 1)[0];
                                }
                                result += parts[i] + args[i];
                            }
                        }

                        return result + parts[parts.length - 1];
                    } else {
                        var key;
                        for(key in args){
                            str = str.replace(':'+key, args[key]);
                        }
                        return str;
                    }
                }
            },
            action = {
                translate: function(){
                    var toTranslate = utils.getByAttr('data-translate'),
                        i;
                    for(i=0; i<toTranslate.length; i++){
                        var el = toTranslate[i],
                            key = utils.getByAttr('data-translate', el),
                            vars = JSON.parse(utils.getByAttr('data-vars', el));
                        if( key ){
                            utils.parsePath({
                                path: key,
                                target: cache.strings[settings.lang],
                                parsed: function(translation){
                                    if( translation.exists ){
                                        translation = translation.obj;
                                        if( vars ){
                                            translation = utils.injectVars(translation, vars);
                                        }
                                        el.innerHTML = translation;
                                    }
                                }
                            });
                        }
                    }
                },
                listen: function(){
                    if( cache.strings ){
                        action.translate();
                        d.addEventListener('DOMNodeInserted', action.translate);
                    }
                }
            },

            init = {
                pre: function(){
                    cache.html = utils.tag('html');
                    utils.initLanguage();
                },
                post: function(locales){
                    utils.setStrings( locales );
                    
                    if( utils.hasMutationEvents() ){
                        action.listen();
                    } else {
                        utils.setHooks();
                    }
                }
            };

            this.locale = function(locale){
                if( typeof cache.strings[locale] !== "undefined" ){
                    settings.lang = locale;
                } else {
                    console.warn( 'Cannot change language, translations for "'+locale+'" do not exist!' );
                }
                
            };
            this.translate = function(){
                action.translate();
            };
            this.gettext = function(key, vars){
                return utils.injectVars(cache.strings[settings.lang][key], vars);
            };
            
            
            // Begin
            
            init.pre();
            
            if(typeof locales === "string" ){
            
                locales = locales.replace('%LANG%', settings.lang);
            
                utils.ajax.get(locales, function(res){
                    locales = JSON.parse(res);
                    if(typeof locales[settings.lang] === "undefined"){
                        var newLocales = {};
                        newLocales[settings.lang] = locales;
                        locales = newLocales;
                    }
                    init.post( locales );
                });
            } else {
                init.post(locales);
            }
        };

    this.Lingual = Lingual;

}).call(this, window, document);