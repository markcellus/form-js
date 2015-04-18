'use strict';
var _ = require('underscore');
var Module = require('module.js');
require('element-kit');

/**
 * @class SubmitButton
 */
var SubmitButton = Module.extend({

    /**
     * Sets up stuff.
     * @abstract
     * @param {Object} options - Instantiation options
     */
    initialize: function (options) {
        this.options = _.extend({
            el: null,
            disabledClass: 'disabled',
            onClick: null
        }, options);

        Module.prototype.initialize.call(this, this.options);

        this.options.el.kit.addEventListener('click', 'onClick', this);
    },

    /**
     * When the submit button is clicked.
     * @param e
     */
    onClick: function (e) {
        if (this.options.onClick) {
            this.options.onClick(e);
        }
    },

    /**
     * Returns the submit button element
     * @returns {HTMLElement} the submit button
     * @abstract
     */
    getSubmitButton: function () {
        return this.options.el;
    },

    /**
     * Enables the form element.
     * @abstract
     */
    enable: function () {
        var btn = this.getSubmitButton();
        btn.disabled = false;
        btn.classList.remove(this.options.disabledClass);
    },

    /**
     * Disables the form element.
     * @abstract
     */
    disable: function () {
        var btn = this.getSubmitButton();
        btn.disabled = true;
        btn.classList.add(this.options.disabledClass);
    },

    /**
     * Removes event listeners.
     */
    destroy: function () {
        this.options.el.kit.removeEventListener('click', 'onClick', this);
        Module.prototype.destroy.call(this);
    }
});

module.exports = SubmitButton;