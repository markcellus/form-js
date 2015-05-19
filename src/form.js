'use strict';
var _ = require('underscore');
var Module = require('module.js');
var Dropdown = require('./dropdown');
var InputField = require('./input-field');
var Checkbox = require('./checkbox');
var ButtonToggle = require('./button-toggle');
var SubmitButton = require('./submit-button');

require('element-kit');

/**
 * The function that fires when the input value changes
 * @callback Form~onValueChange
 * @param {Event} event - The event that fired the change
 */

/**
 * The function that fires to give users opportunity to return a custom set of options on a per-element basis
 * @callback Form~onGetOptions
 * @param {HTMLElement|Array} element(s) - The element (or if radio buttons, an array of elements) on which to use the custom options
 * @returns {Object} Return the custom set of options
 */

/**
 * The function that fires when the submit button is clicked
 * @callback Form~onSubmitButtonClick
 * @returns {Event} Returns the click event
 */

/**
 * Utility class for form elements.
 * @class Form
 */
var Form = Module.extend({

    /**
     * Sets up the form.
     * @param {object} options - The options
     * @param {HTMLFormElement} [options.el] - The form element
     * @param {HTMLFormElement} options.el - The form element
     * @param {Form~onValueChange} [options.onValueChange] - A callback function that fires when the value of any form element changes
     * @param {Function} [options.onGetOptions] - Function callback that is fired upon instantiation to provide custom options
     * @param {string} [options.dropdownClass] - The css class used to query the set of dropdown elements that should be included
     * @param {string} [options.checkboxClass] - The css class used to query the set of checkbox elements that should be included
     * @param {string} [options.inputFieldClass] - The css class used to query the set of text input elements that should be included
     * @param {string} [options.buttonToggleClass] - The css class used to query the set of radio button elements that should be included
     * @param {string} [options.submitButtonClass] - The css class used to query the submit button
     * @param {string} [options.submitButtonDisabledClass] - The class that will be applied to the submit button when its disabled
     * @param {string} [options.onSubmitButtonClick] - Function that is called when the submit button is clicked
     */
    initialize: function (options) {

        this.options = _.extend({
            el: null,
            onValueChange: null,
            onGetOptions: null,
            dropdownClass: null,
            checkboxClass: null,
            inputFieldClass: null,
            buttonToggleClass: null,
            submitButtonClass: null,
            submitButtonDisabledClass: null,
            onSubmitButtonClick: null
        }, options);

        this.options = options;

        // okay to cache here because its a "live" html collection -- yay!
        this.formEls = this.options.el.elements;

        this._formInstances = [];
        Module.prototype.initialize.call(this, this.options);
    },

    /**
     * Sets up the form and instantiates all necessary element classes.
     */
    setup: function () {
        this._setupInstances(this.options.dropdownClass, Dropdown);
        this._setupInstances(this.options.checkboxClass, Checkbox);
        this._setupInstances(this.options.inputFieldClass, InputField);
        this._setupButtonToggleInstances(this.options.buttonToggleClass);

        if (this.options.submitButtonClass) {
            this.subModules.submitButton = new SubmitButton({
                el: this.options.el.getElementsByClassName(this.options.submitButtonClass)[0],
                disabledClass: this.options.submitButtonDisabledClass,
                onClick: this.options.onSubmitButtonClick
            });
        }
    },

    /**
     * Instantiates elements.
     * @param {string} cssClass - The class that the elements must match to be instantiated
     * @param {Function} View - The class to instantiate
     * @param {Object} [options] - The options to be passed to instantiation
     * @param {string} [elKey] - The key to use as the "el"
     * @private
     */
    _setupInstances: function (cssClass, View, options, elKey) {
        var elements = this.options.el.getElementsByClassName(cssClass),
            count = elements.length,
            i,
            instance,
            el;

        var finalOptions = {};

        if (count) {
            elKey = elKey || 'el';
            for (i = 0; i < count; i++) {
                el = elements[i];
                finalOptions = this._buildOptions(el, options);
                finalOptions[elKey] = el; // dont allow custom options to override the el!
                instance = this.subModules['fe' + elKey + cssClass + i] = new View(finalOptions);
                this._formInstances.push(instance);
            }
        }
    },

    /**
     * Sets up button toggle instances by on the elements that contain the supplied css class.
     * @param {string} cssClass - The css class of all button toggle elements to instantiate
     * @private
     */
    _setupButtonToggleInstances: function (cssClass) {
        var toggleNameMap = this.mapElementsByName(this.options.el.getElementsByClassName(cssClass)),
            elKey = 'radio',
            finalOptions = {};
        _.each(toggleNameMap, function (els, name) {
            finalOptions = this._buildOptions(els, {});
            finalOptions.inputs = els; // dont allow custom options to override the radio inputs
            this._formInstances.push(this.subModules['fe' + elKey + cssClass + name] = new ButtonToggle(finalOptions));
        }, this);
    },

    /**
     * Takes a set of elements and maps them by their name attributes.
     * @param {HTMLCollection|Array|NodeList} elements - An array of elements
     * @returns {{}} Returns an object with name/elements mapping
     */
    mapElementsByName: function (elements) {
        var map = {},
            count = elements.length,
            i,
            el;
        if (count) {
            for (i = 0; i < count; i++) {
                el = elements[i];
                if (map[el.name]) {
                    map[el.name].push(el);
                } else {
                    map[el.name] = [el];
                }
            }
        }
        return map;
    },

    /**
     * Returns the instance (if there is one) of an element with a specified name attribute
     * @param {string} name - The name attribute of the element whos instance is desired
     * @returns {Object} Returns the instance that matches the name specified
     */
    getInstanceByName: function (name) {
        var i,
            instance;

        for (i = 0; i < this._formInstances.length; i++) {
            instance = this._formInstances[i];
            if (instance.getFormElement().name === name) {
                break;
            }
        }
        return instance;
    },

    /**
     * Builds the initialize options for an element.
     * @param {HTMLElement|Array} el - The element (or if radio buttons, an array of elements)
     * @param {Object} options - The beginning set of options
     * @returns {*|{}}
     * @private
     */
    _buildOptions: function (el, options) {
        options = options || {};

        if (this.options.onGetOptions) {
            options = _.extend({}, options, this.options.onGetOptions(el));
        }
        options.onChange = function (value, inputEl, UIElement) {
            this._onValueChange(value, inputEl, UIElement);
        }.bind(this);
        return options;
    },

    /**
     * When any form element's value changes.
     * @param {string} value - The new value
     * @param {HTMLElement} el - The element that triggered value change
     * @param {HTMLElement} ui - The UI version of the element
     * @private
     */
    _onValueChange: function (value, el, ui) {

        if (this.options.onValueChange) {
            this.options.onValueChange(value, el, ui);
        }
        if (this.options.onChange) {
            this.options.onChange(value, el, ui);
        }

    },

    /**
     * Disables all form elements.
     */
    disable: function () {
        var els = this.formEls,
            i,
            submitButton = this.getSubmitButtonInstance();
        this.setPropertyAll('disabled', true);
        // add disabled css classes
        for (i = 0; i < els.length; i++) {
            els[i].kit.classList.add('disabled');
        }
        if (submitButton) {
            submitButton.disable();
        }

    },

    /**
     * Enables all form elements.
     */
    enable: function () {
        var els = this.formEls,
            i,
            submitButton = this.getSubmitButtonInstance();
        this.setPropertyAll('disabled', false);
        // remove disabled css classes
        for (i = 0; i < els.length; i++) {
            els[i].kit.classList.remove('disabled');
        }
        if (submitButton) {
            submitButton.disable();
        }
    },

    /**
     * Sets a property on all form elements.
     * @TODO: this function still exists until this class can cover ALL possible form elements (i.e. radio buttons)
     * @param {string} prop - The property to change
     * @param {*} value - The value to set
     */
    setPropertyAll: function (prop, value) {
        var i,
            els = this.formEls;
        for (i = 0; i < els.length; i++) {
            els[i][prop] = value;
        }
    },

    /**
     * Triggers a method on all form instances.
     * @param {string} method - The method
     * @param {...*} params - Any params for the method from here, onward
     */
    triggerMethodAll: function (method, params) {
        var args = Array.prototype.slice.call(arguments, 1),
            i, instance;

        for (i = 0; i < this._formInstances.length; i++) {
            instance = this._formInstances[i];
            instance[method].apply(instance, args);
        }
    },

    /**
     * Clears all form items.
     */
    clear: function () {
        this.triggerMethodAll('clear');
    },

    /**
     * Gets an object that maps all fields to their current name/value pairs.
     * @returns {Array} Returns an array of objects
     */
    getCurrentValues: function () {
        var map = [],
            fields = this.options.el.querySelectorAll('[name]'),
            fieldCount = fields.length,
            i,
            field,
            obj;
        for (i = 0; i < fieldCount; i++) {
            field = fields[i];
            // only add fields with a name attribute
            if (field.name) {
                obj = {
                    name: field.name,
                    // fallback to value attribute when .value can't be trusted (i.e. input[type=date])
                    value: field.value,
                    //value: field.value || field.getAttribute('value')
                    required: field.required,
                    disabled: field.disabled,
                    formElement: field
                };
                map.push(obj);
            }
        }
        return map;
    },

    /**
     * Returns the submit button instance.
     * @returns {Object}
     */
    getSubmitButtonInstance: function () {
        return this.subModules.submitButton;
    }

});

module.exports = Form;