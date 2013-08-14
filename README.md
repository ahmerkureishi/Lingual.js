Lingual.js
=======

Crazy simple i18n localisation on the client side


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
var translate = new Lingual('path/to/translations_en.json');
```

##### Using Ajax to load language dynamically
```javascript
var translate = new Lingual('path/to/translations_%LANG%.json');
```

##### Including translations directly
```javascript
var translate = new Lingual({
    "en": {
        "someKey": "myTranslation"
    }
});
```


### Setting the Language

There are various ways to set the language to be used with Lingual.
