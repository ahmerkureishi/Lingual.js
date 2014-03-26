Lingual.js
=======

Crazy simple client & server side localisation

------------

Lingual.js is a small library that makes it a breeze to bind translations to a page. It is focused on being a powerful data API driven library that leverages a store of translations from a json file to inject into the page.

## Features
* Fast
* Lightweight
* Language detection
* Extensible
* Optional Knockout bindings
* Events

## Installation

Include lingual.js in the head of your document or directly below the closing body tag. jQuery is a requirement.

```html
<script src="jquery.js"></script>
<script src="dist/lingual.min.js"></script>
```

If you want to use Lingual.js on the server, run `npm install`, then include like any node module:

```javascript
var Lingual = require('Lingual.js');
```

## Initializing

Currently, there are three ways to initialize Lingual.js on the client. Initializing consists of setting the language to use and setting the dictionary/hash/object of strings to use for translation.

### Loading translations

##### Using Ajax to load specified language
```javascript
new Lingual('path/to/translations_en.json', settings);
```

##### Using Ajax to load language dynamically
```javascript
new Lingual('path/to/translations_%LANG%.json', settings);
```
`%LANG%` will dynamically be replaced by the language that is automatically detected.

##### Including translations directly
```javascript
new Lingual({
    "en": {
        "foo": "bar"
    }
}, settings);
```

Initializing Lingual on the server:

```javascript
var Lingual = require('Lingual.js');
var locales = require('path/to/locale.json');

new Lingual(locales, settings);
```

## Default Settings
```javascript
var settings = {
    lang: '',
    pathDelimiter: '.',
    selectorKey: 'translate',
    variants: false,
    fixFloats: true,
    debug: true
};
```

* `lang`: String, The language key you want to set. (e.g. "en" or "de"). On the client, leave undefined to attempt to automatically detect.
* `pathDelimiter`: String, The string to denote a key in your translation hash
* `selectorKey`: String, The `data-attribute` name to use for translations: (e.g. "data-translate")
* `variants`: Boolean, If true, language variants will be used (e.g. "en-US" as opposed to "en")
* `fixFloats`: Boolean, Fixes a bug in some browsers that collapse a floated element and do not reflow when text has been injected
* `debug`: Boolean, If true, logging for the specified localiser will be active

Pass an object literal as the second parameter of the constructor method to set the settings to use for the instantiated object.

## Setting the Language

There are various ways to set the language to be used with Lingual.js, and there are fallbacks to setting the language. The order is as follows:

* The `settings.lang` value will be used first (if specified)
* The `lang` attribute on the `html` element will be checked next (e.g. `<html lang="en">`).
* The `navigator.language` property will be used if the `lang` attribute on `html` is not set.
* If the three methods fail above, the language will default to 'en'

## Translating

Lingual.js aims to be as simple as possible. The main method of translating strings is via the `data-translate` attribute on HTML elements.

```html
<div data-translate="foo"></div>
```

This will look for the `foo` key within the locale object set earlier and set the div's contents to that string.

You can use an infinite depth of keys to pull from. For example:
```html
<div data-translate="foo.subKey.something.else"></div>
```

You can specify certain attributes to be translated
```html
<input type="button" data-translate="value: foo">
<!-- or -->
<input type="text" data-translate="placeholder: foo">
<!-- or -->
<img data-translate="alt: my.image.caption">
```

This will look deeper within the object, allowing you to organize your translations. You can change the delimiter used by settings `pathDelimiter` in the settings object.

## Using dynamic variables

You can pass dynamic data to the strings to be interpolated. Currently, the only type of data replacement supported is with an object literal.

```javascript
var translate = new Lingual({
    "en": {
        "foo": "Hello, :name!"
    }
});
```
```html
<div data-translate="foo" data-vars='{"name": "Jacob"}'></div> <!-- Produces "Hello, Jacob!" -->
```


## Public Methods

```javascript
var translator = new Lingual(/* locales, settings */);
```

#### `locale(String locale)`
Change the locale of the document. Must be a string that matches with a preexisting key in the json translations provided upon initialization.
```javascript
translator.locale("es");
```


#### `translate($Element)`
Translate all DOM elements to the set locale. If there is a jQuery object passed as a parameter, the translations will only occur within the scope of that object.
```javascript
translator.translate();
```

#### `gettext(String key, Mixed vars)`
Returns the translation for the specified key with an optional `vars` parameter being an Array or an Object Literal/Json.
```javascript
translator.gettext("foo", ["Vars"]);
```

## Main differences between the client and server usages:

The server side version of Lingual.js is the same as the client, minus the data attribute API and the `translate` method.

## Todo
* Simplistic pluralization rules for most languages

## Licensing

The MIT License (MIT)

Copyright (c) 2014 Maker Studios

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.


