# FormJS

Allows you easily re-style native form elements across all browsers and falls back to native form elements for mobile devices.
Also, provides a simple API to manipulate form elements with javascript. Supports IE9+, all modern browsers, and mobile.

UI Elements include:

 * Checkboxes
 * Button Toggles
 * Input Fields
 * Dropdowns
 * Entire forms

## Dependencies

To use FormJS, you'll need:

* [RequireJS](http://requirejs.org/) - AMD and dependency management
* [ElementKit](https://github.com/mkay581/element-kit) - Fast DOM manipulation for Elements

Of course, if you use [Bower's](http://bower.io/) `bower install` to install this project, it will automatically inject all of the above dependencies for you.

## Usage

To use any classes in FormJS, you must [RequireJS](http://requirejs.org/) to import them. The Classes assume
you have a thorough understanding of the [AMD model](https://github.com/amdjs/amdjs-api/wiki/AMD). If not,
please see the RequireJS website.

### Dropdowns

```html
<select>
    <option value="MD">Maryland</option>
    <option value="VA">Virginia</option>
    <option value="DC">Washington, DC</option>
</select>
```

```javascript
var dropdown = new Dropdown({
    el: document.getElementsByTagName('select')[0]
});

dropdown.setValue('DC'); // set the selected value programmatically

dropdown.getValue(); // => "DC"
dropdown.getDisplayValue(); // => "Washington, DC"
```

### Input Fields


```html
<input type="text" value="" placeholder="Enter text here" />
```

```javascript
var inputField = new InputField({
    el: document.getElementsByTagName('input')[0],
    onChange: function (el) {
        // user has finished typing into the field!
    },
    onKeyDownChange: function (el) {
        // the user has typed a key into the field!
    }
});

inputField.setValue('My text'); // set new value
inputField.getValue(); // => "My text"
```


## Dependencies

* [RequireJS](http://requirejs.org/) - AMD and dependency management
* [ElementKit](https://github.com/mkay581/element-kit) - Fast DOM manipulation for html elements


## Examples
 
Examples can be found in the [examples](https://github.com/mkay581/formjs/blob/master/examples) page.

## Release History

 * 2015-03-26   v1.0.0  Official release.
