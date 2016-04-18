'use strict';
import _ from 'underscore';
import FormElementGroup from './form-element-group';
/**
 * A callback function that fires when one of the radio button elements are selected
 * @callback Radios~onChange
 * @param {string} value - The value of the input element that was changed
 * @param {HTMLInputElement} input - The input element that was changed
 * @param {HTMLElement} UIElement - The container of the input element that was changed
 */

/**
 * Groups radio buttons elements.
 * @class Radios
 * @extends FormElement
 */
class Radios extends FormElementGroup {

    /**
     * Initialization.
     * @param {object} options - Options passed into instance
     * @param {Array|HTMLInputElement} options.inputs - The collection of radio input elements
     * @param {Radios~onChange} [options.onChange] - A callback function that fires when one of the toggle elements are selected
     * @param {string} [options.containerClass] - The css class that will be applied to each toggle item's container
     * @param {string} [options.inputClass] - The css class that will be applied to each toggle item (input element)
     * @param {string} [options.selectedClass] - The css class that will be applied to a radio button item (UI-version) when it is selected
     * @param {string} [options.disabledClass] - The css class that will be applied to a radio button item (UI-version) when it is disabled
     * @param {string|Array} [options.value] - The string matching the name attribute of the toggle button to have selected initially (or an array of such strings)
     */
    constructor (options) {

        options = _.extend({
            inputs: [],
            onChange: null,
            containerClass: 'ui-radio',
            inputClass: 'ui-radio-input',
            selectedClass: 'ui-radio-selected',
            disabledClass: 'ui-radio-disabled',
            value: null
        }, options);

        super(options);
        this.options = options;
    }


    /**
     * When one of the radio input elements are clicked.
     * @param {HTMLInputElement} formElement - The radio button element
     * @param {HTMLElement} UIElement - The ui element
     * @private
     */
    _onFormElementClick (formElement, UIElement) {
        // radio buttons should only trigger a change if the clicked item isnt already selected
        if (this._lastRadioClicked !== formElement) {
            this.triggerAll(function (formElement, UIElement) {
                UIElement.classList.remove(this.options.selectedClass);
                formElement.checked = false;
            }.bind(this));
            formElement.checked = true;
            UIElement.classList.add(this.options.selectedClass);
            this.triggerChange(formElement, UIElement);
            this._lastRadioClicked = formElement;
        }
    }

    /**
     * When one of the radio UI elements are clicked.
     * @param {HTMLInputElement} formElement - The radio button element
     * @param {HTMLElement} UIElement - The ui element
     * @private
     */
    _onUIElementClick (formElement, UIElement) {
        this._onFormElementClick(formElement, UIElement);
    }

    /**
     * Selects the toggle item.
     * @param {Number} index - The index of the toggle item
     */
    select (index) {
        var input = this.getFormElement(index),
            toggle = this.getUIElement(index);
        if (!input.checked) {
            input.checked = true;
            toggle.classList.add(this.options.selectedClass);
            this.triggerChange(input, toggle);
        }

        this.triggerAll(function (formElement, UIElement, idx) {
            if (!formElement.checked) {
                // deselect all other toggles if they are radio buttons
                this.deselect(idx);
            }
        }.bind(this));
    }

    /**
     * Gets the unique identifier for radio buttons.
     * @returns {string}
     */
    getElementKey () {
        return 'radios';
    }

}

module.exports = Radios;
