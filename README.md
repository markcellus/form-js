# FormJS

Allows you easily re-style native form elements across all browsers and falls back to native form elements for mobile devices.
Also, provides a simple API to manipulate form elements with javascript. Supports IE9+, all modern browsers, and mobile.

UI Elements include:

 * Checkboxes
 * Button Toggles
 * Input Fields
 * Dropdowns
 * Entire forms

## Usage

To use any classes in FormJS, you must [RequireJS](http://requirejs.org/) to import them. The Classes assume you have a thorough understanding of the [AMD model](https://github.com/amdjs/amdjs-api/wiki/AMD). If not, please see the RequireJS website.

### Dropdowns

```html
<select>
    <option value="MD">Maryland</option>
    <option value="VA">Virginia</option>
    <option value="DC">Washington, DC</option>
</select>
```

```javascript
var dropdown = new Form.Dropdown({
    el: document.getElementsByTagName('select')[0]
});

dropdown.setValue('DC'); // set the selected value programmatically

dropdown.getValue(); => "DC"
dropdown.getDisplayValue(); => "Washington, DC"
```

### Input Fields

```html
<input type="text" value="" />
```

```javascript
var inputField = new Form.InputField({
    el: document.getElementsByTagName('input')[0],
    onChange: function (el) {
        // input value has changed!
    },
    onKeyDownChange: function (newValue) {
        // the user has typed a key into the field!
        console.log(newValue);
    }
});
```


## Dependencies

* [RequireJS](http://requirejs.org/) - AMD and dependency management
* [ElementKit](https://github.com/mkay581/element-kit) - Fast DOM manipulation for html elements


## Examples
 
Examples can be found in the [examples](https://github.com/mkay581/formjs/blob/master/examples) page.

## Release History

 * 2014-12-08   v0.1.0  Official release.
