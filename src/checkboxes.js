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
 * A callback function that fires when one of the checkbox elements are selected
 * @callback Checkboxes~onSelect
 * @param {string} value - The value of the input element that was selected
 * @param {HTMLInputElement} input - The input element that was selected
 * @param {HTMLElement} UIElement - The container of the input element that was selected
 */

/**
 * A callback function that fires when one of the checkbox elements are de-selected
 * @callback Checkboxes~onDeselect
 * @param {string} value - The value of the input element that was de-selected
 * @param {HTMLInputElement} input - The input element that was de-selected
 * @param {HTMLElement} UIElement - The container of the input element that was de-selected
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
     * @param {Checkboxes~onSelect} [options.onSelect] - A callback function that fires when the checkbox element is selected
     * @param {Checkboxes~onDeselect} [options.onDeselect] - A callback function that fires when the checkbox element is deselected
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

    /**
     * When a checkbox is clicked that is a checkbox input element.
     * @param {HTMLInputElement} formElement - The checkbox element
     * @param {HTMLElement} UIElement - The ui element
     * @private
     */
    _processClick (formElement, UIElement) {
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
        var input = this.getFormElement(index),
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
