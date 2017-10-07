/**
 * Creates an event.
 * @param {string} name - The event name
 * @param {object} [options] - Options to be passed to event
 */
export function createEvent(name, options) {
    let event;
    options = options || {};
    options.bubbles = options.bubbles || true;
    options.cancelable = options.cancelable|| true;

    event = document.createEvent('CustomEvent');
    event.initCustomEvent(name, options.bubbles, options.cancelable, null);
    return event;
}

/**
 * Creates an HTML Element from an html string.
 * @param {string} html - String of html
 * @returns {Node} - Returns and html element node
 */
export function createHtmlElementFromString(html) {
    let tempParentEl,
        el;
    if (html) {
        html = html.trim();
        tempParentEl = document.createElement('div');
        tempParentEl.innerHTML = html;
        el = tempParentEl.childNodes[0];
        return tempParentEl.removeChild(el);
    }
}

