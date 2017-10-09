'use strict';
// we need Map (which requires Symbol) here
import 'core-js/es6/symbol';
import Map from 'core-js/es6/map';

/**
 * Bubbles up each parent node of the element, triggering the callback on each element until traversal
 * either runs out of parent nodes, reaches the document element, or if callback returns a falsy value
 * @param {HTMLElement} [startEl] - The element where traversal will begin (including the passed element), defaults to current el
 * @param {Function} callback - A callback that fires which gets passed the current element
 */
let traverseEachParent = function (startEl, callback) {
    let parentNode = startEl.parentNode || startEl,
        predicate;
    // check if the node has classname property, if not, we know we're at the #document element
    while (parentNode && typeof parentNode.className === 'string') {
        predicate = callback(parentNode);
        if (predicate !== undefined && !predicate) {
            break;
        }
        parentNode = parentNode.parentNode;
    }
};

/**
 * @class FormElement
 * @description An extendable base class that provides common functionality among all form elements.
 */
class FormElement {

    /**
     * Sets up stuff.
     * @abstract
     * @param {Object} options - Instantiation options
     */
    constructor (options) {
        this.options = options || {};
        this._eventListeners = new Map();
    }

    /**
     * Gets the form element.
     * @returns {HTMLElement} Returns the form element
     * @abstract
     */
    getFormElement () {
        return this.options.el;
    }

    /**
     * Gets the ui version of the form element.
     * @returns {HTMLElement} Returns the ui-version of the element.
     * @abstract
     */
    getUIElement () {
        return this.getFormElement();
    }

    /**
     * Gets the form elements.
     * @returns {Array} Returns the array of form elements
     * @abstract
     */
    getFormElements () {
        return [this.getFormElement()];
    }

    /**
     * Gets the current value of the element.
     * @returns {string}
     * @abstract
     */
    getValue () {
        return this.getFormElement().value;
    }

    /**
     * Sets the value of the form element.
     * @param {string} value - The new value
     * @abstract
     */
    setValue (value) {
        let el = this.getFormElements()[0];
        if (el) {
            el.value = value;
        }
    }

    /**
     * Clears the element.
     * @abstract
     */
    clear () {}

    /**
     * Gets the ui versions of the form elements.
     * @returns {Array} Returns the array of ui-versions of the element.
     * @abstract
     */
    getUIElements () {
        return [this.getUIElement()];
    }

    /**
     * Enables the form element.
     * @abstract
     */
    enable () {
        this.getFormElement().disabled = false;
    }

    /**
     * Disables the form element.
     * @abstract
     */
    disable () {
        this.getFormElement().disabled = true;
    }

    /**
     * Gets the element's identifier (preferably unique from all other elements that extend this class).
     * @returns {string} Return the unique key
     * @abstract
     */
    static getElementKey () {
        return 'element';
    }

    /**
     * Adds an event listener to an element.
     * @param {HTMLElement} element - The element to add the listener to
     * @param {String} eventName - The name of the event
     * @param {String} method - The name of the method to call when event fires
     * @param {Object} [context] - The context in which to call the method parameter
     * @param {Boolean} [useCapture] - Whether to use capture
     */
    addEventListener (element, eventName, method, context, useCapture) {
        context = context || this;
        let listener = context[method].bind(context);
        element.addEventListener(eventName, listener, useCapture);
        this._eventListeners.set(listener, {
            name: eventName,
            el: element,
            method: method,
            context: context
        });
    }

    /**
     * Gets the closest ancestor element that has a css class.
     * @param {HTMLElement} el - The element of which to get the closest ancestor
     * @param {string} className - The class name that the ancestor must have to match
     */
    getClosestAncestorElementByClassName (el, className) {
        let result = null;
        traverseEachParent(el, function (parent) {
            if (parent.classList.contains(className)) {
                result = parent;
                return false;
            }
        });
        return result;
    }

    /**
     * Removes an event listener from an element.
     * @param {HTMLElement} element - The element to add the listener to
     * @param {String} eventName - The name of the event
     * @param {String} method - The name of the method to call when event fires
     * @param {Object} [context] - The context in which to call the method parameter
     * @param {Boolean} [useCapture] - Whether to use capture
     */
    removeEventListener (element, eventName, method, context, useCapture) {
        for (let [listener, obj] of this._eventListeners) {
            if (obj.el === element && obj.name === eventName && obj.context === context && obj.method === method) {
                element.removeEventListener(eventName, listener, useCapture);
                this._eventListeners.delete(listener);
                break;
            }
        }
    }

    /**
     * Removes all event listeners.
     */
    destroy () {
        this._eventListeners.forEach((obj) => {
            this.removeEventListener(obj.el, obj.name, obj.method, obj.context);
        });
        this._eventListeners.clear();
    }

}

module.exports = FormElement;
