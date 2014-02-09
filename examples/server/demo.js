var Lingual = require('../../src/lingual.js');
var locales = require('../client/locales/locales');


var translator = new Lingual(locales, {
    lang: 'de'
});

console.log( translator.gettext('test.deep.welcome') );
console.log( translator.gettext('test.deep.title') );
console.log( translator.gettext('test.deep.dynamic', {name:"Jacob"}) );
