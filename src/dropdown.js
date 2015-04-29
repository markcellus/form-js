'use strict';
var _ = require('underscore');
var FormElement = require('./form-element');

require('element-kit');
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
 */
var Dropdown = FormElement.extend({

    /**
     * When instantiated.
     * @param options
     * @param {HTMLSelectElement} options.el - The container of the dropdown
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
    initialize: function (options) {

        this.options = _.extend({
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

        // build html
        el.insertAdjacentHTML('afterend',
            '<div class="' + this.options.containerClass + '">' +
            this._buildSelectedValueHtml() + this._buildOptionsHtml() +
            '</div>');

        this._setupEvents();

        if (selectedOption) {
            this._setUISelectedValue(selectedOption.value);
        }

        if (this.getFormElement().disabled) {
            this.disable();
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

        selectedValueContainerEl.setAttribute('data-value', dataValue);
        selectedValueContainerEl.innerHTML = newSelectedOptionEl.textContent;

        // remove selected class from previously selected option
        if (prevSelectedOption) {
            prevSelectedOption.kit.classList.remove(selectedClass)
        }
        // add selected class to new option
        newSelectedOptionEl.kit.classList.add(selectedClass);

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

        this.bindUIOptionClickEvents(uiOptionEls);
    },

    /**
     * Adds click events on option elements.
     * @param optionEls
     */
    bindUIOptionClickEvents: function (optionEls) {
        var i, count = optionEls.length;
        for (i = 0; i < count; i++) {
            optionEls[i].kit.addEventListener('click', '_onClickUIOption', this);
        }
    },

    /**
     * Removes click events from option elements.
     * @param optionEls
     */
    unbindUIOptionClickEvents: function (optionEls) {
        var i, count = optionEls.length;
        for (i = 0; i < count; i++) {
            optionEls[i].kit.removeEventListener('click', '_onClickUIOption', this);
        }
    },

    /**
     * When clicking on the div that represents the select value.
     * @param {Event} e
     * @private
     * @memberOf Dropdown
     */
    _onClickUIValueContainer: function (e) {
        if (this.getFormElement().disabled) {
            return false;
        } else if (this.isOptionsContainerActive()) {
            this.hideOptionsContainer();
        } else {
            this.showOptionsContainer();
        }
    },

    /**
     * Shows the UI options container element.
     */
    showOptionsContainer: function () {
        this.getUIElement().kit.classList.add(this.options.optionsContainerActiveClass);
        document.body.kit.addEventListener('click', 'onClickDocument', this);
    },

    /**
     * Hides the UI options container element.
     */
    hideOptionsContainer: function () {
        this.getUIElement().kit.classList.remove(this.options.optionsContainerActiveClass);
        document.body.kit.removeEventListener('click', 'onClickDocument', this);
    },

    /**
     * Whether the UI options container element is open.
     * @returns {boolean} Returns true if container is open
     */
    isOptionsContainerActive: function () {
        return this.getUIElement().kit.classList.contains(this.options.optionsContainerActiveClass);
    },

    /**
     * When document is clicked.
     * @param {Event} e
     */
    onClickDocument: function (e) {
        var closestUIContainer = e.target.kit.getClosestAncestorElementByClassName(this.options.containerClass);
        if (!closestUIContainer || closestUIContainer !== this.getUIElement()) {
            // clicked outside of ui element!
            this.hideOptionsContainer();
        }
    },

    /**
     * When one of the ui divs (representing the options elements) is clicked.
     * @param {Event} e
     * @private
     * @memberOf Dropdown
     */
    _onClickUIOption: function (e) {
        var selectedOption = e.currentTarget,
            newDataValue = selectedOption.kit.dataset.value;

        if (this.getValue() !== newDataValue) {
            // set the current value of the REAL dropdown
            this.setValue(newDataValue);
            // set value of ui dropdown
            this._setUISelectedValue(newDataValue);
        }
        this.getUIElement().kit.classList.remove(this.options.optionsContainerActiveClass);

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
        var value = this.getValue();
        this._setUISelectedValue(value);
        if (this.options.onChange) {
            this.options.onChange(value, this.getFormElement(), this.getUIElement(), e);
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
            e = document.createEvent('HTMLEvents'),
            formEl = this.getFormElement();

        e.initEvent('change', false, true);

        // switch selected value because browser doesnt do it for us
        if (origOptionEl) {
            origOptionEl.removeAttribute('selected');
        }
        if (newOptionEl) {
            newOptionEl.setAttribute('selected', 'selected');
            // in most cases, setting attribute (above) also updates the dropdown's value
            // but for some browsers (like phantomjs), we need to manually set it
            formEl.value = dataValue;
            // trigger change event on dropdown
            formEl.dispatchEvent(e);
        } else {
            console.warn('Form Dropdown Error: Cannot call setValue(), dropdown has no option element with a ' +
            'value attribute of ' + dataValue + '.');
        }

        this._setUISelectedValue(dataValue);
    },

    /**
     * Updates markup to show new dropdown option values.
     * @param {Array} optionsData - An array of objects that maps the new data values to display values desired
     * @param {Object} [options] - Update options
     * @param {Boolean} [options.replace] - If true, the new options will replace all current options, if false, new options will be merged with current ones
     */
    updateOptions: function (optionsData, options) {
        var uiOptionsContainer = this.getUIElement().getElementsByClassName(this.options.optionsContainerClass)[0],
            frag = document.createDocumentFragment(),
            optionEl;

        options = options || {};

        if (options.replace) {
            this.clearOptions();
        }
        this._updateFormOptionElements(optionsData);

        optionsData.forEach(function (obj) {
            optionEl = document.createElement('div');
            optionEl.setAttribute('data-value', obj.dataValue);
            optionEl.classList.add(this.options.optionsClass);
            optionEl.innerHTML = obj.displayValue;
            frag.appendChild(optionEl);
        }.bind(this));
        this.bindUIOptionClickEvents(frag.childNodes);
        uiOptionsContainer.appendChild(frag);
    },

    /**
     * Clears all options in the dropdown.
     */
    clearOptions: function () {
        var uiOptionsContainer = this.getUIElement().getElementsByClassName(this.options.optionsContainerClass)[0],
            formEl = this.getFormElement();
        formEl.innerHTML = '';
        uiOptionsContainer.innerHTML = '';
    },

    /**
     * Updates markup to show new form elements.
     * @param {Array} optionsData - An array of objects that maps the new data values to display values desired
     * @param {boolean} reset - Whether to replace current options, or merge with them
     * @private
     */
    _updateFormOptionElements: function (optionsData, reset) {
        var formEl = this.getFormElement(),
            frag = document.createDocumentFragment(),
            optionEl;
        optionsData.forEach(function (obj) {
            optionEl = document.createElement('option');
            optionEl.setAttribute('value', obj.dataValue);
            optionEl.innerHTML = obj.displayValue;
            frag.appendChild(optionEl);
        });
        if (reset) {
            formEl.innerHTML = '';
        } else {

        }
        formEl.appendChild(frag);
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
        var el = this.options.el,
            uiOptionEls = this.getUIElement().getElementsByClassName(this.options.optionsContainerClass)[0];
        this.unbindUIOptionClickEvents(uiOptionEls);
        el.kit.removeEventListener('change', '_onSelectChange', this);
        el.style.display = this._origDisplayValue; // put original display back
    }

});

module.exports = Dropdown;