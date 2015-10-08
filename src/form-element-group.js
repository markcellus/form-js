'use strict';
var _ = require('underscore');
var FormElement = require('./form-element');
require('element-kit');
/**
 * A callback function that fires when one of the form elements are selected
 * @callback FormElementGroup~onChange
 * @param {string} value - The value of the input element that was changed
 * @param {HTMLInputElement} input - The input element that was changed
 * @param {HTMLElement} UIElement - The container of the input element that was changed
 */

/**
 * A callback function that fires when one of the form elements are selected
 * @callback FormElementGroup~onSelect
 * @param {string} value - The value of the input element that was selected
 * @param {HTMLInputElement} input - The input element that was selected
 * @param {HTMLElement} UIElement - The container of the input element that was selected
 */

/**
 * A callback function that fires when one of the form elements are de-selected
 * @callback FormElementGroup~onDeselect
 * @param {string} value - The value of the input element that was de-selected
 * @param {HTMLInputElement} input - The input element that was de-selected
 * @param {HTMLElement} UIElement - The container of the input element that was de-selected
 */

/**
 * Base class to handle grouped form elements.
 * @class FormElementGroup
 * @extends FormElement
 */
var FormElementGroup = FormElement.extend({

    /**
     * Initialization.
     * @param {object} options - Options passed into instance
     * @param {Array|HTMLInputElement} options.inputs - The collection of input elements to be made into form elements
     * @param {FormElementGroup~onChange} [options.onChange] - A callback function that fires when one of the form elements are selected
     * @param {string} [options.containerClass] - The css class that will be applied to each form element's container
     * @param {string} [options.inputClass] - The css class that will be applied to each form element item (input element)
     * @param {FormElementGroup~onSelect} [options.onSelect] - A callback function that fires when a form element is selected
     * @param {FormElementGroup~onDeselect} [options.onDeselect] - A callback function that fires when a form element is deselected
     * @param {string} [options.selectedClass] - The css class that will be applied to a form element item (UI-version) when it is selected
     * @param {string} [options.disabledClass] - The css class that will be applied to a form element item (UI-version) when it is disabled
     * @param {string|Array} [options.value] - The string matching the name attribute of the form element button to have selected initially (or an array of such strings)
     */
    initialize: function (options) {

        this.options = _.extend({
            inputs: [],
            onChange: null,
            containerClass: 'ui-form-element',
            inputClass: 'ui-form-element-input',
            selectedClass: 'ui-form-element-selected',
            disabledClass: 'ui-form-element-disabled',
            value: null
        }, options);

        FormElement.prototype.initialize.call(this, this.options);

        this._container = this.options.container;

        if (!this.options.inputs.length && this._container) {
            this.options.inputs = this._container.querySelectorAll('input');
        }

        if (!this.options.inputs.length) {
            console.error('could not build ' + this.getElementKey() + ': no form element input elements were passed');
        } else {
            this.setup();
        }
    },

    /**
     * Sets up the form elements.
     */
    setup: function () {
        this._formElements = this._setupFormElements(this.options.inputs);
        this._UIElements = this._buildUIElements(this._formElements);
        this._setupEvents();
    },

    /**
     * Sets up form elements.
     * @param {HTMLCollection|Array} elements - The array of form elements
     * @returns {Array} Returns the form elements after they've been setup
     */
    _setupFormElements: function (elements) {
        var value = this.options.value,
            values = [];

        // convert to real array if HTMLCollection
        elements = Array.prototype.slice.call(elements);

        if (typeof value === 'string') {
            values.push(value);
        } else if (value && value.length) {
            // assume its an array
            values = Array.prototype.slice.call(value); //ensure array
        }

        // perform work on all form element elements, checking them if necessary
        elements.forEach(function (formElement) {
            if (values.indexOf(formElement.value) !== -1) {
                // value exists
                formElement.checked = true;
            }
            // add initial class
            formElement.kit.classList.add(this.options.inputClass);
        }.bind(this));

        return elements;
    },

    /**
     * Sets up events.
     * @private
     */
    _setupEvents: function () {
        this.triggerAll(function (formElement) {
            formElement.kit.addEventListener('click', '_onFormElementClick', this);
        }.bind(this));
    },

    /**
     * Gets all the current input form elements.
     * @returns {Array|*}
     */
    getFormElementGroup: function () {
        return this._formElements || [];
    },

    /**
     * Gets all current ui-versions of input form elements.
     * @returns {Array|*}
     */
    getUIElements: function () {
        return this._UIElements || [];
    },

    /**
     * Delegator that triggers a callback on each of the current form element elements.
     * Useful for performing an operation across all elements
     * @param {Function} callback - The function that should be executed for each input item
     */
    triggerAll: function (callback) {
        var i,
            FormElementGroup = this.getFormElementGroup(),
            UIElements = this.getUIElements();
        for (i = 0; i < FormElementGroup.length; i++) {
            callback(FormElementGroup[i], UIElements[i], i);
        }
    },

    /**
     * When the input field is clicked.
     * @param {Event} e
     * @private
     */
    _onFormElementClick: function (e) {
        var formEl = e.currentTarget.getElementsByClassName(this.options.inputClass)[0],
            UIElement = e.currentTarget.getElementsByClassName(this.options.containerClass)[0];

        // this function will fire multiple times do to events bubbling up
        // we only care when the event bubbles up to the input field
        if (e.currentTarget === e.target) {
            formEl = e.target;
            UIElement = e.target.parentElement;
            this._processClick(formEl, UIElement);
        }
    },

    /**
     * A function that should be overridden to process a click on any form element.
     * @param {HTMLInputElement} formElement
     * @param {HTMLElement} UIElement
     * @abstract
     * @private
     */
    _processClick: function (formElement, UIElement) {},

    /**
     * Builds the UI-friendly version of the form elements and wraps them in their appropriate containers.
     * @param {Array} elements - The input elements
     * @returns {Array} Returns an array of the ui-versions of the elements
     * @private
     */
    _buildUIElements: function (elements) {
        var count = elements.length,
            arr = [],
            i,
            formElement,
            UIElement;
        for (i = 0; i < count; i++) {
            formElement = elements[i];
            UIElement = formElement.kit.appendOuterHtml('<div class="' + this.options.containerClass + '"></div>');
            // add selected class if selected initially
            if (formElement.checked) {
                UIElement.kit.classList.add(this.options.selectedClass);
            }
            if (formElement.disabled) {
                UIElement.kit.classList.add(this.options.disabledClass);
            }
            arr.push(UIElement);
        }
        return arr;
    },

    /**
     * Triggers a change on the form element.
     * @param {HTMLInputElement} formElement - The input element
     * @param {HTMLElement} UIElement - The ui element
     */
    triggerChange: function (formElement, UIElement) {
        if (this.options.onChange) {
            this.options.onChange(formElement.value, formElement, UIElement);
        }
    },

    /**
     * Selects the form element item.
     * @param {Number} index - The index of the form element item
     */
    select: function (index) {
        var input = this.getFormElement(index),
            uiEl = this.getUIElement(index);
        if (!input.checked) {
            input.checked = true;
            uiEl.kit.classList.add(this.options.selectedClass);
            this.triggerChange(input, uiEl);
        }
    },

    /**
     * De-selects the form element item.
     * @param {Number} index - The index of the form element item
     */
    deselect: function (index) {
        var input = this.getFormElement(index),
            uiEl = this.getUIElement(index);
        uiEl.kit.classList.remove(this.options.selectedClass);
        if (input.checked) {
            input.checked = false;
            this.triggerChange(input, uiEl);
        }
    },

    /**
     * Gets the selected value of the form element.
     * @returns {Array} Returns the value of the currently selected form elements
     */
    getValue: function () {
        var values = [];
        this.getFormElementGroup().forEach(function (el) {
            if (el.checked) {
                values.push(el.value);
            }
        }, this);
        return values;
    },

    /**
     * Selects the form element that matches the supplied value.
     * @param {string|Array} value - The value of the form element that should be selected
     */
    setValue: function (value) {
        this.getFormElementGroup().forEach(function (el, idx) {
            if (el.value === value || value.indexOf(el.value) !== -1) {
                this.select(idx);
            } else {
                this.deselect(idx);
            }
        }, this);
    },

    /**
     * Gets the form element input element by an index.
     * @param {Number} [index] - The index of the form element input element
     * @returns {HTMLInputElement} Returns the checkbox input element
     */
    getFormElement: function (index) {
        return this.getFormElementGroup()[(index || 0)];
    },

    /**
     * Gets the ui-version of the form element element.
     * @param {Number} [index] - The index of the form element element
     * @returns {HTMLElement} Returns the checkbox div element.
     */
    getUIElement: function (index) {
        return this.getUIElements()[(index || 0)];
    },

    /**
     * Deselects all form elements.
     */
    clear: function () {
        this.triggerAll(function (formElement, UIElement, idx) {
            this.deselect(idx);
        }.bind(this));
    },

    /**
     * Enables the form element.
     */
    enable: function () {
        this.triggerAll(function (formElement, UIElement) {
            formElement.disabled = false;
            UIElement.kit.classList.remove(this.options.disabledClass);
        }.bind(this));
    },

    /**
     * Disables the form element.
     */
    disable: function () {
        this.triggerAll(function (formElement, UIElement) {
            formElement.disabled = true;
            UIElement.kit.classList.add(this.options.disabledClass);
        }.bind(this));
    },

    /**
     * Gets the unique identifier for form elements.
     * @returns {string}
     */
    getElementKey: function () {
        return 'FormElementGroup';
    },

    /**
     * Destruction of this class.
     */
    destroy: function () {
        this.triggerAll(function (formElement, UIElement) {
            UIElement.parentNode.replaceChild(formElement, UIElement);
            formElement.addEventListener('click', '_onFormElementClick', this);
        }.bind(this));
        FormElement.prototype.destroy.call(this);
    }

});

module.exports = FormElementGroup;