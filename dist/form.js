/** 
* FormJS - v0.1.5.
* https://github.com/mkay581/formjs.git
* Copyright 2014. Licensed MIT.
*/
(function (factory) {
    'use strict';
    // support both AMD and non-AMD
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'element-kit'], function (_) {
            return factory(_);
        });
    } else {
        factory(window._);
    }
})((function (_) {
    'use strict';

    function getIEVersion() {
        if (navigator.appName == 'Microsoft Internet Explorer') {
            //Create a user agent var
            var ua = navigator.userAgent;
            //Write a new regEx to find the version number
            var re = new RegExp('MSIE ([0-9]{1,}[.0-9]{0,})');
            //If the regEx through the userAgent is not null
            if (re.exec(ua) != null) {
                //Set the IE version
                return parseInt(RegExp.$1);
            }
        } else {
            return false;
        }
    }

    /**
     * @class FormElement
     * @description An extendable base class that provides common functionality among all form elements.
     * @param {Object} options - Instantiation options
     */
    var FormElement = function (options) {
        this.initialize(options);
    };

    FormElement.prototype = /** @lends FormElement.prototype */{

        /**
         * Sets up stuff.
         * @abstract
         */
        initialize: function (options) {},

        /**
         * Gets the form element.
         * @returns {HTMLElement} Returns the form element
         * @abstract
         */
        getFormElement: function () {
            return this.el;
        },

        /**
         * Gets the ui version of the form element.
         * @returns {HTMLElement} Returns the ui-version of the element.
         * @abstract
         */
        getUIElement: function () {
            return this.getFormElement();
        },

        /**
         * Gets the form elements.
         * @returns {Array} Returns the array of form elements
         * @abstract
         */
        getFormElements: function () {
            return [this.getFormElement()];
        },

        /**
         * Gets the current value of the element.
         * @returns {string}
         */
        getValue: function () {
            return this.getFormElement().value;
        },

        /**
         * Gets the ui versions of the form elements.
         * @returns {Array} Returns the array of ui-versions of the element.
         * @abstract
         */
        getUIElements: function () {
            return [this.getUIElement()];
        },

        /**
         * Enables the form element.
         * @abstract
         */
        enable: function () {
            this.getFormElement().disabled = false;
        },

        /**
         * Disables the form element.
         * @abstract
         */
        disable: function () {
            this.getFormElement().disabled = true;
        },

        /**
         * Gets the element's identifier (preferably unique from all other elements that extend this class).
         * @returns {string} Return the unique key
         * @abstract
         */
        getElementKey: function () {
            return 'element';
        },

        /**
         * Destruction of this class.
         * @abstract
         */
        destroy: function () {}

    };

    /**
     * The function that fires when the input value changes
     * @callback Form~onValueChange
     * @param {Event} event - The event that fired the change
     */

    /**
     * Utility class for form elements.
     * @class Form
     * @param {object} options - The options
     * @param {HTMLInputElement} options.el - The input field element
     * @param {Form~onValueChange} [options.onValueChange] - A callback function that fires when the input value changes
     */
    var Form = function (options) {
        this.options = options;
        this._setupEvents();
    };

    Form.prototype = /** @lends Form */{

        /**
         * Sets up change events.
         * @private
         */
        _setupEvents: function () {
            var i;
            this.eventEls = this.options.el.elements;
            for (i = 0; i < this.eventEls.length; i++) {
                this.eventEls[i].kit.addEventListener('change', '_onValueChange', this);
            }
        },

        /**
         * When any form element's value changes.
         * @param {Event} e
         * @private
         */
        _onValueChange: function (e) {
            if (this.options.onValueChange) {
                this.options.onValueChange(e);
            }
        },

        /**
         * Disables all form elements.
         */
        disable: function () {
            this.setPropertyAll('disabled', true);
        },

        /**
         * Enables all form elements.
         */
        enable: function () {
            this.setPropertyAll('disabled', false);
        },

        /**
         * Sets a property on all form elements.
         * @param {string} prop - The property to change
         * @param {*} value - The value to set
         */
        setPropertyAll: function (prop, value) {
            var i,
                els = this.options.el.elements;
            for (i = 0; i < els.length; i++) {
                els[i][prop] = value;
            }
        },

        /**
         * Gets an object that maps all fields to their current name/value pairs.
         * @returns {Array} Returns an array of objects
         */
        getCurrentValues: function () {
            var map = [],
                fields = this.options.el.querySelectorAll('[name]'),
                fieldCount = fields.length,
                i,
                field,
                obj;
            for (i = 0; i < fieldCount; i++) {
                field = fields[i];
                // only add fields with a name attribute
                if (field.name) {
                    obj = {
                        name: field.name,
                        // fallback to value attribute when .value can't be trusted (i.e. input[type=date])
                        value: field.value
                        //value: field.value || field.getAttribute('value')
                    };
                    map.push(obj);
                }
            }
            return map;
        },

        /**
         * Kills form functionality.
         */
        destroy: function () {
            var i;
            for (i = 0; i < this.eventEls.length; i++) {
                this.eventEls[i].kit.removeEventListener('change', '_onValueChange', this);
            }
        }
    };

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
     * @param {Array|HTMLInputElement} options.inputs - The collection of input elements to be made into toggle items
     * @param {ButtonToggle~onChange} [options.onChange] - A callback function that fires when one of the toggle elements are selected
     * @param {string} [options.containerClass] - The css class that will be applied to each toggle item's container
     * @param {string} [options.inputClass] - The css class that will be applied to each toggle item (input element)
     * @param {ButtonToggle~onSelect} [options.onSelect] - A callback function that fires when the button toggle element is selected
     * @param {ButtonToggle~onDeselect} [options.onDeselect] - A callback function that fires when the button toggle element is deselected
     * @param {string} [options.selectedClass] - The css class that will be applied to a button toggle item (UI-version) when it is selected
     * @param {string} [options.disabledClass] - The css class that will be applied to a button toggle item (UI-version) when it is disabled
     */
    var ButtonToggle = function (options) {
        this.initialize(options);
    };

    ButtonToggle.prototype = _.extend({}, FormElement.prototype, /** @lends ButtonToggle.prototype */{

        /**
         * Initialization.
         * @param {object} options - Options passed into instance
         */
        initialize: function (options) {

            this.options = _.extend({
                inputs: [],
                onChange: null,
                containerClass: 'ui-button-toggle',
                inputClass: 'ui-button-toggle-input',
                selectedClass: 'ui-button-toggle-selected',
                disabledClass: 'ui-button-toggle-disabled'
            }, options);

            FormElement.prototype.initialize.call(this, this.options);

            this._container = this.options.container;

            if (!this.options.inputs.length && this._container) {
                this.options.inputs = this._container.querySelectorAll('input');
            }

            if (!this.options.inputs.length) {
                console.error('could not build toggle items: no toggle input items were passed');
            } else {
                this._formElements = Array.prototype.slice.call(this.options.inputs); // convert to real array if HTMLCollection
                this._UIElements = this._buildUIElements(this._formElements);
            }

            this.setup();

        },

        /**
         * Sets up html.
         */
        setup: function () {
            // add initial class
            this._triggerAll(function (formElement) {
                formElement.kit.classList.add(this.options.inputClass);
            }.bind(this));
            this._setupEvents();
        },

        /**
         * Sets up events.
         * @private
         */
        _setupEvents: function () {
            this._triggerAll(function (formElement, UIElement) {
                formElement.kit.addEventListener('click', '_onFormElementClick', this);
            }.bind(this));
        },

        /**
         * Gets all the current input toggles.
         * @returns {Array|*}
         */
        getFormElements: function () {
            return this._formElements;
        },

        /**
         * Gets all current ui-versions of input toggles.
         * @returns {Array|*}
         */
        getUIElements: function () {
            return this._UIElements;
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
         * @returns {string} Returns the value of the currently selected toggle
         */
        getValue: function () {
            var selectedEl = this.getFormElements().filter(function (el) {
                return el.checked;
            }, this);
            if (selectedEl.length) {
                return selectedEl[0].value;
            } else {
                return '';
            }
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
     * @param {string} value - The new value of the input element
     * @param {HTMLInputElement} input - The input element
     * @param {HTMLElement} UIElement - The container of the input element
     * @param {Event} event - The event
     */

    /**
     * Adds useful logic to an input field.
     * @class InputField
     * @extends FormElement
     * @param {HTMLInputElement} options.el - The input field element
     * @param {InputField~onChange} [options.onChange] - A callback function that fires when the input value changes
     * @param {InputField~onKeyDownChange} [options.onKeyDownChange] - A callback function that fires when input has changed after key down press
     * @param {string} [options.containerClass] - The css class that will be applied to the container that is wrapped around the input field
     * @param {string} [options.inputClass] - The css class that will be applied to the the input field element
     * @param {string} [options.disabledClass] - The css class that will be applied to the input field container element when disabled
     * @param {string} [options.activeClass] - The css class that will be applied to the input field container element when in focus
     * @param {string} [options.placeholderClass] - The css class that is added when the placeholder text shows (removed when hidden)
     */
    var InputField = function (options) {
        this.initialize(options);
    };

    InputField.prototype = _.extend({}, FormElement.prototype, /** @lends InputField */{

        /**
         * Initializes the Input Field class.
         * @param {object} options - Options passed into instance
         */
        initialize: function (options) {

            this.options = _.extend({
                el: null,
                onChange: null,
                onKeyDownChange: null,
                containerClass: 'ui-input-text',
                inputClass: 'ui-input-text-input',
                disabledClass: 'ui-input-text-disabled',
                activeClass: 'ui-input-text-active',
                placeholderClass: 'ui-input-text-placeholder'
            }, options);

            FormElement.prototype.initialize.call(this, this.options);

            this.setup();

        },

        /**
         * Sets up events for showing/hiding tooltip.
         */
        setup: function () {
            var input = this.options.el;

            // add internal class if doesnt already exist
            input.kit.classList.add(this.options.inputClass);

            this._container = this._buildUIElement(input);
            this._inputEl = this._container.getElementsByClassName(this.options.inputClass)[0];

            this.origInputValue = input.value;
            this.isInitDisabled = input.disabled;


            // handle disabled state
            if (this.isInitDisabled) {
                this._container.kit.classList.add(this.options.disabledClass);
            }

            this._bindEvents();

            // setup placeholder text
            if (!this.origInputValue) {
                this.showPlaceholder();
            }

        },

        /**
         * Sets up events.
         * @private
         */
        _bindEvents: function () {
            var input = this.getFormElement();
            input.kit.addEventListener('focus', '_onInputFocus', this);
            input.kit.addEventListener('blur', '_onInputBlur', this);
            input.kit.addEventListener('change', '_onInputValueChange', this);
            input.kit.addEventListener('keydown', '_onInputKeyDown', this);
        },

        /**
         * Destroys events.
         * @private
         */
        _unbindEvents: function () {
            var input = this.getFormElement();
            input.kit.removeEventListener('focus', '_onInputFocus', this);
            input.kit.removeEventListener('blur', '_onInputBlur', this);
            input.kit.removeEventListener('change', '_onInputValueChange', this);
            input.kit.removeEventListener('keydown', '_onInputKeyDown', this);
        },

        /**
         * When a key is pressed down while inside the input field.
         * @param {Event} e
         * @private
         */
        _onInputKeyDown: function (e) {
            if (this.keyDownTimeoutId) {
                clearTimeout(this.keyDownTimeoutId);
            }
            // to ensure we have the most up-to-date the input field value,
            // we must defer the update evaluation until after 1 millisecond
            this.keyDownTimeoutId = setTimeout(this._triggerKeyDownChange.bind(this, e), 1);
        },

        /**
         * Triggers a change event.
         * @param e
         * @private
         */
        _triggerKeyDownChange: function (e) {
            if (this.options.onKeyDownChange) {
                this.options.onKeyDownChange(this.getValue(), this.getFormElement(), this.getUIElement(), e);
            }
        },

        /**
         * Checks whether placeholder attribute are supported by the browser.
         * @returns {boolean} Returns true if browser supports it
         */
        isPlaceholderSupported: function () {
            var version = getIEVersion();
            return !version || (version !== 8 && version !== 9);
        },

        /**
         * Shows placeholder text.
         */
        showPlaceholder: function () {
            if (!this.isPlaceholderSupported()) {
                this.getFormElement().value = this.getPlaceholder();
                this.getUIElement().kit.classList.add(this.options.placeholderClass);
            }
        },

        /**
         * Sets the value of the input field.
         * @param {string} value - The new input field value
         */
        setValue: function (value) {
            var input = this.getFormElement(),
                currentVal = input.value;
            if (value !== currentVal && value !== this.getPlaceholder()) {
                this.getFormElement().value = value;
                this._triggerChange();
            }
        },

        /**
         * Gets the current input field value.
         * @returns {string} Returns current value
         */
        getValue: function () {
            return this.getFormElement().value;
        },

        /**
         * Clears placeholder text.
         */
        clearPlaceholder: function () {
            if (!this.isPlaceholderSupported()) {
                this.getFormElement().value = '';
                this.getUIElement().kit.classList.remove(this.options.placeholderClass);
            }
        },

        /**
         * Builds the UI-friendly version of input field by wrapping it inside of a container.
         * @param {HTMLInputElement} inputEl - The input element
         * @returns {HTMLElement} Returns the input element wrapped in its container
         * @private
         */
        _buildUIElement: function (inputEl) {
            return inputEl.kit.appendOuterHtml('<div class="' + this.options.containerClass + '"></div>');
        },

        /**
         * Gets the current placeholder text.
         * @returns {string}
         */
        getPlaceholder: function () {
            var value = this.getFormElement().getAttribute('placeholder');
            // silly IE returns "null" for inputs that dont have a placeholder attribute
            if (value === null) {
                value = '';
            }
            return value;
        },

        /**
         * When the input gains focus.
         * @private
         */
        _onInputFocus: function () {
            if (this.getValue() === this.getPlaceholder()) {
                this.clearPlaceholder();
            }
            this.getUIElement().kit.classList.add(this.options.activeClass);
        },

        /**
         * When the input loses focus.
         * @private
         */
        _onInputBlur: function () {
            if (!this.getValue()) {
                this.showPlaceholder();
            }
            this.getUIElement().kit.classList.remove(this.options.activeClass);
        },

        /**
         * Triggers a value change.
         * @private
         */
        _triggerChange: function (e) {
            var args = [this.getValue(), this.getFormElement(), this.getUIElement()];
            if (e) {
                args.push(e);
            }
            if (this.options.onChange) {
                this.options.onChange.apply(this, args);
            }
        },

        /**
         * When the input value changes.
         * @param {Event} e - The event that was triggered
         * @private
         */
        _onInputValueChange: function (e) {
            this._triggerChange(e);
        },

        /**
         * Gets the input field element.
         * @returns {HTMLInputElement} Returns the input field element
         */
        getFormElement: function () {
            return this._inputEl;
        },

        /**
         * Gets the input field div element.
         * @returns {HTMLElement} Returns the checkbox div element.
         */
        getUIElement: function () {
            return this._container;
        },

        /**
         * Enables the button toggle.
         */
        enable: function () {
            this.getFormElement().removeAttribute('disabled');
            this.getUIElement().kit.classList.remove(this.options.disabledClass);
        },

        /**
         * Disables the button toggle.
         */
        disable: function () {
            this.getFormElement().setAttribute('disabled', 'true');
            this.getUIElement().kit.classList.add(this.options.disabledClass);
        },

        /**
         * Gets the unique identifier for input fields.
         * @returns {string}
         */
        getElementKey: function () {
            return 'inputText';
        },

        /**
         * Destruction of this class.
         */
        destroy: function () {
            var container = this.getUIElement(),
                input = this.getFormElement();

            this._unbindEvents();

            container.parentNode.replaceChild(input, container);

            if (this.isInitDisabled) {
                input.setAttribute('disabled', 'true');
            }
            // set original value back
            this.setValue(this.origInputValue);

            FormElement.prototype.destroy.call(this);
        }

    });

    Form.ButtonToggle = ButtonToggle;
    Form.Checkbox = Checkbox;
    Form.InputField = InputField;

    return Form;

}));
/** 
* ElementKit - v0.1.0.
* https://github.com/mkay581/element-kit.git
* Copyright 2014 Mark Kennedy. Licensed MIT.
*/
!function(){"use strict";function a(a){var b,c;return a?(a=a.trim(a),b=document.createElement("div"),b.innerHTML=a,c=b.childNodes[0],b.removeChild(c)):void 0}function b(a){var b,c,d=a;for(c=1;c<arguments.length;c++){b=arguments[c];for(var e in b)b.hasOwnProperty(e)&&(d[e]=b[e])}return d}var c=0,d={},e=function(a){this.el=a,this.classList=this._getClassList(),this._eventListenerMap=this._eventListenerMap||[],Object.defineProperty(this,"dataset",{get:function(){return this.getData()}.bind(this)})};e.prototype={appendOuterHtml:function(b){var c=this.el.parentNode,d=a(b);return c.replaceChild(d,this.el),d.appendChild(this.el),d},getUniqueId:function(){return this.el._kitId},getClosestAncestorElementByClassName:function(a){for(var b,c=this.el.parentNode;c&&"string"==typeof c.className;){if(c.kit._hasClass(a)){b=c;break}c=c.parentNode}return b},addEventListener:function(a,b,c,d){var e=b;d=d||{},"function"!=typeof e&&(e=this._createEventListener(c[b],c)),this.el.addEventListener(a,e,d.useCapture),this._eventListenerMap.push({event:a,listener:e,listenerId:b,context:c})},_createEventListener:function(a,b){return function(){b=b||this,a.apply(b,arguments)}},removeEventListener:function(a,b,c){var d,e,f=this._eventListenerMap||[];if(f.length)for(d=0;d<f.length;d++)if(e=f[d],e&&e.event===a&&e.listenerId===b&&e.context===c){this.el.removeEventListener(a,e.listener),this._eventListenerMap[d]=null;break}},waitForTransition:function(a){var b=this.getTransitionDuration();a&&(b>0?setTimeout(a.bind(this,this.el),b):a(this.el))},getTransitionDuration:function(){var a=this.getCssComputedProperty("transition-delay")||"0ms",b=this.getCssComputedProperty("transition-duration")||"0ms";return a=this._convertCssTimeValueToMilliseconds(a),b=this._convertCssTimeValueToMilliseconds(b),a+b},getCssComputedProperty:function(a){var b=window.getComputedStyle(this.el);return b.getPropertyValue(a)||this.el.style[this._getJsPropName(a)]},_convertCssTimeValueToMilliseconds:function(a){var b=this._convertCssUnitToNumber(a),c=a.replace(b,"");return a="s"===c?1e3*b:b},_convertCssUnitToNumber:function(a){return Number(a.replace(/[a-z]+/,""))},_getClassList:function(){return this.el.classList?this.el.classList:{add:this._addClass.bind(this),remove:this._removeClass.bind(this),contains:this._hasClass.bind(this),toggle:this._toggleClass.bind(this)}},_getCssClasses:function(){return this.el.className.split(" ")},_toggleClass:function(a){this._hasClass(a)?this._removeClass(a):this._addClass(a)},_addClass:function(a){if(!this._hasClass(a)){var b=this.el.className;b&&(this.el.className=b+" "),this.el.className=this.el.className+a}},_removeClass:function(a){var b;this._hasClass(a)&&(this.el.className===a?this.el.className="":(b="[\\s]*"+a,b=new RegExp(b,"i"),this.el.className=this.el.className.replace(b,"")))},_hasClass:function(a){var b=this._getCssClasses();return-1!==b.indexOf(a)},_getJsPropName:function(a){return a=a.replace(/-([a-z])/g,function(a){return a[1].toUpperCase()})},getAttributes:function(){var a=this.el.attributes,b={};if(a.length)for(var c=0;c<a.length;c++)b[a[c].name]=a[c].value;return b},_getDomData:function(){var a,b,c=this.getAttributes(),d={};for(a in c)c.hasOwnProperty(a)&&(b=c[a],0===a.indexOf("data-")&&(a=a.substr(5),d[a]=b));return d},getData:function(){var a;this._data=b({},this._data,this._getDomData());for(a in this._data)if(this._data.hasOwnProperty(a)){var c=this._data[a];Object.defineProperty(this._data,a,{writeable:!0,get:function(){return c}.bind(this),set:function(b){this.setData.bind(this,a,b)}.bind(this)})}return this._data},setData:function(a,b){this.el.setAttribute("data-"+a,b),this._data[a]=b}},Object.defineProperty(Element.prototype,"kit",{get:function(){return d[this._kitId]||(c++,this._kitId=c,d[this._kitId]=new e(this)),d[this._kitId]}})}();
//     Underscore.js 1.7.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.
(function(){var n=this,t=n._,r=Array.prototype,e=Object.prototype,u=Function.prototype,i=r.push,a=r.slice,o=r.concat,l=e.toString,c=e.hasOwnProperty,f=Array.isArray,s=Object.keys,p=u.bind,h=function(n){return n instanceof h?n:this instanceof h?void(this._wrapped=n):new h(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=h),exports._=h):n._=h,h.VERSION="1.7.0";var g=function(n,t,r){if(t===void 0)return n;switch(null==r?3:r){case 1:return function(r){return n.call(t,r)};case 2:return function(r,e){return n.call(t,r,e)};case 3:return function(r,e,u){return n.call(t,r,e,u)};case 4:return function(r,e,u,i){return n.call(t,r,e,u,i)}}return function(){return n.apply(t,arguments)}};h.iteratee=function(n,t,r){return null==n?h.identity:h.isFunction(n)?g(n,t,r):h.isObject(n)?h.matches(n):h.property(n)},h.each=h.forEach=function(n,t,r){if(null==n)return n;t=g(t,r);var e,u=n.length;if(u===+u)for(e=0;u>e;e++)t(n[e],e,n);else{var i=h.keys(n);for(e=0,u=i.length;u>e;e++)t(n[i[e]],i[e],n)}return n},h.map=h.collect=function(n,t,r){if(null==n)return[];t=h.iteratee(t,r);for(var e,u=n.length!==+n.length&&h.keys(n),i=(u||n).length,a=Array(i),o=0;i>o;o++)e=u?u[o]:o,a[o]=t(n[e],e,n);return a};var v="Reduce of empty array with no initial value";h.reduce=h.foldl=h.inject=function(n,t,r,e){null==n&&(n=[]),t=g(t,e,4);var u,i=n.length!==+n.length&&h.keys(n),a=(i||n).length,o=0;if(arguments.length<3){if(!a)throw new TypeError(v);r=n[i?i[o++]:o++]}for(;a>o;o++)u=i?i[o]:o,r=t(r,n[u],u,n);return r},h.reduceRight=h.foldr=function(n,t,r,e){null==n&&(n=[]),t=g(t,e,4);var u,i=n.length!==+n.length&&h.keys(n),a=(i||n).length;if(arguments.length<3){if(!a)throw new TypeError(v);r=n[i?i[--a]:--a]}for(;a--;)u=i?i[a]:a,r=t(r,n[u],u,n);return r},h.find=h.detect=function(n,t,r){var e;return t=h.iteratee(t,r),h.some(n,function(n,r,u){return t(n,r,u)?(e=n,!0):void 0}),e},h.filter=h.select=function(n,t,r){var e=[];return null==n?e:(t=h.iteratee(t,r),h.each(n,function(n,r,u){t(n,r,u)&&e.push(n)}),e)},h.reject=function(n,t,r){return h.filter(n,h.negate(h.iteratee(t)),r)},h.every=h.all=function(n,t,r){if(null==n)return!0;t=h.iteratee(t,r);var e,u,i=n.length!==+n.length&&h.keys(n),a=(i||n).length;for(e=0;a>e;e++)if(u=i?i[e]:e,!t(n[u],u,n))return!1;return!0},h.some=h.any=function(n,t,r){if(null==n)return!1;t=h.iteratee(t,r);var e,u,i=n.length!==+n.length&&h.keys(n),a=(i||n).length;for(e=0;a>e;e++)if(u=i?i[e]:e,t(n[u],u,n))return!0;return!1},h.contains=h.include=function(n,t){return null==n?!1:(n.length!==+n.length&&(n=h.values(n)),h.indexOf(n,t)>=0)},h.invoke=function(n,t){var r=a.call(arguments,2),e=h.isFunction(t);return h.map(n,function(n){return(e?t:n[t]).apply(n,r)})},h.pluck=function(n,t){return h.map(n,h.property(t))},h.where=function(n,t){return h.filter(n,h.matches(t))},h.findWhere=function(n,t){return h.find(n,h.matches(t))},h.max=function(n,t,r){var e,u,i=-1/0,a=-1/0;if(null==t&&null!=n){n=n.length===+n.length?n:h.values(n);for(var o=0,l=n.length;l>o;o++)e=n[o],e>i&&(i=e)}else t=h.iteratee(t,r),h.each(n,function(n,r,e){u=t(n,r,e),(u>a||u===-1/0&&i===-1/0)&&(i=n,a=u)});return i},h.min=function(n,t,r){var e,u,i=1/0,a=1/0;if(null==t&&null!=n){n=n.length===+n.length?n:h.values(n);for(var o=0,l=n.length;l>o;o++)e=n[o],i>e&&(i=e)}else t=h.iteratee(t,r),h.each(n,function(n,r,e){u=t(n,r,e),(a>u||1/0===u&&1/0===i)&&(i=n,a=u)});return i},h.shuffle=function(n){for(var t,r=n&&n.length===+n.length?n:h.values(n),e=r.length,u=Array(e),i=0;e>i;i++)t=h.random(0,i),t!==i&&(u[i]=u[t]),u[t]=r[i];return u},h.sample=function(n,t,r){return null==t||r?(n.length!==+n.length&&(n=h.values(n)),n[h.random(n.length-1)]):h.shuffle(n).slice(0,Math.max(0,t))},h.sortBy=function(n,t,r){return t=h.iteratee(t,r),h.pluck(h.map(n,function(n,r,e){return{value:n,index:r,criteria:t(n,r,e)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index-t.index}),"value")};var m=function(n){return function(t,r,e){var u={};return r=h.iteratee(r,e),h.each(t,function(e,i){var a=r(e,i,t);n(u,e,a)}),u}};h.groupBy=m(function(n,t,r){h.has(n,r)?n[r].push(t):n[r]=[t]}),h.indexBy=m(function(n,t,r){n[r]=t}),h.countBy=m(function(n,t,r){h.has(n,r)?n[r]++:n[r]=1}),h.sortedIndex=function(n,t,r,e){r=h.iteratee(r,e,1);for(var u=r(t),i=0,a=n.length;a>i;){var o=i+a>>>1;r(n[o])<u?i=o+1:a=o}return i},h.toArray=function(n){return n?h.isArray(n)?a.call(n):n.length===+n.length?h.map(n,h.identity):h.values(n):[]},h.size=function(n){return null==n?0:n.length===+n.length?n.length:h.keys(n).length},h.partition=function(n,t,r){t=h.iteratee(t,r);var e=[],u=[];return h.each(n,function(n,r,i){(t(n,r,i)?e:u).push(n)}),[e,u]},h.first=h.head=h.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:0>t?[]:a.call(n,0,t)},h.initial=function(n,t,r){return a.call(n,0,Math.max(0,n.length-(null==t||r?1:t)))},h.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:a.call(n,Math.max(n.length-t,0))},h.rest=h.tail=h.drop=function(n,t,r){return a.call(n,null==t||r?1:t)},h.compact=function(n){return h.filter(n,h.identity)};var y=function(n,t,r,e){if(t&&h.every(n,h.isArray))return o.apply(e,n);for(var u=0,a=n.length;a>u;u++){var l=n[u];h.isArray(l)||h.isArguments(l)?t?i.apply(e,l):y(l,t,r,e):r||e.push(l)}return e};h.flatten=function(n,t){return y(n,t,!1,[])},h.without=function(n){return h.difference(n,a.call(arguments,1))},h.uniq=h.unique=function(n,t,r,e){if(null==n)return[];h.isBoolean(t)||(e=r,r=t,t=!1),null!=r&&(r=h.iteratee(r,e));for(var u=[],i=[],a=0,o=n.length;o>a;a++){var l=n[a];if(t)a&&i===l||u.push(l),i=l;else if(r){var c=r(l,a,n);h.indexOf(i,c)<0&&(i.push(c),u.push(l))}else h.indexOf(u,l)<0&&u.push(l)}return u},h.union=function(){return h.uniq(y(arguments,!0,!0,[]))},h.intersection=function(n){if(null==n)return[];for(var t=[],r=arguments.length,e=0,u=n.length;u>e;e++){var i=n[e];if(!h.contains(t,i)){for(var a=1;r>a&&h.contains(arguments[a],i);a++);a===r&&t.push(i)}}return t},h.difference=function(n){var t=y(a.call(arguments,1),!0,!0,[]);return h.filter(n,function(n){return!h.contains(t,n)})},h.zip=function(n){if(null==n)return[];for(var t=h.max(arguments,"length").length,r=Array(t),e=0;t>e;e++)r[e]=h.pluck(arguments,e);return r},h.object=function(n,t){if(null==n)return{};for(var r={},e=0,u=n.length;u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},h.indexOf=function(n,t,r){if(null==n)return-1;var e=0,u=n.length;if(r){if("number"!=typeof r)return e=h.sortedIndex(n,t),n[e]===t?e:-1;e=0>r?Math.max(0,u+r):r}for(;u>e;e++)if(n[e]===t)return e;return-1},h.lastIndexOf=function(n,t,r){if(null==n)return-1;var e=n.length;for("number"==typeof r&&(e=0>r?e+r+1:Math.min(e,r+1));--e>=0;)if(n[e]===t)return e;return-1},h.range=function(n,t,r){arguments.length<=1&&(t=n||0,n=0),r=r||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=Array(e),i=0;e>i;i++,n+=r)u[i]=n;return u};var d=function(){};h.bind=function(n,t){var r,e;if(p&&n.bind===p)return p.apply(n,a.call(arguments,1));if(!h.isFunction(n))throw new TypeError("Bind must be called on a function");return r=a.call(arguments,2),e=function(){if(!(this instanceof e))return n.apply(t,r.concat(a.call(arguments)));d.prototype=n.prototype;var u=new d;d.prototype=null;var i=n.apply(u,r.concat(a.call(arguments)));return h.isObject(i)?i:u}},h.partial=function(n){var t=a.call(arguments,1);return function(){for(var r=0,e=t.slice(),u=0,i=e.length;i>u;u++)e[u]===h&&(e[u]=arguments[r++]);for(;r<arguments.length;)e.push(arguments[r++]);return n.apply(this,e)}},h.bindAll=function(n){var t,r,e=arguments.length;if(1>=e)throw new Error("bindAll must be passed function names");for(t=1;e>t;t++)r=arguments[t],n[r]=h.bind(n[r],n);return n},h.memoize=function(n,t){var r=function(e){var u=r.cache,i=t?t.apply(this,arguments):e;return h.has(u,i)||(u[i]=n.apply(this,arguments)),u[i]};return r.cache={},r},h.delay=function(n,t){var r=a.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},h.defer=function(n){return h.delay.apply(h,[n,1].concat(a.call(arguments,1)))},h.throttle=function(n,t,r){var e,u,i,a=null,o=0;r||(r={});var l=function(){o=r.leading===!1?0:h.now(),a=null,i=n.apply(e,u),a||(e=u=null)};return function(){var c=h.now();o||r.leading!==!1||(o=c);var f=t-(c-o);return e=this,u=arguments,0>=f||f>t?(clearTimeout(a),a=null,o=c,i=n.apply(e,u),a||(e=u=null)):a||r.trailing===!1||(a=setTimeout(l,f)),i}},h.debounce=function(n,t,r){var e,u,i,a,o,l=function(){var c=h.now()-a;t>c&&c>0?e=setTimeout(l,t-c):(e=null,r||(o=n.apply(i,u),e||(i=u=null)))};return function(){i=this,u=arguments,a=h.now();var c=r&&!e;return e||(e=setTimeout(l,t)),c&&(o=n.apply(i,u),i=u=null),o}},h.wrap=function(n,t){return h.partial(t,n)},h.negate=function(n){return function(){return!n.apply(this,arguments)}},h.compose=function(){var n=arguments,t=n.length-1;return function(){for(var r=t,e=n[t].apply(this,arguments);r--;)e=n[r].call(this,e);return e}},h.after=function(n,t){return function(){return--n<1?t.apply(this,arguments):void 0}},h.before=function(n,t){var r;return function(){return--n>0?r=t.apply(this,arguments):t=null,r}},h.once=h.partial(h.before,2),h.keys=function(n){if(!h.isObject(n))return[];if(s)return s(n);var t=[];for(var r in n)h.has(n,r)&&t.push(r);return t},h.values=function(n){for(var t=h.keys(n),r=t.length,e=Array(r),u=0;r>u;u++)e[u]=n[t[u]];return e},h.pairs=function(n){for(var t=h.keys(n),r=t.length,e=Array(r),u=0;r>u;u++)e[u]=[t[u],n[t[u]]];return e},h.invert=function(n){for(var t={},r=h.keys(n),e=0,u=r.length;u>e;e++)t[n[r[e]]]=r[e];return t},h.functions=h.methods=function(n){var t=[];for(var r in n)h.isFunction(n[r])&&t.push(r);return t.sort()},h.extend=function(n){if(!h.isObject(n))return n;for(var t,r,e=1,u=arguments.length;u>e;e++){t=arguments[e];for(r in t)c.call(t,r)&&(n[r]=t[r])}return n},h.pick=function(n,t,r){var e,u={};if(null==n)return u;if(h.isFunction(t)){t=g(t,r);for(e in n){var i=n[e];t(i,e,n)&&(u[e]=i)}}else{var l=o.apply([],a.call(arguments,1));n=new Object(n);for(var c=0,f=l.length;f>c;c++)e=l[c],e in n&&(u[e]=n[e])}return u},h.omit=function(n,t,r){if(h.isFunction(t))t=h.negate(t);else{var e=h.map(o.apply([],a.call(arguments,1)),String);t=function(n,t){return!h.contains(e,t)}}return h.pick(n,t,r)},h.defaults=function(n){if(!h.isObject(n))return n;for(var t=1,r=arguments.length;r>t;t++){var e=arguments[t];for(var u in e)n[u]===void 0&&(n[u]=e[u])}return n},h.clone=function(n){return h.isObject(n)?h.isArray(n)?n.slice():h.extend({},n):n},h.tap=function(n,t){return t(n),n};var b=function(n,t,r,e){if(n===t)return 0!==n||1/n===1/t;if(null==n||null==t)return n===t;n instanceof h&&(n=n._wrapped),t instanceof h&&(t=t._wrapped);var u=l.call(n);if(u!==l.call(t))return!1;switch(u){case"[object RegExp]":case"[object String]":return""+n==""+t;case"[object Number]":return+n!==+n?+t!==+t:0===+n?1/+n===1/t:+n===+t;case"[object Date]":case"[object Boolean]":return+n===+t}if("object"!=typeof n||"object"!=typeof t)return!1;for(var i=r.length;i--;)if(r[i]===n)return e[i]===t;var a=n.constructor,o=t.constructor;if(a!==o&&"constructor"in n&&"constructor"in t&&!(h.isFunction(a)&&a instanceof a&&h.isFunction(o)&&o instanceof o))return!1;r.push(n),e.push(t);var c,f;if("[object Array]"===u){if(c=n.length,f=c===t.length)for(;c--&&(f=b(n[c],t[c],r,e)););}else{var s,p=h.keys(n);if(c=p.length,f=h.keys(t).length===c)for(;c--&&(s=p[c],f=h.has(t,s)&&b(n[s],t[s],r,e)););}return r.pop(),e.pop(),f};h.isEqual=function(n,t){return b(n,t,[],[])},h.isEmpty=function(n){if(null==n)return!0;if(h.isArray(n)||h.isString(n)||h.isArguments(n))return 0===n.length;for(var t in n)if(h.has(n,t))return!1;return!0},h.isElement=function(n){return!(!n||1!==n.nodeType)},h.isArray=f||function(n){return"[object Array]"===l.call(n)},h.isObject=function(n){var t=typeof n;return"function"===t||"object"===t&&!!n},h.each(["Arguments","Function","String","Number","Date","RegExp"],function(n){h["is"+n]=function(t){return l.call(t)==="[object "+n+"]"}}),h.isArguments(arguments)||(h.isArguments=function(n){return h.has(n,"callee")}),"function"!=typeof/./&&(h.isFunction=function(n){return"function"==typeof n||!1}),h.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},h.isNaN=function(n){return h.isNumber(n)&&n!==+n},h.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"===l.call(n)},h.isNull=function(n){return null===n},h.isUndefined=function(n){return n===void 0},h.has=function(n,t){return null!=n&&c.call(n,t)},h.noConflict=function(){return n._=t,this},h.identity=function(n){return n},h.constant=function(n){return function(){return n}},h.noop=function(){},h.property=function(n){return function(t){return t[n]}},h.matches=function(n){var t=h.pairs(n),r=t.length;return function(n){if(null==n)return!r;n=new Object(n);for(var e=0;r>e;e++){var u=t[e],i=u[0];if(u[1]!==n[i]||!(i in n))return!1}return!0}},h.times=function(n,t,r){var e=Array(Math.max(0,n));t=g(t,r,1);for(var u=0;n>u;u++)e[u]=t(u);return e},h.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))},h.now=Date.now||function(){return(new Date).getTime()};var _={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},w=h.invert(_),j=function(n){var t=function(t){return n[t]},r="(?:"+h.keys(n).join("|")+")",e=RegExp(r),u=RegExp(r,"g");return function(n){return n=null==n?"":""+n,e.test(n)?n.replace(u,t):n}};h.escape=j(_),h.unescape=j(w),h.result=function(n,t){if(null==n)return void 0;var r=n[t];return h.isFunction(r)?n[t]():r};var x=0;h.uniqueId=function(n){var t=++x+"";return n?n+t:t},h.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var A=/(.)^/,k={"'":"'","\\":"\\","\r":"r","\n":"n","\u2028":"u2028","\u2029":"u2029"},O=/\\|'|\r|\n|\u2028|\u2029/g,F=function(n){return"\\"+k[n]};h.template=function(n,t,r){!t&&r&&(t=r),t=h.defaults({},t,h.templateSettings);var e=RegExp([(t.escape||A).source,(t.interpolate||A).source,(t.evaluate||A).source].join("|")+"|$","g"),u=0,i="__p+='";n.replace(e,function(t,r,e,a,o){return i+=n.slice(u,o).replace(O,F),u=o+t.length,r?i+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'":e?i+="'+\n((__t=("+e+"))==null?'':__t)+\n'":a&&(i+="';\n"+a+"\n__p+='"),t}),i+="';\n",t.variable||(i="with(obj||{}){\n"+i+"}\n"),i="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+i+"return __p;\n";try{var a=new Function(t.variable||"obj","_",i)}catch(o){throw o.source=i,o}var l=function(n){return a.call(this,n,h)},c=t.variable||"obj";return l.source="function("+c+"){\n"+i+"}",l},h.chain=function(n){var t=h(n);return t._chain=!0,t};var E=function(n){return this._chain?h(n).chain():n};h.mixin=function(n){h.each(h.functions(n),function(t){var r=h[t]=n[t];h.prototype[t]=function(){var n=[this._wrapped];return i.apply(n,arguments),E.call(this,r.apply(h,n))}})},h.mixin(h),h.each(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=r[n];h.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!==n&&"splice"!==n||0!==r.length||delete r[0],E.call(this,r)}}),h.each(["concat","join","slice"],function(n){var t=r[n];h.prototype[n]=function(){return E.call(this,t.apply(this._wrapped,arguments))}}),h.prototype.value=function(){return this._wrapped},"function"==typeof define&&define.amd&&define("underscore",[],function(){return h})}).call(this);
//# sourceMappingURL=underscore-min.map