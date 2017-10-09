'use strict';
import _ from 'underscore';
import FormElement from './form-element';
/**
 * A callback function that fires when one of the form elements are selected
 * @callback FormElementGroup~onChange
 * @param {string} value - The value of the input element that was changed
 * @param {HTMLInputElement} input - The input element that was changed
 * @param {HTMLElement} UIElement - The container of the input element that was changed
 */

/**
 * Base class to handle grouped form elements.
 * @class FormElementGroup
 * @extends FormElement
 */
class FormElementGroup extends FormElement {

    /**
     * Initialization.
     * @param {object} options - Options passed into instance
     * @param {Array|HTMLInputElement} options.inputs - The collection of input elements to be made into form elements
     * @param {FormElementGroup~onChange} [options.onChange] - A callback function that fires when one of the form elements are selected
     * @param {string} [options.containerClass] - The css class that will be applied to each form element's container
     * @param {string} [options.inputClass] - The css class that will be applied to each form element item (input element)
     * @param {string} [options.selectedClass] - The css class that will be applied to a form element item (UI-version) when it is selected
     * @param {string} [options.disabledClass] - The css class that will be applied to a form element item (UI-version) when it is disabled
     * @param {string|Array} [options.value] - The string matching the name attribute of the form element button to have selected initially (or an array of such strings)
     */
    constructor (options) {

        options = _.extend({
            inputs: [],
            onChange: null,
            containerClass: 'ui-form-element',
            inputClass: 'ui-form-element-input',
            selectedClass: 'ui-form-element-selected',
            disabledClass: 'ui-form-element-disabled',
            value: null
        }, options);

        super(options);

        this._container = this.options.container;

        if (!this.options.inputs.length && this._container) {
            this.options.inputs = this._container.querySelectorAll('input');
        }

        if (!this.options.inputs.length) {
            console.error('could not build ' + this.getElementKey() + ': no form element input elements were passed');
        } else {
            this.setup();
        }
    }

    /**
     * Sets up the form elements.
     */
    setup () {
        this._formElements = this._setupFormElements(this.options.inputs);
        this._UIElements = this._buildUIElements(this._formElements);
        this._setupEvents();
    }

    /**
     * Sets up form elements.
     * @param {HTMLCollection|Array} elements - The array of form elements
     * @returns {Array} Returns the form elements after they've been setup
     */
    _setupFormElements (elements) {
        let value = this.options.value,
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
            formElement.classList.add(this.options.inputClass);
        }.bind(this));

        return elements;
    }

    /**
     * Sets up events.
     * @private
     */
    _setupEvents () {
        this.triggerAll(function (formElement, UIElement) {
            this.addEventListener(formElement, 'click', '_onFormElementClickEventListener', this);
            this.addEventListener(UIElement, 'click', '_onUIElementClickEventListener', this, true);
        }.bind(this));
    }

    /**
     * Gets all the current input form elements.
     * @returns {Array|*}
     */
    getFormElementGroup () {
        return this._formElements || [];
    }

    /**
     * Gets all current ui-versions of input form elements.
     * @returns {Array|*}
     */
    getUIElements () {
        return this._UIElements || [];
    }

    /**
     * Delegator that triggers a callback on each of the current form element elements.
     * Useful for performing an operation across all elements
     * @param {Function} callback - The function that should be executed for each input item
     */
    triggerAll (callback) {
        let i,
            FormElementGroup = this.getFormElementGroup(),
            UIElements = this.getUIElements();
        for (i = 0; i < FormElementGroup.length; i++) {
            callback(FormElementGroup[i], UIElements[i], i);
        }
    }

    /**
     * When one of the UI elements (or its parent <label>) is clicked.
     * @param {Event} e
     * @private
     */
    _onFormElementClickEventListener (e) {
        let formElement = e.target;
        let UIElement = formElement.parentElement;
        if (e.target === e.currentTarget) {
            this._onFormElementClick(formElement, UIElement);
        }
    }

    /**
     * An abstract method to handle clicks to any given form element
     * @param {HTMLInputElement} formElement - The form element that was clicked
     * @param {HTMLElement} UIElement - The UI version of the form element that was clicked
     * @private
     * @abstract
     */
    // eslint-disable-next-line no-unused-vars
    _onFormElementClick (formElement, UIElement) {}

    /**
     * When one of the UI elements (or its parent <label>) is clicked.
     * @param {Event} e
     * @private
     */
    _onUIElementClickEventListener (e) {
        let formElement;
        let UIElement;
        // respond to clicks made to the UI element ONLY
        if (e.target === e.currentTarget && e.target.classList.contains(this.options.containerClass)) {
            // we are preventing default here to ensure default
            // checkbox is not going to be checked since
            // we're updating the checked boolean manually later
            e.preventDefault();
            UIElement = e.target;
            formElement = e.target.getElementsByClassName(this.options.inputClass)[0];
            this._onUIElementClick(formElement, UIElement);
        }
    }

    /**
     * An abstract method to handle clicks to any given UI element
     * @param {HTMLInputElement} formElement - The form element nested under the UI element that was clicked
     * @param {HTMLElement} UIElement - The UI version of the form element that was clicked
     * @private
     * @abstract
     */
    // eslint-disable-next-line no-unused-vars
    _onUIElementClick (formElement, UIElement) {}

    /**
     * Builds the UI-friendly version of the form elements and wraps them in their appropriate containers.
     * @param {Array} elements - The input elements
     * @returns {Array} Returns an array of the ui-versions of the elements
     * @private
     */
    _buildUIElements (elements) {
        let count = elements.length,
            arr = [],
            i,
            formElement,
            UIElement;
        for (i = 0; i < count; i++) {
            formElement = elements[i];
            UIElement = this._buildContainerEl(formElement);
            // add selected class if selected initially
            if (formElement.checked) {
                UIElement.classList.add(this.options.selectedClass);
            }
            if (formElement.disabled) {
                UIElement.classList.add(this.options.disabledClass);
            }
            arr.push(UIElement);
        }
        return arr;
    }

    /**
     * Wraps the passed element inside of a custom container element.
     * @param {HTMLElement} el - The element to be wrapped inside of the container
     * @returns {Element} Returns the container element that contains the passed el
     * @private
     */
    _buildContainerEl (el) {
        let parent = el.parentNode;
        let outerEl = document.createElement('div');
        outerEl.classList.add(this.options.containerClass);
        parent.replaceChild(outerEl, el);
        outerEl.appendChild(el);
        return outerEl;
    }

    /**
     * Triggers a change on the form element.
     * @param {HTMLInputElement} formElement - The input element
     * @param {HTMLElement} UIElement - The ui element
     */
    triggerChange (formElement, UIElement) {
        if (this.options.onChange) {
            this.options.onChange(formElement.value, formElement, UIElement);
        }
    }

    /**
     * Selects the form element item.
     * @param {Number} index - The index of the form element item
     */
    select (index) {
        let input = this.getFormElement(index),
            uiEl = this.getUIElement(index);
        if (!input.checked) {
            input.checked = true;
            uiEl.classList.add(this.options.selectedClass);
            this.triggerChange(input, uiEl);
        }
    }

    /**
     * De-selects the form element item.
     * @param {Number} index - The index of the form element item
     */
    deselect (index) {
        let input = this.getFormElement(index),
            uiEl = this.getUIElement(index);
        uiEl.classList.remove(this.options.selectedClass);
        if (input.checked) {
            input.checked = false;
            this.triggerChange(input, uiEl);
        }
    }

    /**
     * Gets the selected value of the form element.
     * @returns {Array} Returns the value of the currently selected form elements
     */
    getValue () {
        let values = [];
        this.getFormElementGroup().forEach(function (el) {
            if (el.checked) {
                values.push(el.value);
            }
        }, this);
        return values;
    }

    /**
     * Selects the form element that matches the supplied value.
     * @param {string|Array} value - The value of the form element that should be selected
     */
    setValue (value) {
        this.getFormElementGroup().forEach(function (el, idx) {
            if (el.value === value || value.indexOf(el.value) !== -1) {
                this.select(idx);
            } else {
                this.deselect(idx);
            }
        }, this);
    }

    /**
     * Gets the form element input element by an index.
     * @param {Number} [index] - The index of the form element input element
     * @returns {HTMLInputElement} Returns the checkbox input element
     */
    getFormElement (index) {
        return this.getFormElementGroup()[(index || 0)];
    }

    /**
     * Gets the ui-version of the form element element.
     * @param {Number} [index] - The index of the form element element
     * @returns {HTMLElement} Returns the checkbox div element.
     */
    getUIElement (index) {
        return this.getUIElements()[(index || 0)];
    }

    /**
     * Deselects all form elements.
     */
    clear () {
        this.triggerAll(function (formElement, UIElement, idx) {
            this.deselect(idx);
        }.bind(this));
    }

    /**
     * Enables the form element.
     */
    enable () {
        this.triggerAll(function (formElement, UIElement) {
            formElement.disabled = false;
            UIElement.classList.remove(this.options.disabledClass);
        }.bind(this));
    }

    /**
     * Disables the form element.
     */
    disable () {
        this.triggerAll(function (formElement, UIElement) {
            formElement.disabled = true;
            UIElement.classList.add(this.options.disabledClass);
        }.bind(this));
    }

    /**
     * Gets the unique identifier for form elements.
     * @returns {string}
     */
    getElementKey () {
        return 'FormElementGroup';
    }

    /**
     * Destruction of this class.
     */
    destroy () {
        this.triggerAll(function (formElement, UIElement) {
            UIElement.parentNode.replaceChild(formElement, UIElement);
            this.removeEventListener(formElement, 'click', '_onFormElementClickEventListener', this);
            this.removeEventListener(UIElement, 'click', '_onUIElementClickEventListener', this, true);
        }.bind(this));
        super.destroy();
    }

}

module.exports = FormElementGroup;
