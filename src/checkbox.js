define([
    'underscore',
    './form-element',
    'element-kit'
], function (
    _,
    FormElement
) {
    "use strict";

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
     * @param {object} options - Options to pass
     * @param {HTMLInputElement} options.el - The input element checkbox
     * @param {Checkbox~onChecked} [options.onChecked] - A callback function that fires when the checkbox is checked
     * @param {Checkbox~onUnchecked} [options.onUnchecked] - A callback function that fires when the checkbox is un-checked
     * @param {string} [options.containerClass] - The css class that will be applied to the UI-version of the checkbox
     * @param {string} [options.inputClass] - The css class that will be applied to the form version of the checkbox
     * @param {string} [options.checkedClass] - The css class that will be applied to the checkbox (UI-version) when it is checked
     * @param {string} [options.disabledClass] - The css class that will be applied to the checkbox (UI-version) when it is disabled
     */
    var Checkbox = function (options) {
        this.initialize(options);
    };

    Checkbox.prototype = _.extend({}, FormElement.prototype, /** @lends Checkbox.prototype */{

        /**
         * Initialization.
         * @param {object} options - Options passed into instantiation.
         */
        initialize: function (options) {

            this.options = _.extend({
                el: null,
                onChecked: null,
                onUnchecked: null,
                containerClass: 'ui-checkbox',
                inputClass: 'ui-checkbox-input',
                checkedClass: 'ui-checkbox-checked',
                disabledClass: 'ui-checkbox-disabled'
            }, options);

            this.el = this.options.el;

            if (this.el.tagName.toLowerCase() !== 'input') {
                console.warn('checkbox error: element passed in instantiation was not an input element');
            }

            FormElement.prototype.initialize.call(this, this.options);

            this.setup();

        },

        /**
         * Sets up html.
         */
        setup: function () {
            var input = this.getFormElement();

            input.kit.classList.add(this.options.inputClass);

            this._container = this._buildUIElement(this.el);

            // if input element is already checked initially, check it!
            this.isInitChecked = input.checked;
            if (this.isInitChecked) {
                this._container.kit.classList.add(this.options.checkedClass);
            }

            this.isInitDisabled = input.disabled;
            if (this.isInitDisabled) {
                this._container.kit.classList.add(this.options.disabledClass);
            }

            // setup events
            this.getUIElement().kit.addEventListener('click', '_onClick', this);
        },

        /**
         * When the checkbox element is clicked.
         * @private
         */
        _onClick: function () {
            var input = this.getFormElement();
            if (!input.disabled) {
                if (!this.getUIElement().kit.classList.contains(this.options.checkedClass)) {
                    this.check();
                } else {
                    this.uncheck();
                }
            }
        },

        /**
         * Builds the checkbox UI-friendly version.
         * @param {HTMLInputElement} inputEl - The input element
         * @returns {HTMLElement} Returns the input element wrapped in a new container
         * @private
         */
        _buildUIElement: function (inputEl) {
            return inputEl.kit.appendOuterHtml('<div class="' + this.options.containerClass + '"></div>');
        },


        /**
         * Checks the checkbox.
         */
        check: function () {
            var input = this.getFormElement(),
                container = this.getUIElement();
            if (!input.checked) {
                input.checked = true;
            }
            container.kit.classList.add(this.options.checkedClass);
            if (this.options.onChecked) {
                this.options.onChecked(input.value, input, container);
            }
        },

        /**
         * Un-checks the checkbox.
         */
        uncheck: function () {
            var input = this.getFormElement(),
                container = this.getUIElement();
            if (input.checked) {
                input.checked = false;
            }
            container.kit.classList.remove(this.options.checkedClass);
            if (this.options.onUnchecked) {
                this.options.onUnchecked(input.value, input, container);
            }
        },

        /**
         * Enables the checkbox.
         */
        enable: function () {
            this.getFormElement().disabled = false;
            this.getUIElement().kit.classList.remove(this.options.disabledClass);
        },

        /**
         * Disables the checkbox.
         */
        disable: function () {
            this.getFormElement().disabled = true;
            this.getUIElement().kit.classList.add(this.options.disabledClass);
        },

        /**
         * Gets the checkbox input element.
         * @returns {HTMLInputElement} Returns the checkbox input element
         */
        getFormElement: function () {
            return this.el;
        },

        /**
         * Gets the checkbox div element.
         * @returns {HTMLElement} Returns the checkbox div element.
         */
        getUIElement: function () {
            return this._container;
        },

        /**
         * Gets the unique identifier for checkboxes.
         * @returns {string}
         */
        getElementKey: function () {
            return 'checkbox';
        },

        /**
         * Destruction of this class.
         */
        destroy: function () {
            var container = this.getUIElement(),
                input = this.getFormElement();

            // remove event listener
            container.kit.removeEventListener('click', '_onClick', this);

            // remove stray html
            container.parentNode.replaceChild(input, container);

            if (this.isInitChecked) {
                input.checked = true;
            }
            if (this.isInitDisabled) {
                input.disabled = true;
            }
            FormElement.prototype.destroy.call(this);
        }

    });

    return Checkbox;
});