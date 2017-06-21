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
 * A callback function that fires when the checkbox is un-checked
 * @callback Checkbox~onChange
 * @param {boolean} value - True if checked, false if not
 * @param {HTMLInputElement} input - The checkbox input element
 * @param {HTMLElement} UIElement - The checkbox element's container
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
     * @param {Checkbox~onChange} [options.onChange] - A callback function that fires when the checkbox value changes
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
        let input = this.getFormElement();

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
        this.addEventListener(this.getUIElement(), 'click', '_onUIElementClick', this, true);
        this.addEventListener(input, 'click', '_onFormElementClick', this);
    }

    /**
     * When the checkbox input element is clicked.
     * @param {Event} e
     * @private
     */
    _onFormElementClick (e) {
        if (e.target === e.currentTarget && !e.target.disabled) {
            if (!this.getUIElement().classList.contains(this.options.checkedClass)) {
                this.check();
            } else {
                this.uncheck();
            }
        }
    }

    /**
     * When the checkbox UI element is clicked.
     * @param {Event} e
     * @private
     */
    _onUIElementClick (e) {
        let input = this.getFormElement();
        // respond to clicks made to the UI element ONLY
        if (!input.disabled && e.target === e.currentTarget && e.target.classList.contains(this.options.containerClass)) {
            // we are preventing default here to ensure default
            // checkbox is not going to be checked since
            // we're updating the checked boolean manually below
            e.preventDefault();
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
        let outerEl = document.createElement('div');
        outerEl.classList.add(this.options.containerClass);
        parent.replaceChild(outerEl, inputEl);
        outerEl.appendChild(inputEl);
        return outerEl;
    }


    /**
     * Checks the checkbox.
     */
    check () {
        let input = this.getFormElement(),
            container = this.getUIElement();
        if (!input.checked) {
            input.checked = true;
        }
        container.classList.add(this.options.checkedClass);
        let value = this.getValue();
        if (this.options.onChecked) {
            this.options.onChecked(value, input, container);
        }
        if (this.options.onChange) {
            this.options.onChange(true, input, container);
        }
    }

    /**
     * Un-checks the checkbox.
     */
    uncheck () {
        let input = this.getFormElement(),
            container = this.getUIElement();
        if (input.checked) {
            input.checked = false;
        }
        container.classList.remove(this.options.checkedClass);
        if (this.options.onUnchecked) {
            this.options.onUnchecked('', input, container);
        }
        if (this.options.onChange) {
            this.options.onChange(false, input, container);
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
     * @returns {string} Returns the checkbox value attribute
     */
    getValue () {
        let formEl = this.getFormElement();
        if (formEl.checked) {
            return formEl.value;
        } else {
            return '';
        }
    }

    /**
     * Sets the checkbox value attribute.
     * @param {string} value
     */
    setValue (value) {
        this.getFormElement().value = value;
    }

    /**
     * Destruction of this class.
     */
    destroy () {
        let container = this.getUIElement(),
            input = this.getFormElement();

        this.removeEventListener(container, 'click', '_onUIElementClick', this, true);
        this.removeEventListener(input, 'click', '_onFormElementClick', this);

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
