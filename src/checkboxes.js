'use strict';
import _ from 'underscore';
import FormElementGroup from './form-element-group';
/**
 * A callback function that fires when one of the checkbox elements are selected
 * @callback Checkboxes~onChange
 * @param {string} value - The value of the input element that was changed
 * @param {HTMLInputElement} input - The input element that was changed
 * @param {HTMLElement} UIElement - The container of the input element that was changed
 */

/**
 * Groups input checkbox elements.
 * @class Checkboxes
 * @extends FormElement
 */
class Checkboxes extends FormElementGroup {

    /**
     * Initialization.
     * @param {object} options - Options passed into instance
     * @param {Array|HTMLInputElement} options.checkboxes - The collection of checkbox input elements
     * @param {Checkboxes~onChange} [options.onChange] - A callback function that fires when one of the checkbox elements are selected
     * @param {string} [options.containerClass] - The css class that will be applied to each checkbox item's container
     * @param {string} [options.inputClass] - The css class that will be applied to each checkbox item (input element)
     * @param {string} [options.selectedClass] - The css class that will be applied to a checkbox item (UI-version) when it is selected
     * @param {string} [options.disabledClass] - The css class that will be applied to a checkbox item (UI-version) when it is disabled
     * @param {string|Array} [options.value] - The string matching the name attribute of the checkbox button to have selected initially (or an array of such strings)
     */
    constructor (options) {

        options = _.extend({
            inputs: [],
            onChange: null,
            containerClass: 'ui-checkbox',
            inputClass: 'ui-checkbox-input',
            selectedClass: 'ui-checkbox-selected',
            disabledClass: 'ui-checkbox-disabled',
            value: null
        }, options);

        super(options);
        this.options = options;
    }

    _onFormElementClick (formElement, UIElement) {
        if (!UIElement.classList.contains(this.options.selectedClass)) {
            UIElement.classList.add(this.options.selectedClass);
            formElement.checked = true;
        } else {
            UIElement.classList.remove(this.options.selectedClass);
            formElement.checked = false;
        }
        this.triggerChange(formElement, UIElement);
    }

    /**
     * When a checkbox UI element is clicked.
     * @param {HTMLCheckboxElement} formElement - The checkbox element that was clicked
     * @param {HTMLElement} UIElement - The checkbox UI element that was clicked
     * @private
     */
    _onUIElementClick (formElement, UIElement) {
        if (!UIElement.classList.contains(this.options.selectedClass)) {
            formElement.checked = true;
            UIElement.classList.add(this.options.selectedClass);
        } else {
            formElement.checked = false;
            UIElement.classList.remove(this.options.selectedClass);
        }
        this.triggerChange(formElement, UIElement);
    }

    /**
     * Selects the checkbox item.
     * @param {Number} index - The index of the checkbox item
     */
    select (index) {
        let input = this.getFormElement(index),
            checkbox = this.getUIElement(index);
        if (!input.checked) {
            input.checked = true;
            checkbox.classList.add(this.options.selectedClass);
            this.triggerChange(input, checkbox);
        }
    }

    /**
     * Gets the unique identifier for checkboxes.
     * @returns {string}
     */
    getElementKey () {
        return 'checkboxes';
    }

}

module.exports = Checkboxes;
