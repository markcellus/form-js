'use strict';
import _ from 'underscore';
import FormElement from './form-element';

/**
 * A callback function that fires when the checkbox is checked
 * @callback Checkbox~onChecked
 * @param {string} value - The input element's value
 * @param {HTMLInputElement} input - The input element
 * @param {HTMLElement} UIElement - The input element's container
 */

/**
 * A callback function that fires when the checkbox is un-checked
 * @callback Checkbox~onUnchecked
 * @param {string} value - The input element's value
 * @param {HTMLInputElement} input - The input element
 * @param {HTMLElement} UIElement - The input element's container
 */

/**
 * Adds JS functionality to an input checkbox.
 * @class Checkbox
 * @extends FormElement
 */
class Checkbox extends FormElement {

    /**
     * Initialization.
     * @param {object} options - Options passed into instantiation.
     * @param {HTMLInputElement} options.el - The input element checkbox
     * @param {Checkbox~onChecked} [options.onChecked] - A callback function that fires when the checkbox is checked
     * @param {Checkbox~onUnchecked} [options.onUnchecked] - A callback function that fires when the checkbox is un-checked
     * @param {string} [options.containerClass] - The css class that will be applied to the UI-version of the checkbox
     * @param {string} [options.inputClass] - The css class that will be applied to the form version of the checkbox
     * @param {string} [options.checkedClass] - The css class that will be applied to the checkbox (UI-version) when it is checked
     * @param {string} [options.disabledClass] - The css class that will be applied to the checkbox (UI-version) when it is disabled
     * @param {boolean} [options.value] - The initial checked value to set
     */
    constructor (options) {

        options = _.extend({
            el: null,
            onChecked: null,
            onUnchecked: null,
            containerClass: 'ui-checkbox',
            inputClass: 'ui-checkbox-input',
            checkedClass: 'ui-checkbox-checked',
            disabledClass: 'ui-checkbox-disabled',
            value: null
        }, options);

        super(options);


        if (options.el.tagName.toLowerCase() !== 'input') {
            console.warn('checkbox error: element passed in instantiation was not an input element');
        }

        this.el = options.el;
        this.options = options;

        this.setup();

    }

    /**
     * Sets up html.
     */
    setup () {
        var input = this.getFormElement();

        input.classList.add(this.options.inputClass);

        this._container = this._buildUIElement(this.el);

        // if input element is already checked initially, check it!
        this.isInitChecked = this.options.value || input.checked;

        if (this.isInitChecked) {
            this.check();
        }

        this.isInitDisabled = input.disabled;
        if (this.isInitDisabled) {
            this._container.classList.add(this.options.disabledClass);
        }

        // setup events
        this.addEventListener(this.getUIElement(), 'click', '_onClick', this);
    }

    /**
     * When the checkbox element is clicked.
     * @private
     */
    _onClick () {
        var input = this.getFormElement();
        if (!input.disabled) {
            if (!this.getUIElement().classList.contains(this.options.checkedClass)) {
                this.check();
            } else {
                this.uncheck();
            }
        }
    }

    /**
     * Wraps the checkbox in a UI-friendly container div.
     * @param {HTMLInputElement} inputEl - The input element
     * @returns {HTMLElement} Returns the input element wrapped in a new container
     * @private
     */
    _buildUIElement (inputEl) {
        let parent = inputEl.parentNode;
        var outerEl = document.createElement('div');
        outerEl.classList.add(this.options.containerClass);
        parent.replaceChild(outerEl, inputEl);
        outerEl.appendChild(inputEl);
        return outerEl;
    }


    /**
     * Checks the checkbox.
     */
    check () {
        var input = this.getFormElement(),
            container = this.getUIElement();
        if (!input.checked) {
            input.checked = true;
        }
        container.classList.add(this.options.checkedClass);
        if (this.options.onChecked) {
            this.options.onChecked(input.value, input, container);
        }
    }

    /**
     * Un-checks the checkbox.
     */
    uncheck () {
        var input = this.getFormElement(),
            container = this.getUIElement();
        if (input.checked) {
            input.checked = false;
        }
        container.classList.remove(this.options.checkedClass);
        if (this.options.onUnchecked) {
            this.options.onUnchecked(input.value, input, container);
        }
    }

    /**
     * Enables the checkbox.
     */
    enable () {
        this.getFormElement().disabled = false;
        this.getUIElement().classList.remove(this.options.disabledClass);
    }

    /**
     * Disables the checkbox.
     */
    disable () {
        this.getFormElement().disabled = true;
        this.getUIElement().classList.add(this.options.disabledClass);
    }

    /**
     * Gets the checkbox input element.
     * @returns {HTMLInputElement} Returns the checkbox input element
     */
    getFormElement () {
        return this.el;
    }

    /**
     * Gets the checkbox div element.
     * @returns {HTMLElement} Returns the checkbox div element.
     */
    getUIElement () {
        return this._container;
    }

    /**
     * Gets the unique identifier for checkboxes.
     * @returns {string}
     */
    getElementKey () {
        return 'checkbox';
    }

    /**
     * Unselects the checkbox if its selected.
     */
    clear () {
        this.uncheck();
    }

    /**
     * Returns whether the checkbox is checked or not
     * @returns {boolean} Returns a truthy value if checkbox is checked, falsy if not
     */
    getValue () {
        return this.getFormElement().checked;
    }

    /**
     * Checks the checkbox if a truthy value is passed.
     * @param {string|boolean} value
     */
    setValue (value) {
        // check it if the value is truthy
        value = value ? true : false;
        this.getFormElement().checked = value;
    }

    /**
     * Destruction of this class.
     */
    destroy () {
        var container = this.getUIElement(),
            input = this.getFormElement();

        this.removeEventListener(container, 'click', '_onClick', this);

        // remove stray html
        container.parentNode.replaceChild(input, container);

        if (this.isInitChecked) {
            input.checked = true;
        }
        if (this.isInitDisabled) {
            input.disabled = true;
        }
        super.destroy();
    }

}

module.exports = Checkbox;
