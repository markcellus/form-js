# FormJS

Allows you easily restyle a native browser's form elements for consistent look and feel across all browsers and
falls back to native form elements for mobile. Also, provides a simple javascript API to programmatically manipulate form elements.
Supports IE9+, all modern browsers, and mobile.

UI Elements include:

 * Checkboxes
 * Button Toggles
 * Input Fields
 * Dropdowns
 * Entire forms

## Usage/Examples

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
    el: document.getElementByTagName('select')[0]
});

dropdown.setValue('DC'); // set the selected value programmatically

dropdown.getValue(); => "DC"
dropdown.getDisplayValue(); => "Washington, DC"
```

## Dependencies

* [RequireJS](http://requirejs.org/) - AMD and dependency management
* [ElementKit](https://github.com/mkay581/element-kit) - Fast DOM manipulation for html elements


## Examples
 
Examples can be found in the [examples](https://github.com/mkay581/formjs/blob/master/examples) page.

## Release History

 * 2014-12-08   v0.1.0  Official release.
