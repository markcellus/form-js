'use strict';
var _ = require('underscore');
var Module = require('module-js');
var Dropdown = require('./dropdown');
var InputField = require('./input-field');
var Checkbox = require('./checkbox');
var ButtonToggle = require('./button-toggle');
var SubmitButton = require('./submit-button');

require('element-kit');

/**
 * The function that fires when the input value changes
 * @callback Form~onValueChange
 * @param {string} value - The new value
 * @param {HTMLElement} element - The form element
 * @param {HTMLElement} uIElement - The ui-version of the form element
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
            onSubmitButtonClick: null,
            // data should accept Map or a bare Object (map is encouraged!)
            data: {
                'the-name': 'hey'
            },
            onDataChange: function () {}
        }, options);

        // okay to cache here because its a "live" html collection -- yay!
        this.formEls = this.options.el.elements;

        this._formInstances = [];
        this._moduleCount = 0;
        Module.prototype.initialize.call(this, this.options);
    },

    /**
     * Sets up data map so that we're observing its changes.
     * @returns {Object}
     * @private
     */
    _setupDataMapping: function (data) {
        data = data || {};
        // sync any changes made on data map to options data
        Object.observe(data, function (changes) {
            changes.forEach(function (chg) {
                var n = chg.name,
                    newValue = chg.object[n],
                    inst = this.getInstanceByName(n);
                inst.setValue(newValue);
            }.bind(this));
        }.bind(this));
        return data;
    },

    /**
     * Returns a mapping of ids to their associated form option and selector.
     */
    _getSelectorMap: function () {
        return {
            dropdown: {
                option: this.options.dropdownClass,
                selector: 'select',
                tag: 'select'
            },
            checkbox: {
                option: this.options.checkboxClass,
                tag: 'input',
                types: ['checkbox']
            },
            input: {
                option: this.options.inputFieldClass,
                tag: 'input',
                types: [
                    'password', 'email', 'number', 'text', 'date',
                    'datetime', 'month', 'search', 'range', 'time',
                    'week', 'tel', 'color', 'datetime-local'
                ]
            },
            radio: {
                option: this.options.buttonToggleClass,
                tag: 'input',
                types: ['radio']
            }
        }
    },

    /**
     * Sets up the form and instantiates all necessary element classes.
     */
    setup: function () {
        var submitButtonEl = this.options.el.getElementsByClassName(this.options.submitButtonClass)[0];

        this._setupInstances(this._getInstanceEls('dropdown'), Dropdown);
        this._setupInstances(this._getInstanceEls('checkbox'), Checkbox);
        this._setupInstances(this._getInstanceEls('input'), InputField);

        // group radio button toggles by name before instantiating
        var radios = this._getInstanceEls('radio');
        _.each(this.mapElementsByAttribute(radios, 'name'), function (els) {
            this._setupInstance(els, ButtonToggle, {}, 'inputs');
        }, this);


        if (submitButtonEl) {
            this.subModules.submitButton = new SubmitButton({
                el: submitButtonEl,
                disabledClass: this.options.submitButtonDisabledClass,
                onClick: this.options.onSubmitButtonClick
            });
        }
        this._setupDataMapping(this.options.data);
    },

    /**
     * Gets the matching form elements, based on the supplied type.
     * @param {string} type - The type identifier (i.e. "dropdown", "checkbox", "input")
     * @returns {Array|HTMLCollection} Returns an array of matching elements
     * @private
     */
    _getInstanceEls: function (type) {
        var formEl = this.options.el,
            elements = [],
            map = this._getSelectorMap();

        map = map[type] || {};

        // we are strategically grabbing elements by "tagName" to ensure we have a LIVE HTMLCollection
        // instead of an ineffective, non-live NodeList (i.e. querySelector), can we say, "less state management"!

        if (map.option) {
            elements = formEl.getElementsByClassName(map.option);
        } else if (map.types) {
            map.types.forEach(function (val) {
                (this.mapElementsByAttribute(this.formEls, 'type')[val] || []).forEach(function (el) {
                    elements.push(el);
                });
            }, this);
        } else if (map.tag) {
            elements = formEl.getElementsByTagName(map.tag);
        }
        return elements;
    },

    /**
     * Creates a single instance of a class for each of the supplied elements.
     * @param {HTMLCollection|Array} elements - The set of elements to instance the class on
     * @param {Function} View - The class to instantiate
     * @param {Object} [options] - The options to be passed to instantiation
     * @param {string} [elKey] - The key to use as the "el"
     * @private
     */
    _setupInstances: function (elements, View, options, elKey) {
        var count = elements.length,
            i;
        if (count) {
            for (i = 0; i < count; i++) {
                this._setupInstance(elements[i], View, options, elKey);
            }
        }
    },

    /**
     * Creates a single instance of a class using multiple elements.
     * @param {Array|HTMLCollection} els - The elements for which to setup an instance
     * @param {Function} View - The class to instantiate
     * @param {Object} [options] - The options to be passed to instantiation
     * @param {string} [elKey] - The key to use as the "el"
     * @private
     */
    _setupInstance: function (els, View, options, elKey) {
        elKey = elKey || 'el';
        var formOptions = this.options;
        var finalOptions = this._buildOptions(els, options);
        finalOptions[elKey] = els; // dont allow custom options to override the el!

        // assign value to form element if a data object was passed in options
        els = els.length ? Array.prototype.slice.call(els) : [els]; //ensure array
        var name = els[0].name;
        if (formOptions.data && typeof formOptions.data[name] !== 'function' && formOptions.data.hasOwnProperty(name)) {
            finalOptions.value = finalOptions.value || formOptions.data[name];
        }
        this._moduleCount++;
        var instance = this.subModules['fe' + this._moduleCount] = new View(finalOptions);
        this._formInstances.push(instance);
    },

    /**
     * Maps all supplied elements by an attribute.
     * @param {Array|HTMLCollection|NodeList} elements
     * @param {string} attr - The attribute to map by (the values will be the keys in the map returned)
     * @returns {Object} Returns the final object
     */
    mapElementsByAttribute: function (elements, attr) {
        var map = {},
            count = elements.length,
            i,
            el;
        if (count) {
            for (i = 0; i < count; i++) {
                el = elements[i];
                if (map[el[attr]]) {
                    map[el[attr]].push(el);
                } else {
                    map[el[attr]] = [el];
                }
            }
        }
        return map;
    },

    /**
     * Takes a set of elements and maps them by their name attributes.
     * @param {HTMLCollection|Array|NodeList} elements - An array of elements
     * @returns {{}} Returns an object with name/elements mapping
     * @deprecated since 2.0.0
     */
    mapElementsByName: function (elements) {
        return this.mapElementsByAttribute(elements, 'name');
    },

    /**
     * Returns the instance (if there is one) of an element with a specified name attribute
     * @param {string} name - The name attribute of the element whos instance is desired
     * @returns {Object} Returns the instance that matches the name specified
     * @TODO: this method should return an array because there could be multiple form elements with the same name!
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
        var name = el.name,
            formOptions = this.options,
            mapValue = formOptions.data[name];

        // update data map
        if (typeof mapValue === 'function') {
            // function, so call it
            mapValue(value);
        } else if (formOptions.data.hasOwnProperty(name)) {
            formOptions.data[name] = value;
        }

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