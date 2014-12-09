/** 
* FormJS - v0.1.4.
* https://github.com/mkay581/formjs.git
* Copyright 2014. Licensed MIT.
*/
define(['underscore'], function (_) {
    

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

    return FormElement;
});