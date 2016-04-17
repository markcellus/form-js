'use strict';
import _ from 'underscore';
import FormElement from './form-element';

/**
 * The function that fires when the input value changes
 * @callback InputField~onChange
 * @param {string} value - The new value of the input element
 * @param {HTMLInputElement} input - The input element
 * @param {HTMLElement} UIElement - The container of the input element
 * @param {Event} event - The event
 */

/**
 * The function that is triggered when the input field has changed after a key has been pressed down
 * NOTE: This function can fire rapidly as a user types!
 * @callback InputField~onKeyDownChange
 * @param {HTMLInputElement} input - The updated input element
 * @param {HTMLElement} UIElement - The updated container of the input element
 * @param {Event} event - The event
 */

/**
 * Adds useful logic to an input field.
 * @class InputField
 * @extends FormElement
 */
class InputField extends FormElement {

    /**
     * Initializes the Input Field class.
     * @param {object} options - Options passed into instance
     * @param {HTMLInputElement} options.el - The input field element
     * @param {InputField~onChange} [options.onChange] - A callback function that fires when the input value changes
     * @param {InputField~onKeyDownChange} [options.onKeyDownChange] - A callback function that fires when input has changed after key down press
     * @param {string} [options.containerClass] - The css class that will be applied to the container that is wrapped around the input field
     * @param {string} [options.inputClass] - The css class that will be applied to the the input field element
     * @param {string} [options.disabledClass] - The css class that will be applied to the input field container element when disabled
     * @param {string} [options.activeClass] - The css class that will be applied to the input field container element when in focus
     * @param {string} [options.value] - An initial value to set the input field to
     */
    constructor (options) {

        options = _.extend({
            el: null,
            onChange: null,
            onKeyDownChange: null,
            containerClass: 'ui-input-text',
            inputClass: 'ui-input-text-input',
            disabledClass: 'ui-input-text-disabled',
            activeClass: 'ui-input-text-active',
            value: null
        }, options);

        super(options);
        this.options = options;
        this.setup();
    }

    /**
     * Sets up events for showing/hiding tooltip.
     */
    setup () {
        var input = this.options.el,
            optionsValue = this.options.value || input.value;

        // add internal class if doesnt already exist
        input.classList.add(this.options.inputClass);

        this._container = this._buildUIElement(input);
        this._inputEl = this._container.getElementsByClassName(this.options.inputClass)[0];

        if (input.value !== optionsValue) {
            input.value = optionsValue;
        }

        this.origInputValue = optionsValue;
        this.isInitDisabled = input.disabled;


        // handle disabled state
        if (this.isInitDisabled) {
            this._container.classList.add(this.options.disabledClass);
        }

        this._bindEvents();

    }

    /**
     * Sets up events.
     * @private
     */
    _bindEvents () {
        var input = this.getFormElement();
        this.addEventListener(input, 'focus', '_onInputFocus', this);
        this.addEventListener(input, 'blur', '_onInputBlur', this);
        this.addEventListener(input, 'change', '_onInputValueChange', this);
        this.addEventListener(input, 'keydown', '_onInputKeyDown', this);
    }

    /**
     * Destroys events.
     * @private
     */
    _unbindEvents () {
        var input = this.getFormElement();
        this.removeEventListener(input, 'focus', '_onInputFocus', this);
        this.removeEventListener(input, 'blur', '_onInputBlur', this);
        this.removeEventListener(input, 'change', '_onInputValueChange', this);
        this.removeEventListener(input, 'keydown', '_onInputKeyDown', this);
    }

    /**
     * When a key is pressed down while inside the input field.
     * @param {Event} e
     * @private
     */
    _onInputKeyDown (e) {
        if (this.keyDownTimeoutId) {
            clearTimeout(this.keyDownTimeoutId);
        }
        // to ensure we have the most up-to-date the input field value,
        // we must defer the update evaluation until after 1 millisecond
        this.keyDownTimeoutId = setTimeout(this._triggerKeyDownChange.bind(this, e), 1);
    }

    /**
     * Triggers a change event.
     * @param e
     * @private
     */
    _triggerKeyDownChange (e) {
        if (this.options.onKeyDownChange) {
            this.options.onKeyDownChange(this.getFormElement(), this.getUIElement(), e);
        }
    }

    /**
     * Sets the value of the input field.
     * @param {string} value - The new input field value
     */
    setValue (value) {
        var input = this.getFormElement(),
            currentVal = input.value;
        if (value !== currentVal) {
            input.value = value;
            this._triggerChange();
        }
    }

    /**
     * Gets the current input field value.
     * @returns {string} Returns current value
     */
    getValue () {
        return this.getFormElement().value;
    }

    /**
     * Builds the UI-friendly version of input field by wrapping it inside of a container.
     * @param {HTMLInputElement} inputEl - The input element
     * @returns {HTMLElement} Returns the newly-created container element with the nested input element
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
     * When the input gains focus.
     * @private
     */
    _onInputFocus () {
        this.getUIElement().classList.add(this.options.activeClass);
    }

    /**
     * When the input loses focus.
     * @private
     */
    _onInputBlur () {
        this.getUIElement().classList.remove(this.options.activeClass);
    }

    /**
     * Triggers a value change.
     * @private
     */
    _triggerChange (e) {
        var args = [this.getValue(), this.getFormElement(), this.getUIElement()];
        if (e) {
            args.push(e);
        }
        if (this.options.onChange) {
            this.options.onChange.apply(this, args);
        }
    }

    /**
     * When the input value changes.
     * @param {Event} e - The event that was triggered
     * @private
     */
    _onInputValueChange (e) {
        this._triggerChange(e);
    }

    /**
     * Gets the input field element.
     * @returns {HTMLInputElement} Returns the input field element
     */
    getFormElement () {
        return this._inputEl;
    }

    /**
     * Gets the input field div element.
     * @returns {HTMLElement} Returns the checkbox div element.
     */
    getUIElement () {
        return this._container;
    }

    /**
     * Enables the button toggle.
     */
    enable () {
        this.getFormElement().removeAttribute('disabled');
        this.getUIElement().classList.remove(this.options.disabledClass);
    }

    /**
     * Disables the button toggle.
     */
    disable () {
        this.getFormElement().setAttribute('disabled', 'true');
        this.getUIElement().classList.add(this.options.disabledClass);
    }

    /**
     * Sets the input to nothing.
     */
    clear () {
        this.setValue('');
    }

    /**
     * Gets the unique identifier for input fields.
     * @returns {string}
     */
    getElementKey () {
        return 'inputText';
    }

    /**
     * Destruction of this class.
     */
    destroy () {
        var container = this.getUIElement(),
            input = this.getFormElement();

        this._unbindEvents();

        container.parentNode.replaceChild(input, container);

        if (this.isInitDisabled) {
            input.setAttribute('disabled', 'true');
        }
        // set original value back
        this.setValue(this.origInputValue);

        super.destroy();
    }

}

module.exports = InputField;
