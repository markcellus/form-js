'use strict';
import _ from 'underscore';

/**
 * @class SubmitButton
 */
class SubmitButton {

    /**
     * Sets up stuff.
     * @abstract
     * @param {Object} options - Instantiation options
     */
    constructor (options) {
        options = _.extend({
            el: null,
            disabledClass: 'disabled',
            onClick: null
        }, options);

        this.options = options;
        this._onClickEventListener = this.onClick.bind(this);
        this.options.el.addEventListener('click', this._onClickEventListener);
    }

    /**
     * When the submit button is clicked.
     * @param e
     */
    onClick (e) {
        if (this.options.onClick) {
            this.options.onClick(e);
        }
    }

    /**
     * Returns the submit button element
     * @returns {HTMLElement} the submit button
     * @abstract
     */
    getSubmitButton () {
        return this.options.el;
    }

    /**
     * Enables the form element.
     * @abstract
     */
    enable () {
        let btn = this.getSubmitButton();
        btn.disabled = false;
        btn.classList.remove(this.options.disabledClass);
    }

    /**
     * Disables the form element.
     * @abstract
     */
    disable () {
        let btn = this.getSubmitButton();
        btn.disabled = true;
        btn.classList.add(this.options.disabledClass);
    }

    /**
     * Removes event listeners.
     */
    destroy () {
        this.options.el.removeEventListener('click', this._onClickEventListener);
    }
}

module.exports = SubmitButton;
