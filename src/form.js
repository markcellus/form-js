(function (factory) {
    'use strict';
    // support both AMD and non-AMD
    if (typeof define === 'function' && define.amd) {
        define(['element-kit'], function () {
            return factory();
        });
    } else {
        window.Form = factory();
    }
})((function () {
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
     * Merges the contents of two or more objects.
     * @param {object} obj - The target object
     * @param {...object} - Additional objects who's properties will be merged in
     */
    function extend(target) {
        var merged = target,
            source, i;
        for (i = 1; i < arguments.length; i++) {
            source = arguments[i];
            for (var prop in source) {
                if (source.hasOwnProperty(prop)) {
                    merged[prop] = source[prop];
                }
            }
        }
        return merged;
    }

    /**
     * Checks if user is on a mobile device.
     * @returns {boolean}
     */
    function isMobile() {
        // detect orientation, property that only smartphones, tablets and phablets have
        // if it doesnt exist, we know user is on a desktop
        return typeof window.orientation !== 'undefined';
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
        initialize: function (options) {
            this.options = options || {};
        },

        /**
         * Gets the form element.
         * @returns {HTMLElement} Returns the form element
         * @abstract
         */
        getFormElement: function () {
            return this.options.el;
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
     * The function that fires when any form element value changes
     * @callback Form~onChange
     * @param {Event} event - The event that fired the change
     */

    /**
     * Function callback that is fired each time an instance is created to provide custom options
     * BEWARE: This function fires very rapidly so please make sure any logic in this function is quick,
     * to the point, and most importantly, non-blocking.
     * @callback Form~onGetOptions
     * @param {HTMLElement} el - The event that fired the change
     * @param {Object} options - The beginning set of default options
     * @returns {Object} options - Must QUICKLY return the final options object that the Form class will use for the
     * instantiation of the class for the el given in the first parameter
     */

    /**
     * Utility class for form elements.
     * @class Form
     * @param {object} options - The options
     * @param {HTMLInputElement} options.el - The input field element
     * @param {Form~onChange} [options.onChange] - A callback function that fires when any form element values change
     * @param {Function} [options.onGetOptions] - Function callback that is fired each time an instance is created to provide custom options
     * @param {HTMLCollection|Array} [options.inputFields] - Input field elements that will be used for InputField class instantiations
     * @param {HTMLCollection|Array} [options.buttonToggles] - Input checkboxes or radio elements that will be used for ButtonToggle class instantiations
     * @param {HTMLCollection|Array} [options.checkboxes] - Input checkboxes that will be used for Checkboxes class instantiations
     * @param {HTMLCollection|Array} [options.dropdowns] - Select elements that will be used for Dropdown class instantiations
     */
    var Form = function (options) {

        options.el = options.el || document.createDocumentFragment();

        this.options = extend({
            el: options.el,
            onChange: null,
            onGetOptions: null,
            inputFields: options.el.querySelectorAll('input[type="text"], textarea'),
            buttonToggles: [],
            checkboxes: options.el.querySelectorAll('input[type="checkbox"]'),
            dropdowns: options.el.querySelectorAll('select')
        }, options);

        this._formInstances = [];
        this._valuesMap = {};

        this.setup();
    };

    Form.prototype = /** @lends Form */{

        /**
         * Sets up all sub-class instances.
         */
        setup: function () {
            this._setupInstances(this.options.inputFields, InputField);
            this._setupInstances(this.options.checkboxes, Checkbox);
            this._setupInstances(this.options.buttonToggles, ButtonToggle);
            this._setupInstances(this.options.dropdowns, Dropdown);
        },

        /**
         * When any form element's value changes.
         * @param {HTMLFormElement} formEl - The form element after its value has been updated
         * @param {HTMLElement} uiEl - The ui representation of the form element
         * @param {Event} e
         * @private
         */
        _onValueChange: function (formEl, uiEl, e) {
            var name = formEl.name,
                origValue = this._valuesMap[name],
                value = formEl.value;

            if (origValue && origValue === value) {
                // new value is same as existing!
                return;
            }

            this._valuesMap[name] = value;

            if (this.options.onChange) {
                this.options.onChange(formEl, uiEl, e);
            }
        },

        /**
         * Disables form and all of its elements.
         */
        disable: function () {
            this.triggerMethodAll('disable');
        },

        /**
         * Enables form and all of its elements.
         */
        enable: function () {
            this.triggerMethodAll('enable');
        },

        /**
         * Fires a method on all available form instances.
         * @param {string} method - The method to call
         * @param {Array} [args] - The array of args to apply to the method
         */
        triggerMethodAll: function (method, args) {
            var instances = this._formInstances,
                count = instances.length,
                i;
            args = args || [];
            for (i = 0; i < count; i++) {
                this._formInstances[i][method].apply(this, args);
            }
        },

        /**
         * Takes a set of html elements and instantiates the appropriate form sub-class on each of them.
         * @param {HTMLCollection|Array|NodeList} elements - The elements that will be used
         * @param {Function} View - The class to instantiate
         * @param {Object} [options] - The options to be passed to instantiation
         * @param {string} [elKey] - The key to use as the "el"
         * @private
         */
        _setupInstances: function (elements, View, options, elKey) {
            var count = elements.length,
                i,
                instance;
            elKey = elKey || 'el';
            options = options || {};
            for (i = 0; i < count; i++) {
                options = this._buildOptions(elements[i], options);
                options[elKey] = elements[i]; // dont allow custom options to override the el!
                instance = new View(options);
                this._formInstances.push(instance);

                // set value map
                this._valuesMap[instance.getFormElement().name] = instance.getValue();
            }
        },

        /**
         * Builds the initialize options for an element.
         * @param {HTMLElement} el - The element
         * @param {Object} options - The beginning set of options
         * @returns {*|{}}
         * @private
         */
        _buildOptions: function (el, options) {
            if (this.options.onGetOptions) {
                options = _.extend({}, options, this.options.onGetOptions(el));
            }
            options.onChange = function (value, inputEl, UIElement) {
                this._onValueChange(value, inputEl, UIElement);
            }.bind(this);

            return options;
        },

        /**
         * Returns the instance (if there is one) of an element with a specified name attribute
         * @param {string} name - The name attribute of the element whos instance is desired
         * @returns {Object} Returns the instance that matches the name specified
         */
        getInstanceByName: function (name) {
            var i,
                instance;

            for (i = 0; i < this._formInstances.length; i++) {
                instance = this._formInstances[i];
                if (instance.getFormElement().name === name) {
                    break;
                }
            }
            return instance;
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
            this.triggerMethodAll('destroy');
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

    ButtonToggle.prototype = extend({}, FormElement.prototype, /** @lends ButtonToggle.prototype */{

        /**
         * Initialization.
         * @param {object} options - Options passed into instance
         */
        initialize: function (options) {

            this.options = extend({
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
            this._triggerAll(function (formElement) {
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

    Form.ButtonToggle = ButtonToggle;

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

    Checkbox.prototype = extend({}, FormElement.prototype, /** @lends Checkbox.prototype */{

        /**
         * Initialization.
         * @param {object} options - Options passed into instantiation.
         */
        initialize: function (options) {

            this.options = extend({
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

    Form.Checkbox = Checkbox;

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

    InputField.prototype = extend({}, FormElement.prototype, /** @lends InputField */{

        /**
         * Initializes the Input Field class.
         * @param {object} options - Options passed into instance
         */
        initialize: function (options) {

            this.options = extend({
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

    Form.InputField = InputField;

    /**
     * The function that is triggered the selected dropdown value changes
     * @callback Dropdown~onChange
     * @param {HTMLSelectElement} input - The select element after its value has been updated
     * @param {HTMLElement} UIElement - The container of the select element after its value has been updated
     * @param {Event} event - The event
     */

    /**
     * Adds JS functionality to a select element and creates a ui representation of it to allow custom styling.
     * Falls back to native dropdowns on mobile devices.
     * @constructor Dropdown
     * @param {object} options - Options to pass
     * @param {HTMLSelectElement} options.el - The container of the tooltip
     * @param {Dropdown~onChange} [options.onChange] - A callback function that fires when the selected dropdown value changes
     * @param {Boolean} [options.autoSetup] - When to automatically setup the dropdown (add event listeners, etc)
     * @param {string} [options.containerClass] - The css class to use for the dropdown container for the ui representation of the dropdown
     * @param {string} [options.optionsContainerClass] - The css class to use for the options container of the ui representation of the dropdown
     * @param {string} [options.optionsContainerActiveClass] - The css class that will applied to the ui representation of an option element when it should be visible to the user
     * @param {string} [options.optionsClass] - The css class to use for the ui representation of all options elements
     * @param {string} [options.optionsSelectedClass] - The css class to use for the option element of the ui representation of the dropdown when it is selected
     * @param {string} [options.selectedValueContainerClass] - The css class to use for the selected value container of the dropdown
     * @param {string} [options.selectedValueContainerActiveClass] - The css class that will be applied to the selected value container when it should be visible to the user
     */
    var Dropdown = function (options) {
        this.initialize(options);
    };

    Dropdown.prototype = extend({}, FormElement.prototype, /** @lends Dropdown.prototype */{

        /**
         * When instantiated.
         * @param options
         */
        initialize: function (options) {

            this.options = extend({
                el: null,
                onChange: null,
                autoSetup: true,
                containerClass: 'dropdown-container',
                optionsContainerClass: 'dropdown-option-container',
                optionsContainerActiveClass: 'dropdown-option-container-active',
                optionsClass: 'dropdown-option',
                optionsSelectedClass: 'dropdown-option-selected',
                selectedValueContainerClass: 'dropdown-value-container',
                selectedValueContainerActiveClass: 'dropdown-value-container-active',
                disabledClass: 'dropdown-disabled'
            }, options);

            FormElement.prototype.initialize.call(this, this.options);

            if (this.options.autoSetup) {
                this.setup();
            }
        },

        /**
         * Sets up events for dropdown.
         * @memberOf Dropdown
         */
        setup: function () {
            var el = this.options.el,
                selectedOption = el.querySelectorAll('option[selected]')[0];

            el.kit.addEventListener('change', '_onSelectChange', this);

            if(!isMobile()){
                // user is on desktop!
                // hide original select element
                this._origDisplayValue = el.style.display;
                el.style.display = 'none';

                // build html
                el.insertAdjacentHTML('afterend',
                    '<div class="' + this.options.containerClass + '">' +
                        this._buildSelectedValueHtml() + this._buildOptionsHtml() +
                    '</div>');

                this._setupEvents();

                if (selectedOption) {
                    this._setUISelectedValue(selectedOption.value, selectedOption.textContent);
                }

                if (this.getFormElement().disabled) {
                    this.disable();
                }
            }

        },

        /**
         * Sets the UI representation of the select dropdown to a new value.
         * @param {string} dataValue - The new data value
         * @private
         * @memberOf Dropdown
         */
        _setUISelectedValue: function (dataValue) {
            var optionsContainerEl = this.getUIElement().getElementsByClassName(this.options.optionsContainerClass)[0],
                prevSelectedOption = optionsContainerEl.getElementsByClassName(this.options.optionsSelectedClass)[0],
                newSelectedOptionEl = optionsContainerEl.querySelectorAll('.' + this.options.optionsClass + '[data-value="' + dataValue + '"]')[0],
                selectedClass = this.options.optionsSelectedClass,
                selectedValueContainerEl = this.getUIElement().getElementsByClassName(this.options.selectedValueContainerClass)[0];

            if (!this.getFormElement().disabled) {
                selectedValueContainerEl.setAttribute('data-value', dataValue);
                selectedValueContainerEl.innerHTML = newSelectedOptionEl.textContent;

                // remove selected class from previously selected option
                if (prevSelectedOption) {
                    prevSelectedOption.kit.classList.remove(selectedClass)
                }
                // add selected class to new option
                newSelectedOptionEl.kit.classList.add(selectedClass);
            }

        },

        /**
         * Sets up click events on the ui element and its children.
         * @private
         * @memberOf Dropdown
         */
        _setupEvents: function () {
            var uiEl = this.getUIElement(),
                uiValueContainer = uiEl.getElementsByClassName(this.options.selectedValueContainerClass)[0],
                uiOptionEls = uiEl.getElementsByClassName(this.options.optionsClass),
                count = uiOptionEls.length,
                i;
            // add click events on container
            uiValueContainer.kit.addEventListener('click', '_onClickUIValueContainer', this);

            // add click events on options
            for (i = 0; i < count; i++) {
                uiOptionEls[i].kit.addEventListener('click', '_onClickUIOption', this);
            }
        },

        /**
         * When clicking on the div that represents the select value.
         * @param {Event} e
         * @private
         * @memberOf Dropdown
         */
        _onClickUIValueContainer: function (e) {
            var uiOptionContainer = this.getUIElement().getElementsByClassName(this.options.optionsContainerClass)[0];
            // show/hide options container
            uiOptionContainer.kit.classList.toggle(this.options.optionsContainerActiveClass);
        },

        /**
         * When one of the ui divs (representing the options elements) is clicked.
         * @param {Event} e
         * @private
         * @memberOf Dropdown
         */
        _onClickUIOption: function (e) {
            var selectedOption = e.currentTarget,
                newDataValue = selectedOption.kit.dataset.value,
                newDisplayValue = selectedOption.textContent;

            if (this.getValue() !== newDataValue) {
                // set the current value of the REAL dropdown
                this.setValue(newDataValue);
                // set value of ui dropdown
                this._setUISelectedValue(newDataValue, newDisplayValue);
            }
        },

        /**
         * Builds the html for the dropdown value.
         * @returns {string}
         * @private
         * @memberOf Dropdown
         */
        _buildSelectedValueHtml: function () {
            return '<div class="' + this.options.selectedValueContainerClass + '" data-value=""></div>';
        },

        /**
         * Builds a representative version of the option elements of the original select.
         * @returns {string} Returns the html of the options container along with its nested children
         * @private
         * @memberOf Dropdown
         */
        _buildOptionsHtml: function () {
            var options = this.options,
                uiOptionsContainer = document.createElement('div'),
                html = '<div class="' + options.optionsContainerClass + '">',
                optionEls = options.el.getElementsByTagName('option'),
                count = optionEls.length,
                i,
                option,
                selectedClass = '';

            uiOptionsContainer.kit.classList.add(options.optionsContainerClass);

            for (i = 0; i < count; i++) {
                option = optionEls[i];
                selectedClass = option.hasAttribute('selected') ? options.optionsSelectedClass : '';
                html += '<div class="' + options.optionsClass + ' ' + selectedClass + '" data-value="' + option.value  + '">' +
                option.textContent + '</div>';
            }

            html += '</div>'; // close container tag

            return html;

        },

        /**
         * When the select value changes.
         * @param e
         * @private
         * @memberOf Dropdown
         */
        _onSelectChange: function (e) {
            if (this.options.onChange) {
                this.options.onChange(this.getFormElement(), this.getUIElement(), e);
            }
        },

        /**
         * Returns the element that represents the div-version of the dropdown.
         * @returns {HTMLElement|*}
         */
        getUIElement: function () {
            return this.getFormElement().nextSibling || this.getFormElement(); // mobile wont have the sibiling
        },

        /**
         * Gets an option element by its value attribute.
         * @param {string} dataValue - The value attribute of the option desired
         * @returns {*}
         * @memberOf Dropdown
         */
        getOptionByDataValue: function (dataValue) {
            return this.options.el.querySelectorAll('option[value="' + dataValue + '"]')[0];
        },

        /**
         * Gets an option element by its text content.
         * @param {string} displayValue - The text content that the eleemnt should have in order to be returned
         * @returns {*|HTMLOptionElement}
         * @memberOf Dropdown
         */
        getOptionByDisplayValue: function (displayValue) {
            var optionEls = this.options.el.querySelectorAll('option'),
                i,
                count = optionEls.length,
                option;
            for (i = 0; i < count; i++) {
                option = optionEls[i];
                if (option.textContent === displayValue) {
                    break;
                }
            }
            return option;
        },

        /**
         * Sets the dropdown to a specified value (if there is an option
         * element with a value attribute that contains the value supplied)
         * @param {string} dataValue - The value to set the dropdown menu to
         * @memberOf Dropdown
         */
        setValue: function (dataValue) {
            var origOptionEl = this.getOptionByDataValue(this.getValue()),
                newOptionEl = this.getOptionByDataValue(dataValue),
                e = document.createEvent('HTMLEvents');

            if (!this.getFormElement().disabled) {
                e.initEvent('change', false, true);

                // switch selected value because browser doesnt do it for us
                if (origOptionEl) {
                    origOptionEl.removeAttribute('selected');
                }
                if (newOptionEl) {
                    newOptionEl.setAttribute('selected', 'selected'); // this is sufficient because it also updates the value attr
                    // trigger change event on dropdown
                    this.options.el.dispatchEvent(e);
                } else {
                    console.warn('Form Dropdown Error: Cannot call setValue(), dropdown has no option element with a ' +
                    'value attribute of ' + dataValue + '.');
                }

                if (!isMobile()) {
                    this._setUISelectedValue(dataValue, newOptionEl.textContent);
                }
            }

        },

        /**
         * Disables the dropdown.
         */
        disable: function () {
            this.getUIElement().kit.classList.add(this.options.disabledClass);
            this.getFormElement().disabled = true;
        },

        /**
         * Enables the dropdown.
         */
        enable: function () {
            this.getUIElement().kit.classList.remove(this.options.disabledClass);
            this.getFormElement().disabled = false;
        },

        /**
         * Returns the text inside the option element that is currently selected.
         * @returns {*}
         * @memberOf Dropdown
         */
        getDisplayValue: function () {
            return this.getOptionByDataValue(this.getValue()).textContent;
        },

        /**
         * Destruction of this class.
         * @memberOf Dropdown
         */
        destroy: function () {
            var el = this.options.el;
            el.kit.removeEventListener('change', '_onSelectChange', this);
            el.style.display = this._origDisplayValue; // put original display back
        }

    });

    Form.Dropdown = Dropdown;

    return Form;

}));