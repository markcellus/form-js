'use strict';
var _ = require('underscore');
var FormElement = require('./form-element');
var DeviceManager = require('device-manager');

require('element-kit');
/**
 * The function that is triggered the selected dropdown value changes
 * @callback Dropdown~onChange
 * @param {HTMLSelectElement} input - The select element after its value has been updated
 * @param {HTMLElement} UIElement - The container of the select element after its value has been updated
 * @param {Event} event - The event
 */

/**
 * The function that is triggered the dropdown gains focus
 * @callback Dropdown~onFocus
 * @param {Event} event - The event
 */

/**
 * The function that is triggered the dropdown loses focus
 * @callback Dropdown~onBlur
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
     * @param {Dropdown~onFocus} [options.onFocus] - When the dropdown gains focus
     * @param {Dropdown~onBlur} [options.onBlur] - When the dropdown loses focus
     * @param {string} [options.customWrapperClass] - The css class to use for div that the select element and the generated UI version of the dropdown will be wrapped by
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
            onFocus: null,
            onBlur: null,
            customWrapperClass: 'dropdown-wrapper',
            containerClass: 'dropdown-container',
            optionsContainerClass: 'dropdown-option-container',
            optionsContainerActiveClass: 'dropdown-option-container-active',
            optionsClass: 'dropdown-option',
            optionsHighlightedClass: 'dropdown-option-highlighted',
            optionsSelectedClass: 'dropdown-option-selected',
            selectedValueContainerClass: 'dropdown-value-container',
            selectedValueContainerActiveClass: 'dropdown-value-container-active',
            disabledClass: 'dropdown-disabled'
        }, options);

        FormElement.prototype.initialize.call(this, this.options);

        this._keyMap = {
            38: 'up',
            40: 'down',
            27: 'esc',
            32: 'space'
        };

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

        this._wrapperEl = el.kit.appendOuterHtml('<div class="' + this.options.customWrapperClass + '">');
        this._uiEl = this._buildUIElement();
        this._wrapperEl.appendChild(this._uiEl);

        this._bindUIElementEvents();

        if (selectedOption) {
            this._setUISelectedValue(selectedOption.value);
        }

        if (this.getFormElement().disabled) {
            this.disable();
        }

    },

    /**
     * Builds the UI element.
     * @returns {Element}
     * @private
     */
    _buildUIElement: function () {
        var options = this.options,
            formEl = options.el,
            uiEl = document.createElement('div');

        this._origTabIndex = formEl.tabIndex;

        uiEl.classList.add(this.options.containerClass);
        uiEl.innerHTML = this._buildSelectedValueHtml() + this._buildOptionsHtml();

        // only switch tab index to ui element when not on a mobile device
        // since we're using native there
        if (!DeviceManager.isMobile()) {
            uiEl.tabIndex = this._origTabIndex || 0;
            // remove form element from being focused since we now have the UI element
            formEl.tabIndex = -1;
        }

        return uiEl;
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
     * When a key press event is registered when focused on the UI Element.
     * @param {KeyboardEvent} e - The key up event
     */
    onKeyStrokeUIElement: function (e) {
        var options = this.options,
            highlightClass = this.options.optionsHighlightedClass,
            uiEl = this.getUIElement(),
            uiContainer = uiEl.getElementsByClassName(options.optionsContainerClass)[0],
            selectedUIOptionEl = uiContainer.getElementsByClassName(options.optionsSelectedClass)[0],
            highlightedOptionEl = uiContainer.getElementsByClassName(highlightClass)[0] || selectedUIOptionEl,
            key = this._keyMap[e.keyCode];

        if (!key) {
            return false;
        } else if ((key === 'up' || key === 'down') && !this.isOptionsContainerActive()) {
            this.showOptionsContainer();
        } else if (key === 'up') {
            this._onKeyStrokeUp(highlightedOptionEl);
        } else if (key === 'down') {
            this._onKeyStrokeDown(highlightedOptionEl);
        } else if (!this.isOptionsContainerActive()) {
            return false;
        } else if (key === 'esc') {
            this.hideOptionsContainer();
        } else if (key === 'space') {
            this.setValue(highlightedOptionEl.dataset.value);
            this.hideOptionsContainer();
        }

    },

    /**
     * When the up arrow is triggered.
     * @param {HTMLElement} highlightedOptionEl - The currently highlighted UI option element
     * @private
     */
    _onKeyStrokeUp: function (highlightedOptionEl) {
        var highlightClass = this.options.optionsHighlightedClass,
            prevSibling = highlightedOptionEl.previousSibling;

        highlightedOptionEl.classList.remove(highlightClass);

        // go to bottom option if at the beginning
        if (!prevSibling) {
            prevSibling = this.getUIElement().getElementsByClassName(this.options.optionsContainerClass)[0].lastChild;
        }
        prevSibling.classList.add(highlightClass);
    },

    /**
     * When the down arrow is triggered.
     * @param {HTMLElement} highlightedOptionEl - The currently highlighted UI option element
     * @private
     */
    _onKeyStrokeDown: function (highlightedOptionEl) {
        var highlightClass = this.options.optionsHighlightedClass,
            nextSibling = highlightedOptionEl.nextSibling;

        highlightedOptionEl.classList.remove(highlightClass);

        if (!nextSibling) {
            // get top option element if at end
            nextSibling = this.getUIElement().getElementsByClassName(this.options.optionsContainerClass)[0].firstChild;
        }
        nextSibling.classList.add(highlightClass);
    },


    /**
     * When the select element is focused.
     * @private
     * @param e
     */
    _onFocusFormElement: function (e) {
        if (this.options.onFocus) {
            this.options.onFocus(e);
        }
    },

    /**
     * When the select element loses focused.
     * @private
     * @param e
     */
    _onBlurFormElement: function (e) {
        if (this.options.onBlur) {
            this.options.onBlur(e);
        }
    },

    /**
     * When the UI Element is in focus.
     * @private
     * @param e
     */
    _onFocusUIElement: function (e) {
        var self = this;
        this._windowKeyEventListener = function(e) {
            // if any keys we're listening to internally, prevent default window behavior
            if (self._keyMap[e.keyCode]) {
                e.preventDefault();
            }
        };

        if (!DeviceManager.isMobile()) {
            // prevent default window actions on key strokes
            window.addEventListener('keydown', this._windowKeyEventListener, false);
            window.addEventListener('keyup', this._windowKeyEventListener, false);
            // add key stroke event listeners
            this.getUIElement().kit.addEventListener('keyup', 'onKeyStrokeUIElement', this);
        }

        if (this.options.onFocus) {
            this.options.onFocus(e);
        }
    },

    /**
     * When the UI Element loses focus
     * @private
     * @param e
     */
    _onBlurUIElement: function (e) {
        if (!DeviceManager.isMobile()) {
            this.getUIElement().kit.removeEventListener('keyup', 'onKeyStrokeUIElement', this);
            window.removeEventListener('keydown', this._windowKeyEventListener, false);
            window.removeEventListener('keyup', this._windowKeyEventListener, false);
        }
        if (this.options.onBlur) {
            this.options.onBlur(e);
        }
    },

    /**
     * When an option element inside of the UI element is hovered over
     * @param {MouseEvent} e - The mouse event
     * @private
     */
    _onMouseEnterUIElement: function (e) {
        e.currentTarget.classList.add(this.options.optionsHighlightedClass);
    },

    /**
     * When hovering over an option element inside of the UI element stops.
     * @param {MouseEvent} e - The mouse event
     * @private
     */
    _onMouseLeaveUIElement: function (e) {
        e.currentTarget.classList.remove(this.options.optionsHighlightedClass);
    },

    /**
     * Sets up click events on the ui element and its children.
     * @private
     * @memberOf Dropdown
     */
    _bindUIElementEvents: function () {
        var uiEl = this.getUIElement(),
            uiValueContainer = uiEl.getElementsByClassName(this.options.selectedValueContainerClass)[0],
            formEl = this.getFormElement();

        uiEl.kit.addEventListener('focus', '_onFocusUIElement', this);
        uiEl.kit.addEventListener('blur', '_onBlurUIElement', this);
        formEl.kit.addEventListener('focus', '_onFocusFormElement', this);
        formEl.kit.addEventListener('blur', '_onBlurFormElement', this);

        // add click events on container
        uiValueContainer.kit.addEventListener('click', '_onClickUIValueContainer', this);
    },

    /**
     * Removes all ui element event listeners.
     * @private
     */
    _unbindUIElementEvents: function () {
        var uiEl = this.getUIElement(),
            uiValueContainer = uiEl.getElementsByClassName(this.options.selectedValueContainerClass)[0],
            formEl = this.getFormElement();

        uiEl.kit.removeEventListener('focus', '_onFocusUIElement', this);
        uiEl.kit.removeEventListener('blur', '_onBlurUIElement', this);
        formEl.kit.removeEventListener('focus', '_onFocusFormElement', this);
        formEl.kit.removeEventListener('blur', '_onBlurFormElement', this);

        // add click events on container
        uiValueContainer.kit.removeEventListener('click', '_onClickUIValueContainer', this);
    },

    /**
     * Adds click events on all option elements of the UI-version of dropdown.
     */
    bindUIOptionEvents: function () {
        var optionEls = this.getUIElement().getElementsByClassName(this.options.optionsClass),
            i, count = optionEls.length;
        for (i = 0; i < count; i++) {
            optionEls[i].kit.addEventListener('click', '_onClickUIOption', this);
            optionEls[i].kit.addEventListener('mouseenter', '_onMouseEnterUIElement', this);
            optionEls[i].kit.addEventListener('mouseleave', '_onMouseLeaveUIElement', this);
        }
    },

    /**
     * Removes click events from all options elements of the UI-version of dropdown.
     */
    unbindUIOptionEvents: function () {
        var optionEls = this.getUIElement().getElementsByClassName(this.options.optionsClass),
            i, count = optionEls.length;
        for (i = 0; i < count; i++) {
            optionEls[i].kit.removeEventListener('click', '_onClickUIOption', this);
            optionEls[i].kit.removeEventListener('mouseenter', '_onMouseEnterUIElement', this);
            optionEls[i].kit.removeEventListener('mouseleave', '_onMouseLeaveUIElement', this);
        }
    },

    /**
     * When clicking on the div that represents the select value.
     * @private
     * @memberOf Dropdown
     */
    _onClickUIValueContainer: function () {
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
        var uiEl = this.getUIElement(),
            options = this.options,
            selectedUIOption = this.getUIOptionByDataValue(this.getValue()) || uiEl.getElementsByClassName(options.optionsClass)[0];
        uiEl.kit.classList.add(options.optionsContainerActiveClass);
        this.bindUIOptionEvents();
        // set selected class on selected value for instances where it is not present
        // like upon showing the container for the first time
        if (selectedUIOption) {
            selectedUIOption.classList.add(this.options.optionsSelectedClass);
        }
        document.body.kit.addEventListener('click', 'onClickDocument', this);
    },

    /**
     * Hides the UI options container element.
     */
    hideOptionsContainer: function () {
        // Redraw of options container needed for iPad and Safari.
        if (DeviceManager.isBrowser('safari')) {
            this.redrawOptionsContainer();
        }
        this.getUIElement().kit.classList.remove(this.options.optionsContainerActiveClass);
        this.unbindUIOptionEvents();
        document.body.kit.removeEventListener('click', 'onClickDocument', this);
    },

    /**
     * Forces a redraw of the options container element.
     * @note If dropdown options are hidden on default,
     * this will force the styles to be updated when active class is removed.
     */
    redrawOptionsContainer: function () {
        var optionsContainerEl = this.getUIElement().getElementsByClassName(this.options.optionsContainerClass)[0],
            currentOverflowAttr = optionsContainerEl.style.overflow;

        // update overflow property to force the redraw.
        optionsContainerEl.style.overflow = 'hidden';
        optionsContainerEl.offsetHeight;
        // if there was an original overflow property, reset it
        // or remove the property
        if (currentOverflowAttr) {
            optionsContainerEl.style.overflow = currentOverflowAttr;
        } else {
            optionsContainerEl.style.removeProperty('overflow');
        }
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
        this.hideOptionsContainer();

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
        return this._uiEl;
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
     * Gets an UI option element by its data value.
     * @param dataValue
     * @returns {*}
     */
    getUIOptionByDataValue: function (dataValue) {
        return this.getUIElement().querySelectorAll('.' + this.options.optionsClass + '[data-value="' + dataValue + '"]')[0];
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
     * Clears all options in the dropdown
     */
    clear: function () {
        this.setValue('');
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
        this.unbindUIOptionEvents();
        this._unbindUIElementEvents();
        el.kit.removeEventListener('change', '_onSelectChange', this);
        el.style.display = this._origDisplayValue; // put original display back
        el.tabIndex = this._origTabIndex;
        // restore html
        this._wrapperEl.parentNode.replaceChild(el, this._wrapperEl);
    }

});

module.exports = Dropdown;