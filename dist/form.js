/** 
* form-js - v1.11.1.
* https://github.com/mkay581/form-js.git
* Copyright 2015 Mark Kennedy. Licensed MIT.
*/

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Form = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*global define:false require:false */
module.exports = (function(){
	// Import Events
	var events = require('events')

	// Export Domain
	var domain = {}
	domain.createDomain = domain.create = function(){
		var d = new events.EventEmitter()

		function emitError(e) {
			d.emit('error', e)
		}

		d.add = function(emitter){
			emitter.on('error', emitError)
		}
		d.remove = function(emitter){
			emitter.removeListener('error', emitError)
		}
		d.bind = function(fn){
			return function(){
				var args = Array.prototype.slice.call(arguments)
				try {
					fn.apply(null, args)
				}
				catch (err){
					emitError(err)
				}
			}
		}
		d.intercept = function(fn){
			return function(err){
				if ( err ) {
					emitError(err)
				}
				else {
					var args = Array.prototype.slice.call(arguments, 1)
					try {
						fn.apply(null, args)
					}
					catch (err){
						emitError(err)
					}
				}
			}
		}
		d.run = function(fn){
			try {
				fn()
			}
			catch (err) {
				emitError(err)
			}
			return this
		};
		d.dispose = function(){
			this.removeAllListeners()
			return this
		};
		d.enter = d.exit = function(){
			return this
		}
		return d
	};
	return domain
}).call(this)
},{"events":2}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
'use strict';
/**
 A class to add a simple EventTarget (https://developer.mozilla.org/en-US/docs/Web/API/EventTarget) API
 around any object or function, so that it can begin to receive and trigger event listeners.
 @class Listen
 */

var Listen = {

    /**
     * Registers a target to begin receiving and triggering events.
     * @param {Object|Function} target - The target
     */
    createTarget: function (target) {
        this._targets = this._targets || [];

        var targetMap = this._getTargetMap(target);
        if (!targetMap.target) {
            target.addEventListener = this._getEventMethod(target, '_addEvent').bind(this);
            target.removeEventListener = this._getEventMethod(target, '_removeEvent').bind(this);
            target.dispatchEvent = this._getEventMethod(target, '_dispatchEvent').bind(this);
            targetMap.target = target;
            this._targets.push(targetMap);
        }
    },

    /**
     * Looks through all targets and finds the one that has a target object that matches the passed in instance
     * @param target
     * @returns {Object}
     * @private
     */
    _getTargetMap: function (target) {
        return this._targets.filter(function (map) {
                return map.target === target;
            })[0] || {};
    },

    /**
     * Registers a callback to be fired when the url changes.
     * @private
     * @param {Object|Function} target
     * @param {String} eventName
     * @param {Function} listener
     * @param {boolean} useCapture
     * @param {Object} [context]
     */
    _addEvent: function (target, eventName, listener, useCapture, context) {

        if (typeof useCapture !== 'boolean') {
            context = useCapture;
            useCapture = null;
        }

        // replicating native JS default useCapture option
        useCapture = useCapture || false;

        var existingListeners = this.getNested(this._getTargetMap(target), eventName);
        if (!existingListeners) {
            existingListeners = this.setNested(this._getTargetMap(target), eventName, []);
        }

        var listenerObj = {
            listener: listener,
            context: context,
            useCapture: useCapture
        };
        // dont add event listener if target already has it
        if (existingListeners.indexOf(listenerObj) === -1) {
            existingListeners.push(listenerObj);
        }
    },

    /**
     * Returns our internal method for a target.
     * @private
     * @param target
     * @param method
     * @returns {*|function(this:Listen)}
     */
    _getEventMethod: function (target, method) {
        return function () {
            var args = Array.prototype.slice.call(arguments, 0);
            args.unshift(target);
            this[method].apply(this, args);
        }.bind(this);
    },

    /**
     * Removes an event listener from the target.
     * @private
     * @param target
     * @param eventName
     * @param listener
     */
    _removeEvent: function (target, eventName, listener) {
        var existingListeners = this.getNested(this._getTargetMap(target), eventName, []);
        existingListeners.forEach(function (listenerObj, idx) {
            if (listenerObj.listener === listener) {
                existingListeners.splice(idx, 1);
            }
        });
    },

    /**
     * Triggers all event listeners on a target.
     * @private
     * @param {Object|Function} target - The target
     * @param {String} eventName - The event name
     * @param {Object} customData - Custom data that will be sent to the url
     */
    _dispatchEvent: function (target, eventName, customData) {
        var targetObj = this._getTargetMap(target) || {},
            e;
        if (targetObj[eventName]) {
            targetObj[eventName].forEach(function (listenerObj) {
                e = this._createEvent(eventName, customData);
                listenerObj.listener.call(listenerObj.context || target, e);
            }.bind(this));
        }
    },

    /**
     * Creates an event.
     * @param {string} eventName - The event name
     * @param {Object} customData - Custom data that will be sent to the url
     * @private
     */
    _createEvent: function (eventName, customData) {
        // For IE 9+ compatibility, we must use document.createEvent() for our CustomEvent.
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(eventName, false, false, customData);
        return evt;
    },

    /**
     * Merges the contents of two or more objects.
     * @param {object} obj - The target object
     * @param {...object} - Additional objects who's properties will be merged in
     */
    extend: function (target) {
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
    },

    /**
     * Gets a deeply nested property of an object.
     * @param {object} obj - The object to evaluate
     * @param {string} map - A string denoting where the property that should be extracted exists
     * @param {object} [fallback] - The fallback if the property does not exist
     */
    getNested: function (obj, map, fallback) {
        var mapFragments = map.split('.'),
            val = obj;
        for (var i = 0; i < mapFragments.length; i++) {
            if (val[mapFragments[i]]) {
                val = val[mapFragments[i]];
            } else {
                val = fallback;
                break;
            }
        }
        return val;
    },

    /**
     * Sets a nested property on an object, creating empty objects as needed to avoid undefined errors.
     * @param {object} obj - The initial object
     * @param {string} map - A string denoting where the property that should be set exists
     * @param {*} value - New value to set
     * @example this.setNested(obj, 'path.to.value.to.set', 'newValue');
     */
    setNested: function (obj, map, value) {
        var mapFragments = map.split('.'),
            val = obj;
        for (var i = 0; i < mapFragments.length; i++) {
            var isLast = i === (mapFragments.length - 1);
            if (!isLast) {
                val[mapFragments[i]] = val[mapFragments[i]] || {};
                val = val[mapFragments[i]];
            } else {
                val[mapFragments[i]] = value;
            }
        }
        return value;
    },

    /**
     * Removes target from being tracked therefore eliminating all listeners.
     * @param target
     */
    destroyTarget: function (target) {
        var map = this._getTargetMap(target),
            index = this._targets.indexOf(map);
        if (index > -1) {
            this._targets.splice(index, 1);
        }
    }
};

module.exports = Listen;
},{}],5:[function(require,module,exports){
'use strict';

var Listen = require('listen-js');
/**
 @class DeviceManager
 @description A set of utilities for managing the state of the user's current device.
 */
var DeviceManager = function () {
    this.initialize();
};

DeviceManager.prototype = {

    /**
     * Upon initialization.
     * @memberOf DeviceManager
     */
    initialize: function () {
        // allow event listening on the device
        Listen.createTarget(this);

        this._getOrientationChangeListener = function () {
            var self = this;
            return function () {
                self._onOrientationChange.bind(self);
            }
        };

        window.addEventListener('orientationchange', this._getOrientationChangeListener());
    },

    /**
     * When the user changes the orientation of their device.
     * @private
     */
    _onOrientationChange: function () {
        var orientation;

        if (window.innerHeight <= window.innerWidth) {
            orientation = 'landscape';
        } else {
            orientation = 'portrait';
        }
        this.dispatchEvent('orientationchange', {orientation: orientation});
    },

    /**
     * Gets the user agent string of the current session.
     * @returns {string}
     */
    getUserAgent: function () {
        return window.navigator.userAgent;
    },

    /**
     * Checks if the user is on a specific browser.
     * @param {string|Array} name - The browser OS names to check
     * @returns {boolean}
     */
    isBrowser: function (name) {
        var pattern = name,
            userAgent = this.getUserAgent(),
            reg;

        if (!name) {
            return true;
        }

        if (Array.isArray(name)) {
            pattern = name.join('|');
        }

        if (pattern.indexOf('safari') > -1) {
            // avoid safari returning true when in chrome
            reg = new RegExp('chrome', 'i');
            return !reg.test(userAgent);
        } else {
            reg = new RegExp(pattern, 'i');
            return reg.test(userAgent);
        }
    },

    /**
     * Checks if the user is on a mobile device.
     * @returns {boolean}
     */
    isMobile: function () {
        return this.isBrowser(['Android', 'webOS', 'iPhone', 'iPad', 'iPod', 'BlackBerry', 'IEMobile', 'Opera Mini']);
    },

    /**
     * Checks if the OS is of a certain type.
     * @param {string|Array} name - The name of the OS
     * @returns {boolean}
     */
    isOS: function (name) {
        var pattern = name;
        if (Array.isArray(name)) {
            pattern = name.join('|');
        }
        var reg = new RegExp(pattern, 'i');
        return reg.test(this.getUserAgent());
    },

    /**
     * Removes events and cleans up.
     */
    destroy: function () {
        window.removeEventListener('orientationchange', this._getOrientationChangeListener());
        Listen.destroyTarget(this);
    }

};

module.exports = new DeviceManager();
},{"listen-js":4}],6:[function(require,module,exports){
'use strict';

var Element = require('./element');
var ImageElement = require('./image-element');

var elementCount = 0, cache = {}, loaded;

module.exports = (function () {

    var ElementKit = function (options) {
        this.initialize(options);
    };
    ElementKit.prototype = {
        /**
         * Does a little setup for element kit.
         */
        initialize: function () {

            var self = this;
            // can only define the element property once or an exception will be thrown
            // must also check if element kit was loaded by some other module dependency
            if (!loaded && !document.body.kit) {
                // make element kit available on ALL DOM Elements when they are created
                loaded = Object.defineProperty(window.Element.prototype, 'kit', {
                    get: function () {
                        return self.setup(this);
                    }
                });
            }
        },

        /**
         * Sets up the kit on an element.
         * @param {HTMLElement} el - The element in which to load the kit onto
         * @returns {Element|ImageElement} Returns the element instance
         */
        setup: function (el) {
            var ElementClass;
            // only add a new instance of the class if it hasnt already been added
            if (!cache[el._kitId]) {
                ElementClass = el instanceof window.HTMLImageElement ? ImageElement : Element;
                elementCount++;
                el._kitId = elementCount;
                cache[el._kitId] = new ElementClass(el);
            }
            return cache[el._kitId];
        },
        /**
         * Destroys element kit.
         */
        destroy: function () {}

    };

    return new ElementKit();

})();
},{"./element":7,"./image-element":8}],7:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var ElementKit = require('./element-kit');

var Element = function (el) {
    this.initialize(el);
};

/**
 * A class from which all Elements are based.
 * @description Bootstraps an element to allow for native JS methods (see https://developer.mozilla.org/en-US/docs/Web/API/Element)
 * @class Element
 * @param {Element} el - The element
 */
Element.prototype = /** @lends Element */{

    initialize: function (el) {
        this.el = el;
        this.classList = this._getClassList();
        this._eventListenerMap = this._eventListenerMap || [];

        Object.defineProperty(this, 'dataset', {
            get: function () {
                return this.getData();
            }.bind(this)
        });
    },

    /**
     * Bubbles up each parent node of the element, triggering the callback on each element until traversal
     * either runs out of parent nodes, reaches the document element, or if callback returns a falsy value
     * @param {Function} callback - A callback that fires which gets passed the current element
     * @param {HTMLElement} [startEl] - The element where traversal will begin (including the passed element), defaults to current el
     * @private
     */
    _traverseEachParent: function (callback, startEl) {
        var parentNode = startEl || this.el,
            predicate;
        // check if the node has classname property, if not, we know we're at the #document element
        while (parentNode && typeof parentNode.className === 'string') {
            predicate = callback(parentNode);
            if (predicate !== undefined && !predicate) {
                break;
            }
            parentNode = parentNode.parentNode;
        }
    },

    /**
     * Wrap a parent container element around the element.
     * @param {string} html - The wrapper html
     */
    appendOuterHtml: function (html) {
        var parent = this.el.parentNode,
            container = utils.createHtmlElement(html);
        if (parent) {
            parent.replaceChild(container, this.el);
        } else {
            parent = document.createDocumentFragment();
            parent.appendChild(container);
        }
        container.appendChild(this.el);
        return container;
    },

    /**
     * Retrieves the unique identifier of the element.
     * @private
     */
    getUniqueId: function () {
        return this.el._kitId;
    },

    /**
     * Gets the closest ancestor element that has a css class.
     * @param {string} className - The class name that the ancestor must have to match
     */
    getClosestAncestorElementByClassName: function (className) {
        var result;
        this._traverseEachParent(function (parent) {
            if (parent.kit._hasClass(className)) {
                result = parent;
                return false;
            }
        }, this.el.parentNode);
        return result;
    },

    /**
     * Adds an event listener to the element.
     * @param {string} event - The event to listen to
     * @param {string|Function} listener - The name of the function (or the function itself) that should fire when the event happens
     * @param {Object} [context] - The context in which the function should be called
     * @param {Object} [options] - Object containing additional options
     * @param {Object} [options.useCapture] - Whether to use capture (see Web.API.EventTarget.addEventListener)
     */
    addEventListener: function (event, listener, context, options) {
        var _listener = listener;
        options = options || {};

        if (typeof _listener !== 'function') {
            _listener = this._createEventListener(context[listener], context);
        }

        this.el.addEventListener(event, _listener, options.useCapture);

        this._eventListenerMap.push({
            event: event,
            listener: _listener,
            listenerId: listener,
            context: context
        });
    },

    /**
     * Creates an event listener bounded to a context (useful for adding and removing events).
     * @param {Function} listener - The listener function
     * @param {Object} context - The context that should be used when the function is called
     * @returns {Function} Returns an event listener function bounded to the context
     * @private
     */
    _createEventListener: function (listener, context) {
        return function (e) {
            context = context || this;
            listener.apply(context, arguments);
        }
    },

    /**
     * Removes an event listener from the element.
     * @param {string} event - The event to remove
     * @param {string|Function} listener - The event listener function or (name of it) to be removed
     * @param {Object} [context] - The context of the listener that is being removed
     */
    removeEventListener: function (event, listener, context) {
        var map = this._eventListenerMap || [],
            i,
            obj;

        if (map.length) {
            for (i = 0; i < map.length; i++) {
                obj = map[i];
                if (obj && obj.event === event && obj.listenerId === listener && obj.context === context) {
                    this.el.removeEventListener(event, obj.listener);
                    this._eventListenerMap[i] = null;
                    break;
                }
            }
        }
    },

    /**
     * Builds a transition promise that waits to resolve until the el's CSS transition is completed.
     * @param {Function} callback - The callback that is fired when the transition time is complete
     * @returns {HTMLElement} Returns the html element
     */
    waitForTransition: function (callback) {
        var duration = this.getTransitionDuration();
        if (callback) {
            if (duration > 0) {
                setTimeout(callback.bind(this, this.el), duration);
            } else {
                callback(this.el);
            }
        }
    },

    /**
     * Gets the time is takes for the element to transition to its show state.
     * @returns {Number} Returns the total CSS transition time in milliseconds
     */
    getTransitionDuration: function () {
        var delayProp = this.getCssComputedProperty('transition-delay') || '0ms',
            durationProp = this.getCssComputedProperty('transition-duration') || '0ms',
            times = Array.isArray(durationProp) ? durationProp : [durationProp],
            delay = Array.isArray(delayProp) ? delayProp : [delayProp],
            highest = 0,
            map;

        times.push.apply(times, delay); // account for delay

        // calculate highest number of time
        times.forEach(function (value) {
            value.split(',').forEach(function (v) {
                v = this._convertCssTimeValueToMilliseconds(v);
                map = this._getCssPropUnitMap(v);
                if (map.num > highest) {
                    highest = map.num;
                }
            }.bind(this));
        }.bind(this));

        return highest;
    },

    /**
     * Gets the computed property of the element.
     * @param {string} prop - The name of the property to get
     * @returns {string} Returns the value of the property
     */
    getCssComputedProperty: function (prop) {
        var style = window.getComputedStyle(this.el);
        return style.getPropertyValue(prop) || this.el.style[this._getJsPropName(prop)];
    },

    /**
     * Takes a value and separates the number and unit into a key/value map.
     * @param v - The value
     * @returns {{num: Number, unit: string}} Returns the map
     * @private
     */
    _getCssPropUnitMap: function (v) {
        v.trim();
        var num = v.match('[0-9\.]+'),
            unit = 'ms';

        num = num ? num[0] : '';
        if (num) {
            unit = v.split(num)[1];
            num = Number(num);
        }
        return {
            num: num,
            unit: unit
        };
    },

    /**
     * Converts a css timing unit value into milliseconds.
     * @param {string} val - The value string
     * @returns {string} Returns the timing unit value in milliseconds
     * @private
     */
    _convertCssTimeValueToMilliseconds: function (val) {
        var number = this._getCssPropUnitMap(val).num,
            unit = val.replace(number, '');
        if (unit === 's') {
            val = number * 1000;
        } else {
            val = number;
        }
        return val + 'ms';
    },

    /**
     * Gets the class list of an element.
     * @returns {Array} Returns an array of class names.
     * @private
     */
    _getClassList: function () {
        return {
            add: this._addClass.bind(this),
            remove: this._removeClass.bind(this),
            contains: this._hasClass.bind(this),
            toggle: this._toggleClass.bind(this)
        };
    },

    /**
     * Gets the class list of an element.
     * @returns {Array} Returns an array of class names.
     * @private
     */
    _getCssClasses: function () {
        return this.el.className.split(' ');
    },

    /**
     * Toggles (adds/removes) a css class on the element.
     * @param {string} className - The css class value to add/remove
     * @private
     */
    _toggleClass: function (className) {
        if (!this._hasClass(className)) {
            this._addClass(className);
        } else {
            this._removeClass(className);
        }
    },

    /**
     * Adds a CSS class to the element.
     * @param {...string} arguments - The arguments containing css classes to add
     * @private
     */
    _addClass: function  () {
        if (('classList' in document.createElement('_'))) {
            // browser supports classList!
            this._each(arguments, function (className) {
                this.el.classList.add(className);
            }.bind(this));
        } else {
            this._each(arguments, function (className) {
                if (!this._hasClass(className)) {
                    this.el.className = this.el.className ? this.el.className + ' ' + className : className;
                }
            }.bind(this));
        }
    },

    /**
     * Triggers a callback function for a set of items.
     * @param {Array} items - An array of items
     * @param {Function} method - The function to execute for each item
     * @private
     */
    _each: function (items, method) {
        var count = items.length,
            i;
        for (i = 0; i < count; i++) {
            method(items[i]);
        }
    },

    /**
     * Removes a CSS class from the element.
     * @param {...string} arguments - The arguments containing css classes to remove
     * @private
     */
    _removeClass: function () {
        var re;
        if ('classList' in document.createElement('_')) {
            this._each(arguments, function (className) {
                this.el.classList.remove(className);
            }.bind(this));
        } else {
            this._each(arguments, function (className) {
                if (this.el.className === className) {
                    // if the only class that exists,  remove it and make empty string
                    this.el.className = '';
                } else {
                    re = '[\\s]*' + className;
                    re = new RegExp(re, 'i');
                    this.el.className = this.el.className.replace(re, '');
                }
            }.bind(this));
        }
    },

    /**
     * Checks if the element has a class.
     * @param {string} className - The css class value to check
     * @private
     */
    _hasClass: function (className) {
        var classes = this._getCssClasses();
        return classes.indexOf(className) !== -1;
    },

    /**
     * Takes a css property name and returns the javascript version of it.
     * @param {string} cssProp - The css property
     * @returns {string} Returns the javascript version
     * @private
     */
    _getJsPropName: function (cssProp) {
        // convert to camelCase
        cssProp = cssProp.replace(/-([a-z])/g, function (letter) {
            return letter[1].toUpperCase();
        });
        return cssProp;
    },

    /**
     * Gets a simplified mapping of all attributes of an element.
     * @returns {object} - Returns an object containing all attribute mappings
     */
    getAttributes: function () {
        var attrs = this.el.attributes,
            map = {};
        if (attrs.length) {
            for (var i = 0; i < attrs.length; i++) {
                map[attrs[i].name] = attrs[i].value;
            }
        }
        return map;
    },

    /**
     * Gets the elements current data attributes that have been assigned in the DOM.
     * @returns {{}}
     * @private
     */
    _getDomData: function () {
        var attrs = this.getAttributes(), data = {}, key, value;
        for (key in attrs) {
            if (attrs.hasOwnProperty(key)) {
                value = attrs[key];
                if (key.indexOf('data-') === 0) {
                    // data attribute found!
                    key = key.substr(5);
                    data[key] = value;
                }
            }
        }
        return data;
    },

    /**
     * Returns an object of the element's current data attributes.
     * @returns {*|{}}
     */
    getData: function () {
        var key;

        this._data = utils.extend({}, this._data, this._getDomData());

        // convert all current data properties to be "watchable".
        for (key in this._data) {
            if (this._data.hasOwnProperty(key)) {
                var value = this._data[key];
                // TODO: we should only convert it if it isnt already a "watchable" obj
                Object.defineProperty(this._data, key, {
                    writeable: true,
                    get: function () {
                        return value;
                    }.bind(this),
                    set: function (value) {
                        this.setData.bind(this, key, value)
                    }.bind(this)
                });
            }
        }
        return this._data;

    },

    /**
     * When data is being set.
     * @param {string} key - The key of which to be set
     * @param {*} value - The value
     */
    setData: function (key, value) {
        this.el.setAttribute('data-' + key, value);
        this._data[key] = value;

    },

    /**
     * Destroys the kit on the element.
     */
    destroy: function () {}
};

module.exports = Element;
},{"./element-kit":6,"./utils":9}],8:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var Element = require('./element');

/**
 * A class from which all image elements are based.
 * @class ImageElement
 * @param {Element} el - The element
 * @todo: find a more simple way to extend Element class along with its prototypes
 */
var ImageElement = function (el) {
    Element.prototype.initialize.call(this, el);
};
ImageElement.prototype = utils.extend({}, Element.prototype, {
    /**
     * Loads the image asset from a provided source url.
     * @param {string} srcAttr - The attribute on the element which has the image source url or any url
     * @param {Function} [callback] - The callback fired when the image has loaded
     */
    load: function (srcAttr, callback) {
        var el = this.el,
            src = el.getAttribute(srcAttr) || srcAttr;

        if (!src) {
            console.warn('ElementKit error: ImageElement has no "' + srcAttr + '" attribute to load');
        }

        if (src.indexOf(',') !== -1) {
            // image is a srcset!
            src = this._getImageSourceSetPath(src);
        }
        this._loadImage(src, callback);
        return this;
    },

    /**
     * Loads an image in a virtual DOM which will be cached in the browser and shown.
     * @param {string} src - The image source url
     * @param {Function} callback - Function that is called when image has loaded
     * @private
     */
    _loadImage: function (src, callback) {
        var img = this.el;
        img.onload = function () {
            callback ? callback(img) : null;
        };
        img.src = src;
    },

    /**
     * Sniffs srcset attribute and detects the images viewport size to return the correct source image to display
     * FYI: browsers do have this functionality natively but some of them have it turned by default (Firefox, IE, etc)
     * @param {string} srcSet - The source set attribute
     * @returns {string} Returns the source image path
     * @private
     */
    _getImageSourceSetPath: function (srcSet) {
        var viewportWidth = window.innerWidth,
            viewportHeight = window.innerHeight,
            src,
            widthHeightMap,
            width,
            height,
            found;
        srcSet.split(',').forEach(function (str) {
            widthHeightMap = this._buildSourceMapWidthHeight(str);
            width = widthHeightMap.width || 0;
            height = widthHeightMap.height || 0;
            if (!found && viewportWidth >= width && viewportHeight >= height) {
                src = str.split(' ')[0];
                found = true;
            }
        }.bind(this));
        return src;
    },

    /**
     * Builds a mapping of width and height within a srcset attribute.
     * @param {String} str - The srcset attribute string
     * @param {Object} [map] - The object that width and height keys will be attached to
     * @returns {*|{}}
     * @private
     */
    _buildSourceMapWidthHeight: function (str, map) {
        var frags = str.split(' '),
            attrId,
            getNumber = function (frag) {
                return Number(frag.substr(0, frag.length - 1))
            };

        map = map || {};

        frags.shift(); // remove first item since we know it is the filename

        frags.forEach(function (frag) {
            attrId = frag.charAt(frag.length - 1);
            if (attrId === 'w') {
                map.width = getNumber(frag);
            } else if (attrId === 'h') {
                map.height = getNumber(frag);
            }
        });
        return map;
    }

});

module.exports = ImageElement;
},{"./element":7,"./utils":9}],9:[function(require,module,exports){
module.exports = {
    /**
     * Creates an HTML Element from an html string.
     * @param {string} html - String of html
     * @returns {HTMLElement} - Returns and html element node
     */
    createHtmlElement: function (html) {
        var tempParentEl,
            el;
        if (html) {
            html = html.trim(html);
            tempParentEl = document.createElement('div');
            tempParentEl.innerHTML = html;
            el = tempParentEl.childNodes[0];
            return tempParentEl.removeChild(el);
        }
    },

    /**
     * Merges the contents of two or more objects.
     * @param {object} obj - The target object
     * @param {...object} - Additional objects who's properties will be merged in
     */
    extend: function (target) {
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
};
},{}],10:[function(require,module,exports){
'use strict';

module.exports = require('./lib')

},{"./lib":15}],11:[function(require,module,exports){
'use strict';

var asap = require('asap/raw');

function noop() {}

// States:
//
// 0 - pending
// 1 - fulfilled with _value
// 2 - rejected with _value
// 3 - adopted the state of another promise, _value
//
// once the state is no longer pending (0) it is immutable

// All `_` prefixed properties will be reduced to `_{random number}`
// at build time to obfuscate them and discourage their use.
// We don't use symbols or Object.defineProperty to fully hide them
// because the performance isn't good enough.


// to avoid using try/catch inside critical functions, we
// extract them to here.
var LAST_ERROR = null;
var IS_ERROR = {};
function getThen(obj) {
  try {
    return obj.then;
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

function tryCallOne(fn, a) {
  try {
    return fn(a);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}
function tryCallTwo(fn, a, b) {
  try {
    fn(a, b);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

module.exports = Promise;

function Promise(fn) {
  if (typeof this !== 'object') {
    throw new TypeError('Promises must be constructed via new');
  }
  if (typeof fn !== 'function') {
    throw new TypeError('not a function');
  }
  this._37 = 0;
  this._12 = null;
  this._59 = [];
  if (fn === noop) return;
  doResolve(fn, this);
}
Promise._99 = noop;

Promise.prototype.then = function(onFulfilled, onRejected) {
  if (this.constructor !== Promise) {
    return safeThen(this, onFulfilled, onRejected);
  }
  var res = new Promise(noop);
  handle(this, new Handler(onFulfilled, onRejected, res));
  return res;
};

function safeThen(self, onFulfilled, onRejected) {
  return new self.constructor(function (resolve, reject) {
    var res = new Promise(noop);
    res.then(resolve, reject);
    handle(self, new Handler(onFulfilled, onRejected, res));
  });
};
function handle(self, deferred) {
  while (self._37 === 3) {
    self = self._12;
  }
  if (self._37 === 0) {
    self._59.push(deferred);
    return;
  }
  asap(function() {
    var cb = self._37 === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      if (self._37 === 1) {
        resolve(deferred.promise, self._12);
      } else {
        reject(deferred.promise, self._12);
      }
      return;
    }
    var ret = tryCallOne(cb, self._12);
    if (ret === IS_ERROR) {
      reject(deferred.promise, LAST_ERROR);
    } else {
      resolve(deferred.promise, ret);
    }
  });
}
function resolve(self, newValue) {
  // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
  if (newValue === self) {
    return reject(
      self,
      new TypeError('A promise cannot be resolved with itself.')
    );
  }
  if (
    newValue &&
    (typeof newValue === 'object' || typeof newValue === 'function')
  ) {
    var then = getThen(newValue);
    if (then === IS_ERROR) {
      return reject(self, LAST_ERROR);
    }
    if (
      then === self.then &&
      newValue instanceof Promise
    ) {
      self._37 = 3;
      self._12 = newValue;
      finale(self);
      return;
    } else if (typeof then === 'function') {
      doResolve(then.bind(newValue), self);
      return;
    }
  }
  self._37 = 1;
  self._12 = newValue;
  finale(self);
}

function reject(self, newValue) {
  self._37 = 2;
  self._12 = newValue;
  finale(self);
}
function finale(self) {
  for (var i = 0; i < self._59.length; i++) {
    handle(self, self._59[i]);
  }
  self._59 = null;
}

function Handler(onFulfilled, onRejected, promise){
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, promise) {
  var done = false;
  var res = tryCallTwo(fn, function (value) {
    if (done) return;
    done = true;
    resolve(promise, value);
  }, function (reason) {
    if (done) return;
    done = true;
    reject(promise, reason);
  })
  if (!done && res === IS_ERROR) {
    done = true;
    reject(promise, LAST_ERROR);
  }
}

},{"asap/raw":19}],12:[function(require,module,exports){
'use strict';

var Promise = require('./core.js');

module.exports = Promise;
Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this;
  self.then(null, function (err) {
    setTimeout(function () {
      throw err;
    }, 0);
  });
};

},{"./core.js":11}],13:[function(require,module,exports){
'use strict';

//This file contains the ES6 extensions to the core Promises/A+ API

var Promise = require('./core.js');

module.exports = Promise;

/* Static Functions */

var TRUE = valuePromise(true);
var FALSE = valuePromise(false);
var NULL = valuePromise(null);
var UNDEFINED = valuePromise(undefined);
var ZERO = valuePromise(0);
var EMPTYSTRING = valuePromise('');

function valuePromise(value) {
  var p = new Promise(Promise._99);
  p._37 = 1;
  p._12 = value;
  return p;
}
Promise.resolve = function (value) {
  if (value instanceof Promise) return value;

  if (value === null) return NULL;
  if (value === undefined) return UNDEFINED;
  if (value === true) return TRUE;
  if (value === false) return FALSE;
  if (value === 0) return ZERO;
  if (value === '') return EMPTYSTRING;

  if (typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then;
      if (typeof then === 'function') {
        return new Promise(then.bind(value));
      }
    } catch (ex) {
      return new Promise(function (resolve, reject) {
        reject(ex);
      });
    }
  }
  return valuePromise(value);
};

Promise.all = function (arr) {
  var args = Array.prototype.slice.call(arr);

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([]);
    var remaining = args.length;
    function res(i, val) {
      if (val && (typeof val === 'object' || typeof val === 'function')) {
        if (val instanceof Promise && val.then === Promise.prototype.then) {
          while (val._37 === 3) {
            val = val._12;
          }
          if (val._37 === 1) return res(i, val._12);
          if (val._37 === 2) reject(val._12);
          val.then(function (val) {
            res(i, val);
          }, reject);
          return;
        } else {
          var then = val.then;
          if (typeof then === 'function') {
            var p = new Promise(then.bind(val));
            p.then(function (val) {
              res(i, val);
            }, reject);
            return;
          }
        }
      }
      args[i] = val;
      if (--remaining === 0) {
        resolve(args);
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) {
    reject(value);
  });
};

Promise.race = function (values) {
  return new Promise(function (resolve, reject) {
    values.forEach(function(value){
      Promise.resolve(value).then(resolve, reject);
    });
  });
};

/* Prototype Methods */

Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
};

},{"./core.js":11}],14:[function(require,module,exports){
'use strict';

var Promise = require('./core.js');

module.exports = Promise;
Promise.prototype['finally'] = function (f) {
  return this.then(function (value) {
    return Promise.resolve(f()).then(function () {
      return value;
    });
  }, function (err) {
    return Promise.resolve(f()).then(function () {
      throw err;
    });
  });
};

},{"./core.js":11}],15:[function(require,module,exports){
'use strict';

module.exports = require('./core.js');
require('./done.js');
require('./finally.js');
require('./es6-extensions.js');
require('./node-extensions.js');

},{"./core.js":11,"./done.js":12,"./es6-extensions.js":13,"./finally.js":14,"./node-extensions.js":16}],16:[function(require,module,exports){
'use strict';

// This file contains then/promise specific extensions that are only useful
// for node.js interop

var Promise = require('./core.js');
var asap = require('asap');

module.exports = Promise;

/* Static Functions */

Promise.denodeify = function (fn, argumentCount) {
  argumentCount = argumentCount || Infinity;
  return function () {
    var self = this;
    var args = Array.prototype.slice.call(arguments, 0,
        argumentCount > 0 ? argumentCount : 0);
    return new Promise(function (resolve, reject) {
      args.push(function (err, res) {
        if (err) reject(err);
        else resolve(res);
      })
      var res = fn.apply(self, args);
      if (res &&
        (
          typeof res === 'object' ||
          typeof res === 'function'
        ) &&
        typeof res.then === 'function'
      ) {
        resolve(res);
      }
    })
  }
}
Promise.nodeify = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    var callback =
      typeof args[args.length - 1] === 'function' ? args.pop() : null;
    var ctx = this;
    try {
      return fn.apply(this, arguments).nodeify(callback, ctx);
    } catch (ex) {
      if (callback === null || typeof callback == 'undefined') {
        return new Promise(function (resolve, reject) {
          reject(ex);
        });
      } else {
        asap(function () {
          callback.call(ctx, ex);
        })
      }
    }
  }
}

Promise.prototype.nodeify = function (callback, ctx) {
  if (typeof callback != 'function') return this;

  this.then(function (value) {
    asap(function () {
      callback.call(ctx, null, value);
    });
  }, function (err) {
    asap(function () {
      callback.call(ctx, err);
    });
  });
}

},{"./core.js":11,"asap":17}],17:[function(require,module,exports){
"use strict";

// rawAsap provides everything we need except exception management.
var rawAsap = require("./raw");
// RawTasks are recycled to reduce GC churn.
var freeTasks = [];
// We queue errors to ensure they are thrown in right order (FIFO).
// Array-as-queue is good enough here, since we are just dealing with exceptions.
var pendingErrors = [];
var requestErrorThrow = rawAsap.makeRequestCallFromTimer(throwFirstError);

function throwFirstError() {
    if (pendingErrors.length) {
        throw pendingErrors.shift();
    }
}

/**
 * Calls a task as soon as possible after returning, in its own event, with priority
 * over other events like animation, reflow, and repaint. An error thrown from an
 * event will not interrupt, nor even substantially slow down the processing of
 * other events, but will be rather postponed to a lower priority event.
 * @param {{call}} task A callable object, typically a function that takes no
 * arguments.
 */
module.exports = asap;
function asap(task) {
    var rawTask;
    if (freeTasks.length) {
        rawTask = freeTasks.pop();
    } else {
        rawTask = new RawTask();
    }
    rawTask.task = task;
    rawAsap(rawTask);
}

// We wrap tasks with recyclable task objects.  A task object implements
// `call`, just like a function.
function RawTask() {
    this.task = null;
}

// The sole purpose of wrapping the task is to catch the exception and recycle
// the task object after its single use.
RawTask.prototype.call = function () {
    try {
        this.task.call();
    } catch (error) {
        if (asap.onerror) {
            // This hook exists purely for testing purposes.
            // Its name will be periodically randomized to break any code that
            // depends on its existence.
            asap.onerror(error);
        } else {
            // In a web browser, exceptions are not fatal. However, to avoid
            // slowing down the queue of pending tasks, we rethrow the error in a
            // lower priority turn.
            pendingErrors.push(error);
            requestErrorThrow();
        }
    } finally {
        this.task = null;
        freeTasks[freeTasks.length] = this;
    }
};

},{"./raw":18}],18:[function(require,module,exports){
(function (global){
"use strict";

// Use the fastest means possible to execute a task in its own turn, with
// priority over other events including IO, animation, reflow, and redraw
// events in browsers.
//
// An exception thrown by a task will permanently interrupt the processing of
// subsequent tasks. The higher level `asap` function ensures that if an
// exception is thrown by a task, that the task queue will continue flushing as
// soon as possible, but if you use `rawAsap` directly, you are responsible to
// either ensure that no exceptions are thrown from your task, or to manually
// call `rawAsap.requestFlush` if an exception is thrown.
module.exports = rawAsap;
function rawAsap(task) {
    if (!queue.length) {
        requestFlush();
        flushing = true;
    }
    // Equivalent to push, but avoids a function call.
    queue[queue.length] = task;
}

var queue = [];
// Once a flush has been requested, no further calls to `requestFlush` are
// necessary until the next `flush` completes.
var flushing = false;
// `requestFlush` is an implementation-specific method that attempts to kick
// off a `flush` event as quickly as possible. `flush` will attempt to exhaust
// the event queue before yielding to the browser's own event loop.
var requestFlush;
// The position of the next task to execute in the task queue. This is
// preserved between calls to `flush` so that it can be resumed if
// a task throws an exception.
var index = 0;
// If a task schedules additional tasks recursively, the task queue can grow
// unbounded. To prevent memory exhaustion, the task queue will periodically
// truncate already-completed tasks.
var capacity = 1024;

// The flush function processes all tasks that have been scheduled with
// `rawAsap` unless and until one of those tasks throws an exception.
// If a task throws an exception, `flush` ensures that its state will remain
// consistent and will resume where it left off when called again.
// However, `flush` does not make any arrangements to be called again if an
// exception is thrown.
function flush() {
    while (index < queue.length) {
        var currentIndex = index;
        // Advance the index before calling the task. This ensures that we will
        // begin flushing on the next task the task throws an error.
        index = index + 1;
        queue[currentIndex].call();
        // Prevent leaking memory for long chains of recursive calls to `asap`.
        // If we call `asap` within tasks scheduled by `asap`, the queue will
        // grow, but to avoid an O(n) walk for every task we execute, we don't
        // shift tasks off the queue after they have been executed.
        // Instead, we periodically shift 1024 tasks off the queue.
        if (index > capacity) {
            // Manually shift all values starting at the index back to the
            // beginning of the queue.
            for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
                queue[scan] = queue[scan + index];
            }
            queue.length -= index;
            index = 0;
        }
    }
    queue.length = 0;
    index = 0;
    flushing = false;
}

// `requestFlush` is implemented using a strategy based on data collected from
// every available SauceLabs Selenium web driver worker at time of writing.
// https://docs.google.com/spreadsheets/d/1mG-5UYGup5qxGdEMWkhP6BWCz053NUb2E1QoUTU16uA/edit#gid=783724593

// Safari 6 and 6.1 for desktop, iPad, and iPhone are the only browsers that
// have WebKitMutationObserver but not un-prefixed MutationObserver.
// Must use `global` instead of `window` to work in both frames and web
// workers. `global` is a provision of Browserify, Mr, Mrs, or Mop.
var BrowserMutationObserver = global.MutationObserver || global.WebKitMutationObserver;

// MutationObservers are desirable because they have high priority and work
// reliably everywhere they are implemented.
// They are implemented in all modern browsers.
//
// - Android 4-4.3
// - Chrome 26-34
// - Firefox 14-29
// - Internet Explorer 11
// - iPad Safari 6-7.1
// - iPhone Safari 7-7.1
// - Safari 6-7
if (typeof BrowserMutationObserver === "function") {
    requestFlush = makeRequestCallFromMutationObserver(flush);

// MessageChannels are desirable because they give direct access to the HTML
// task queue, are implemented in Internet Explorer 10, Safari 5.0-1, and Opera
// 11-12, and in web workers in many engines.
// Although message channels yield to any queued rendering and IO tasks, they
// would be better than imposing the 4ms delay of timers.
// However, they do not work reliably in Internet Explorer or Safari.

// Internet Explorer 10 is the only browser that has setImmediate but does
// not have MutationObservers.
// Although setImmediate yields to the browser's renderer, it would be
// preferrable to falling back to setTimeout since it does not have
// the minimum 4ms penalty.
// Unfortunately there appears to be a bug in Internet Explorer 10 Mobile (and
// Desktop to a lesser extent) that renders both setImmediate and
// MessageChannel useless for the purposes of ASAP.
// https://github.com/kriskowal/q/issues/396

// Timers are implemented universally.
// We fall back to timers in workers in most engines, and in foreground
// contexts in the following browsers.
// However, note that even this simple case requires nuances to operate in a
// broad spectrum of browsers.
//
// - Firefox 3-13
// - Internet Explorer 6-9
// - iPad Safari 4.3
// - Lynx 2.8.7
} else {
    requestFlush = makeRequestCallFromTimer(flush);
}

// `requestFlush` requests that the high priority event queue be flushed as
// soon as possible.
// This is useful to prevent an error thrown in a task from stalling the event
// queue if the exception handled by Node.js’s
// `process.on("uncaughtException")` or by a domain.
rawAsap.requestFlush = requestFlush;

// To request a high priority event, we induce a mutation observer by toggling
// the text of a text node between "1" and "-1".
function makeRequestCallFromMutationObserver(callback) {
    var toggle = 1;
    var observer = new BrowserMutationObserver(callback);
    var node = document.createTextNode("");
    observer.observe(node, {characterData: true});
    return function requestCall() {
        toggle = -toggle;
        node.data = toggle;
    };
}

// The message channel technique was discovered by Malte Ubl and was the
// original foundation for this library.
// http://www.nonblocking.io/2011/06/windownexttick.html

// Safari 6.0.5 (at least) intermittently fails to create message ports on a
// page's first load. Thankfully, this version of Safari supports
// MutationObservers, so we don't need to fall back in that case.

// function makeRequestCallFromMessageChannel(callback) {
//     var channel = new MessageChannel();
//     channel.port1.onmessage = callback;
//     return function requestCall() {
//         channel.port2.postMessage(0);
//     };
// }

// For reasons explained above, we are also unable to use `setImmediate`
// under any circumstances.
// Even if we were, there is another bug in Internet Explorer 10.
// It is not sufficient to assign `setImmediate` to `requestFlush` because
// `setImmediate` must be called *by name* and therefore must be wrapped in a
// closure.
// Never forget.

// function makeRequestCallFromSetImmediate(callback) {
//     return function requestCall() {
//         setImmediate(callback);
//     };
// }

// Safari 6.0 has a problem where timers will get lost while the user is
// scrolling. This problem does not impact ASAP because Safari 6.0 supports
// mutation observers, so that implementation is used instead.
// However, if we ever elect to use timers in Safari, the prevalent work-around
// is to add a scroll event listener that calls for a flush.

// `setTimeout` does not call the passed callback if the delay is less than
// approximately 7 in web workers in Firefox 8 through 18, and sometimes not
// even then.

function makeRequestCallFromTimer(callback) {
    return function requestCall() {
        // We dispatch a timeout with a specified delay of 0 for engines that
        // can reliably accommodate that request. This will usually be snapped
        // to a 4 milisecond delay, but once we're flushing, there's no delay
        // between events.
        var timeoutHandle = setTimeout(handleTimer, 0);
        // However, since this timer gets frequently dropped in Firefox
        // workers, we enlist an interval handle that will try to fire
        // an event 20 times per second until it succeeds.
        var intervalHandle = setInterval(handleTimer, 50);

        function handleTimer() {
            // Whichever timer succeeds will cancel both timers and
            // execute the callback.
            clearTimeout(timeoutHandle);
            clearInterval(intervalHandle);
            callback();
        }
    };
}

// This is for `asap.js` only.
// Its name will be periodically randomized to break any code that depends on
// its existence.
rawAsap.makeRequestCallFromTimer = makeRequestCallFromTimer;

// ASAP was originally a nextTick shim included in Q. This was factored out
// into this ASAP package. It was later adapted to RSVP which made further
// amendments. These decisions, particularly to marginalize MessageChannel and
// to capture the MutationObserver implementation in a closure, were integrated
// back into ASAP proper.
// https://github.com/tildeio/rsvp.js/blob/cddf7232546a9cf858524b75cde6f9edf72620a7/lib/rsvp/asap.js

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],19:[function(require,module,exports){
(function (process){
"use strict";

var domain; // The domain module is executed on demand
var hasSetImmediate = typeof setImmediate === "function";

// Use the fastest means possible to execute a task in its own turn, with
// priority over other events including network IO events in Node.js.
//
// An exception thrown by a task will permanently interrupt the processing of
// subsequent tasks. The higher level `asap` function ensures that if an
// exception is thrown by a task, that the task queue will continue flushing as
// soon as possible, but if you use `rawAsap` directly, you are responsible to
// either ensure that no exceptions are thrown from your task, or to manually
// call `rawAsap.requestFlush` if an exception is thrown.
module.exports = rawAsap;
function rawAsap(task) {
    if (!queue.length) {
        requestFlush();
        flushing = true;
    }
    // Avoids a function call
    queue[queue.length] = task;
}

var queue = [];
// Once a flush has been requested, no further calls to `requestFlush` are
// necessary until the next `flush` completes.
var flushing = false;
// The position of the next task to execute in the task queue. This is
// preserved between calls to `flush` so that it can be resumed if
// a task throws an exception.
var index = 0;
// If a task schedules additional tasks recursively, the task queue can grow
// unbounded. To prevent memory excaustion, the task queue will periodically
// truncate already-completed tasks.
var capacity = 1024;

// The flush function processes all tasks that have been scheduled with
// `rawAsap` unless and until one of those tasks throws an exception.
// If a task throws an exception, `flush` ensures that its state will remain
// consistent and will resume where it left off when called again.
// However, `flush` does not make any arrangements to be called again if an
// exception is thrown.
function flush() {
    while (index < queue.length) {
        var currentIndex = index;
        // Advance the index before calling the task. This ensures that we will
        // begin flushing on the next task the task throws an error.
        index = index + 1;
        queue[currentIndex].call();
        // Prevent leaking memory for long chains of recursive calls to `asap`.
        // If we call `asap` within tasks scheduled by `asap`, the queue will
        // grow, but to avoid an O(n) walk for every task we execute, we don't
        // shift tasks off the queue after they have been executed.
        // Instead, we periodically shift 1024 tasks off the queue.
        if (index > capacity) {
            // Manually shift all values starting at the index back to the
            // beginning of the queue.
            for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
                queue[scan] = queue[scan + index];
            }
            queue.length -= index;
            index = 0;
        }
    }
    queue.length = 0;
    index = 0;
    flushing = false;
}

rawAsap.requestFlush = requestFlush;
function requestFlush() {
    // Ensure flushing is not bound to any domain.
    // It is not sufficient to exit the domain, because domains exist on a stack.
    // To execute code outside of any domain, the following dance is necessary.
    var parentDomain = process.domain;
    if (parentDomain) {
        if (!domain) {
            // Lazy execute the domain module.
            // Only employed if the user elects to use domains.
            domain = require("domain");
        }
        domain.active = process.domain = null;
    }

    // `setImmediate` is slower that `process.nextTick`, but `process.nextTick`
    // cannot handle recursion.
    // `requestFlush` will only be called recursively from `asap.js`, to resume
    // flushing after an error is thrown into a domain.
    // Conveniently, `setImmediate` was introduced in the same version
    // `process.nextTick` started throwing recursion errors.
    if (flushing && hasSetImmediate) {
        setImmediate(flush);
    } else {
        process.nextTick(flush);
    }

    if (parentDomain) {
        domain.active = process.domain = parentDomain;
    }
}

}).call(this,require('_process'))
},{"_process":3,"domain":1}],20:[function(require,module,exports){
'use strict';

var Promise = require('promise');
var _ = require('underscore');

/**
 * @class Module
 * @description Base class that represents all modules of an App.
 */
var Module = function (options) {
    this.initialize(options);
};

/**
 * Extends a class and allows creation of subclasses.
 * @param protoProps
 * @param staticProps
 * @returns {*}
 */
var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
        child = protoProps.constructor;
    } else {
        child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) {
        _.extend(child.prototype, protoProps);
    }

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
};

Module.extend = extend;

Module.prototype = {

    /**
     * Initialization.
     * @param {Object} [options] - An object of options
     * @param {HTMLElement} [options.el] - The module element
     * @param {string} [options.loadedClass] - The class that will be applied to the module element when it is loaded
     * @param {string} [options.activeClass] - The class that will be applied to the module element when it is shown
     * @param {string} [options.disabledClass] - The class that will be applied to the module element when disabled
     * @param {string} [options.errorClass] - The class that will be applied to the module element when it has a load error
     */
    initialize: function (options) {

        this.options = _.extend({}, {
            el: null,
            loadedClass: 'module-loaded',
            activeClass: 'module-active',
            disabledClass: 'module-disabled',
            errorClass: 'module-error'
        }, options);

        this._handleElementInitialState();

        this.subModules = {};
        this.active = false;
        this.loaded = false;
    },

    /**
     * A function that fires when the module's load() method is called
     * which can be overridden by subclass custom implementations.
     * @abstract
     * @return {*} May return a promise when done
     * @param options
     */
    onLoad: function (options) {
        return Promise.resolve();
    },

    /**
     * A function that fires when the module's show() method is called
     * which can be overridden by subclass custom implementations.
     * @abstract
     * @return {*} May return a promise when done
     */
    onShow: function () {
        return Promise.resolve();
    },

    /**
     * A function that fires when the module's hide() method is called
     * which can be overridden by subclass custom implementations.
     * @abstract
     * @return {*} May return a promise when done
     */
    onHide: function () {
        return Promise.resolve();
    },

    /**
     * A function that fires when the module's enable() method is called
     * which can be overridden by subclass custom implementations.
     * @abstract
     * @returns {*|Promise} Optionally return a promise when done
     */
    onEnable: function () {
        return Promise.resolve();
    },

    /**
     * A function that fires when the module's disable() method is called
     * which can be overridden by subclass custom implementations.
     * @abstract
     * @returns {*|Promise} Optionally return a promise when done
     */
    onDisable: function () {
        return Promise.resolve();
    },

    /**
     * A function that fires when the error() method is called
     * which can be overridden by subclass custom implementations.
     * @param {Object} [e] - The error object that was triggered
     * @abstract
     * @returns {*} Optionally return a promise when done
     */
    onError: function (e) {
        return Promise.resolve(e);
    },

    /**
     * Loads.
     * @param {Object} [options] - Options
     * @param {HTMLElement} [options.el] - The modules element (used only if module element wasnt passed in initialize)
     * @return {Promise}
     */
    load: function (options) {
        var views = _.values(this.subModules);

        // add element to options
        if (options) {
            this.options.el = this.options.el || options.el;
        }

        // load all subModules
        if (!this.loaded) {
            return Promise.all(_.invoke(views, 'load')).then(function () {
                return this._ensurePromise(this.onLoad(options))
                    .then(function () {
                        this.loaded = true;
                        if (this.options.el) {
                            this.options.el.classList.add(this.options.loadedClass);
                        }
                    }.bind(this))
                    .catch(function (e) {
                        this.error(e);
                        return e;
                    }.bind(this));
            }.bind(this));
        } else {
            return Promise.resolve();
        }
    },

    /**
     * Triggers a load error on the module.
     * @param {Object} [err] - The error object to trigger
     * @return {Promise} Returns a promise when erroring operation is complete
     */
    error: function (err) {
        var el = this.options.el,
            e = err || new Error(),
            msg = e.message || '';

        if (el) {
            el.classList.add(this.options.errorClass);
        }
        this.error = true;
        this.loaded = false;

        console.warn('MODULE ERROR!' + ' ' + msg);

        if (e.stack) {
            console.log(e.stack);
        }
        return this._ensurePromise(this.onError(e))
            .then(function (customErr) {
                return customErr || e;
            });
    },

    /**
     * Enables the module.
     * @return {Promise}
     */
    enable: function () {
        var el = this.options.el;
        if (el) {
            el.classList.remove(this.options.disabledClass);
        }
        this.disabled = false;
        return this._ensurePromise(this.onEnable());
    },

    /**
     * Disables the module.
     * @return {Promise}
     */
    disable: function () {
        var el = this.options.el;
        if (el) {
            el.classList.add(this.options.disabledClass);
        }
        this.disabled = true;
        return this._ensurePromise(this.onDisable());
    },

    /**
     * Shows the page.
     * @return {Promise}
     */
    show: function () {
        var el = this.options.el;
        if (el) {
            el.classList.add(this.options.activeClass);
        }
        this.active = true;
        return this._ensurePromise(this.onShow());
    },

    /**
     * Hides the page.
     * @return {Promise}
     */
    hide: function () {
        var el = this.options.el;
        if (el) {
            el.classList.remove(this.options.activeClass);
        }
        this.active = false;
        return this._ensurePromise(this.onHide());
    },

    /**
     * Sets up element internally by evaluating its initial state.
     * @private
     */
    _handleElementInitialState: function () {
        var el = this.options.el;
        if (!el) {
            return;
        }
        if (el.classList.contains(this.options.disabledClass)) {
            this._origDisabled = true;
            this.disable();
        }

        if (el.classList.contains(this.options.errorClass)) {
            this._origError = true;
            this.error(new Error());
        }
    },

    /**
     * Restores the elements classes back to the way they were before instantiation.
     * @private
     */
    _resetElementInitialState: function () {
        var options = this.options,
            el = options.el,
            disabledClass = options.disabledClass,
            errorClass = options.errorClass;

        if (!el) {
            return;
        }
        if (this._origDisabled) {
            el.classList.add(disabledClass);
        } else {
            el.classList.remove(disabledClass);
        }

        if (!this._origError) {
            el.classList.remove(errorClass);
        } else {
            el.classList.add(errorClass);
        }
    },

    /**
     * Wraps a promise around a function if doesnt already have one.
     * @param func
     * @private
     */
    _ensurePromise: function (func) {
        if (!func || !func.then) {
            func = Promise.resolve();
        }
        return func;
    },

    /**
     * Destroys all nested views and cleans up.
     */
    destroy: function () {
        var subModules = this.subModules;

        for (var key in subModules) {
            if (subModules.hasOwnProperty(key) && subModules[key]) {
                subModules[key].destroy();
            }
        }
        this.subModules = {};
        this.active = false;
        this.loaded = false;

        this._resetElementInitialState();
    }

};


module.exports = Module;
},{"promise":10,"underscore":21}],21:[function(require,module,exports){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}],22:[function(require,module,exports){
'use strict';
var _ = require('underscore');
var FormElement = require('./form-element');
require('element-kit');
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
 */
var ButtonToggle = FormElement.extend({

    /**
     * Initialization.
     * @param {object} options - Options passed into instance
     * @param {Array|HTMLInputElement} options.inputs - The collection of input elements to be made into toggle items
     * @param {ButtonToggle~onChange} [options.onChange] - A callback function that fires when one of the toggle elements are selected
     * @param {string} [options.containerClass] - The css class that will be applied to each toggle item's container
     * @param {string} [options.inputClass] - The css class that will be applied to each toggle item (input element)
     * @param {ButtonToggle~onSelect} [options.onSelect] - A callback function that fires when the button toggle element is selected
     * @param {ButtonToggle~onDeselect} [options.onDeselect] - A callback function that fires when the button toggle element is deselected
     * @param {string} [options.selectedClass] - The css class that will be applied to a button toggle item (UI-version) when it is selected
     * @param {string} [options.disabledClass] - The css class that will be applied to a button toggle item (UI-version) when it is disabled
     */
    initialize: function (options) {

        this.options = _.extend({
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
     * Deselects all toggles.
     */
    clear: function () {
        this._triggerAll(function (formElement, UIElement, idx) {
            this.deselect(idx);
        }.bind(this));
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

module.exports = ButtonToggle;
},{"./form-element":25,"element-kit":6,"underscore":21}],23:[function(require,module,exports){
'use strict';
var _ = require('underscore');
var FormElement = require('./form-element');
require('element-kit');

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
 */
var Checkbox = FormElement.extend({

    /**
     * Initialization.
     * @param {object} options - Options passed into instantiation.
     * @param {HTMLInputElement} options.el - The input element checkbox
     * @param {Checkbox~onChecked} [options.onChecked] - A callback function that fires when the checkbox is checked
     * @param {Checkbox~onUnchecked} [options.onUnchecked] - A callback function that fires when the checkbox is un-checked
     * @param {string} [options.containerClass] - The css class that will be applied to the UI-version of the checkbox
     * @param {string} [options.inputClass] - The css class that will be applied to the form version of the checkbox
     * @param {string} [options.checkedClass] - The css class that will be applied to the checkbox (UI-version) when it is checked
     * @param {string} [options.disabledClass] - The css class that will be applied to the checkbox (UI-version) when it is disabled
     */
    initialize: function (options) {

        this.options = _.extend({
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
     * Unselects the checkbox if its selected.
     */
    clear: function () {
        this.uncheck();
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

module.exports = Checkbox;
},{"./form-element":25,"element-kit":6,"underscore":21}],24:[function(require,module,exports){
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
},{"./form-element":25,"device-manager":5,"element-kit":6,"underscore":21}],25:[function(require,module,exports){
'use strict';
var _ = require('underscore');
var Module = require('module-js');
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
},{"element-kit":6,"module-js":20,"underscore":21}],26:[function(require,module,exports){
'use strict';
var _ = require('underscore');
var Module = require('module-js');
var Dropdown = require('./dropdown');
var InputField = require('./input-field');
var Checkbox = require('./checkbox');
var ButtonToggle = require('./button-toggle');
var SubmitButton = require('./submit-button');

require('element-kit');

/**
 * The function that fires when the input value changes
 * @callback Form~onValueChange
 * @param {Event} event - The event that fired the change
 */

/**
 * The function that fires to give users opportunity to return a custom set of options on a per-element basis
 * @callback Form~onGetOptions
 * @param {HTMLElement|Array} element(s) - The element (or if radio buttons, an array of elements) on which to use the custom options
 * @returns {Object} Return the custom set of options
 */

/**
 * The function that fires when the submit button is clicked
 * @callback Form~onSubmitButtonClick
 * @returns {Event} Returns the click event
 */

/**
 * Utility class for form elements.
 * @class Form
 */
var Form = Module.extend({

    /**
     * Sets up the form.
     * @param {object} options - The options
     * @param {HTMLFormElement} [options.el] - The form element
     * @param {HTMLFormElement} options.el - The form element
     * @param {Form~onValueChange} [options.onValueChange] - A callback function that fires when the value of any form element changes
     * @param {Function} [options.onGetOptions] - Function callback that is fired upon instantiation to provide custom options
     * @param {string} [options.dropdownClass] - The css class used to query the set of dropdown elements that should be included
     * @param {string} [options.checkboxClass] - The css class used to query the set of checkbox elements that should be included
     * @param {string} [options.inputFieldClass] - The css class used to query the set of text input elements that should be included
     * @param {string} [options.buttonToggleClass] - The css class used to query the set of radio button elements that should be included
     * @param {string} [options.submitButtonClass] - The css class used to query the submit button
     * @param {string} [options.submitButtonDisabledClass] - The class that will be applied to the submit button when its disabled
     * @param {string} [options.onSubmitButtonClick] - Function that is called when the submit button is clicked
     */
    initialize: function (options) {

        this.options = _.extend({
            el: null,
            onValueChange: null,
            onGetOptions: null,
            dropdownClass: null,
            checkboxClass: null,
            inputFieldClass: null,
            buttonToggleClass: null,
            submitButtonClass: null,
            submitButtonDisabledClass: null,
            onSubmitButtonClick: null
        }, options);

        this.options = options;

        // okay to cache here because its a "live" html collection -- yay!
        this.formEls = this.options.el.elements;

        this._formInstances = [];
        Module.prototype.initialize.call(this, this.options);
    },

    /**
     * Sets up the form and instantiates all necessary element classes.
     */
    setup: function () {
        var submitButtonEl = this.options.el.getElementsByClassName(this.options.submitButtonClass)[0];
        this._setupInstances(this.options.dropdownClass, Dropdown);
        this._setupInstances(this.options.checkboxClass, Checkbox);
        this._setupInstances(this.options.inputFieldClass, InputField);
        this._setupButtonToggleInstances(this.options.buttonToggleClass);

        if (submitButtonEl) {
            this.subModules.submitButton = new SubmitButton({
                el: submitButtonEl,
                disabledClass: this.options.submitButtonDisabledClass,
                onClick: this.options.onSubmitButtonClick
            });
        }
    },

    /**
     * Instantiates elements.
     * @param {string} cssClass - The class that the elements must match to be instantiated
     * @param {Function} View - The class to instantiate
     * @param {Object} [options] - The options to be passed to instantiation
     * @param {string} [elKey] - The key to use as the "el"
     * @private
     */
    _setupInstances: function (cssClass, View, options, elKey) {
        var elements = this.options.el.getElementsByClassName(cssClass),
            count = elements.length,
            i,
            instance,
            el;

        var finalOptions = {};

        if (count) {
            elKey = elKey || 'el';
            for (i = 0; i < count; i++) {
                el = elements[i];
                finalOptions = this._buildOptions(el, options);
                finalOptions[elKey] = el; // dont allow custom options to override the el!
                instance = this.subModules['fe' + elKey + cssClass + i] = new View(finalOptions);
                this._formInstances.push(instance);
            }
        }
    },

    /**
     * Sets up button toggle instances by on the elements that contain the supplied css class.
     * @param {string} cssClass - The css class of all button toggle elements to instantiate
     * @private
     */
    _setupButtonToggleInstances: function (cssClass) {
        var toggleNameMap = this.mapElementsByName(this.options.el.getElementsByClassName(cssClass)),
            elKey = 'radio',
            finalOptions = {};
        _.each(toggleNameMap, function (els, name) {
            finalOptions = this._buildOptions(els, {});
            finalOptions.inputs = els; // dont allow custom options to override the radio inputs
            this._formInstances.push(this.subModules['fe' + elKey + cssClass + name] = new ButtonToggle(finalOptions));
        }, this);
    },

    /**
     * Takes a set of elements and maps them by their name attributes.
     * @param {HTMLCollection|Array|NodeList} elements - An array of elements
     * @returns {{}} Returns an object with name/elements mapping
     */
    mapElementsByName: function (elements) {
        var map = {},
            count = elements.length,
            i,
            el;
        if (count) {
            for (i = 0; i < count; i++) {
                el = elements[i];
                if (map[el.name]) {
                    map[el.name].push(el);
                } else {
                    map[el.name] = [el];
                }
            }
        }
        return map;
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
     * Builds the initialize options for an element.
     * @param {HTMLElement|Array} el - The element (or if radio buttons, an array of elements)
     * @param {Object} options - The beginning set of options
     * @returns {*|{}}
     * @private
     */
    _buildOptions: function (el, options) {
        options = options || {};

        if (this.options.onGetOptions) {
            options = _.extend({}, options, this.options.onGetOptions(el));
        }
        options.onChange = function (value, inputEl, UIElement) {
            this._onValueChange(value, inputEl, UIElement);
        }.bind(this);
        return options;
    },

    /**
     * When any form element's value changes.
     * @param {string} value - The new value
     * @param {HTMLElement} el - The element that triggered value change
     * @param {HTMLElement} ui - The UI version of the element
     * @private
     */
    _onValueChange: function (value, el, ui) {

        if (this.options.onValueChange) {
            this.options.onValueChange(value, el, ui);
        }
        if (this.options.onChange) {
            this.options.onChange(value, el, ui);
        }

    },

    /**
     * Disables all form elements.
     */
    disable: function () {
        var els = this.formEls,
            i,
            submitButton = this.getSubmitButtonInstance();
        this.setPropertyAll('disabled', true);
        // add disabled css classes
        for (i = 0; i < els.length; i++) {
            els[i].kit.classList.add('disabled');
        }
        if (submitButton) {
            submitButton.disable();
        }

    },

    /**
     * Enables all form elements.
     */
    enable: function () {
        var els = this.formEls,
            i,
            submitButton = this.getSubmitButtonInstance();
        this.setPropertyAll('disabled', false);
        // remove disabled css classes
        for (i = 0; i < els.length; i++) {
            els[i].kit.classList.remove('disabled');
        }
        if (submitButton) {
            submitButton.disable();
        }
    },

    /**
     * Sets a property on all form elements.
     * @TODO: this function still exists until this class can cover ALL possible form elements (i.e. radio buttons)
     * @param {string} prop - The property to change
     * @param {*} value - The value to set
     */
    setPropertyAll: function (prop, value) {
        var i,
            els = this.formEls;
        for (i = 0; i < els.length; i++) {
            els[i][prop] = value;
        }
    },

    /**
     * Triggers a method on all form instances.
     * @param {string} method - The method
     * @param {...*} params - Any params for the method from here, onward
     */
    triggerMethodAll: function (method, params) {
        var args = Array.prototype.slice.call(arguments, 1),
            i, instance;

        for (i = 0; i < this._formInstances.length; i++) {
            instance = this._formInstances[i];
            instance[method].apply(instance, args);
        }
    },

    /**
     * Clears all form items.
     */
    clear: function () {
        this.triggerMethodAll('clear');
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
                    value: field.value,
                    //value: field.value || field.getAttribute('value')
                    required: field.required,
                    disabled: field.disabled,
                    formElement: field
                };
                map.push(obj);
            }
        }
        return map;
    },

    /**
     * Returns the submit button instance.
     * @returns {Object}
     */
    getSubmitButtonInstance: function () {
        return this.subModules.submitButton;
    }

});

module.exports = Form;
},{"./button-toggle":22,"./checkbox":23,"./dropdown":24,"./input-field":27,"./submit-button":28,"element-kit":6,"module-js":20,"underscore":21}],27:[function(require,module,exports){
'use strict';
var _ = require('underscore');
var FormElement = require('./form-element');

require('element-kit');
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
 * @param {HTMLInputElement} input - The updated input element
 * @param {HTMLElement} UIElement - The updated container of the input element
 * @param {Event} event - The event
 */

/**
 * Adds useful logic to an input field.
 * @class InputField
 * @extends FormElement
 */
var InputField = FormElement.extend({

    /**
     * Initializes the Input Field class.
     * @param {object} options - Options passed into instance
     * @param {HTMLInputElement} options.el - The input field element
     * @param {InputField~onChange} [options.onChange] - A callback function that fires when the input value changes
     * @param {InputField~onKeyDownChange} [options.onKeyDownChange] - A callback function that fires when input has changed after key down press
     * @param {string} [options.containerClass] - The css class that will be applied to the container that is wrapped around the input field
     * @param {string} [options.inputClass] - The css class that will be applied to the the input field element
     * @param {string} [options.disabledClass] - The css class that will be applied to the input field container element when disabled
     * @param {string} [options.activeClass] - The css class that will be applied to the input field container element when in focus
     */
    initialize: function (options) {

        this.options = _.extend({
            el: null,
            onChange: null,
            onKeyDownChange: null,
            containerClass: 'ui-input-text',
            inputClass: 'ui-input-text-input',
            disabledClass: 'ui-input-text-disabled',
            activeClass: 'ui-input-text-active'
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
            this.options.onKeyDownChange(this.getFormElement(), this.getUIElement(), e);
        }
    },

    /**
     * Sets the value of the input field.
     * @param {string} value - The new input field value
     */
    setValue: function (value) {
        var input = this.getFormElement(),
            currentVal = input.value;
        if (value !== currentVal) {
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
     * Builds the UI-friendly version of input field by wrapping it inside of a container.
     * @param {HTMLInputElement} inputEl - The input element
     * @returns {HTMLElement} Returns the input element wrapped in its container
     * @private
     */
    _buildUIElement: function (inputEl) {
        return inputEl.kit.appendOuterHtml('<div class="' + this.options.containerClass + '"></div>');
    },

    /**
     * When the input gains focus.
     * @private
     */
    _onInputFocus: function () {
        this.getUIElement().kit.classList.add(this.options.activeClass);
    },

    /**
     * When the input loses focus.
     * @private
     */
    _onInputBlur: function () {
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
     * Sets the input to nothing.
     */
    clear: function () {
        this.setValue('');
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

module.exports = InputField;
},{"./form-element":25,"element-kit":6,"underscore":21}],28:[function(require,module,exports){
'use strict';
var _ = require('underscore');
var Module = require('module-js');
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
},{"element-kit":6,"module-js":20,"underscore":21}]},{},[26])(26)
});