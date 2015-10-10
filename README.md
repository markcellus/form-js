[![Build Status](https://travis-ci.org/mkay581/form-js.svg?branch=master)](https://travis-ci.org/mkay581/form-js)

# FormJS

This library provides a simple API to manipulate a form or its related elements with JavaScript.
Supports IE10+, all modern browsers, and mobile.

It's important for you to use native form elements (i.e. `<select>`, `<input>`, etc) because they come with critical built-in
logic needed for the interactions that users expect. Like tabbing to fields, pressing enter or spacebar to commit a 
dropdown item, mobile keyboard input triggering, etc.

## Benefits

 * Automatic form data binding (JSON data and JS object literals)
 * Use CSS to easily customize hard-to-style native elements (i.e. dropdowns)
 * Listen to user events on forms 
 * Easily change and update form elements and their values with JavaScript
 * Trigger events programmatically

## Support

 * Checkboxes
 * Radio Buttons
 * Input Fields
 * Dropdowns (Select Elements)
 * Text Areas
 * Entire forms

## Usage

### Styling form elements

Let's say you wanted to style a dropdown menu with the following html:

```html
<select>
    <option value="MD">Maryland</option>
    <option value="VA" selected>Virginia</option>
    <option value="DC">Washington, DC</option>
</select>
```

With this library, you can do this:

```javascript
var dropdown = new Dropdown({
    el: document.getElementsByTagName('select')[0]
});
```

Which will change your HTML into this:

```html
<div class="dropdown-wrapper">
    <div class="dropdown-container">
        <div class="dropdown-value-container">Virginia</div>
        <div class="dropdown-option-container">
            <div class="dropdown-option" data-value="MD">Maryland</div>
            <div class="dropdown-option dropdown-option-selected" data-value="VA">Virginia</div>
            <div class="dropdown-option" data-value="DC">Washington, DC</div>
        </div>
    </div>
    <select>
        <option value="MD">Maryland</option>
        <option value="VA" selected>Virginia</option>
        <option value="DC">Washington, DC</option>
    </select>
</div>
```

Then you can style the dropdown using CSS (and just hide the `<select>` element).


### Programmatically change the element's value

Each class comes with a set of utility methods so you can change the elements via JS. Using the example above, you
could do the following:

```javascript
// set the selected value programmatically
dropdown.setValue('DC');

// get the new data value
dropdown.getValue(); // => "DC"

// get the display value
dropdown.getDisplayValue(); // => "Washington, DC"
```

### Listening to change events

You can also listen to events on form elements. Given the following input element...


```html
<input type="text" value="" placeholder="Enter text here" />
```

You can do the following:

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
// set the value
inputField.setValue('My text'); // set new value
// get the new value
inputField.getValue(); // => "My text"
```

### Detect when user changes any value in a form

Suppose you have this HTML:

```html
<form class="debt-info-form">
    <input type="text" name="first_name" value="" />
    <select name="loan_type">
        <option value="CC">Credit Card</option>
        <option value="Mortgage">Mortgage</option>
        <option value="HELO">HELO</option>
        <option value="Student Loan">Student Loan</option>
    </select>
</form>
```

You can detect when a user changes any of the form's elements like so:

```javascript
var form = new Form({
    el: document.body.getElementsByClassName('debt-info-form')[0],
    onValueChange: function (val, el) {
        // a value has been changed!
       console.log('new value: ' + val);
    }
});
form.setup();
```

## Examples
 
Examples can be found in the [examples](https://github.com/mkay581/formjs/blob/master/examples) page.

## Release History

Release history can be found in the [releases](https://github.com/mkay581/form-js/releases) page.
