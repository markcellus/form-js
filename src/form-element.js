'use strict';
var _ = require('underscore');
var Module = require('module.js');
require('element-kit');

/**
 * @class FormElement
 * @description An extendable base class that provides common functionality among all form elements.
 */
var FormElement = Module.extend({

    /**
     * Sets up stuff.
     * @abstract
     * @param {Object} options - Instantiation options
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
     * Clears the element.
     */
    clear: function () {},

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
    }

});

module.exports = FormElement;