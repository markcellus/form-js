'use strict';
var _ = require('underscore');
var FormElement = require('./form-element');
require('element-kit');
/**
 * A callback function that fires when one of the button toggle elements are selected
 * @callback ButtonToggle~onChange
 * @param {string} value - The value of the input element that was changed
 * @param {HTMLInputElement} input - The input element that was changed
 * @param {HTMLElement} UIElement - The container of the input element that was changed
 */

/**
 * A callback function that fires when one of the button toggle elements are selected
 * @callback ButtonToggle~onSelect
 * @param {string} value - The value of the input element that was selected
 * @param {HTMLInputElement} input - The input element that was selected
 * @param {HTMLElement} UIElement - The container of the input element that was selected
 */

/**
 * A callback function that fires when one of the button toggle elements are de-selected
 * @callback ButtonToggle~onDeselect
 * @param {string} value - The value of the input element that was de-selected
 * @param {HTMLInputElement} input - The input element that was de-selected
 * @param {HTMLElement} UIElement - The container of the input element that was de-selected
 */

/**
 * Turns input radio or checkbox html elements into a Button Toggle.
 * @class ButtonToggle
 * @extends FormElement
 */
var ButtonToggle = FormElement.extend({

    /**
     * Initialization.
     * @param {object} options - Options passed into instance
     * @param {Array|HTMLInputElement} options.inputs - The collection of input elements to be made into toggle items
     * @param {ButtonToggle~onChange} [options.onChange] - A callback function that fires when one of the toggle elements are selected
     * @param {string} [options.containerClass] - The css class that will be applied to each toggle item's container
     * @param {string} [options.inputClass] - The css class that will be applied to each toggle item (input element)
     * @param {ButtonToggle~onSelect} [options.onSelect] - A callback function that fires when the button toggle element is selected
     * @param {ButtonToggle~onDeselect} [options.onDeselect] - A callback function that fires when the button toggle element is deselected
     * @param {string} [options.selectedClass] - The css class that will be applied to a button toggle item (UI-version) when it is selected
     * @param {string} [options.disabledClass] - The css class that will be applied to a button toggle item (UI-version) when it is disabled
     * @param {string|Array} [options.value] - The string matching the name attribute of the toggle button to have selected initially (or an array of such strings)
     */
    initialize: function (options) {

        this.options = _.extend({
            inputs: [],
            onChange: null,
            containerClass: 'ui-button-toggle',
            inputClass: 'ui-button-toggle-input',
            selectedClass: 'ui-button-toggle-selected',
            disabledClass: 'ui-button-toggle-disabled',
            value: null
        }, options);

        FormElement.prototype.initialize.call(this, this.options);

        this._container = this.options.container;

        if (!this.options.inputs.length && this._container) {
            this.options.inputs = this._container.querySelectorAll('input');
        }

        if (!this.options.inputs.length) {
            console.error('could not build toggle items: no toggle input items were passed');
        } else {
            this.setup();
        }
    },

    /**
     * Sets up the button toggles.
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

        // perform work on all button toggle elements, checking them if necessary
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
        this._triggerAll(function (formElement) {
            formElement.kit.addEventListener('click', '_onFormElementClick', this);
        }.bind(this));
    },

    /**
     * Gets all the current input toggles.
     * @returns {Array|*}
     */
    getFormElements: function () {
        return this._formElements || [];
    },

    /**
     * Gets all current ui-versions of input toggles.
     * @returns {Array|*}
     */
    getUIElements: function () {
        return this._UIElements || [];
    },

    /**
     * Private delegator that triggers a callback on each of the current button toggle elements.
     * Useful for performing an operation across all elements
     * @param {Function} callback - The function that should be executed for each input item
     * @private
     */
    _triggerAll: function (callback) {
        var i,
            formElements = this.getFormElements(),
            UIElements = this.getUIElements();
        for (i = 0; i < formElements.length; i++) {
            callback(formElements[i], UIElements[i], i);
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
            this._delegateClick(formEl, UIElement);
        }

    },

    /**
     * Delegates a click as a radio button or checkbox.
     * @param {HTMLInputElement} formElement
     * @param {HTMLElement} UIElement
     * @private
     */
    _delegateClick: function (formElement, UIElement) {
        if (this.isRadio()) {
            this._processRadioClick(formElement, UIElement);
        } else {
            this._processCheckboxClick(formElement, UIElement);
        }
    },

    /**
     * When a button toggle is clicked that is a radio input element.
     * @param {HTMLInputElement} formElement - The radio button element
     * @param {HTMLElement} UIElement - The ui element
     * @private
     */
    _processRadioClick: function (formElement, UIElement) {
        // radio buttons should only trigger a change if the clicked item isnt already selected
        if (this._lastRadioClicked !== formElement) {
            this._triggerAll(function (formElement, UIElement) {
                UIElement.kit.classList.remove(this.options.selectedClass);
                formElement.checked = false;
            }.bind(this));
            this._onToggleSelect(formElement, UIElement);
            this._lastRadioClicked = formElement;
        }
    },

    /**
     * When a button toggle is clicked that is a checkbox input element.
     * @param {HTMLInputElement} formElement - The checkbox element
     * @param {HTMLElement} UIElement - The ui element
     * @private
     */
    _processCheckboxClick: function (formElement, UIElement) {
        if (!UIElement.kit.classList.contains(this.options.selectedClass)) {
            this._onToggleSelect(formElement, UIElement);
        } else {
            this._onToggleDeselect(formElement, UIElement);
        }
    },

    /**
     * When a toggle is selected.
     * @param {HTMLInputElement} formElement - The input element
     * @param {HTMLElement} UIElement - The ui element
     * @private
     */
    _onToggleSelect: function (formElement, UIElement) {
        formElement.checked = true;
        UIElement.kit.classList.add(this.options.selectedClass);
        this._triggerChange(formElement, UIElement);
    },

    /**
     * When a toggle is deselected.
     * @param {HTMLInputElement} formElement - The input element
     * @param {HTMLElement} UIElement - The ui element
     * @private
     */
    _onToggleDeselect: function (formElement, UIElement) {
        formElement.checked = false;
        UIElement.kit.classList.remove(this.options.selectedClass);
        this._triggerChange(formElement, UIElement);
    },

    /**
     * Builds the UI-friendly version of the toggle inputs and wraps them in their appropriate containers.
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
     * Checks whether input is a radio button.
     * @returns {boolean}
     */
    isRadio: function () {
        return this.getFormElements()[0].getAttribute('type') === 'radio';
    },

    /**
     * Triggers a change on the button toggle.
     * @param {HTMLInputElement} formElement - The input element
     * @param {HTMLElement} UIElement - The ui element
     * @private
     */
    _triggerChange: function (formElement, UIElement) {
        if (this.options.onChange) {
            this.options.onChange(formElement.value, formElement, UIElement);
        }
    },

    /**
     * Selects the toggle item.
     * @param {Number} index - The index of the toggle item
     */
    select: function (index) {
        var input = this.getFormElement(index),
            toggle = this.getUIElement(index);
        if (!input.checked) {
            input.checked = true;
            toggle.kit.classList.add(this.options.selectedClass);
            this._triggerChange(input, toggle);
        }

        if (this.isRadio()) {
            this._triggerAll(function (formElement, UIElement, idx) {
                if (!formElement.checked) {
                    // deselect all other toggles if they are radio buttons
                    this.deselect(idx);
                }
            }.bind(this));
        }

    },

    /**
     * Gets the selected value of the button toggle.
     * @returns {Array} Returns the value of the currently selected toggles
     */
    getValue: function () {
        var values = [];
        this.getFormElements().forEach(function (el) {
            if (el.checked) {
                values.push(el.value);
            }
        }, this);
        return values;
    },

    /**
     * Selects the button toggle that matches the supplied value.
     * @param {string|Array} value - The value of the button toggle that should be selected
     */
    setValue: function (value) {
        this.getFormElements().forEach(function (el, idx) {
            if (el.value === value || value.indexOf(el.value) !== -1) {
                this.select(idx);
            } else {
                this.deselect(idx);
            }
        }, this);
    },

    /**
     * De-selects the toggle item.
     * @param {Number} index - The index of the toggle item
     */
    deselect: function (index) {
        var input = this.getFormElement(index),
            toggle = this.getUIElement(index);
        toggle.kit.classList.remove(this.options.selectedClass);
        if (input.checked) {
            input.checked = false;
            this._triggerChange(input, toggle);
        }
    },

    /**
     * Gets the toggle input element by an index.
     * @param {Number} [index] - The index of the toggle input element
     * @returns {HTMLInputElement} Returns the checkbox input element
     */
    getFormElement: function (index) {
        return this.getFormElements()[(index || 0)];
    },

    /**
     * Gets the ui-version of the toggle element.
     * @param {Number} [index] - The index of the toggle element
     * @returns {HTMLElement} Returns the checkbox div element.
     */
    getUIElement: function (index) {
        return this.getUIElements()[(index || 0)];
    },

    /**
     * Deselects all toggles.
     */
    clear: function () {
        this._triggerAll(function (formElement, UIElement, idx) {
            this.deselect(idx);
        }.bind(this));
    },

    /**
     * Enables the button toggle.
     */
    enable: function () {
        this._triggerAll(function (formElement, UIElement) {
            formElement.disabled = false;
            UIElement.kit.classList.remove(this.options.disabledClass);
        }.bind(this));
    },

    /**
     * Disables the button toggle.
     */
    disable: function () {
        this._triggerAll(function (formElement, UIElement) {
            formElement.disabled = true;
            UIElement.kit.classList.add(this.options.disabledClass);
        }.bind(this));
    },

    /**
     * Gets the unique identifier for button toggles.
     * @returns {string}
     */
    getElementKey: function () {
        if (this.isRadio()) {
            return 'buttonToggleRadio';
        } else {
            return 'buttonToggleCheckbox';
        }
    },

    /**
     * Destruction of this class.
     */
    destroy: function () {
        this._triggerAll(function (formElement, UIElement) {
            UIElement.parentNode.replaceChild(formElement, UIElement);
            formElement.addEventListener('click', '_onFormElementClick', this);
        }.bind(this));
        FormElement.prototype.destroy.call(this);
    }

});

module.exports = ButtonToggle;