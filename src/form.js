'use strict';
var _ = require('underscore');
require('element-kit');

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
        console.log(this.options.el);
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

module.exports = Form;