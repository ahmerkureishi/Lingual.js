Lingual.js
=======

Crazy simple client side localisation


## Installation

Include lingual.js in the head of your document or directly below the closing body tag.

```html
<script src="src/lingual.js"></script>
```

## Initializing

Currently, there are three ways to initialize Lingual.js. Initializing consists of setting the language to use and setting the dictionary/hash/object of strings to use for translation.

### Loading translations

##### Using Ajax to load specified language
```javascript
var translate = new Lingual('path/to/translations_en.json', settings);
```

##### Using Ajax to load language dynamically
```javascript
var translate = new Lingual('path/to/translations_%LANG%.json', settings);
```
`%LANG%` will dynamically be replaced by the language that is automatically detected.

##### Including translations directly
```javascript
var translate = new Lingual({
    "en": {
        "foo": "bar"
    }
}, settings);
```

### Default Settings
```javascript
var settings = {
    lang: undefined,
    pathDelimiter: '.',
};
```
Pass an object literal as the second parameter of the constructor method to set the settings to use for the instantiated object.

### Setting the Language

There are various ways to set the language to be used with Lingual.js, and there are fallbacks to setting the language. The order is as follows:

* The `lang` attribute on the `html` element will be used first (i.e `<html lang="en">`).
* The `navigator.language` property will be used if the `lang` attribute on `html` is not set.
* If the first two methods fail, the language will default to english.

### Translating

Lingual.js aims to be as simple as possible. The main method of translating strings is via the `data-translate` attribute on HTML elements.

```html
<div data-translate="foo"></div>
```

This will look for the `foo` key within the locale object set earlier and set the div's contents to that string.

You can use an infinite depth of keys to pull from. For example:
```html
<div data-translate="foo.subKey.something.else"></div>
```

This will look deeper within the object, allowing you to organize your translations. You can change the delimiter used by settings `pathDelimiter` in the settings object.

### Using dynamic variables

There are two ways to inject dynamic data into translations. One is by using an array, and the other uses object literals.

```javascript
var translate = new Lingual({
    "en": {
        "sampleArray": "Hello, %s!",
        "sampleObject": "Hello, :name!"
    }
});
```
```html
<div data-translate="sampleArray" data-vars='["Jacob"]'></div> <!-- Produces "Hello, Jacob!" -->
<div data-translate="sampleObject" data-vars='{"name": "Jacob"}'></div> <!-- Produces "Hello, Jacob!" -->
```

If you were to dynamically add an element to the DOM that has a `data-translate` attribute, it will automatically be translated.


## Public Methods

```javascript
var translator = new Lingual(/* locales, settings */);
```

#### `.locale(String locale)`
Change the locale of the document. Must be a string that matches with a preexisting key in the json translations provided upon initialization.
```javascript
translator.locale("es");
```


#### `.translate()`
Translate all DOM elements to the set locale
```javascript
translator.translate();
```

#### `.gettext(String key, Mixed vars)`
Returns the translation for the specified key with an optional `vars` parameter being an Array or an Object Literal/Json.
```javascript
translator.gettext("foo", ["Vars"]);
```

## Todo

[x] Infinite depth of locales (i.e. `<data-translate="support.intro.welcome"></div>`)
[ ] Method overriding to extend support of automatic translations for browsers that do not support DOM Mutators
[ ] Simplistic pluralization rules for most languages


## Licensing
MIT

