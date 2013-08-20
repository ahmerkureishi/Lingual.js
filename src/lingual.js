(function (w, d) {

    "use strict";

    var Lingual = Lingual || function(locales, opts) {

        var defaults = {
                lang: '',
                pathDelimiter: '.'
            },
            cache = {
                strings: {}
            },
            utils = {
                ajax: {
                    get: function(url, fn){
                        var jx = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
                        jx.onreadystatechange = function () {
                            if (jx.readyState == 4 && jx.status == 200) {
                                fn.call(null, jx.responseText);
                            }
                        }
                        jx.open("GET", url, true);
                        jx.send();
                    }
                },
                deepExtend: function(destination, source) {
                    for (var property in source) {
                        if (source[property] && source[property].constructor &&
                            source[property].constructor === Object) {
                            destination[property] = destination[property] || {};
                            utils.deepExtend(destination[property], source[property]);
                        } else {
                            destination[property] = source[property];
                        }
                    }
                    return destination;
                },
                parsePath: function(target, path){
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
                setHooks: function(){
                    var i;
                    for(i=0; i<defaults.hooks.length; i++){
                        var curMethod = defaults.hooks[i];
                        defaults.hooks[i] = alert;
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
                    defaults.lang = lang;
                },
                tag: function(t){
                    var el = d.getElementsByTagName(t);
                    return (el[0]) || null;
                },
                setStrings: function(localeStrings){
                    cache.strings = localeStrings;
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

                    if( Array.isArray(args) ){
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
                            var translation = utils.parsePath( cache.strings[defaults.lang], key );
                            
                            if( translation ){
                                if( vars ){
                                    translation = utils.injectVars(translation, vars);
                                }
                                el.innerHTML = translation;
                            }
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
                pre: function(opts){
                    utils.deepExtend(defaults, opts);
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
                    defaults.lang = locale;
                }
            };
            this.translate = function(){
                action.translate();
            };
            this.gettext = function(key, vars){
                return utils.injectVars(cache.strings[defaults.lang][key], vars);
            };

            // Initialize shit
            init.pre(opts);

            if(typeof locales === "string" ){

                locales = locales.replace('%LANG%', defaults.lang);

                utils.ajax.get(locales, function(res){
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

    this.Lingual = Lingual;

}).call(this, window, document);
