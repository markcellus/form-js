/** 
* form-js - v4.2.1.
* https://github.com/mkay581/form-js.git
* Copyright 2016 Mark Kennedy. Licensed MIT.
*/

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Form = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.map');
module.exports = require('../modules/_core').Map;
},{"../modules/_core":12,"../modules/es6.map":73,"../modules/es6.object.to-string":74,"../modules/es6.string.iterator":75,"../modules/web.dom.iterable":77}],2:[function(require,module,exports){
require('../modules/es6.symbol');
require('../modules/es6.object.to-string');
module.exports = require('../modules/_core').Symbol;
},{"../modules/_core":12,"../modules/es6.object.to-string":74,"../modules/es6.symbol":76}],3:[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],4:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = require('./_wks')('unscopables')
  , ArrayProto  = Array.prototype;
if(ArrayProto[UNSCOPABLES] == undefined)require('./_hide')(ArrayProto, UNSCOPABLES, {});
module.exports = function(key){
  ArrayProto[UNSCOPABLES][key] = true;
};
},{"./_hide":24,"./_wks":70}],5:[function(require,module,exports){
module.exports = function(it, Constructor, name, forbiddenField){
  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};
},{}],6:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./_is-object":31}],7:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject')
  , toLength  = require('./_to-length')
  , toIndex   = require('./_to-index');
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = toIObject($this)
      , length = toLength(O.length)
      , index  = toIndex(fromIndex, length)
      , value;
    // Array#includes uses SameValueZero equality algorithm
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    // Array#toIndex ignores holes, Array#includes - not
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};
},{"./_to-index":61,"./_to-iobject":63,"./_to-length":64}],8:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof')
  , TAG = require('./_wks')('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function(it, key){
  try {
    return it[key];
  } catch(e){ /* empty */ }
};

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"./_cof":9,"./_wks":70}],9:[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],10:[function(require,module,exports){
'use strict';
var dP          = require('./_object-dp').f
  , create      = require('./_object-create')
  , hide        = require('./_hide')
  , redefineAll = require('./_redefine-all')
  , ctx         = require('./_ctx')
  , anInstance  = require('./_an-instance')
  , defined     = require('./_defined')
  , forOf       = require('./_for-of')
  , $iterDefine = require('./_iter-define')
  , step        = require('./_iter-step')
  , setSpecies  = require('./_set-species')
  , DESCRIPTORS = require('./_descriptors')
  , fastKey     = require('./_meta').fastKey
  , SIZE        = DESCRIPTORS ? '_s' : 'size';

var getEntry = function(that, key){
  // fast case
  var index = fastKey(key), entry;
  if(index !== 'F')return that._i[index];
  // frozen object case
  for(entry = that._f; entry; entry = entry.n){
    if(entry.k == key)return entry;
  }
};

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      anInstance(that, C, NAME, '_i');
      that._i = create(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear(){
        for(var that = this, data = that._i, entry = that._f; entry; entry = entry.n){
          entry.r = true;
          if(entry.p)entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var that  = this
          , entry = getEntry(that, key);
        if(entry){
          var next = entry.n
            , prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if(prev)prev.n = next;
          if(next)next.p = prev;
          if(that._f == entry)that._f = next;
          if(that._l == entry)that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /*, that = undefined */){
        anInstance(this, C, 'forEach');
        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3)
          , entry;
        while(entry = entry ? entry.n : this._f){
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while(entry && entry.r)entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key){
        return !!getEntry(this, key);
      }
    });
    if(DESCRIPTORS)dP(C.prototype, 'size', {
      get: function(){
        return defined(this[SIZE]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry){
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that._f)that._f = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index !== 'F')that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function(C, NAME, IS_MAP){
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    $iterDefine(C, NAME, function(iterated, kind){
      this._t = iterated;  // target
      this._k = kind;      // kind
      this._l = undefined; // previous
    }, function(){
      var that  = this
        , kind  = that._k
        , entry = that._l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!that._t || !(that._l = entry = entry ? entry.n : that._t._f)){
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if(kind == 'keys'  )return step(0, entry.k);
      if(kind == 'values')return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(NAME);
  }
};
},{"./_an-instance":5,"./_ctx":13,"./_defined":14,"./_descriptors":15,"./_for-of":21,"./_hide":24,"./_iter-define":34,"./_iter-step":36,"./_meta":40,"./_object-create":41,"./_object-dp":42,"./_redefine-all":53,"./_set-species":56}],11:[function(require,module,exports){
'use strict';
var global            = require('./_global')
  , $export           = require('./_export')
  , redefine          = require('./_redefine')
  , redefineAll       = require('./_redefine-all')
  , meta              = require('./_meta')
  , forOf             = require('./_for-of')
  , anInstance        = require('./_an-instance')
  , isObject          = require('./_is-object')
  , fails             = require('./_fails')
  , $iterDetect       = require('./_iter-detect')
  , setToStringTag    = require('./_set-to-string-tag')
  , inheritIfRequired = require('./_inherit-if-required');

module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK){
  var Base  = global[NAME]
    , C     = Base
    , ADDER = IS_MAP ? 'set' : 'add'
    , proto = C && C.prototype
    , O     = {};
  var fixMethod = function(KEY){
    var fn = proto[KEY];
    redefine(proto, KEY,
      KEY == 'delete' ? function(a){
        return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'has' ? function has(a){
        return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'get' ? function get(a){
        return IS_WEAK && !isObject(a) ? undefined : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'add' ? function add(a){ fn.call(this, a === 0 ? 0 : a); return this; }
        : function set(a, b){ fn.call(this, a === 0 ? 0 : a, b); return this; }
    );
  };
  if(typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function(){
    new C().entries().next();
  }))){
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    redefineAll(C.prototype, methods);
    meta.NEED = true;
  } else {
    var instance             = new C
      // early implementations not supports chaining
      , HASNT_CHAINING       = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance
      // V8 ~  Chromium 40- weak-collections throws on primitives, but should return false
      , THROWS_ON_PRIMITIVES = fails(function(){ instance.has(1); })
      // most early implementations doesn't supports iterables, most modern - not close it correctly
      , ACCEPT_ITERABLES     = $iterDetect(function(iter){ new C(iter); }) // eslint-disable-line no-new
      // for early implementations -0 and +0 not the same
      , BUGGY_ZERO = !IS_WEAK && fails(function(){
        // V8 ~ Chromium 42- fails only with 5+ elements
        var $instance = new C()
          , index     = 5;
        while(index--)$instance[ADDER](index, index);
        return !$instance.has(-0);
      });
    if(!ACCEPT_ITERABLES){ 
      C = wrapper(function(target, iterable){
        anInstance(target, C, NAME);
        var that = inheritIfRequired(new Base, target, C);
        if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      });
      C.prototype = proto;
      proto.constructor = C;
    }
    if(THROWS_ON_PRIMITIVES || BUGGY_ZERO){
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }
    if(BUGGY_ZERO || HASNT_CHAINING)fixMethod(ADDER);
    // weak collections should not contains .clear method
    if(IS_WEAK && proto.clear)delete proto.clear;
  }

  setToStringTag(C, NAME);

  O[NAME] = C;
  $export($export.G + $export.W + $export.F * (C != Base), O);

  if(!IS_WEAK)common.setStrong(C, NAME, IS_MAP);

  return C;
};
},{"./_an-instance":5,"./_export":19,"./_fails":20,"./_for-of":21,"./_global":22,"./_inherit-if-required":27,"./_is-object":31,"./_iter-detect":35,"./_meta":40,"./_redefine":54,"./_redefine-all":53,"./_set-to-string-tag":57}],12:[function(require,module,exports){
var core = module.exports = {version: '2.4.0'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],13:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"./_a-function":3}],14:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],15:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_fails":20}],16:[function(require,module,exports){
var isObject = require('./_is-object')
  , document = require('./_global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./_global":22,"./_is-object":31}],17:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');
},{}],18:[function(require,module,exports){
// all enumerable object keys, includes symbols
var getKeys = require('./_object-keys')
  , gOPS    = require('./_object-gops')
  , pIE     = require('./_object-pie');
module.exports = function(it){
  var result     = getKeys(it)
    , getSymbols = gOPS.f;
  if(getSymbols){
    var symbols = getSymbols(it)
      , isEnum  = pIE.f
      , i       = 0
      , key;
    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))result.push(key);
  } return result;
};
},{"./_object-gops":47,"./_object-keys":50,"./_object-pie":51}],19:[function(require,module,exports){
var global    = require('./_global')
  , core      = require('./_core')
  , hide      = require('./_hide')
  , redefine  = require('./_redefine')
  , ctx       = require('./_ctx')
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE]
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , expProto  = exports[PROTOTYPE] || (exports[PROTOTYPE] = {})
    , key, own, out, exp;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if(target)redefine(target, key, out, type & $export.U);
    // export
    if(exports[key] != out)hide(exports, key, exp);
    if(IS_PROTO && expProto[key] != out)expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library` 
module.exports = $export;
},{"./_core":12,"./_ctx":13,"./_global":22,"./_hide":24,"./_redefine":54}],20:[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],21:[function(require,module,exports){
var ctx         = require('./_ctx')
  , call        = require('./_iter-call')
  , isArrayIter = require('./_is-array-iter')
  , anObject    = require('./_an-object')
  , toLength    = require('./_to-length')
  , getIterFn   = require('./core.get-iterator-method')
  , BREAK       = {}
  , RETURN      = {};
var exports = module.exports = function(iterable, entries, fn, that, ITERATOR){
  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
    , f      = ctx(fn, that, entries ? 2 : 1)
    , index  = 0
    , length, step, iterator, result;
  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if(result === BREAK || result === RETURN)return result;
  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
    result = call(iterator, f, step.value, entries);
    if(result === BREAK || result === RETURN)return result;
  }
};
exports.BREAK  = BREAK;
exports.RETURN = RETURN;
},{"./_an-object":6,"./_ctx":13,"./_is-array-iter":29,"./_iter-call":32,"./_to-length":64,"./core.get-iterator-method":71}],22:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],23:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],24:[function(require,module,exports){
var dP         = require('./_object-dp')
  , createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function(object, key, value){
  return dP.f(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./_descriptors":15,"./_object-dp":42,"./_property-desc":52}],25:[function(require,module,exports){
module.exports = require('./_global').document && document.documentElement;
},{"./_global":22}],26:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function(){
  return Object.defineProperty(require('./_dom-create')('div'), 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_descriptors":15,"./_dom-create":16,"./_fails":20}],27:[function(require,module,exports){
var isObject       = require('./_is-object')
  , setPrototypeOf = require('./_set-proto').set;
module.exports = function(that, target, C){
  var P, S = target.constructor;
  if(S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && isObject(P) && setPrototypeOf){
    setPrototypeOf(that, P);
  } return that;
};
},{"./_is-object":31,"./_set-proto":55}],28:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./_cof":9}],29:[function(require,module,exports){
// check on default Array iterator
var Iterators  = require('./_iterators')
  , ITERATOR   = require('./_wks')('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"./_iterators":37,"./_wks":70}],30:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg){
  return cof(arg) == 'Array';
};
},{"./_cof":9}],31:[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],32:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch(e){
    var ret = iterator['return'];
    if(ret !== undefined)anObject(ret.call(iterator));
    throw e;
  }
};
},{"./_an-object":6}],33:[function(require,module,exports){
'use strict';
var create         = require('./_object-create')
  , descriptor     = require('./_property-desc')
  , setToStringTag = require('./_set-to-string-tag')
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
};
},{"./_hide":24,"./_object-create":41,"./_property-desc":52,"./_set-to-string-tag":57,"./_wks":70}],34:[function(require,module,exports){
'use strict';
var LIBRARY        = require('./_library')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , hide           = require('./_hide')
  , has            = require('./_has')
  , Iterators      = require('./_iterators')
  , $iterCreate    = require('./_iter-create')
  , setToStringTag = require('./_set-to-string-tag')
  , getPrototypeOf = require('./_object-gpo')
  , ITERATOR       = require('./_wks')('iterator')
  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
  , FF_ITERATOR    = '@@iterator'
  , KEYS           = 'keys'
  , VALUES         = 'values';

var returnThis = function(){ return this; };

module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
  $iterCreate(Constructor, NAME, next);
  var getMethod = function(kind){
    if(!BUGGY && kind in proto)return proto[kind];
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  };
  var TAG        = NAME + ' Iterator'
    , DEF_VALUES = DEFAULT == VALUES
    , VALUES_BUG = false
    , proto      = Base.prototype
    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , $default   = $native || getMethod(DEFAULT)
    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
    , methods, key, IteratorPrototype;
  // Fix native
  if($anyNative){
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
    if(IteratorPrototype !== Object.prototype){
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if(DEF_VALUES && $native && $native.name !== VALUES){
    VALUES_BUG = true;
    $default = function values(){ return $native.call(this); };
  }
  // Define iterator
  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      values:  DEF_VALUES ? $default : getMethod(VALUES),
      keys:    IS_SET     ? $default : getMethod(KEYS),
      entries: $entries
    };
    if(FORCED)for(key in methods){
      if(!(key in proto))redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};
},{"./_export":19,"./_has":23,"./_hide":24,"./_iter-create":33,"./_iterators":37,"./_library":39,"./_object-gpo":48,"./_redefine":54,"./_set-to-string-tag":57,"./_wks":70}],35:[function(require,module,exports){
var ITERATOR     = require('./_wks')('iterator')
  , SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }

module.exports = function(exec, skipClosing){
  if(!skipClosing && !SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[ITERATOR]();
    iter.next = function(){ return {done: safe = true}; };
    arr[ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./_wks":70}],36:[function(require,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],37:[function(require,module,exports){
module.exports = {};
},{}],38:[function(require,module,exports){
var getKeys   = require('./_object-keys')
  , toIObject = require('./_to-iobject');
module.exports = function(object, el){
  var O      = toIObject(object)
    , keys   = getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
};
},{"./_object-keys":50,"./_to-iobject":63}],39:[function(require,module,exports){
module.exports = false;
},{}],40:[function(require,module,exports){
var META     = require('./_uid')('meta')
  , isObject = require('./_is-object')
  , has      = require('./_has')
  , setDesc  = require('./_object-dp').f
  , id       = 0;
var isExtensible = Object.isExtensible || function(){
  return true;
};
var FREEZE = !require('./_fails')(function(){
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function(it){
  setDesc(it, META, {value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  }});
};
var fastKey = function(it, create){
  // return primitive with prefix
  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return 'F';
    // not necessary to add metadata
    if(!create)return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function(it, create){
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return true;
    // not necessary to add metadata
    if(!create)return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function(it){
  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY:      META,
  NEED:     false,
  fastKey:  fastKey,
  getWeak:  getWeak,
  onFreeze: onFreeze
};
},{"./_fails":20,"./_has":23,"./_is-object":31,"./_object-dp":42,"./_uid":67}],41:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject    = require('./_an-object')
  , dPs         = require('./_object-dps')
  , enumBugKeys = require('./_enum-bug-keys')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , Empty       = function(){ /* empty */ }
  , PROTOTYPE   = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe')
    , i      = enumBugKeys.length
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write('<script>document.F=Object</script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties){
  var result;
  if(O !== null){
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty;
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};
},{"./_an-object":6,"./_dom-create":16,"./_enum-bug-keys":17,"./_html":25,"./_object-dps":43,"./_shared-key":58}],42:[function(require,module,exports){
var anObject       = require('./_an-object')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , toPrimitive    = require('./_to-primitive')
  , dP             = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes){
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if(IE8_DOM_DEFINE)try {
    return dP(O, P, Attributes);
  } catch(e){ /* empty */ }
  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
  if('value' in Attributes)O[P] = Attributes.value;
  return O;
};
},{"./_an-object":6,"./_descriptors":15,"./_ie8-dom-define":26,"./_to-primitive":66}],43:[function(require,module,exports){
var dP       = require('./_object-dp')
  , anObject = require('./_an-object')
  , getKeys  = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties){
  anObject(O);
  var keys   = getKeys(Properties)
    , length = keys.length
    , i = 0
    , P;
  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
  return O;
};
},{"./_an-object":6,"./_descriptors":15,"./_object-dp":42,"./_object-keys":50}],44:[function(require,module,exports){
var pIE            = require('./_object-pie')
  , createDesc     = require('./_property-desc')
  , toIObject      = require('./_to-iobject')
  , toPrimitive    = require('./_to-primitive')
  , has            = require('./_has')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , gOPD           = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P){
  O = toIObject(O);
  P = toPrimitive(P, true);
  if(IE8_DOM_DEFINE)try {
    return gOPD(O, P);
  } catch(e){ /* empty */ }
  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
};
},{"./_descriptors":15,"./_has":23,"./_ie8-dom-define":26,"./_object-pie":51,"./_property-desc":52,"./_to-iobject":63,"./_to-primitive":66}],45:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./_to-iobject')
  , gOPN      = require('./_object-gopn').f
  , toString  = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function(it){
  try {
    return gOPN(it);
  } catch(e){
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it){
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"./_object-gopn":46,"./_to-iobject":63}],46:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys      = require('./_object-keys-internal')
  , hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
  return $keys(O, hiddenKeys);
};
},{"./_enum-bug-keys":17,"./_object-keys-internal":49}],47:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;
},{}],48:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has         = require('./_has')
  , toObject    = require('./_to-object')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function(O){
  O = toObject(O);
  if(has(O, IE_PROTO))return O[IE_PROTO];
  if(typeof O.constructor == 'function' && O instanceof O.constructor){
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};
},{"./_has":23,"./_shared-key":58,"./_to-object":65}],49:[function(require,module,exports){
var has          = require('./_has')
  , toIObject    = require('./_to-iobject')
  , arrayIndexOf = require('./_array-includes')(false)
  , IE_PROTO     = require('./_shared-key')('IE_PROTO');

module.exports = function(object, names){
  var O      = toIObject(object)
    , i      = 0
    , result = []
    , key;
  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while(names.length > i)if(has(O, key = names[i++])){
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};
},{"./_array-includes":7,"./_has":23,"./_shared-key":58,"./_to-iobject":63}],50:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys       = require('./_object-keys-internal')
  , enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O){
  return $keys(O, enumBugKeys);
};
},{"./_enum-bug-keys":17,"./_object-keys-internal":49}],51:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;
},{}],52:[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],53:[function(require,module,exports){
var redefine = require('./_redefine');
module.exports = function(target, src, safe){
  for(var key in src)redefine(target, key, src[key], safe);
  return target;
};
},{"./_redefine":54}],54:[function(require,module,exports){
var global    = require('./_global')
  , hide      = require('./_hide')
  , has       = require('./_has')
  , SRC       = require('./_uid')('src')
  , TO_STRING = 'toString'
  , $toString = Function[TO_STRING]
  , TPL       = ('' + $toString).split(TO_STRING);

require('./_core').inspectSource = function(it){
  return $toString.call(it);
};

(module.exports = function(O, key, val, safe){
  var isFunction = typeof val == 'function';
  if(isFunction)has(val, 'name') || hide(val, 'name', key);
  if(O[key] === val)return;
  if(isFunction)has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if(O === global){
    O[key] = val;
  } else {
    if(!safe){
      delete O[key];
      hide(O, key, val);
    } else {
      if(O[key])O[key] = val;
      else hide(O, key, val);
    }
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString(){
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});
},{"./_core":12,"./_global":22,"./_has":23,"./_hide":24,"./_uid":67}],55:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = require('./_is-object')
  , anObject = require('./_an-object');
var check = function(O, proto){
  anObject(O);
  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function(test, buggy, set){
      try {
        set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch(e){ buggy = true; }
      return function setPrototypeOf(O, proto){
        check(O, proto);
        if(buggy)O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};
},{"./_an-object":6,"./_ctx":13,"./_is-object":31,"./_object-gopd":44}],56:[function(require,module,exports){
'use strict';
var global      = require('./_global')
  , dP          = require('./_object-dp')
  , DESCRIPTORS = require('./_descriptors')
  , SPECIES     = require('./_wks')('species');

module.exports = function(KEY){
  var C = global[KEY];
  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};
},{"./_descriptors":15,"./_global":22,"./_object-dp":42,"./_wks":70}],57:[function(require,module,exports){
var def = require('./_object-dp').f
  , has = require('./_has')
  , TAG = require('./_wks')('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};
},{"./_has":23,"./_object-dp":42,"./_wks":70}],58:[function(require,module,exports){
var shared = require('./_shared')('keys')
  , uid    = require('./_uid');
module.exports = function(key){
  return shared[key] || (shared[key] = uid(key));
};
},{"./_shared":59,"./_uid":67}],59:[function(require,module,exports){
var global = require('./_global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./_global":22}],60:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , defined   = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String(defined(that))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./_defined":14,"./_to-integer":62}],61:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , max       = Math.max
  , min       = Math.min;
module.exports = function(index, length){
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};
},{"./_to-integer":62}],62:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],63:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject')
  , defined = require('./_defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./_defined":14,"./_iobject":28}],64:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./_to-integer":62}],65:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function(it){
  return Object(defined(it));
};
},{"./_defined":14}],66:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function(it, S){
  if(!isObject(it))return it;
  var fn, val;
  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to primitive value");
};
},{"./_is-object":31}],67:[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],68:[function(require,module,exports){
var global         = require('./_global')
  , core           = require('./_core')
  , LIBRARY        = require('./_library')
  , wksExt         = require('./_wks-ext')
  , defineProperty = require('./_object-dp').f;
module.exports = function(name){
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if(name.charAt(0) != '_' && !(name in $Symbol))defineProperty($Symbol, name, {value: wksExt.f(name)});
};
},{"./_core":12,"./_global":22,"./_library":39,"./_object-dp":42,"./_wks-ext":69}],69:[function(require,module,exports){
exports.f = require('./_wks');
},{"./_wks":70}],70:[function(require,module,exports){
var store      = require('./_shared')('wks')
  , uid        = require('./_uid')
  , Symbol     = require('./_global').Symbol
  , USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function(name){
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;
},{"./_global":22,"./_shared":59,"./_uid":67}],71:[function(require,module,exports){
var classof   = require('./_classof')
  , ITERATOR  = require('./_wks')('iterator')
  , Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
},{"./_classof":8,"./_core":12,"./_iterators":37,"./_wks":70}],72:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables')
  , step             = require('./_iter-step')
  , Iterators        = require('./_iterators')
  , toIObject        = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function(iterated, kind){
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , kind  = this._k
    , index = this._i++;
  if(!O || index >= O.length){
    this._t = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');
},{"./_add-to-unscopables":4,"./_iter-define":34,"./_iter-step":36,"./_iterators":37,"./_to-iobject":63}],73:[function(require,module,exports){
'use strict';
var strong = require('./_collection-strong');

// 23.1 Map Objects
module.exports = require('./_collection')('Map', function(get){
  return function Map(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key){
    var entry = strong.getEntry(this, key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value){
    return strong.def(this, key === 0 ? 0 : key, value);
  }
}, strong, true);
},{"./_collection":11,"./_collection-strong":10}],74:[function(require,module,exports){
'use strict';
// 19.1.3.6 Object.prototype.toString()
var classof = require('./_classof')
  , test    = {};
test[require('./_wks')('toStringTag')] = 'z';
if(test + '' != '[object z]'){
  require('./_redefine')(Object.prototype, 'toString', function toString(){
    return '[object ' + classof(this) + ']';
  }, true);
}
},{"./_classof":8,"./_redefine":54,"./_wks":70}],75:[function(require,module,exports){
'use strict';
var $at  = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function(iterated){
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , index = this._i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  this._i += point.length;
  return {value: point, done: false};
});
},{"./_iter-define":34,"./_string-at":60}],76:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global         = require('./_global')
  , has            = require('./_has')
  , DESCRIPTORS    = require('./_descriptors')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , META           = require('./_meta').KEY
  , $fails         = require('./_fails')
  , shared         = require('./_shared')
  , setToStringTag = require('./_set-to-string-tag')
  , uid            = require('./_uid')
  , wks            = require('./_wks')
  , wksExt         = require('./_wks-ext')
  , wksDefine      = require('./_wks-define')
  , keyOf          = require('./_keyof')
  , enumKeys       = require('./_enum-keys')
  , isArray        = require('./_is-array')
  , anObject       = require('./_an-object')
  , toIObject      = require('./_to-iobject')
  , toPrimitive    = require('./_to-primitive')
  , createDesc     = require('./_property-desc')
  , _create        = require('./_object-create')
  , gOPNExt        = require('./_object-gopn-ext')
  , $GOPD          = require('./_object-gopd')
  , $DP            = require('./_object-dp')
  , $keys          = require('./_object-keys')
  , gOPD           = $GOPD.f
  , dP             = $DP.f
  , gOPN           = gOPNExt.f
  , $Symbol        = global.Symbol
  , $JSON          = global.JSON
  , _stringify     = $JSON && $JSON.stringify
  , PROTOTYPE      = 'prototype'
  , HIDDEN         = wks('_hidden')
  , TO_PRIMITIVE   = wks('toPrimitive')
  , isEnum         = {}.propertyIsEnumerable
  , SymbolRegistry = shared('symbol-registry')
  , AllSymbols     = shared('symbols')
  , OPSymbols      = shared('op-symbols')
  , ObjectProto    = Object[PROTOTYPE]
  , USE_NATIVE     = typeof $Symbol == 'function'
  , QObject        = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function(){
  return _create(dP({}, 'a', {
    get: function(){ return dP(this, 'a', {value: 7}).a; }
  })).a != 7;
}) ? function(it, key, D){
  var protoDesc = gOPD(ObjectProto, key);
  if(protoDesc)delete ObjectProto[key];
  dP(it, key, D);
  if(protoDesc && it !== ObjectProto)dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function(tag){
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function(it){
  return typeof it == 'symbol';
} : function(it){
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D){
  if(it === ObjectProto)$defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if(has(AllSymbols, key)){
    if(!D.enumerable){
      if(!has(it, HIDDEN))dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
      D = _create(D, {enumerable: createDesc(0, false)});
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P){
  anObject(it);
  var keys = enumKeys(P = toIObject(P))
    , i    = 0
    , l = keys.length
    , key;
  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P){
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key){
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if(this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
  it  = toIObject(it);
  key = toPrimitive(key, true);
  if(it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return;
  var D = gOPD(it, key);
  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it){
  var names  = gOPN(toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i){
    if(!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META)result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
  var IS_OP  = it === ObjectProto
    , names  = gOPN(IS_OP ? OPSymbols : toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i){
    if(has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true))result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if(!USE_NATIVE){
  $Symbol = function Symbol(){
    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function(value){
      if(this === ObjectProto)$set.call(OPSymbols, value);
      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if(DESCRIPTORS && setter)setSymbolDesc(ObjectProto, tag, {configurable: true, set: $set});
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString(){
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f   = $defineProperty;
  require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  require('./_object-pie').f  = $propertyIsEnumerable;
  require('./_object-gops').f = $getOwnPropertySymbols;

  if(DESCRIPTORS && !require('./_library')){
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function(name){
    return wrap(wks(name));
  }
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Symbol: $Symbol});

for(var symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), i = 0; symbols.length > i; )wks(symbols[i++]);

for(var symbols = $keys(wks.store), i = 0; symbols.length > i; )wksDefine(symbols[i++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(key){
    if(isSymbol(key))return keyOf(SymbolRegistry, key);
    throw TypeError(key + ' is not a symbol!');
  },
  useSetter: function(){ setter = true; },
  useSimple: function(){ setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function(){
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it){
    if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
    var args = [it]
      , i    = 1
      , replacer, $replacer;
    while(arguments.length > i)args.push(arguments[i++]);
    replacer = args[1];
    if(typeof replacer == 'function')$replacer = replacer;
    if($replacer || !isArray(replacer))replacer = function(key, value){
      if($replacer)value = $replacer.call(this, key, value);
      if(!isSymbol(value))return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);
},{"./_an-object":6,"./_descriptors":15,"./_enum-keys":18,"./_export":19,"./_fails":20,"./_global":22,"./_has":23,"./_hide":24,"./_is-array":30,"./_keyof":38,"./_library":39,"./_meta":40,"./_object-create":41,"./_object-dp":42,"./_object-gopd":44,"./_object-gopn":46,"./_object-gopn-ext":45,"./_object-gops":47,"./_object-keys":50,"./_object-pie":51,"./_property-desc":52,"./_redefine":54,"./_set-to-string-tag":57,"./_shared":59,"./_to-iobject":63,"./_to-primitive":66,"./_uid":67,"./_wks":70,"./_wks-define":68,"./_wks-ext":69}],77:[function(require,module,exports){
var $iterators    = require('./es6.array.iterator')
  , redefine      = require('./_redefine')
  , global        = require('./_global')
  , hide          = require('./_hide')
  , Iterators     = require('./_iterators')
  , wks           = require('./_wks')
  , ITERATOR      = wks('iterator')
  , TO_STRING_TAG = wks('toStringTag')
  , ArrayValues   = Iterators.Array;

for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
  var NAME       = collections[i]
    , Collection = global[NAME]
    , proto      = Collection && Collection.prototype
    , key;
  if(proto){
    if(!proto[ITERATOR])hide(proto, ITERATOR, ArrayValues);
    if(!proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
    Iterators[NAME] = ArrayValues;
    for(key in $iterators)if(!proto[key])redefine(proto, key, $iterators[key], true);
  }
}
},{"./_global":22,"./_hide":24,"./_iterators":37,"./_redefine":54,"./_wks":70,"./es6.array.iterator":72}],78:[function(require,module,exports){
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
},{"listen-js":79}],79:[function(require,module,exports){
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
},{}],80:[function(require,module,exports){
(function (global){
/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function(global) {
  'use strict';

  var testingExposeCycleCount = global.testingExposeCycleCount;

  // Detect and do basic sanity checking on Object/Array.observe.
  function detectObjectObserve() {
    if (typeof Object.observe !== 'function' ||
        typeof Array.observe !== 'function') {
      return false;
    }

    var records = [];

    function callback(recs) {
      records = recs;
    }

    var test = {};
    var arr = [];
    Object.observe(test, callback);
    Array.observe(arr, callback);
    test.id = 1;
    test.id = 2;
    delete test.id;
    arr.push(1, 2);
    arr.length = 0;

    Object.deliverChangeRecords(callback);
    if (records.length !== 5)
      return false;

    if (records[0].type != 'add' ||
        records[1].type != 'update' ||
        records[2].type != 'delete' ||
        records[3].type != 'splice' ||
        records[4].type != 'splice') {
      return false;
    }

    Object.unobserve(test, callback);
    Array.unobserve(arr, callback);

    return true;
  }

  var hasObserve = detectObjectObserve();

  function detectEval() {
    // Don't test for eval if we're running in a Chrome App environment.
    // We check for APIs set that only exist in a Chrome App context.
    if (typeof chrome !== 'undefined' && chrome.app && chrome.app.runtime) {
      return false;
    }

    // Firefox OS Apps do not allow eval. This feature detection is very hacky
    // but even if some other platform adds support for this function this code
    // will continue to work.
    if (typeof navigator != 'undefined' && navigator.getDeviceStorage) {
      return false;
    }

    try {
      var f = new Function('', 'return true;');
      return f();
    } catch (ex) {
      return false;
    }
  }

  var hasEval = detectEval();

  function isIndex(s) {
    return +s === s >>> 0 && s !== '';
  }

  function toNumber(s) {
    return +s;
  }

  function isObject(obj) {
    return obj === Object(obj);
  }

  var numberIsNaN = global.Number.isNaN || function(value) {
    return typeof value === 'number' && global.isNaN(value);
  }

  function areSameValue(left, right) {
    if (left === right)
      return left !== 0 || 1 / left === 1 / right;
    if (numberIsNaN(left) && numberIsNaN(right))
      return true;

    return left !== left && right !== right;
  }

  var createObject = ('__proto__' in {}) ?
    function(obj) { return obj; } :
    function(obj) {
      var proto = obj.__proto__;
      if (!proto)
        return obj;
      var newObject = Object.create(proto);
      Object.getOwnPropertyNames(obj).forEach(function(name) {
        Object.defineProperty(newObject, name,
                             Object.getOwnPropertyDescriptor(obj, name));
      });
      return newObject;
    };

  var identStart = '[\$_a-zA-Z]';
  var identPart = '[\$_a-zA-Z0-9]';
  var identRegExp = new RegExp('^' + identStart + '+' + identPart + '*' + '$');

  function getPathCharType(char) {
    if (char === undefined)
      return 'eof';

    var code = char.charCodeAt(0);

    switch(code) {
      case 0x5B: // [
      case 0x5D: // ]
      case 0x2E: // .
      case 0x22: // "
      case 0x27: // '
      case 0x30: // 0
        return char;

      case 0x5F: // _
      case 0x24: // $
        return 'ident';

      case 0x20: // Space
      case 0x09: // Tab
      case 0x0A: // Newline
      case 0x0D: // Return
      case 0xA0:  // No-break space
      case 0xFEFF:  // Byte Order Mark
      case 0x2028:  // Line Separator
      case 0x2029:  // Paragraph Separator
        return 'ws';
    }

    // a-z, A-Z
    if ((0x61 <= code && code <= 0x7A) || (0x41 <= code && code <= 0x5A))
      return 'ident';

    // 1-9
    if (0x31 <= code && code <= 0x39)
      return 'number';

    return 'else';
  }

  var pathStateMachine = {
    'beforePath': {
      'ws': ['beforePath'],
      'ident': ['inIdent', 'append'],
      '[': ['beforeElement'],
      'eof': ['afterPath']
    },

    'inPath': {
      'ws': ['inPath'],
      '.': ['beforeIdent'],
      '[': ['beforeElement'],
      'eof': ['afterPath']
    },

    'beforeIdent': {
      'ws': ['beforeIdent'],
      'ident': ['inIdent', 'append']
    },

    'inIdent': {
      'ident': ['inIdent', 'append'],
      '0': ['inIdent', 'append'],
      'number': ['inIdent', 'append'],
      'ws': ['inPath', 'push'],
      '.': ['beforeIdent', 'push'],
      '[': ['beforeElement', 'push'],
      'eof': ['afterPath', 'push']
    },

    'beforeElement': {
      'ws': ['beforeElement'],
      '0': ['afterZero', 'append'],
      'number': ['inIndex', 'append'],
      "'": ['inSingleQuote', 'append', ''],
      '"': ['inDoubleQuote', 'append', '']
    },

    'afterZero': {
      'ws': ['afterElement', 'push'],
      ']': ['inPath', 'push']
    },

    'inIndex': {
      '0': ['inIndex', 'append'],
      'number': ['inIndex', 'append'],
      'ws': ['afterElement'],
      ']': ['inPath', 'push']
    },

    'inSingleQuote': {
      "'": ['afterElement'],
      'eof': ['error'],
      'else': ['inSingleQuote', 'append']
    },

    'inDoubleQuote': {
      '"': ['afterElement'],
      'eof': ['error'],
      'else': ['inDoubleQuote', 'append']
    },

    'afterElement': {
      'ws': ['afterElement'],
      ']': ['inPath', 'push']
    }
  }

  function noop() {}

  function parsePath(path) {
    var keys = [];
    var index = -1;
    var c, newChar, key, type, transition, action, typeMap, mode = 'beforePath';

    var actions = {
      push: function() {
        if (key === undefined)
          return;

        keys.push(key);
        key = undefined;
      },

      append: function() {
        if (key === undefined)
          key = newChar
        else
          key += newChar;
      }
    };

    function maybeUnescapeQuote() {
      if (index >= path.length)
        return;

      var nextChar = path[index + 1];
      if ((mode == 'inSingleQuote' && nextChar == "'") ||
          (mode == 'inDoubleQuote' && nextChar == '"')) {
        index++;
        newChar = nextChar;
        actions.append();
        return true;
      }
    }

    while (mode) {
      index++;
      c = path[index];

      if (c == '\\' && maybeUnescapeQuote(mode))
        continue;

      type = getPathCharType(c);
      typeMap = pathStateMachine[mode];
      transition = typeMap[type] || typeMap['else'] || 'error';

      if (transition == 'error')
        return; // parse error;

      mode = transition[0];
      action = actions[transition[1]] || noop;
      newChar = transition[2] === undefined ? c : transition[2];
      action();

      if (mode === 'afterPath') {
        return keys;
      }
    }

    return; // parse error
  }

  function isIdent(s) {
    return identRegExp.test(s);
  }

  var constructorIsPrivate = {};

  function Path(parts, privateToken) {
    if (privateToken !== constructorIsPrivate)
      throw Error('Use Path.get to retrieve path objects');

    for (var i = 0; i < parts.length; i++) {
      this.push(String(parts[i]));
    }

    if (hasEval && this.length) {
      this.getValueFrom = this.compiledGetValueFromFn();
    }
  }

  // TODO(rafaelw): Make simple LRU cache
  var pathCache = {};

  function getPath(pathString) {
    if (pathString instanceof Path)
      return pathString;

    if (pathString == null || pathString.length == 0)
      pathString = '';

    if (typeof pathString != 'string') {
      if (isIndex(pathString.length)) {
        // Constructed with array-like (pre-parsed) keys
        return new Path(pathString, constructorIsPrivate);
      }

      pathString = String(pathString);
    }

    var path = pathCache[pathString];
    if (path)
      return path;

    var parts = parsePath(pathString);
    if (!parts)
      return invalidPath;

    var path = new Path(parts, constructorIsPrivate);
    pathCache[pathString] = path;
    return path;
  }

  Path.get = getPath;

  function formatAccessor(key) {
    if (isIndex(key)) {
      return '[' + key + ']';
    } else {
      return '["' + key.replace(/"/g, '\\"') + '"]';
    }
  }

  Path.prototype = createObject({
    __proto__: [],
    valid: true,

    toString: function() {
      var pathString = '';
      for (var i = 0; i < this.length; i++) {
        var key = this[i];
        if (isIdent(key)) {
          pathString += i ? '.' + key : key;
        } else {
          pathString += formatAccessor(key);
        }
      }

      return pathString;
    },

    getValueFrom: function(obj, directObserver) {
      for (var i = 0; i < this.length; i++) {
        if (obj == null)
          return;
        obj = obj[this[i]];
      }
      return obj;
    },

    iterateObjects: function(obj, observe) {
      for (var i = 0; i < this.length; i++) {
        if (i)
          obj = obj[this[i - 1]];
        if (!isObject(obj))
          return;
        observe(obj, this[i]);
      }
    },

    compiledGetValueFromFn: function() {
      var str = '';
      var pathString = 'obj';
      str += 'if (obj != null';
      var i = 0;
      var key;
      for (; i < (this.length - 1); i++) {
        key = this[i];
        pathString += isIdent(key) ? '.' + key : formatAccessor(key);
        str += ' &&\n     ' + pathString + ' != null';
      }
      str += ')\n';

      var key = this[i];
      pathString += isIdent(key) ? '.' + key : formatAccessor(key);

      str += '  return ' + pathString + ';\nelse\n  return undefined;';
      return new Function('obj', str);
    },

    setValueFrom: function(obj, value) {
      if (!this.length)
        return false;

      for (var i = 0; i < this.length - 1; i++) {
        if (!isObject(obj))
          return false;
        obj = obj[this[i]];
      }

      if (!isObject(obj))
        return false;

      obj[this[i]] = value;
      return true;
    }
  });

  var invalidPath = new Path('', constructorIsPrivate);
  invalidPath.valid = false;
  invalidPath.getValueFrom = invalidPath.setValueFrom = function() {};

  var MAX_DIRTY_CHECK_CYCLES = 1000;

  function dirtyCheck(observer) {
    var cycles = 0;
    while (cycles < MAX_DIRTY_CHECK_CYCLES && observer.check_()) {
      cycles++;
    }
    if (testingExposeCycleCount)
      global.dirtyCheckCycleCount = cycles;

    return cycles > 0;
  }

  function objectIsEmpty(object) {
    for (var prop in object)
      return false;
    return true;
  }

  function diffIsEmpty(diff) {
    return objectIsEmpty(diff.added) &&
           objectIsEmpty(diff.removed) &&
           objectIsEmpty(diff.changed);
  }

  function diffObjectFromOldObject(object, oldObject) {
    var added = {};
    var removed = {};
    var changed = {};

    for (var prop in oldObject) {
      var newValue = object[prop];

      if (newValue !== undefined && newValue === oldObject[prop])
        continue;

      if (!(prop in object)) {
        removed[prop] = undefined;
        continue;
      }

      if (newValue !== oldObject[prop])
        changed[prop] = newValue;
    }

    for (var prop in object) {
      if (prop in oldObject)
        continue;

      added[prop] = object[prop];
    }

    if (Array.isArray(object) && object.length !== oldObject.length)
      changed.length = object.length;

    return {
      added: added,
      removed: removed,
      changed: changed
    };
  }

  var eomTasks = [];
  function runEOMTasks() {
    if (!eomTasks.length)
      return false;

    for (var i = 0; i < eomTasks.length; i++) {
      eomTasks[i]();
    }
    eomTasks.length = 0;
    return true;
  }

  var runEOM = hasObserve ? (function(){
    return function(fn) {
      return Promise.resolve().then(fn);
    }
  })() :
  (function() {
    return function(fn) {
      eomTasks.push(fn);
    };
  })();

  var observedObjectCache = [];

  function newObservedObject() {
    var observer;
    var object;
    var discardRecords = false;
    var first = true;

    function callback(records) {
      if (observer && observer.state_ === OPENED && !discardRecords)
        observer.check_(records);
    }

    return {
      open: function(obs) {
        if (observer)
          throw Error('ObservedObject in use');

        if (!first)
          Object.deliverChangeRecords(callback);

        observer = obs;
        first = false;
      },
      observe: function(obj, arrayObserve) {
        object = obj;
        if (arrayObserve)
          Array.observe(object, callback);
        else
          Object.observe(object, callback);
      },
      deliver: function(discard) {
        discardRecords = discard;
        Object.deliverChangeRecords(callback);
        discardRecords = false;
      },
      close: function() {
        observer = undefined;
        Object.unobserve(object, callback);
        observedObjectCache.push(this);
      }
    };
  }

  /*
   * The observedSet abstraction is a perf optimization which reduces the total
   * number of Object.observe observations of a set of objects. The idea is that
   * groups of Observers will have some object dependencies in common and this
   * observed set ensures that each object in the transitive closure of
   * dependencies is only observed once. The observedSet acts as a write barrier
   * such that whenever any change comes through, all Observers are checked for
   * changed values.
   *
   * Note that this optimization is explicitly moving work from setup-time to
   * change-time.
   *
   * TODO(rafaelw): Implement "garbage collection". In order to move work off
   * the critical path, when Observers are closed, their observed objects are
   * not Object.unobserve(d). As a result, it's possible that if the observedSet
   * is kept open, but some Observers have been closed, it could cause "leaks"
   * (prevent otherwise collectable objects from being collected). At some
   * point, we should implement incremental "gc" which keeps a list of
   * observedSets which may need clean-up and does small amounts of cleanup on a
   * timeout until all is clean.
   */

  function getObservedObject(observer, object, arrayObserve) {
    var dir = observedObjectCache.pop() || newObservedObject();
    dir.open(observer);
    dir.observe(object, arrayObserve);
    return dir;
  }

  var observedSetCache = [];

  function newObservedSet() {
    var observerCount = 0;
    var observers = [];
    var objects = [];
    var rootObj;
    var rootObjProps;

    function observe(obj, prop) {
      if (!obj)
        return;

      if (obj === rootObj)
        rootObjProps[prop] = true;

      if (objects.indexOf(obj) < 0) {
        objects.push(obj);
        Object.observe(obj, callback);
      }

      observe(Object.getPrototypeOf(obj), prop);
    }

    function allRootObjNonObservedProps(recs) {
      for (var i = 0; i < recs.length; i++) {
        var rec = recs[i];
        if (rec.object !== rootObj ||
            rootObjProps[rec.name] ||
            rec.type === 'setPrototype') {
          return false;
        }
      }
      return true;
    }

    function callback(recs) {
      if (allRootObjNonObservedProps(recs))
        return;

      var observer;
      for (var i = 0; i < observers.length; i++) {
        observer = observers[i];
        if (observer.state_ == OPENED) {
          observer.iterateObjects_(observe);
        }
      }

      for (var i = 0; i < observers.length; i++) {
        observer = observers[i];
        if (observer.state_ == OPENED) {
          observer.check_();
        }
      }
    }

    var record = {
      objects: objects,
      get rootObject() { return rootObj; },
      set rootObject(value) {
        rootObj = value;
        rootObjProps = {};
      },
      open: function(obs, object) {
        observers.push(obs);
        observerCount++;
        obs.iterateObjects_(observe);
      },
      close: function(obs) {
        observerCount--;
        if (observerCount > 0) {
          return;
        }

        for (var i = 0; i < objects.length; i++) {
          Object.unobserve(objects[i], callback);
          Observer.unobservedCount++;
        }

        observers.length = 0;
        objects.length = 0;
        rootObj = undefined;
        rootObjProps = undefined;
        observedSetCache.push(this);
        if (lastObservedSet === this)
          lastObservedSet = null;
      },
    };

    return record;
  }

  var lastObservedSet;

  function getObservedSet(observer, obj) {
    if (!lastObservedSet || lastObservedSet.rootObject !== obj) {
      lastObservedSet = observedSetCache.pop() || newObservedSet();
      lastObservedSet.rootObject = obj;
    }
    lastObservedSet.open(observer, obj);
    return lastObservedSet;
  }

  var UNOPENED = 0;
  var OPENED = 1;
  var CLOSED = 2;
  var RESETTING = 3;

  var nextObserverId = 1;

  function Observer() {
    this.state_ = UNOPENED;
    this.callback_ = undefined;
    this.target_ = undefined; // TODO(rafaelw): Should be WeakRef
    this.directObserver_ = undefined;
    this.value_ = undefined;
    this.id_ = nextObserverId++;
  }

  Observer.prototype = {
    open: function(callback, target) {
      if (this.state_ != UNOPENED)
        throw Error('Observer has already been opened.');

      addToAll(this);
      this.callback_ = callback;
      this.target_ = target;
      this.connect_();
      this.state_ = OPENED;
      return this.value_;
    },

    close: function() {
      if (this.state_ != OPENED)
        return;

      removeFromAll(this);
      this.disconnect_();
      this.value_ = undefined;
      this.callback_ = undefined;
      this.target_ = undefined;
      this.state_ = CLOSED;
    },

    deliver: function() {
      if (this.state_ != OPENED)
        return;

      dirtyCheck(this);
    },

    report_: function(changes) {
      try {
        this.callback_.apply(this.target_, changes);
      } catch (ex) {
        Observer._errorThrownDuringCallback = true;
        console.error('Exception caught during observer callback: ' +
                       (ex.stack || ex));
      }
    },

    discardChanges: function() {
      this.check_(undefined, true);
      return this.value_;
    }
  }

  var collectObservers = !hasObserve;
  var allObservers;
  Observer._allObserversCount = 0;

  if (collectObservers) {
    allObservers = [];
  }

  function addToAll(observer) {
    Observer._allObserversCount++;
    if (!collectObservers)
      return;

    allObservers.push(observer);
  }

  function removeFromAll(observer) {
    Observer._allObserversCount--;
  }

  var runningMicrotaskCheckpoint = false;

  global.Platform = global.Platform || {};

  global.Platform.performMicrotaskCheckpoint = function() {
    if (runningMicrotaskCheckpoint)
      return;

    if (!collectObservers)
      return;

    runningMicrotaskCheckpoint = true;

    var cycles = 0;
    var anyChanged, toCheck;

    do {
      cycles++;
      toCheck = allObservers;
      allObservers = [];
      anyChanged = false;

      for (var i = 0; i < toCheck.length; i++) {
        var observer = toCheck[i];
        if (observer.state_ != OPENED)
          continue;

        if (observer.check_())
          anyChanged = true;

        allObservers.push(observer);
      }
      if (runEOMTasks())
        anyChanged = true;
    } while (cycles < MAX_DIRTY_CHECK_CYCLES && anyChanged);

    if (testingExposeCycleCount)
      global.dirtyCheckCycleCount = cycles;

    runningMicrotaskCheckpoint = false;
  };

  if (collectObservers) {
    global.Platform.clearObservers = function() {
      allObservers = [];
    };
  }

  function ObjectObserver(object) {
    Observer.call(this);
    this.value_ = object;
    this.oldObject_ = undefined;
  }

  ObjectObserver.prototype = createObject({
    __proto__: Observer.prototype,

    arrayObserve: false,

    connect_: function(callback, target) {
      if (hasObserve) {
        this.directObserver_ = getObservedObject(this, this.value_,
                                                 this.arrayObserve);
      } else {
        this.oldObject_ = this.copyObject(this.value_);
      }

    },

    copyObject: function(object) {
      var copy = Array.isArray(object) ? [] : {};
      for (var prop in object) {
        copy[prop] = object[prop];
      };
      if (Array.isArray(object))
        copy.length = object.length;
      return copy;
    },

    check_: function(changeRecords, skipChanges) {
      var diff;
      var oldValues;
      if (hasObserve) {
        if (!changeRecords)
          return false;

        oldValues = {};
        diff = diffObjectFromChangeRecords(this.value_, changeRecords,
                                           oldValues);
      } else {
        oldValues = this.oldObject_;
        diff = diffObjectFromOldObject(this.value_, this.oldObject_);
      }

      if (diffIsEmpty(diff))
        return false;

      if (!hasObserve)
        this.oldObject_ = this.copyObject(this.value_);

      this.report_([
        diff.added || {},
        diff.removed || {},
        diff.changed || {},
        function(property) {
          return oldValues[property];
        }
      ]);

      return true;
    },

    disconnect_: function() {
      if (hasObserve) {
        this.directObserver_.close();
        this.directObserver_ = undefined;
      } else {
        this.oldObject_ = undefined;
      }
    },

    deliver: function() {
      if (this.state_ != OPENED)
        return;

      if (hasObserve)
        this.directObserver_.deliver(false);
      else
        dirtyCheck(this);
    },

    discardChanges: function() {
      if (this.directObserver_)
        this.directObserver_.deliver(true);
      else
        this.oldObject_ = this.copyObject(this.value_);

      return this.value_;
    }
  });

  function ArrayObserver(array) {
    if (!Array.isArray(array))
      throw Error('Provided object is not an Array');
    ObjectObserver.call(this, array);
  }

  ArrayObserver.prototype = createObject({

    __proto__: ObjectObserver.prototype,

    arrayObserve: true,

    copyObject: function(arr) {
      return arr.slice();
    },

    check_: function(changeRecords) {
      var splices;
      if (hasObserve) {
        if (!changeRecords)
          return false;
        splices = projectArraySplices(this.value_, changeRecords);
      } else {
        splices = calcSplices(this.value_, 0, this.value_.length,
                              this.oldObject_, 0, this.oldObject_.length);
      }

      if (!splices || !splices.length)
        return false;

      if (!hasObserve)
        this.oldObject_ = this.copyObject(this.value_);

      this.report_([splices]);
      return true;
    }
  });

  ArrayObserver.applySplices = function(previous, current, splices) {
    splices.forEach(function(splice) {
      var spliceArgs = [splice.index, splice.removed.length];
      var addIndex = splice.index;
      while (addIndex < splice.index + splice.addedCount) {
        spliceArgs.push(current[addIndex]);
        addIndex++;
      }

      Array.prototype.splice.apply(previous, spliceArgs);
    });
  };

  function PathObserver(object, path) {
    Observer.call(this);

    this.object_ = object;
    this.path_ = getPath(path);
    this.directObserver_ = undefined;
  }

  PathObserver.prototype = createObject({
    __proto__: Observer.prototype,

    get path() {
      return this.path_;
    },

    connect_: function() {
      if (hasObserve)
        this.directObserver_ = getObservedSet(this, this.object_);

      this.check_(undefined, true);
    },

    disconnect_: function() {
      this.value_ = undefined;

      if (this.directObserver_) {
        this.directObserver_.close(this);
        this.directObserver_ = undefined;
      }
    },

    iterateObjects_: function(observe) {
      this.path_.iterateObjects(this.object_, observe);
    },

    check_: function(changeRecords, skipChanges) {
      var oldValue = this.value_;
      this.value_ = this.path_.getValueFrom(this.object_);
      if (skipChanges || areSameValue(this.value_, oldValue))
        return false;

      this.report_([this.value_, oldValue, this]);
      return true;
    },

    setValue: function(newValue) {
      if (this.path_)
        this.path_.setValueFrom(this.object_, newValue);
    }
  });

  function CompoundObserver(reportChangesOnOpen) {
    Observer.call(this);

    this.reportChangesOnOpen_ = reportChangesOnOpen;
    this.value_ = [];
    this.directObserver_ = undefined;
    this.observed_ = [];
  }

  var observerSentinel = {};

  CompoundObserver.prototype = createObject({
    __proto__: Observer.prototype,

    connect_: function() {
      if (hasObserve) {
        var object;
        var needsDirectObserver = false;
        for (var i = 0; i < this.observed_.length; i += 2) {
          object = this.observed_[i]
          if (object !== observerSentinel) {
            needsDirectObserver = true;
            break;
          }
        }

        if (needsDirectObserver)
          this.directObserver_ = getObservedSet(this, object);
      }

      this.check_(undefined, !this.reportChangesOnOpen_);
    },

    disconnect_: function() {
      for (var i = 0; i < this.observed_.length; i += 2) {
        if (this.observed_[i] === observerSentinel)
          this.observed_[i + 1].close();
      }
      this.observed_.length = 0;
      this.value_.length = 0;

      if (this.directObserver_) {
        this.directObserver_.close(this);
        this.directObserver_ = undefined;
      }
    },

    addPath: function(object, path) {
      if (this.state_ != UNOPENED && this.state_ != RESETTING)
        throw Error('Cannot add paths once started.');

      var path = getPath(path);
      this.observed_.push(object, path);
      if (!this.reportChangesOnOpen_)
        return;
      var index = this.observed_.length / 2 - 1;
      this.value_[index] = path.getValueFrom(object);
    },

    addObserver: function(observer) {
      if (this.state_ != UNOPENED && this.state_ != RESETTING)
        throw Error('Cannot add observers once started.');

      this.observed_.push(observerSentinel, observer);
      if (!this.reportChangesOnOpen_)
        return;
      var index = this.observed_.length / 2 - 1;
      this.value_[index] = observer.open(this.deliver, this);
    },

    startReset: function() {
      if (this.state_ != OPENED)
        throw Error('Can only reset while open');

      this.state_ = RESETTING;
      this.disconnect_();
    },

    finishReset: function() {
      if (this.state_ != RESETTING)
        throw Error('Can only finishReset after startReset');
      this.state_ = OPENED;
      this.connect_();

      return this.value_;
    },

    iterateObjects_: function(observe) {
      var object;
      for (var i = 0; i < this.observed_.length; i += 2) {
        object = this.observed_[i]
        if (object !== observerSentinel)
          this.observed_[i + 1].iterateObjects(object, observe)
      }
    },

    check_: function(changeRecords, skipChanges) {
      var oldValues;
      for (var i = 0; i < this.observed_.length; i += 2) {
        var object = this.observed_[i];
        var path = this.observed_[i+1];
        var value;
        if (object === observerSentinel) {
          var observable = path;
          value = this.state_ === UNOPENED ?
              observable.open(this.deliver, this) :
              observable.discardChanges();
        } else {
          value = path.getValueFrom(object);
        }

        if (skipChanges) {
          this.value_[i / 2] = value;
          continue;
        }

        if (areSameValue(value, this.value_[i / 2]))
          continue;

        oldValues = oldValues || [];
        oldValues[i / 2] = this.value_[i / 2];
        this.value_[i / 2] = value;
      }

      if (!oldValues)
        return false;

      // TODO(rafaelw): Having observed_ as the third callback arg here is
      // pretty lame API. Fix.
      this.report_([this.value_, oldValues, this.observed_]);
      return true;
    }
  });

  function identFn(value) { return value; }

  function ObserverTransform(observable, getValueFn, setValueFn,
                             dontPassThroughSet) {
    this.callback_ = undefined;
    this.target_ = undefined;
    this.value_ = undefined;
    this.observable_ = observable;
    this.getValueFn_ = getValueFn || identFn;
    this.setValueFn_ = setValueFn || identFn;
    // TODO(rafaelw): This is a temporary hack. PolymerExpressions needs this
    // at the moment because of a bug in it's dependency tracking.
    this.dontPassThroughSet_ = dontPassThroughSet;
  }

  ObserverTransform.prototype = {
    open: function(callback, target) {
      this.callback_ = callback;
      this.target_ = target;
      this.value_ =
          this.getValueFn_(this.observable_.open(this.observedCallback_, this));
      return this.value_;
    },

    observedCallback_: function(value) {
      value = this.getValueFn_(value);
      if (areSameValue(value, this.value_))
        return;
      var oldValue = this.value_;
      this.value_ = value;
      this.callback_.call(this.target_, this.value_, oldValue);
    },

    discardChanges: function() {
      this.value_ = this.getValueFn_(this.observable_.discardChanges());
      return this.value_;
    },

    deliver: function() {
      return this.observable_.deliver();
    },

    setValue: function(value) {
      value = this.setValueFn_(value);
      if (!this.dontPassThroughSet_ && this.observable_.setValue)
        return this.observable_.setValue(value);
    },

    close: function() {
      if (this.observable_)
        this.observable_.close();
      this.callback_ = undefined;
      this.target_ = undefined;
      this.observable_ = undefined;
      this.value_ = undefined;
      this.getValueFn_ = undefined;
      this.setValueFn_ = undefined;
    }
  }

  var expectedRecordTypes = {
    add: true,
    update: true,
    delete: true
  };

  function diffObjectFromChangeRecords(object, changeRecords, oldValues) {
    var added = {};
    var removed = {};

    for (var i = 0; i < changeRecords.length; i++) {
      var record = changeRecords[i];
      if (!expectedRecordTypes[record.type]) {
        console.error('Unknown changeRecord type: ' + record.type);
        console.error(record);
        continue;
      }

      if (!(record.name in oldValues))
        oldValues[record.name] = record.oldValue;

      if (record.type == 'update')
        continue;

      if (record.type == 'add') {
        if (record.name in removed)
          delete removed[record.name];
        else
          added[record.name] = true;

        continue;
      }

      // type = 'delete'
      if (record.name in added) {
        delete added[record.name];
        delete oldValues[record.name];
      } else {
        removed[record.name] = true;
      }
    }

    for (var prop in added)
      added[prop] = object[prop];

    for (var prop in removed)
      removed[prop] = undefined;

    var changed = {};
    for (var prop in oldValues) {
      if (prop in added || prop in removed)
        continue;

      var newValue = object[prop];
      if (oldValues[prop] !== newValue)
        changed[prop] = newValue;
    }

    return {
      added: added,
      removed: removed,
      changed: changed
    };
  }

  function newSplice(index, removed, addedCount) {
    return {
      index: index,
      removed: removed,
      addedCount: addedCount
    };
  }

  var EDIT_LEAVE = 0;
  var EDIT_UPDATE = 1;
  var EDIT_ADD = 2;
  var EDIT_DELETE = 3;

  function ArraySplice() {}

  ArraySplice.prototype = {

    // Note: This function is *based* on the computation of the Levenshtein
    // "edit" distance. The one change is that "updates" are treated as two
    // edits - not one. With Array splices, an update is really a delete
    // followed by an add. By retaining this, we optimize for "keeping" the
    // maximum array items in the original array. For example:
    //
    //   'xxxx123' -> '123yyyy'
    //
    // With 1-edit updates, the shortest path would be just to update all seven
    // characters. With 2-edit updates, we delete 4, leave 3, and add 4. This
    // leaves the substring '123' intact.
    calcEditDistances: function(current, currentStart, currentEnd,
                                old, oldStart, oldEnd) {
      // "Deletion" columns
      var rowCount = oldEnd - oldStart + 1;
      var columnCount = currentEnd - currentStart + 1;
      var distances = new Array(rowCount);

      // "Addition" rows. Initialize null column.
      for (var i = 0; i < rowCount; i++) {
        distances[i] = new Array(columnCount);
        distances[i][0] = i;
      }

      // Initialize null row
      for (var j = 0; j < columnCount; j++)
        distances[0][j] = j;

      for (var i = 1; i < rowCount; i++) {
        for (var j = 1; j < columnCount; j++) {
          if (this.equals(current[currentStart + j - 1], old[oldStart + i - 1]))
            distances[i][j] = distances[i - 1][j - 1];
          else {
            var north = distances[i - 1][j] + 1;
            var west = distances[i][j - 1] + 1;
            distances[i][j] = north < west ? north : west;
          }
        }
      }

      return distances;
    },

    // This starts at the final weight, and walks "backward" by finding
    // the minimum previous weight recursively until the origin of the weight
    // matrix.
    spliceOperationsFromEditDistances: function(distances) {
      var i = distances.length - 1;
      var j = distances[0].length - 1;
      var current = distances[i][j];
      var edits = [];
      while (i > 0 || j > 0) {
        if (i == 0) {
          edits.push(EDIT_ADD);
          j--;
          continue;
        }
        if (j == 0) {
          edits.push(EDIT_DELETE);
          i--;
          continue;
        }
        var northWest = distances[i - 1][j - 1];
        var west = distances[i - 1][j];
        var north = distances[i][j - 1];

        var min;
        if (west < north)
          min = west < northWest ? west : northWest;
        else
          min = north < northWest ? north : northWest;

        if (min == northWest) {
          if (northWest == current) {
            edits.push(EDIT_LEAVE);
          } else {
            edits.push(EDIT_UPDATE);
            current = northWest;
          }
          i--;
          j--;
        } else if (min == west) {
          edits.push(EDIT_DELETE);
          i--;
          current = west;
        } else {
          edits.push(EDIT_ADD);
          j--;
          current = north;
        }
      }

      edits.reverse();
      return edits;
    },

    /**
     * Splice Projection functions:
     *
     * A splice map is a representation of how a previous array of items
     * was transformed into a new array of items. Conceptually it is a list of
     * tuples of
     *
     *   <index, removed, addedCount>
     *
     * which are kept in ascending index order of. The tuple represents that at
     * the |index|, |removed| sequence of items were removed, and counting forward
     * from |index|, |addedCount| items were added.
     */

    /**
     * Lacking individual splice mutation information, the minimal set of
     * splices can be synthesized given the previous state and final state of an
     * array. The basic approach is to calculate the edit distance matrix and
     * choose the shortest path through it.
     *
     * Complexity: O(l * p)
     *   l: The length of the current array
     *   p: The length of the old array
     */
    calcSplices: function(current, currentStart, currentEnd,
                          old, oldStart, oldEnd) {
      var prefixCount = 0;
      var suffixCount = 0;

      var minLength = Math.min(currentEnd - currentStart, oldEnd - oldStart);
      if (currentStart == 0 && oldStart == 0)
        prefixCount = this.sharedPrefix(current, old, minLength);

      if (currentEnd == current.length && oldEnd == old.length)
        suffixCount = this.sharedSuffix(current, old, minLength - prefixCount);

      currentStart += prefixCount;
      oldStart += prefixCount;
      currentEnd -= suffixCount;
      oldEnd -= suffixCount;

      if (currentEnd - currentStart == 0 && oldEnd - oldStart == 0)
        return [];

      if (currentStart == currentEnd) {
        var splice = newSplice(currentStart, [], 0);
        while (oldStart < oldEnd)
          splice.removed.push(old[oldStart++]);

        return [ splice ];
      } else if (oldStart == oldEnd)
        return [ newSplice(currentStart, [], currentEnd - currentStart) ];

      var ops = this.spliceOperationsFromEditDistances(
          this.calcEditDistances(current, currentStart, currentEnd,
                                 old, oldStart, oldEnd));

      var splice = undefined;
      var splices = [];
      var index = currentStart;
      var oldIndex = oldStart;
      for (var i = 0; i < ops.length; i++) {
        switch(ops[i]) {
          case EDIT_LEAVE:
            if (splice) {
              splices.push(splice);
              splice = undefined;
            }

            index++;
            oldIndex++;
            break;
          case EDIT_UPDATE:
            if (!splice)
              splice = newSplice(index, [], 0);

            splice.addedCount++;
            index++;

            splice.removed.push(old[oldIndex]);
            oldIndex++;
            break;
          case EDIT_ADD:
            if (!splice)
              splice = newSplice(index, [], 0);

            splice.addedCount++;
            index++;
            break;
          case EDIT_DELETE:
            if (!splice)
              splice = newSplice(index, [], 0);

            splice.removed.push(old[oldIndex]);
            oldIndex++;
            break;
        }
      }

      if (splice) {
        splices.push(splice);
      }
      return splices;
    },

    sharedPrefix: function(current, old, searchLength) {
      for (var i = 0; i < searchLength; i++)
        if (!this.equals(current[i], old[i]))
          return i;
      return searchLength;
    },

    sharedSuffix: function(current, old, searchLength) {
      var index1 = current.length;
      var index2 = old.length;
      var count = 0;
      while (count < searchLength && this.equals(current[--index1], old[--index2]))
        count++;

      return count;
    },

    calculateSplices: function(current, previous) {
      return this.calcSplices(current, 0, current.length, previous, 0,
                              previous.length);
    },

    equals: function(currentValue, previousValue) {
      return currentValue === previousValue;
    }
  };

  var arraySplice = new ArraySplice();

  function calcSplices(current, currentStart, currentEnd,
                       old, oldStart, oldEnd) {
    return arraySplice.calcSplices(current, currentStart, currentEnd,
                                   old, oldStart, oldEnd);
  }

  function intersect(start1, end1, start2, end2) {
    // Disjoint
    if (end1 < start2 || end2 < start1)
      return -1;

    // Adjacent
    if (end1 == start2 || end2 == start1)
      return 0;

    // Non-zero intersect, span1 first
    if (start1 < start2) {
      if (end1 < end2)
        return end1 - start2; // Overlap
      else
        return end2 - start2; // Contained
    } else {
      // Non-zero intersect, span2 first
      if (end2 < end1)
        return end2 - start1; // Overlap
      else
        return end1 - start1; // Contained
    }
  }

  function mergeSplice(splices, index, removed, addedCount) {

    var splice = newSplice(index, removed, addedCount);

    var inserted = false;
    var insertionOffset = 0;

    for (var i = 0; i < splices.length; i++) {
      var current = splices[i];
      current.index += insertionOffset;

      if (inserted)
        continue;

      var intersectCount = intersect(splice.index,
                                     splice.index + splice.removed.length,
                                     current.index,
                                     current.index + current.addedCount);

      if (intersectCount >= 0) {
        // Merge the two splices

        splices.splice(i, 1);
        i--;

        insertionOffset -= current.addedCount - current.removed.length;

        splice.addedCount += current.addedCount - intersectCount;
        var deleteCount = splice.removed.length +
                          current.removed.length - intersectCount;

        if (!splice.addedCount && !deleteCount) {
          // merged splice is a noop. discard.
          inserted = true;
        } else {
          var removed = current.removed;

          if (splice.index < current.index) {
            // some prefix of splice.removed is prepended to current.removed.
            var prepend = splice.removed.slice(0, current.index - splice.index);
            Array.prototype.push.apply(prepend, removed);
            removed = prepend;
          }

          if (splice.index + splice.removed.length > current.index + current.addedCount) {
            // some suffix of splice.removed is appended to current.removed.
            var append = splice.removed.slice(current.index + current.addedCount - splice.index);
            Array.prototype.push.apply(removed, append);
          }

          splice.removed = removed;
          if (current.index < splice.index) {
            splice.index = current.index;
          }
        }
      } else if (splice.index < current.index) {
        // Insert splice here.

        inserted = true;

        splices.splice(i, 0, splice);
        i++;

        var offset = splice.addedCount - splice.removed.length
        current.index += offset;
        insertionOffset += offset;
      }
    }

    if (!inserted)
      splices.push(splice);
  }

  function createInitialSplices(array, changeRecords) {
    var splices = [];

    for (var i = 0; i < changeRecords.length; i++) {
      var record = changeRecords[i];
      switch(record.type) {
        case 'splice':
          mergeSplice(splices, record.index, record.removed.slice(), record.addedCount);
          break;
        case 'add':
        case 'update':
        case 'delete':
          if (!isIndex(record.name))
            continue;
          var index = toNumber(record.name);
          if (index < 0)
            continue;
          mergeSplice(splices, index, [record.oldValue], 1);
          break;
        default:
          console.error('Unexpected record type: ' + JSON.stringify(record));
          break;
      }
    }

    return splices;
  }

  function projectArraySplices(array, changeRecords) {
    var splices = [];

    createInitialSplices(array, changeRecords).forEach(function(splice) {
      if (splice.addedCount == 1 && splice.removed.length == 1) {
        if (splice.removed[0] !== array[splice.index])
          splices.push(splice);

        return
      };

      splices = splices.concat(calcSplices(array, splice.index, splice.index + splice.addedCount,
                                           splice.removed, 0, splice.removed.length));
    });

    return splices;
  }

  // Export the observe-js object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, export as a global object.

  var expose = global;

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      expose = exports = module.exports;
    }
    expose = exports;
  } 

  expose.Observer = Observer;
  expose.Observer.runEOM_ = runEOM;
  expose.Observer.observerSentinel_ = observerSentinel; // for testing.
  expose.Observer.hasObjectObserve = hasObserve;
  expose.ArrayObserver = ArrayObserver;
  expose.ArrayObserver.calculateSplices = function(current, previous) {
    return arraySplice.calculateSplices(current, previous);
  };

  expose.ArraySplice = ArraySplice;
  expose.ObjectObserver = ObjectObserver;
  expose.PathObserver = PathObserver;
  expose.CompoundObserver = CompoundObserver;
  expose.Path = Path;
  expose.ObserverTransform = ObserverTransform;
  
})(typeof global !== 'undefined' && global && typeof module !== 'undefined' && module ? global : this || window);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],81:[function(require,module,exports){
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

},{}],82:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _formElement = require('./form-element');

var _formElement2 = _interopRequireDefault(_formElement);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
 * A callback function that fires when the checkbox is un-checked
 * @callback Checkbox~onChange
 * @param {boolean} value - True if checked, false if not
 * @param {HTMLInputElement} input - The checkbox input element
 * @param {HTMLElement} UIElement - The checkbox element's container
 */

/**
 * Adds JS functionality to an input checkbox.
 * @class Checkbox
 * @extends FormElement
 */

var Checkbox = function (_FormElement) {
    _inherits(Checkbox, _FormElement);

    /**
     * Initialization.
     * @param {object} options - Options passed into instantiation.
     * @param {HTMLInputElement} options.el - The input element checkbox
     * @param {Checkbox~onChecked} [options.onChecked] - A callback function that fires when the checkbox is checked
     * @param {Checkbox~onUnchecked} [options.onUnchecked] - A callback function that fires when the checkbox is un-checked
     * @param {Checkbox~onChange} [options.onChange] - A callback function that fires when the checkbox value changes
     * @param {string} [options.containerClass] - The css class that will be applied to the UI-version of the checkbox
     * @param {string} [options.inputClass] - The css class that will be applied to the form version of the checkbox
     * @param {string} [options.checkedClass] - The css class that will be applied to the checkbox (UI-version) when it is checked
     * @param {string} [options.disabledClass] - The css class that will be applied to the checkbox (UI-version) when it is disabled
     * @param {boolean} [options.value] - The initial checked value to set
     */

    function Checkbox(options) {
        _classCallCheck(this, Checkbox);

        options = _underscore2.default.extend({
            el: null,
            onChecked: null,
            onUnchecked: null,
            containerClass: 'ui-checkbox',
            inputClass: 'ui-checkbox-input',
            checkedClass: 'ui-checkbox-checked',
            disabledClass: 'ui-checkbox-disabled',
            value: null
        }, options);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Checkbox).call(this, options));

        if (options.el.tagName.toLowerCase() !== 'input') {
            console.warn('checkbox error: element passed in instantiation was not an input element');
        }

        _this.el = options.el;
        _this.options = options;

        _this.setup();

        return _this;
    }

    /**
     * Sets up html.
     */


    _createClass(Checkbox, [{
        key: 'setup',
        value: function setup() {
            var input = this.getFormElement();

            input.classList.add(this.options.inputClass);

            this._container = this._buildUIElement(this.el);

            // if input element is already checked initially, check it!
            this.isInitChecked = this.options.value || input.checked;

            if (this.isInitChecked) {
                this.check();
            }

            this.isInitDisabled = input.disabled;
            if (this.isInitDisabled) {
                this._container.classList.add(this.options.disabledClass);
            }

            // setup events
            this.addEventListener(this.getUIElement(), 'click', '_onUIElementClick', this, true);
            this.addEventListener(input, 'click', '_onFormElementClick', this);
        }

        /**
         * When the checkbox input element is clicked.
         * @param {Event} e
         * @private
         */

    }, {
        key: '_onFormElementClick',
        value: function _onFormElementClick(e) {
            if (e.target === e.currentTarget && !e.target.disabled) {
                if (!this.getUIElement().classList.contains(this.options.checkedClass)) {
                    this.check();
                } else {
                    this.uncheck();
                }
            }
        }

        /**
         * When the checkbox UI element is clicked.
         * @param {Event} e
         * @private
         */

    }, {
        key: '_onUIElementClick',
        value: function _onUIElementClick(e) {
            var input = this.getFormElement();
            // respond to clicks made to the UI element ONLY
            if (!input.disabled && e.target === e.currentTarget && e.target.classList.contains(this.options.containerClass)) {
                // we are preventing default here to ensure default
                // checkbox is not going to be checked since
                // we're updating the checked boolean manually below
                e.preventDefault();
                if (!this.getUIElement().classList.contains(this.options.checkedClass)) {
                    this.check();
                } else {
                    this.uncheck();
                }
            }
        }

        /**
         * Wraps the checkbox in a UI-friendly container div.
         * @param {HTMLInputElement} inputEl - The input element
         * @returns {HTMLElement} Returns the input element wrapped in a new container
         * @private
         */

    }, {
        key: '_buildUIElement',
        value: function _buildUIElement(inputEl) {
            var parent = inputEl.parentNode;
            var outerEl = document.createElement('div');
            outerEl.classList.add(this.options.containerClass);
            parent.replaceChild(outerEl, inputEl);
            outerEl.appendChild(inputEl);
            return outerEl;
        }

        /**
         * Checks the checkbox.
         */

    }, {
        key: 'check',
        value: function check() {
            var input = this.getFormElement(),
                container = this.getUIElement();
            if (!input.checked) {
                input.checked = true;
            }
            container.classList.add(this.options.checkedClass);
            var value = this.getValue();
            if (this.options.onChecked) {
                this.options.onChecked(value, input, container);
            }
            if (this.options.onChange) {
                this.options.onChange(true, input, container);
            }
        }

        /**
         * Un-checks the checkbox.
         */

    }, {
        key: 'uncheck',
        value: function uncheck() {
            var input = this.getFormElement(),
                container = this.getUIElement();
            if (input.checked) {
                input.checked = false;
            }
            container.classList.remove(this.options.checkedClass);
            if (this.options.onUnchecked) {
                this.options.onUnchecked('', input, container);
            }
            if (this.options.onChange) {
                this.options.onChange(false, input, container);
            }
        }

        /**
         * Enables the checkbox.
         */

    }, {
        key: 'enable',
        value: function enable() {
            this.getFormElement().disabled = false;
            this.getUIElement().classList.remove(this.options.disabledClass);
        }

        /**
         * Disables the checkbox.
         */

    }, {
        key: 'disable',
        value: function disable() {
            this.getFormElement().disabled = true;
            this.getUIElement().classList.add(this.options.disabledClass);
        }

        /**
         * Gets the checkbox input element.
         * @returns {HTMLInputElement} Returns the checkbox input element
         */

    }, {
        key: 'getFormElement',
        value: function getFormElement() {
            return this.el;
        }

        /**
         * Gets the checkbox div element.
         * @returns {HTMLElement} Returns the checkbox div element.
         */

    }, {
        key: 'getUIElement',
        value: function getUIElement() {
            return this._container;
        }

        /**
         * Gets the unique identifier for checkboxes.
         * @returns {string}
         */

    }, {
        key: 'getElementKey',
        value: function getElementKey() {
            return 'checkbox';
        }

        /**
         * Unselects the checkbox if its selected.
         */

    }, {
        key: 'clear',
        value: function clear() {
            this.uncheck();
        }

        /**
         * Returns whether the checkbox is checked or not
         * @returns {string} Returns the checkbox value attribute
         */

    }, {
        key: 'getValue',
        value: function getValue() {
            var formEl = this.getFormElement();
            if (formEl.checked) {
                return formEl.value;
            } else {
                return '';
            }
        }

        /**
         * Sets the checkbox value attribute.
         * @param {string} value
         */

    }, {
        key: 'setValue',
        value: function setValue(value) {
            this.getFormElement().value = value;
        }

        /**
         * Destruction of this class.
         */

    }, {
        key: 'destroy',
        value: function destroy() {
            var container = this.getUIElement(),
                input = this.getFormElement();

            this.removeEventListener(container, 'click', '_onUIElementClick', this, true);
            this.removeEventListener(input, 'click', '_onFormElementClick', this);

            // remove stray html
            container.parentNode.replaceChild(input, container);

            if (this.isInitChecked) {
                input.checked = true;
            }
            if (this.isInitDisabled) {
                input.disabled = true;
            }
            _get(Object.getPrototypeOf(Checkbox.prototype), 'destroy', this).call(this);
        }
    }]);

    return Checkbox;
}(_formElement2.default);

module.exports = Checkbox;

},{"./form-element":86,"underscore":81}],83:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _formElementGroup = require('./form-element-group');

var _formElementGroup2 = _interopRequireDefault(_formElementGroup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A callback function that fires when one of the checkbox elements are selected
 * @callback Checkboxes~onChange
 * @param {string} value - The value of the input element that was changed
 * @param {HTMLInputElement} input - The input element that was changed
 * @param {HTMLElement} UIElement - The container of the input element that was changed
 */

/**
 * Groups input checkbox elements.
 * @class Checkboxes
 * @extends FormElement
 */

var Checkboxes = function (_FormElementGroup) {
    _inherits(Checkboxes, _FormElementGroup);

    /**
     * Initialization.
     * @param {object} options - Options passed into instance
     * @param {Array|HTMLInputElement} options.checkboxes - The collection of checkbox input elements
     * @param {Checkboxes~onChange} [options.onChange] - A callback function that fires when one of the checkbox elements are selected
     * @param {string} [options.containerClass] - The css class that will be applied to each checkbox item's container
     * @param {string} [options.inputClass] - The css class that will be applied to each checkbox item (input element)
     * @param {string} [options.selectedClass] - The css class that will be applied to a checkbox item (UI-version) when it is selected
     * @param {string} [options.disabledClass] - The css class that will be applied to a checkbox item (UI-version) when it is disabled
     * @param {string|Array} [options.value] - The string matching the name attribute of the checkbox button to have selected initially (or an array of such strings)
     */

    function Checkboxes(options) {
        _classCallCheck(this, Checkboxes);

        options = _underscore2.default.extend({
            inputs: [],
            onChange: null,
            containerClass: 'ui-checkbox',
            inputClass: 'ui-checkbox-input',
            selectedClass: 'ui-checkbox-selected',
            disabledClass: 'ui-checkbox-disabled',
            value: null
        }, options);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Checkboxes).call(this, options));

        _this.options = options;
        return _this;
    }

    _createClass(Checkboxes, [{
        key: '_onFormElementClick',
        value: function _onFormElementClick(formElement, UIElement) {
            if (!UIElement.classList.contains(this.options.selectedClass)) {
                UIElement.classList.add(this.options.selectedClass);
                formElement.checked = true;
            } else {
                UIElement.classList.remove(this.options.selectedClass);
                formElement.checked = false;
            }
            this.triggerChange(formElement, UIElement);
        }

        /**
         * When a checkbox UI element is clicked.
         * @param {HTMLCheckboxElement} formElement - The checkbox element that was clicked
         * @param {HTMLElement} UIElement - The checkbox UI element that was clicked
         * @private
         */

    }, {
        key: '_onUIElementClick',
        value: function _onUIElementClick(formElement, UIElement) {
            if (!UIElement.classList.contains(this.options.selectedClass)) {
                formElement.checked = true;
                UIElement.classList.add(this.options.selectedClass);
            } else {
                formElement.checked = false;
                UIElement.classList.remove(this.options.selectedClass);
            }
            this.triggerChange(formElement, UIElement);
        }

        /**
         * Selects the checkbox item.
         * @param {Number} index - The index of the checkbox item
         */

    }, {
        key: 'select',
        value: function select(index) {
            var input = this.getFormElement(index),
                checkbox = this.getUIElement(index);
            if (!input.checked) {
                input.checked = true;
                checkbox.classList.add(this.options.selectedClass);
                this.triggerChange(input, checkbox);
            }
        }

        /**
         * Gets the unique identifier for checkboxes.
         * @returns {string}
         */

    }, {
        key: 'getElementKey',
        value: function getElementKey() {
            return 'checkboxes';
        }
    }]);

    return Checkboxes;
}(_formElementGroup2.default);

module.exports = Checkboxes;

},{"./form-element-group":85,"underscore":81}],84:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _formElement = require('./form-element');

var _formElement2 = _interopRequireDefault(_formElement);

var _deviceManager = require('device-manager');

var _deviceManager2 = _interopRequireDefault(_deviceManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var Dropdown = function (_FormElement) {
    _inherits(Dropdown, _FormElement);

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

    function Dropdown(options) {
        _classCallCheck(this, Dropdown);

        options = _underscore2.default.extend({
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

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Dropdown).call(this, options));

        _this.options = options;

        _this._keyMap = {
            38: 'up',
            40: 'down',
            27: 'esc',
            32: 'space'
        };

        if (_this.options.autoSetup) {
            _this.setup();
        }
        return _this;
    }

    /**
     * Sets up events for dropdown.
     * @memberOf Dropdown
     */


    _createClass(Dropdown, [{
        key: 'setup',
        value: function setup() {
            var el = this.options.el,
                selectedOption = el.querySelectorAll('option[selected]')[0];

            this.addEventListener(el, 'change', '_onSelectChange', this);

            this._wrapperEl = this._buildWrapperEl(el);
            this._uiEl = this._buildUIElement();
            this._wrapperEl.appendChild(this._uiEl);

            this._bindUIElementEvents();

            if (selectedOption) {
                this._setUISelectedValue(selectedOption.value);
            }

            if (this.getFormElement().disabled) {
                this.disable();
            }
        }

        /**
         * Wraps the passed element inside of a custom container element.
         * @param {HTMLElement} el - The element to be wrapped inside of the container
         * @returns {Element} Returns the container element that contains the passed el
         * @private
         */

    }, {
        key: '_buildWrapperEl',
        value: function _buildWrapperEl(el) {
            var parent = el.parentNode;
            var outerEl = document.createElement('div');
            outerEl.classList.add(this.options.customWrapperClass);
            parent.replaceChild(outerEl, el);
            outerEl.appendChild(el);
            return outerEl;
        }

        /**
         * Builds the UI element.
         * @returns {Element}
         * @private
         */

    }, {
        key: '_buildUIElement',
        value: function _buildUIElement() {
            var options = this.options,
                formEl = options.el,
                uiEl = document.createElement('div');

            this._origTabIndex = formEl.tabIndex;

            uiEl.classList.add(this.options.containerClass);
            uiEl.innerHTML = this._buildSelectedValueHtml() + this._buildOptionsHtml();

            // only switch tab index to ui element when not on a mobile device
            // since we're using native there
            if (!_deviceManager2.default.isMobile()) {
                uiEl.tabIndex = this._origTabIndex || 0;
                // remove form element from being focused since we now have the UI element
                formEl.tabIndex = -1;
            }

            return uiEl;
        }

        /**
         * Sets the UI representation of the select dropdown to a new value.
         * @param {string} dataValue - The new data value
         * @private
         * @memberOf Dropdown
         */

    }, {
        key: '_setUISelectedValue',
        value: function _setUISelectedValue(dataValue) {
            var optionsContainerEl = this.getUIElement().getElementsByClassName(this.options.optionsContainerClass)[0],
                prevSelectedOption = optionsContainerEl.getElementsByClassName(this.options.optionsSelectedClass)[0],
                newSelectedOptionEl = optionsContainerEl.querySelectorAll('.' + this.options.optionsClass + '[data-value="' + dataValue + '"]')[0],
                selectedClass = this.options.optionsSelectedClass,
                selectedValueContainerEl = this.getUIElement().getElementsByClassName(this.options.selectedValueContainerClass)[0],
                displayValue = newSelectedOptionEl ? newSelectedOptionEl.textContent : '';

            selectedValueContainerEl.setAttribute('data-value', dataValue);
            selectedValueContainerEl.innerHTML = displayValue;

            // remove selected class from previously selected option
            if (prevSelectedOption) {
                prevSelectedOption.classList.remove(selectedClass);
            }
            // add selected class to new option
            if (newSelectedOptionEl) {
                newSelectedOptionEl.classList.add(selectedClass);
            }
        }

        /**
         * When a key press event is registered when focused on the UI Element.
         * @param {KeyboardEvent} e - The key up event
         */

    }, {
        key: 'onKeyStrokeUIElement',
        value: function onKeyStrokeUIElement(e) {
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
        }

        /**
         * When the up arrow is triggered.
         * @param {HTMLElement} highlightedOptionEl - The currently highlighted UI option element
         * @private
         */

    }, {
        key: '_onKeyStrokeUp',
        value: function _onKeyStrokeUp(highlightedOptionEl) {
            var highlightClass = this.options.optionsHighlightedClass,
                prevSibling = highlightedOptionEl.previousSibling;

            highlightedOptionEl.classList.remove(highlightClass);

            // go to bottom option if at the beginning
            if (!prevSibling) {
                prevSibling = this.getUIElement().getElementsByClassName(this.options.optionsContainerClass)[0].lastChild;
            }
            prevSibling.classList.add(highlightClass);
        }

        /**
         * When the down arrow is triggered.
         * @param {HTMLElement} highlightedOptionEl - The currently highlighted UI option element
         * @private
         */

    }, {
        key: '_onKeyStrokeDown',
        value: function _onKeyStrokeDown(highlightedOptionEl) {
            var highlightClass = this.options.optionsHighlightedClass,
                nextSibling = highlightedOptionEl.nextSibling;

            highlightedOptionEl.classList.remove(highlightClass);

            if (!nextSibling) {
                // get top option element if at end
                nextSibling = this.getUIElement().getElementsByClassName(this.options.optionsContainerClass)[0].firstChild;
            }
            nextSibling.classList.add(highlightClass);
        }

        /**
         * When the select element is focused.
         * @private
         * @param e
         */

    }, {
        key: '_onFocusFormElement',
        value: function _onFocusFormElement(e) {
            if (this.options.onFocus) {
                this.options.onFocus(e);
            }
        }

        /**
         * When the select element loses focused.
         * @private
         * @param e
         */

    }, {
        key: '_onBlurFormElement',
        value: function _onBlurFormElement(e) {
            if (this.options.onBlur) {
                this.options.onBlur(e);
            }
        }

        /**
         * When the UI Element is in focus.
         * @private
         * @param e
         */

    }, {
        key: '_onFocusUIElement',
        value: function _onFocusUIElement(e) {
            if (!_deviceManager2.default.isMobile()) {
                // prevent default window actions on key strokes
                this.addEventListener(window, 'keydown', '_onWindowKeyup', this, false);
                this.addEventListener(window, 'keyup', '_onWindowKeyup', this, false);
                // add key stroke event listeners
                this.addEventListener(this.getUIElement(), 'keyup', 'onKeyStrokeUIElement', this);
            }

            if (this.options.onFocus) {
                this.options.onFocus(e);
            }
        }

        /**
         * When the user taps a keyboard key.
         * @param {Event} e - The event object
         * @private
         */

    }, {
        key: '_onWindowKeyup',
        value: function _onWindowKeyup(e) {
            // if any keys we're listening to internally, prevent default window behavior
            if (this._keyMap[e.keyCode]) {
                e.preventDefault();
            }
        }

        /**
         * When the UI Element loses focus
         * @private
         * @param e
         */

    }, {
        key: '_onBlurUIElement',
        value: function _onBlurUIElement(e) {
            if (!_deviceManager2.default.isMobile()) {
                this.removeEventListener(this.getUIElement(), 'keyup', 'onKeyStrokeUIElement', this);
                this.removeEventListener(window, 'keydown', '_onWindowKeyup', this, false);
                this.removeEventListener(window, 'keyup', '_onWindowKeyup', this, false);
            }
            if (this.options.onBlur) {
                this.options.onBlur(e);
            }
        }

        /**
         * When an option element inside of the UI element is hovered over
         * @param {MouseEvent} e - The mouse event
         * @private
         */

    }, {
        key: '_onMouseEnterUIElement',
        value: function _onMouseEnterUIElement(e) {
            e.currentTarget.classList.add(this.options.optionsHighlightedClass);
        }

        /**
         * When hovering over an option element inside of the UI element stops.
         * @param {MouseEvent} e - The mouse event
         * @private
         */

    }, {
        key: '_onMouseLeaveUIElement',
        value: function _onMouseLeaveUIElement(e) {
            e.currentTarget.classList.remove(this.options.optionsHighlightedClass);
        }

        /**
         * Sets up click events on the ui element and its children.
         * @private
         * @memberOf Dropdown
         */

    }, {
        key: '_bindUIElementEvents',
        value: function _bindUIElementEvents() {
            var uiEl = this.getUIElement(),
                uiValueContainer = uiEl.getElementsByClassName(this.options.selectedValueContainerClass)[0],
                formEl = this.getFormElement();
            this.addEventListener(uiEl, 'focus', '_onFocusUIElement', this);
            this.addEventListener(uiEl, 'blur', '_onBlurUIElement', this);
            this.addEventListener(formEl, 'focus', '_onFocusFormElement', this);
            this.addEventListener(formEl, 'blur', '_onBlurFormElement', this);
            // add click events on container
            this.addEventListener(uiValueContainer, 'click', '_onClickUIValueContainer', this);
        }

        /**
         * Removes all ui element event listeners.
         * @private
         */

    }, {
        key: '_unbindUIElementEvents',
        value: function _unbindUIElementEvents() {
            var uiEl = this.getUIElement(),
                uiValueContainer = uiEl.getElementsByClassName(this.options.selectedValueContainerClass)[0],
                formEl = this.getFormElement();
            this.removeEventListener(uiEl, 'focus', '_onFocusUIElement', this);
            this.removeEventListener(uiEl, 'blur', '_onBlurUIElement', this);
            this.removeEventListener(formEl, 'focus', '_onFocusFormElement', this);
            this.removeEventListener(formEl, 'blur', '_onBlurFormElement', this);
            // add click events on container
            this.removeEventListener(uiValueContainer, 'click', '_onClickUIValueContainer', this);
        }

        /**
         * Adds click events on all option elements of the UI-version of dropdown.
         */

    }, {
        key: 'bindUIOptionEvents',
        value: function bindUIOptionEvents() {
            var optionEls = this.getUIElement().getElementsByClassName(this.options.optionsClass),
                i,
                count = optionEls.length;

            for (i = 0; i < count; i++) {
                var el = optionEls[i];
                this.addEventListener(el, 'click', '_onClickUIOption', this);
                this.addEventListener(el, 'mouseenter', '_onMouseEnterUIElement', this);
                this.addEventListener(el, 'mouseleave', '_onMouseLeaveUIElement', this);
            }
        }

        /**
         * Removes click events from all options elements of the UI-version of dropdown.
         */

    }, {
        key: 'unbindUIOptionEvents',
        value: function unbindUIOptionEvents() {
            var optionEls = this.getUIElement().getElementsByClassName(this.options.optionsClass),
                i,
                count = optionEls.length;
            for (i = 0; i < count; i++) {
                var el = optionEls[i];
                this.removeEventListener(el, 'click', '_onClickUIOption', this);
                this.removeEventListener(el, 'mouseenter', '_onMouseEnterUIElement', this);
                this.removeEventListener(el, 'mouseleave', '_onMouseLeaveUIElement', this);
            }
        }

        /**
         * When clicking on the div that represents the select value.
         * @private
         * @memberOf Dropdown
         */

    }, {
        key: '_onClickUIValueContainer',
        value: function _onClickUIValueContainer() {
            if (this.getFormElement().disabled) {
                return false;
            } else if (this.isOptionsContainerActive()) {
                this.hideOptionsContainer();
            } else {
                this.showOptionsContainer();
            }
        }

        /**
         * Shows the UI options container element.
         */

    }, {
        key: 'showOptionsContainer',
        value: function showOptionsContainer() {
            var uiEl = this.getUIElement(),
                options = this.options,
                selectedUIOption = this.getUIOptionByDataValue(this.getValue()) || uiEl.getElementsByClassName(options.optionsClass)[0];
            uiEl.classList.add(options.optionsContainerActiveClass);
            this.bindUIOptionEvents();
            // set selected class on selected value for instances where it is not present
            // like upon showing the container for the first time
            if (selectedUIOption) {
                selectedUIOption.classList.add(this.options.optionsSelectedClass);
            }
            this.addEventListener(document.body, 'click', 'onClickDocument', this);
        }

        /**
         * Hides the UI options container element.
         */

    }, {
        key: 'hideOptionsContainer',
        value: function hideOptionsContainer() {
            // Redraw of options container needed for iPad and Safari.
            if (_deviceManager2.default.isBrowser('safari')) {
                this.redrawOptionsContainer();
            }
            this.getUIElement().classList.remove(this.options.optionsContainerActiveClass);
            this.unbindUIOptionEvents();
            this.removeEventListener(document.body, 'click', 'onClickDocument', this);
        }

        /**
         * Forces a redraw of the options container element.
         * @note If dropdown options are hidden on default,
         * this will force the styles to be updated when active class is removed.
         */

    }, {
        key: 'redrawOptionsContainer',
        value: function redrawOptionsContainer() {
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
        }

        /**
         * Whether the UI options container element is open.
         * @returns {boolean} Returns true if container is open
         */

    }, {
        key: 'isOptionsContainerActive',
        value: function isOptionsContainerActive() {
            return this.getUIElement().classList.contains(this.options.optionsContainerActiveClass);
        }

        /**
         * When document is clicked.
         * @param {Event} e
         */

    }, {
        key: 'onClickDocument',
        value: function onClickDocument(e) {
            var closestUIContainer = this.getClosestAncestorElementByClassName(e.target, this.options.containerClass);
            if (!closestUIContainer || closestUIContainer !== this.getUIElement()) {
                // clicked outside of ui element!
                this.hideOptionsContainer();
            }
        }

        /**
         * When one of the ui divs (representing the options elements) is clicked.
         * @param {Event} e
         * @private
         * @memberOf Dropdown
         */

    }, {
        key: '_onClickUIOption',
        value: function _onClickUIOption(e) {
            var selectedOption = e.currentTarget,
                newDataValue = selectedOption.dataset.value;

            if (this.getValue() !== newDataValue) {
                // set the current value of the REAL dropdown
                this.setValue(newDataValue);
                // set value of ui dropdown
                this._setUISelectedValue(newDataValue);
            }
            this.hideOptionsContainer();
        }

        /**
         * Builds the html for the dropdown value.
         * @returns {string}
         * @private
         * @memberOf Dropdown
         */

    }, {
        key: '_buildSelectedValueHtml',
        value: function _buildSelectedValueHtml() {
            return '<div class="' + this.options.selectedValueContainerClass + '" data-value=""></div>';
        }

        /**
         * Builds a representative version of the option elements of the original select.
         * @returns {string} Returns the html of the options container along with its nested children
         * @private
         * @memberOf Dropdown
         */

    }, {
        key: '_buildOptionsHtml',
        value: function _buildOptionsHtml() {
            var options = this.options,
                uiOptionsContainer = document.createElement('div'),
                html = '<div class="' + options.optionsContainerClass + '">',
                optionEls = options.el.getElementsByTagName('option'),
                count = optionEls.length,
                i,
                option,
                selectedClass = '';

            uiOptionsContainer.classList.add(options.optionsContainerClass);

            for (i = 0; i < count; i++) {
                option = optionEls[i];
                selectedClass = option.hasAttribute('selected') ? options.optionsSelectedClass : '';
                html += '<div class="' + options.optionsClass + ' ' + selectedClass + '" data-value="' + option.value + '">' + option.textContent + '</div>';
            }

            html += '</div>'; // close container tag

            return html;
        }

        /**
         * When the select value changes.
         * @param e
         * @private
         * @memberOf Dropdown
         */

    }, {
        key: '_onSelectChange',
        value: function _onSelectChange(e) {
            var value = this.getValue();
            this._setUISelectedValue(value);
            if (this.options.onChange) {
                this.options.onChange(value, this.getFormElement(), this.getUIElement(), e);
            }
        }

        /**
         * Returns the element that represents the div-version of the dropdown.
         * @returns {HTMLElement|*}
         */

    }, {
        key: 'getUIElement',
        value: function getUIElement() {
            return this._uiEl;
        }

        /**
         * Gets an option element by its value attribute.
         * @param {string} dataValue - The value attribute of the option desired
         * @returns {*}
         * @memberOf Dropdown
         */

    }, {
        key: 'getOptionByDataValue',
        value: function getOptionByDataValue(dataValue) {
            return this.options.el.querySelectorAll('option[value="' + dataValue + '"]')[0];
        }

        /**
         * Gets an UI option element by its data value.
         * @param dataValue
         * @returns {*}
         */

    }, {
        key: 'getUIOptionByDataValue',
        value: function getUIOptionByDataValue(dataValue) {
            return this.getUIElement().querySelectorAll('.' + this.options.optionsClass + '[data-value="' + dataValue + '"]')[0];
        }

        /**
         * Gets an option element by its text content.
         * @param {string} displayValue - The text content that the eleemnt should have in order to be returned
         * @returns {*|HTMLOptionElement}
         * @memberOf Dropdown
         */

    }, {
        key: 'getOptionByDisplayValue',
        value: function getOptionByDisplayValue(displayValue) {
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
        }

        /**
         * Sets the dropdown to a specified value (if there is an option
         * element with a value attribute that contains the value supplied)
         * @param {string} dataValue - The value to set the dropdown menu to
         * @memberOf Dropdown
         */

    }, {
        key: 'setValue',
        value: function setValue(dataValue) {
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
                console.warn('Form Dropdown Error: Cannot call setValue(), dropdown has no option element with a ' + 'value attribute of ' + dataValue + '.');
            }

            this._setUISelectedValue(dataValue);
        }

        /**
         * Updates markup to show new dropdown option values.
         * @param {Array} optionsData - An array of objects that maps the new data values to display values desired
         * @param {Object} [options] - Update options
         * @param {Boolean} [options.replace] - If true, the new options will replace all current options, if false, new options will be merged with current ones
         */

    }, {
        key: 'updateOptions',
        value: function updateOptions(optionsData, options) {
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
        }

        /**
         * Clears all options in the dropdown.
         */

    }, {
        key: 'clearOptions',
        value: function clearOptions() {
            var uiOptionsContainer = this.getUIElement().getElementsByClassName(this.options.optionsContainerClass)[0],
                formEl = this.getFormElement();
            formEl.innerHTML = '';
            uiOptionsContainer.innerHTML = '';
        }

        /**
         * Updates markup to show new form elements.
         * @param {Array} optionsData - An array of objects that maps the new data values to display values desired
         * @param {boolean} reset - Whether to replace current options, or merge with them
         * @private
         */

    }, {
        key: '_updateFormOptionElements',
        value: function _updateFormOptionElements(optionsData, reset) {
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
            } else {}
            formEl.appendChild(frag);
        }

        /**
         * Disables the dropdown.
         */

    }, {
        key: 'disable',
        value: function disable() {
            this.getUIElement().classList.add(this.options.disabledClass);
            this.getFormElement().disabled = true;
        }

        /**
         * Enables the dropdown.
         */

    }, {
        key: 'enable',
        value: function enable() {
            this.getUIElement().classList.remove(this.options.disabledClass);
            this.getFormElement().disabled = false;
        }

        /**
         * Clears all options in the dropdown
         */

    }, {
        key: 'clear',
        value: function clear() {
            var optionEl = this.getOptionByDataValue('');
            if (optionEl) {
                this.setValue('');
            }
        }

        /**
         * Returns the text inside the option element that is currently selected.
         * @returns {*}
         * @memberOf Dropdown
         */

    }, {
        key: 'getDisplayValue',
        value: function getDisplayValue() {
            return this.getOptionByDataValue(this.getValue()).textContent;
        }

        /**
         * Destruction of this class.
         * @memberOf Dropdown
         */

    }, {
        key: 'destroy',
        value: function destroy() {
            var el = this.options.el;
            this.unbindUIOptionEvents();
            this._unbindUIElementEvents();
            this.removeEventListener(el, 'change', '_onSelectChange', this);
            el.style.display = this._origDisplayValue; // put original display back
            el.tabIndex = this._origTabIndex;
            // restore html
            this._wrapperEl.parentNode.replaceChild(el, this._wrapperEl);
            _get(Object.getPrototypeOf(Dropdown.prototype), 'destroy', this).call(this);
        }
    }]);

    return Dropdown;
}(_formElement2.default);

module.exports = Dropdown;

},{"./form-element":86,"device-manager":78,"underscore":81}],85:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _formElement = require('./form-element');

var _formElement2 = _interopRequireDefault(_formElement);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A callback function that fires when one of the form elements are selected
 * @callback FormElementGroup~onChange
 * @param {string} value - The value of the input element that was changed
 * @param {HTMLInputElement} input - The input element that was changed
 * @param {HTMLElement} UIElement - The container of the input element that was changed
 */

/**
 * Base class to handle grouped form elements.
 * @class FormElementGroup
 * @extends FormElement
 */

var FormElementGroup = function (_FormElement) {
    _inherits(FormElementGroup, _FormElement);

    /**
     * Initialization.
     * @param {object} options - Options passed into instance
     * @param {Array|HTMLInputElement} options.inputs - The collection of input elements to be made into form elements
     * @param {FormElementGroup~onChange} [options.onChange] - A callback function that fires when one of the form elements are selected
     * @param {string} [options.containerClass] - The css class that will be applied to each form element's container
     * @param {string} [options.inputClass] - The css class that will be applied to each form element item (input element)
     * @param {string} [options.selectedClass] - The css class that will be applied to a form element item (UI-version) when it is selected
     * @param {string} [options.disabledClass] - The css class that will be applied to a form element item (UI-version) when it is disabled
     * @param {string|Array} [options.value] - The string matching the name attribute of the form element button to have selected initially (or an array of such strings)
     */

    function FormElementGroup(options) {
        _classCallCheck(this, FormElementGroup);

        options = _underscore2.default.extend({
            inputs: [],
            onChange: null,
            containerClass: 'ui-form-element',
            inputClass: 'ui-form-element-input',
            selectedClass: 'ui-form-element-selected',
            disabledClass: 'ui-form-element-disabled',
            value: null
        }, options);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FormElementGroup).call(this, options));

        _this._container = _this.options.container;

        if (!_this.options.inputs.length && _this._container) {
            _this.options.inputs = _this._container.querySelectorAll('input');
        }

        if (!_this.options.inputs.length) {
            console.error('could not build ' + _this.getElementKey() + ': no form element input elements were passed');
        } else {
            _this.setup();
        }
        return _this;
    }

    /**
     * Sets up the form elements.
     */


    _createClass(FormElementGroup, [{
        key: 'setup',
        value: function setup() {
            this._formElements = this._setupFormElements(this.options.inputs);
            this._UIElements = this._buildUIElements(this._formElements);
            this._setupEvents();
        }

        /**
         * Sets up form elements.
         * @param {HTMLCollection|Array} elements - The array of form elements
         * @returns {Array} Returns the form elements after they've been setup
         */

    }, {
        key: '_setupFormElements',
        value: function _setupFormElements(elements) {
            var value = this.options.value,
                values = [];

            // convert to real array if HTMLCollection
            elements = Array.prototype.slice.call(elements);

            if (typeof value === 'string') {
                values.push(value);
            } else if (value && value.length) {
                // assume its an array
                values = Array.prototype.slice.call(value); //ensure array
            }

            // perform work on all form element elements, checking them if necessary
            elements.forEach(function (formElement) {
                if (values.indexOf(formElement.value) !== -1) {
                    // value exists
                    formElement.checked = true;
                }
                // add initial class
                formElement.classList.add(this.options.inputClass);
            }.bind(this));

            return elements;
        }

        /**
         * Sets up events.
         * @private
         */

    }, {
        key: '_setupEvents',
        value: function _setupEvents() {
            this.triggerAll(function (formElement, UIElement) {
                this.addEventListener(formElement, 'click', '_onFormElementClickEventListener', this);
                this.addEventListener(UIElement, 'click', '_onUIElementClickEventListener', this, true);
            }.bind(this));
        }

        /**
         * Gets all the current input form elements.
         * @returns {Array|*}
         */

    }, {
        key: 'getFormElementGroup',
        value: function getFormElementGroup() {
            return this._formElements || [];
        }

        /**
         * Gets all current ui-versions of input form elements.
         * @returns {Array|*}
         */

    }, {
        key: 'getUIElements',
        value: function getUIElements() {
            return this._UIElements || [];
        }

        /**
         * Delegator that triggers a callback on each of the current form element elements.
         * Useful for performing an operation across all elements
         * @param {Function} callback - The function that should be executed for each input item
         */

    }, {
        key: 'triggerAll',
        value: function triggerAll(callback) {
            var i,
                FormElementGroup = this.getFormElementGroup(),
                UIElements = this.getUIElements();
            for (i = 0; i < FormElementGroup.length; i++) {
                callback(FormElementGroup[i], UIElements[i], i);
            }
        }

        /**
         * When one of the UI elements (or its parent <label>) is clicked.
         * @param {Event} e
         * @private
         */

    }, {
        key: '_onFormElementClickEventListener',
        value: function _onFormElementClickEventListener(e) {
            var formElement = e.target;
            var UIElement = formElement.parentElement;
            if (e.target === e.currentTarget) {
                this._onFormElementClick(formElement, UIElement);
            }
        }

        /**
         * An abstract method to handle clicks to any given form element
         * @param {HTMLInputElement} formElement - The form element that was clicked
         * @param {HTMLElement} UIElement - The UI version of the form element that was clicked
         * @private
         * @abstract
         */

    }, {
        key: '_onFormElementClick',
        value: function _onFormElementClick(formElement, UIElement) {}

        /**
         * When one of the UI elements (or its parent <label>) is clicked.
         * @param {Event} e
         * @private
         */

    }, {
        key: '_onUIElementClickEventListener',
        value: function _onUIElementClickEventListener(e) {
            var formElement;
            var UIElement;
            // respond to clicks made to the UI element ONLY
            if (e.target === e.currentTarget && e.target.classList.contains(this.options.containerClass)) {
                // we are preventing default here to ensure default
                // checkbox is not going to be checked since
                // we're updating the checked boolean manually later
                e.preventDefault();
                UIElement = e.target;
                formElement = e.target.getElementsByClassName(this.options.inputClass)[0];
                this._onUIElementClick(formElement, UIElement);
            }
        }

        /**
         * An abstract method to handle clicks to any given UI element
         * @param {HTMLInputElement} formElement - The form element nested under the UI element that was clicked
         * @param {HTMLElement} UIElement - The UI version of the form element that was clicked
         * @private
         * @abstract
         */

    }, {
        key: '_onUIElementClick',
        value: function _onUIElementClick(formElement, UIElement) {}

        /**
         * Builds the UI-friendly version of the form elements and wraps them in their appropriate containers.
         * @param {Array} elements - The input elements
         * @returns {Array} Returns an array of the ui-versions of the elements
         * @private
         */

    }, {
        key: '_buildUIElements',
        value: function _buildUIElements(elements) {
            var count = elements.length,
                arr = [],
                i,
                formElement,
                UIElement;
            for (i = 0; i < count; i++) {
                formElement = elements[i];
                UIElement = this._buildContainerEl(formElement);
                // add selected class if selected initially
                if (formElement.checked) {
                    UIElement.classList.add(this.options.selectedClass);
                }
                if (formElement.disabled) {
                    UIElement.classList.add(this.options.disabledClass);
                }
                arr.push(UIElement);
            }
            return arr;
        }

        /**
         * Wraps the passed element inside of a custom container element.
         * @param {HTMLElement} el - The element to be wrapped inside of the container
         * @returns {Element} Returns the container element that contains the passed el
         * @private
         */

    }, {
        key: '_buildContainerEl',
        value: function _buildContainerEl(el) {
            var parent = el.parentNode;
            var outerEl = document.createElement('div');
            outerEl.classList.add(this.options.containerClass);
            parent.replaceChild(outerEl, el);
            outerEl.appendChild(el);
            return outerEl;
        }

        /**
         * Triggers a change on the form element.
         * @param {HTMLInputElement} formElement - The input element
         * @param {HTMLElement} UIElement - The ui element
         */

    }, {
        key: 'triggerChange',
        value: function triggerChange(formElement, UIElement) {
            if (this.options.onChange) {
                this.options.onChange(formElement.value, formElement, UIElement);
            }
        }

        /**
         * Selects the form element item.
         * @param {Number} index - The index of the form element item
         */

    }, {
        key: 'select',
        value: function select(index) {
            var input = this.getFormElement(index),
                uiEl = this.getUIElement(index);
            if (!input.checked) {
                input.checked = true;
                uiEl.classList.add(this.options.selectedClass);
                this.triggerChange(input, uiEl);
            }
        }

        /**
         * De-selects the form element item.
         * @param {Number} index - The index of the form element item
         */

    }, {
        key: 'deselect',
        value: function deselect(index) {
            var input = this.getFormElement(index),
                uiEl = this.getUIElement(index);
            uiEl.classList.remove(this.options.selectedClass);
            if (input.checked) {
                input.checked = false;
                this.triggerChange(input, uiEl);
            }
        }

        /**
         * Gets the selected value of the form element.
         * @returns {Array} Returns the value of the currently selected form elements
         */

    }, {
        key: 'getValue',
        value: function getValue() {
            var values = [];
            this.getFormElementGroup().forEach(function (el) {
                if (el.checked) {
                    values.push(el.value);
                }
            }, this);
            return values;
        }

        /**
         * Selects the form element that matches the supplied value.
         * @param {string|Array} value - The value of the form element that should be selected
         */

    }, {
        key: 'setValue',
        value: function setValue(value) {
            this.getFormElementGroup().forEach(function (el, idx) {
                if (el.value === value || value.indexOf(el.value) !== -1) {
                    this.select(idx);
                } else {
                    this.deselect(idx);
                }
            }, this);
        }

        /**
         * Gets the form element input element by an index.
         * @param {Number} [index] - The index of the form element input element
         * @returns {HTMLInputElement} Returns the checkbox input element
         */

    }, {
        key: 'getFormElement',
        value: function getFormElement(index) {
            return this.getFormElementGroup()[index || 0];
        }

        /**
         * Gets the ui-version of the form element element.
         * @param {Number} [index] - The index of the form element element
         * @returns {HTMLElement} Returns the checkbox div element.
         */

    }, {
        key: 'getUIElement',
        value: function getUIElement(index) {
            return this.getUIElements()[index || 0];
        }

        /**
         * Deselects all form elements.
         */

    }, {
        key: 'clear',
        value: function clear() {
            this.triggerAll(function (formElement, UIElement, idx) {
                this.deselect(idx);
            }.bind(this));
        }

        /**
         * Enables the form element.
         */

    }, {
        key: 'enable',
        value: function enable() {
            this.triggerAll(function (formElement, UIElement) {
                formElement.disabled = false;
                UIElement.classList.remove(this.options.disabledClass);
            }.bind(this));
        }

        /**
         * Disables the form element.
         */

    }, {
        key: 'disable',
        value: function disable() {
            this.triggerAll(function (formElement, UIElement) {
                formElement.disabled = true;
                UIElement.classList.add(this.options.disabledClass);
            }.bind(this));
        }

        /**
         * Gets the unique identifier for form elements.
         * @returns {string}
         */

    }, {
        key: 'getElementKey',
        value: function getElementKey() {
            return 'FormElementGroup';
        }

        /**
         * Destruction of this class.
         */

    }, {
        key: 'destroy',
        value: function destroy() {
            this.triggerAll(function (formElement, UIElement) {
                UIElement.parentNode.replaceChild(formElement, UIElement);
                this.removeEventListener(formElement, 'click', '_onFormElementClickEventListener', this);
                this.removeEventListener(UIElement, 'click', '_onUIElementClickEventListener', this, true);
            }.bind(this));
            _get(Object.getPrototypeOf(FormElementGroup.prototype), 'destroy', this).call(this);
        }
    }]);

    return FormElementGroup;
}(_formElement2.default);

module.exports = FormElementGroup;

},{"./form-element":86,"underscore":81}],86:[function(require,module,exports){
'use strict';
// we need Map (which requires Symbol) here

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('core-js/es6/symbol');

var _map = require('core-js/es6/map');

var _map2 = _interopRequireDefault(_map);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Bubbles up each parent node of the element, triggering the callback on each element until traversal
 * either runs out of parent nodes, reaches the document element, or if callback returns a falsy value
 * @param {HTMLElement} [startEl] - The element where traversal will begin (including the passed element), defaults to current el
 * @param {Function} callback - A callback that fires which gets passed the current element
 */
var traverseEachParent = function traverseEachParent(startEl, callback) {
    var parentNode = startEl.parentNode || startEl,
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

var FormElement = function () {

    /**
     * Sets up stuff.
     * @abstract
     * @param {Object} options - Instantiation options
     */

    function FormElement(options) {
        _classCallCheck(this, FormElement);

        this.options = options || {};
        this._eventListeners = new _map2.default();
    }

    /**
     * Gets the form element.
     * @returns {HTMLElement} Returns the form element
     * @abstract
     */


    _createClass(FormElement, [{
        key: 'getFormElement',
        value: function getFormElement() {
            return this.options.el;
        }

        /**
         * Gets the ui version of the form element.
         * @returns {HTMLElement} Returns the ui-version of the element.
         * @abstract
         */

    }, {
        key: 'getUIElement',
        value: function getUIElement() {
            return this.getFormElement();
        }

        /**
         * Gets the form elements.
         * @returns {Array} Returns the array of form elements
         * @abstract
         */

    }, {
        key: 'getFormElements',
        value: function getFormElements() {
            return [this.getFormElement()];
        }

        /**
         * Gets the current value of the element.
         * @returns {string}
         * @abstract
         */

    }, {
        key: 'getValue',
        value: function getValue() {
            return this.getFormElement().value;
        }

        /**
         * Sets the value of the form element.
         * @param {string} value - The new value
         * @abstract
         */

    }, {
        key: 'setValue',
        value: function setValue(value) {
            var el = this.getFormElements()[0];
            if (el) {
                el.value = value;
            }
        }

        /**
         * Clears the element.
         * @abstract
         */

    }, {
        key: 'clear',
        value: function clear() {}

        /**
         * Gets the ui versions of the form elements.
         * @returns {Array} Returns the array of ui-versions of the element.
         * @abstract
         */

    }, {
        key: 'getUIElements',
        value: function getUIElements() {
            return [this.getUIElement()];
        }

        /**
         * Enables the form element.
         * @abstract
         */

    }, {
        key: 'enable',
        value: function enable() {
            this.getFormElement().disabled = false;
        }

        /**
         * Disables the form element.
         * @abstract
         */

    }, {
        key: 'disable',
        value: function disable() {
            this.getFormElement().disabled = true;
        }

        /**
         * Gets the element's identifier (preferably unique from all other elements that extend this class).
         * @returns {string} Return the unique key
         * @abstract
         */

    }, {
        key: 'addEventListener',


        /**
         * Adds an event listener to an element.
         * @param {HTMLElement} element - The element to add the listener to
         * @param {String} eventName - The name of the event
         * @param {String} method - The name of the method to call when event fires
         * @param {Object} [context] - The context in which to call the method parameter
         * @param {Boolean} [useCapture] - Whether to use capture
         */
        value: function addEventListener(element, eventName, method, context, useCapture) {
            context = context || this;
            var listener = context[method].bind(context);
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

    }, {
        key: 'getClosestAncestorElementByClassName',
        value: function getClosestAncestorElementByClassName(el, className) {
            var result = null;
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

    }, {
        key: 'removeEventListener',
        value: function removeEventListener(element, eventName, method, context, useCapture) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._eventListeners[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _step$value = _slicedToArray(_step.value, 2);

                    var listener = _step$value[0];
                    var obj = _step$value[1];

                    if (obj.el === element && obj.name === eventName && obj.context === context && obj.method === method) {
                        element.removeEventListener(eventName, listener, useCapture);
                        this._eventListeners.delete(listener);
                        break;
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }

        /**
         * Removes all event listeners.
         */

    }, {
        key: 'destroy',
        value: function destroy() {
            var _this = this;

            this._eventListeners.forEach(function (obj) {
                _this.removeEventListener(obj.el, obj.name, obj.method, obj.context);
            });
            this._eventListeners.clear();
        }
    }], [{
        key: 'getElementKey',
        value: function getElementKey() {
            return 'element';
        }
    }]);

    return FormElement;
}();

module.exports = FormElement;

},{"core-js/es6/map":1,"core-js/es6/symbol":2}],87:[function(require,module,exports){
/* global Platform */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _dropdown = require('./dropdown');

var _dropdown2 = _interopRequireDefault(_dropdown);

var _inputField = require('./input-field');

var _inputField2 = _interopRequireDefault(_inputField);

var _checkbox = require('./checkbox');

var _checkbox2 = _interopRequireDefault(_checkbox);

var _checkboxes = require('./checkboxes');

var _checkboxes2 = _interopRequireDefault(_checkboxes);

var _formElement = require('./form-element');

var _formElement2 = _interopRequireDefault(_formElement);

var _formElementGroup = require('./form-element-group');

var _formElementGroup2 = _interopRequireDefault(_formElementGroup);

var _radios = require('./radios');

var _radios2 = _interopRequireDefault(_radios);

var _textArea = require('./text-area');

var _textArea2 = _interopRequireDefault(_textArea);

var _submitButton = require('./submit-button');

var _submitButton2 = _interopRequireDefault(_submitButton);

var _observeJs = require('observe-js');

var _observeJs2 = _interopRequireDefault(_observeJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The function that fires when the input value changes
 * @callback Form~onValueChange
 * @param {string} value - The new value
 * @param {HTMLElement} element - The form element
 * @param {HTMLElement} uIElement - The ui-version of the form element
 */

/**
 * The function that fires to give users opportunity to return a custom set of options on a per-element basis
 * @callback Form~onGetOptions
 * @param {HTMLElement} element - The element on which to use the custom options
 * @returns {Object} Return the custom set of options
 */

/**
 * The function that fires when the submit button is clicked
 * @callback Form~onSubmitButtonClick
 * @params {Event} e - The click event
 */

/**
 * The function that fires when the form is submitted.
 * @callback Form~onSubmit
 * @params {Event} e - The click event
 * @params {Array} values - An array of the form's current values at the time the form was submitted
 */

/**
 * Utility class for form elements.
 * @class Form
 */

var Form = function () {

    /**
     * Sets up the form.
     * @param {object} options - The options
     * @param {HTMLFormElement} options.el - The form element
     * @param {Form~onValueChange} [options.onValueChange] - A callback function that fires when the value of any form element changes
     * @param {Function} [options.onGetOptions] - Function callback that is fired upon instantiation to provide custom options
     * @param {string} [options.dropdownClass] - The css class used to query the set of dropdown elements that should be included
     * @param {string} [options.checkboxClass] - The css class used to query the set of checkbox elements that should be included
     * @param {string} [options.inputFieldClass] - The css class used to query the set of text input elements that should be included
     * @param {string} [options.textAreaClass] - The css class used to query the set of textarea elements that should be included
     * @param {string} [options.radioClass] - The css class used to query the set of radio button elements that should be included
     * @param {Form~onSubmit} [options.onSubmit] - Function that is called when the form is submitted
     * @param {string} [options.submitButtonClass] - The css class used to query the submit button
     * @param {string} [options.submitButtonDisabledClass] - The class that will be applied to the submit button when its disabled
     * @param {Form~onSubmitButtonClick} [options.onSubmitButtonClick] - Function that is called when the submit button is clicked
     * @param {Object} [options.data] - An object mapping the form elements name attributes (keys) to their values which will be binded to form's fields
     * @param {Number} [options.legacyDataPollTime] - The amount of time (in milliseconds) to poll for options.data changes for browsers that do not support native data observing
     */

    function Form(options) {
        _classCallCheck(this, Form);

        options = _underscore2.default.extend({
            el: null,
            onValueChange: null,
            onGetOptions: null,
            dropdownClass: null,
            checkboxClass: null,
            inputFieldClass: null,
            textAreaClass: null,
            radioClass: null,
            onSubmit: null,
            submitButtonClass: null,
            submitButtonDisabledClass: null,
            onSubmitButtonClick: null,
            data: null,
            legacyDataPollTime: 125
        }, options);

        this.options = options;

        // okay to cache here because its a "live" html collection -- yay!
        this.formEls = this.options.el.elements;

        this._formInstances = [];
        this._moduleCount = 0;
        this.subModules = {};

        this._onSubmitEventListener = this.onSubmit.bind(this);
        this.options.el.addEventListener('submit', this._onSubmitEventListener, true);
    }

    /**
     * Sets up data map so that we're observing its changes.
     * @returns {Object}
     * @private
     */


    _createClass(Form, [{
        key: '_setupDataMapping',
        value: function _setupDataMapping(rawData) {
            var data = {};
            if (rawData) {
                data = rawData;

                // if Object.observe is not supported, we poll data every 125 milliseconds
                if (!Object.observe) {
                    this._legacyDataPollTimer = window.setInterval(function () {
                        Platform.performMicrotaskCheckpoint();
                    }, this.options.legacyDataPollTime);
                }

                // sync any changes made on data map to options data
                this._observer = new _observeJs2.default.ObjectObserver(data);
                this._observer.open(function (added, removed, changed) {
                    var mashup = _underscore2.default.extend(added, removed, changed);
                    Object.keys(mashup).forEach(function (n) {
                        this.getInstanceByName(n).setValue(mashup[n]);
                    }.bind(this));
                }.bind(this));
            }
            return data;
        }

        /**
         * Returns a mapping of ids to their associated form option and selector.
         */

    }, {
        key: '_getSelectorMap',
        value: function _getSelectorMap() {
            return {
                dropdown: {
                    option: this.options.dropdownClass,
                    selector: 'select',
                    tag: 'select'
                },
                checkbox: {
                    option: this.options.checkboxClass,
                    tag: 'input',
                    types: ['checkbox']
                },
                input: {
                    option: this.options.inputFieldClass,
                    tag: 'input',
                    types: ['password', 'email', 'number', 'text', 'date', 'datetime', 'month', 'search', 'range', 'time', 'week', 'tel', 'color', 'datetime-local']
                },
                radio: {
                    option: this.options.radioClass,
                    tag: 'input',
                    types: ['radio']
                },
                textarea: {
                    option: this.options.textAreaClass,
                    tag: 'textarea'
                }
            };
        }
    }, {
        key: 'onSubmit',
        value: function onSubmit(e) {
            var currentValues = this.getCurrentValues();
            if (this.options.onSubmitButtonClick) {
                this.options.onSubmitButtonClick(e, currentValues);
            }
            if (this.options.onSubmit) {
                this.options.onSubmit(e, currentValues);
            }
        }

        /**
         * Sets up the form and instantiates all necessary element classes.
         */

    }, {
        key: 'setup',
        value: function setup() {
            var submitButtonEl = this.options.el.getElementsByClassName(this.options.submitButtonClass)[0];

            this._setupInstances(this._getInstanceEls('dropdown'), _dropdown2.default);
            this._setupInstances(this._getInstanceEls('checkbox'), _checkbox2.default);
            this._setupInstances(this._getInstanceEls('input'), _inputField2.default);
            this._setupInstances(this._getInstanceEls('textarea'), _textArea2.default);

            // group radio button toggles by name before instantiating
            var radios = this._getInstanceEls('radio');
            _underscore2.default.each(this.mapElementsByAttribute(radios, 'name'), function (els) {
                this._setupInstance(els, _radios2.default, {}, 'inputs');
            }, this);

            if (submitButtonEl) {
                this.subModules.submitButton = new _submitButton2.default({
                    el: submitButtonEl,
                    disabledClass: this.options.submitButtonDisabledClass,
                    onClick: this.onSubmit.bind(this)
                });
            }
            this._setupDataMapping(this.options.data);
        }

        /**
         * Gets the matching form elements, based on the supplied type.
         * @param {string} type - The type identifier (i.e. "dropdown", "checkbox", "input")
         * @returns {Array|HTMLCollection} Returns an array of matching elements
         * @private
         */

    }, {
        key: '_getInstanceEls',
        value: function _getInstanceEls(type) {
            var formEl = this.options.el,
                elements = [],
                map = this._getSelectorMap();

            map = map[type] || {};

            // we are strategically grabbing elements by "tagName" to ensure we have a LIVE HTMLCollection
            // instead of an ineffective, non-live NodeList (i.e. querySelector), can we say, "less state management"!

            if (map.option) {
                elements = formEl.getElementsByClassName(map.option);
            } else if (map.types) {
                map.types.forEach(function (val) {
                    (this.mapElementsByAttribute(this.formEls, 'type')[val] || []).forEach(function (el) {
                        elements.push(el);
                    });
                }, this);
            } else if (map.tag) {
                elements = formEl.getElementsByTagName(map.tag);
            }
            return elements;
        }

        /**
         * Creates a single instance of a class for each of the supplied elements.
         * @param {HTMLCollection|Array} elements - The set of elements to instance the class on
         * @param {Function} View - The class to instantiate
         * @param {Object} [options] - The options to be passed to instantiation
         * @param {string} [elKey] - The key to use as the "el"
         * @private
         */

    }, {
        key: '_setupInstances',
        value: function _setupInstances(elements, View, options, elKey) {
            var count = elements.length,
                i;
            if (count) {
                for (i = 0; i < count; i++) {
                    this._setupInstance(elements[i], View, options, elKey);
                }
            }
        }

        /**
         * Creates a single instance of a class using multiple elements.
         * @param {Array|HTMLCollection} els - The elements for which to setup an instance
         * @param {Function} View - The class to instantiate
         * @param {Object} [options] - The options to be passed to instantiation
         * @param {string} [elKey] - The key to use as the "el"
         * @private
         */

    }, {
        key: '_setupInstance',
        value: function _setupInstance(els, View, options, elKey) {
            elKey = elKey || 'el';
            var formOptions = this.options;
            var finalOptions = this._buildOptions(els, options);
            finalOptions[elKey] = els; // dont allow custom options to override the el!

            // assign value to form element if a data object was passed in options
            els = els.length ? Array.prototype.slice.call(els) : [els]; //ensure array
            var name = els[0].name;
            if (formOptions.data && typeof formOptions.data[name] !== 'function' && formOptions.data.hasOwnProperty(name)) {
                finalOptions.value = finalOptions.value || formOptions.data[name];
            }
            this._moduleCount++;
            var instance = this.subModules['fe' + this._moduleCount] = new View(finalOptions);
            this._formInstances.push(instance);
        }

        /**
         * Maps all supplied elements by an attribute.
         * @param {Array|HTMLCollection|NodeList} elements
         * @param {string} attr - The attribute to map by (the values will be the keys in the map returned)
         * @returns {Object} Returns the final object
         */

    }, {
        key: 'mapElementsByAttribute',
        value: function mapElementsByAttribute(elements, attr) {
            var map = {},
                count = elements.length,
                i,
                el;
            if (count) {
                for (i = 0; i < count; i++) {
                    el = elements[i];
                    if (map[el[attr]]) {
                        map[el[attr]].push(el);
                    } else {
                        map[el[attr]] = [el];
                    }
                }
            }
            return map;
        }

        /**
         * Returns the instance (if there is one) of an element with a specified name attribute
         * @param {string} name - The name attribute of the element whos instance is desired
         * @returns {Object} Returns the instance that matches the name specified
         * @TODO: this method should return an array because there could be multiple form elements with the same name!
         */

    }, {
        key: 'getInstanceByName',
        value: function getInstanceByName(name) {
            var i, instance;

            for (i = 0; i < this._formInstances.length; i++) {
                instance = this._formInstances[i];
                if (instance.getFormElement().name === name) {
                    break;
                }
            }
            return instance;
        }

        /**
         * Builds the initialize options for an element.
         * @param {HTMLElement|Array} el - The element (or if radio buttons, an array of elements)
         * @param {Object} options - The beginning set of options
         * @returns {*|{}}
         * @private
         */

    }, {
        key: '_buildOptions',
        value: function _buildOptions(el, options) {
            options = options || {};

            if (this.options.onGetOptions) {
                options = _underscore2.default.extend({}, options, this.options.onGetOptions(el));
            }
            options.onChange = function (value, inputEl, UIElement) {
                this._onValueChange(value, inputEl, UIElement);
            }.bind(this);
            return options;
        }

        /**
         * When any form element's value changes.
         * @param {string} value - The new value
         * @param {HTMLElement} el - The element that triggered value change
         * @param {HTMLElement} ui - The UI version of the element
         * @private
         */

    }, {
        key: '_onValueChange',
        value: function _onValueChange(value, el, ui) {
            var name = el.name,
                formOptionsData = this.options.data || {},
                mapValue = formOptionsData[name];

            // update data map
            if (typeof mapValue === 'function') {
                // function, so call it
                mapValue(value);
            } else if (formOptionsData.hasOwnProperty(name)) {
                formOptionsData[name] = value;
            }

            if (this.options.onValueChange) {
                this.options.onValueChange(value, el, ui);
            }
            if (this.options.onChange) {
                this.options.onChange(value, el, ui);
            }
        }

        /**
         * Disables all form elements.
         */

    }, {
        key: 'disable',
        value: function disable() {
            var els = this.formEls,
                i,
                submitButton = this.getSubmitButtonInstance();
            this.setPropertyAll('disabled', true);
            // add disabled css classes
            for (i = 0; i < els.length; i++) {
                els[i].classList.add('disabled');
            }
            if (submitButton) {
                submitButton.disable();
            }
        }

        /**
         * Enables all form elements.
         */

    }, {
        key: 'enable',
        value: function enable() {
            var els = this.formEls,
                i,
                submitButton = this.getSubmitButtonInstance();
            this.setPropertyAll('disabled', false);
            // remove disabled css classes
            for (i = 0; i < els.length; i++) {
                els[i].classList.remove('disabled');
            }
            if (submitButton) {
                submitButton.disable();
            }
        }

        /**
         * Sets a property on all form elements.
         * @TODO: this function still exists until this class can cover ALL possible form elements (i.e. radio buttons)
         * @param {string} prop - The property to change
         * @param {*} value - The value to set
         */

    }, {
        key: 'setPropertyAll',
        value: function setPropertyAll(prop, value) {
            var i,
                els = this.formEls;
            for (i = 0; i < els.length; i++) {
                els[i][prop] = value;
            }
        }

        /**
         * Triggers a method on all form instances.
         * @param {string} method - The method
         * @param {...*} params - Any params for the method from here, onward
         */

    }, {
        key: 'triggerMethodAll',
        value: function triggerMethodAll(method, params) {
            var args = Array.prototype.slice.call(arguments, 1),
                i,
                instance;

            for (i = 0; i < this._formInstances.length; i++) {
                instance = this._formInstances[i];
                instance[method].apply(instance, args);
            }
        }

        /**
         * Clears all form items.
         */

    }, {
        key: 'clear',
        value: function clear() {
            this.triggerMethodAll('clear');
        }

        /**
         * Gets an object that maps all fields to their current name/value pairs.
         * @returns {Array} Returns an array of objects
         */

    }, {
        key: 'getCurrentValues',
        value: function getCurrentValues() {
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
        }

        /**
         * Returns the submit button instance.
         * @returns {Object}
         */

    }, {
        key: 'getSubmitButtonInstance',
        value: function getSubmitButtonInstance() {
            return this.subModules.submitButton;
        }

        /**
         * Cleans up some stuff.
         */

    }, {
        key: 'destroy',
        value: function destroy() {
            this.options.el.removeEventListener('submit', this._onSubmitEventListener, true);
            window.clearInterval(this._legacyDataPollTimer);
            if (this._observer) {
                this._observer.close();
            }
            for (var key in this.subModules) {
                if (this.subModules.hasOwnProperty(key) && this.subModules[key]) {
                    this.subModules[key].destroy();
                }
            }
        }
    }]);

    return Form;
}();

Form.Checkbox = _checkbox2.default;
Form.Checkboxes = _checkboxes2.default;
Form.Dropdown = _dropdown2.default;
Form.FormElement = _formElement2.default;
Form.FormElementGroup = _formElementGroup2.default;
Form.InputField = _inputField2.default;
Form.Radios = _radios2.default;
Form.SubmitButton = _submitButton2.default;
Form.TextArea = _textArea2.default;

module.exports = Form;

},{"./checkbox":82,"./checkboxes":83,"./dropdown":84,"./form-element":86,"./form-element-group":85,"./input-field":88,"./radios":89,"./submit-button":90,"./text-area":91,"observe-js":80,"underscore":81}],88:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _formElement = require('./form-element');

var _formElement2 = _interopRequireDefault(_formElement);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
 * BEWARE: This function fires rapidly as a user types!
 * @callback InputField~onKeyDownChange
 * @param {string} value - The new value of the input element
 * @param {HTMLInputElement} input - The updated input element
 * @param {HTMLElement} UIElement - The updated container of the input element
 * @param {Event} event - The event
 */

/**
 * Adds useful logic to an input field.
 * @class InputField
 * @extends FormElement
 */

var InputField = function (_FormElement) {
    _inherits(InputField, _FormElement);

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
     * @param {string} [options.value] - An initial value to set the input field to
     */

    function InputField(options) {
        _classCallCheck(this, InputField);

        options = _underscore2.default.extend({
            el: null,
            onChange: null,
            onKeyDownChange: null,
            containerClass: 'ui-input-text',
            inputClass: 'ui-input-text-input',
            disabledClass: 'ui-input-text-disabled',
            activeClass: 'ui-input-text-active',
            value: null
        }, options);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(InputField).call(this, options));

        _this.options = options;
        _this.setup();
        return _this;
    }

    /**
     * Sets up events for showing/hiding tooltip.
     */


    _createClass(InputField, [{
        key: 'setup',
        value: function setup() {
            var input = this.options.el,
                optionsValue = this.options.value || input.value;

            // add internal class if doesnt already exist
            input.classList.add(this.options.inputClass);

            this._container = this._buildUIElement(input);
            this._inputEl = this._container.getElementsByClassName(this.options.inputClass)[0];

            if (input.value !== optionsValue) {
                input.value = optionsValue;
            }

            this.origInputValue = optionsValue;
            this.isInitDisabled = input.disabled;

            // handle disabled state
            if (this.isInitDisabled) {
                this._container.classList.add(this.options.disabledClass);
            }

            this._bindEvents();
        }

        /**
         * Sets up events.
         * @private
         */

    }, {
        key: '_bindEvents',
        value: function _bindEvents() {
            var input = this.getFormElement();
            this.addEventListener(input, 'focus', '_onInputFocus', this);
            this.addEventListener(input, 'blur', '_onInputBlur', this);
            this.addEventListener(input, 'change', '_onInputValueChange', this);
            this.addEventListener(input, 'keydown', '_onInputKeyDown', this);
        }

        /**
         * Destroys events.
         * @private
         */

    }, {
        key: '_unbindEvents',
        value: function _unbindEvents() {
            var input = this.getFormElement();
            this.removeEventListener(input, 'focus', '_onInputFocus', this);
            this.removeEventListener(input, 'blur', '_onInputBlur', this);
            this.removeEventListener(input, 'change', '_onInputValueChange', this);
            this.removeEventListener(input, 'keydown', '_onInputKeyDown', this);
        }

        /**
         * When a key is pressed down while inside the input field.
         * @param {Event} e
         * @private
         */

    }, {
        key: '_onInputKeyDown',
        value: function _onInputKeyDown(e) {
            if (this.keyDownTimeoutId) {
                clearTimeout(this.keyDownTimeoutId);
            }
            // to ensure we have the most up-to-date the input field value,
            // we must defer the update evaluation until after 1 millisecond
            this.keyDownTimeoutId = setTimeout(this._triggerKeyDownChange.bind(this, e), 1);
        }

        /**
         * Triggers a change event.
         * @param e
         * @private
         */

    }, {
        key: '_triggerKeyDownChange',
        value: function _triggerKeyDownChange(e) {
            var input = this.getFormElement();
            if (this.options.onKeyDownChange) {
                this.options.onKeyDownChange(input.value, input, this.getUIElement(), e);
            }
        }

        /**
         * Sets the value of the input field.
         * @param {string} value - The new input field value
         */

    }, {
        key: 'setValue',
        value: function setValue(value) {
            var input = this.getFormElement(),
                currentVal = input.value;
            if (value !== currentVal) {
                input.value = value;
                this._triggerChange();
            }
        }

        /**
         * Gets the current input field value.
         * @returns {string} Returns current value
         */

    }, {
        key: 'getValue',
        value: function getValue() {
            return this.getFormElement().value;
        }

        /**
         * Builds the UI-friendly version of input field by wrapping it inside of a container.
         * @param {HTMLInputElement} inputEl - The input element
         * @returns {HTMLElement} Returns the newly-created container element with the nested input element
         * @private
         */

    }, {
        key: '_buildUIElement',
        value: function _buildUIElement(inputEl) {
            var parent = inputEl.parentNode;
            var outerEl = document.createElement('div');
            outerEl.classList.add(this.options.containerClass);
            parent.replaceChild(outerEl, inputEl);
            outerEl.appendChild(inputEl);
            return outerEl;
        }

        /**
         * When the input gains focus.
         * @private
         */

    }, {
        key: '_onInputFocus',
        value: function _onInputFocus() {
            this.getUIElement().classList.add(this.options.activeClass);
        }

        /**
         * When the input loses focus.
         * @private
         */

    }, {
        key: '_onInputBlur',
        value: function _onInputBlur() {
            this.getUIElement().classList.remove(this.options.activeClass);
        }

        /**
         * Triggers a value change.
         * @private
         */

    }, {
        key: '_triggerChange',
        value: function _triggerChange(e) {
            var args = [this.getValue(), this.getFormElement(), this.getUIElement()];
            if (e) {
                args.push(e);
            }
            if (this.options.onChange) {
                this.options.onChange.apply(this, args);
            }
        }

        /**
         * When the input value changes.
         * @param {Event} e - The event that was triggered
         * @private
         */

    }, {
        key: '_onInputValueChange',
        value: function _onInputValueChange(e) {
            this._triggerChange(e);
        }

        /**
         * Gets the input field element.
         * @returns {HTMLInputElement} Returns the input field element
         */

    }, {
        key: 'getFormElement',
        value: function getFormElement() {
            return this._inputEl;
        }

        /**
         * Gets the input field div element.
         * @returns {HTMLElement} Returns the checkbox div element.
         */

    }, {
        key: 'getUIElement',
        value: function getUIElement() {
            return this._container;
        }

        /**
         * Enables the button toggle.
         */

    }, {
        key: 'enable',
        value: function enable() {
            this.getFormElement().removeAttribute('disabled');
            this.getUIElement().classList.remove(this.options.disabledClass);
        }

        /**
         * Disables the button toggle.
         */

    }, {
        key: 'disable',
        value: function disable() {
            this.getFormElement().setAttribute('disabled', 'true');
            this.getUIElement().classList.add(this.options.disabledClass);
        }

        /**
         * Sets the input to nothing.
         */

    }, {
        key: 'clear',
        value: function clear() {
            this.setValue('');
        }

        /**
         * Gets the unique identifier for input fields.
         * @returns {string}
         */

    }, {
        key: 'getElementKey',
        value: function getElementKey() {
            return 'inputText';
        }

        /**
         * Destruction of this class.
         */

    }, {
        key: 'destroy',
        value: function destroy() {
            var container = this.getUIElement(),
                input = this.getFormElement();

            this._unbindEvents();

            container.parentNode.replaceChild(input, container);

            if (this.isInitDisabled) {
                input.setAttribute('disabled', 'true');
            }
            // set original value back
            this.setValue(this.origInputValue);

            _get(Object.getPrototypeOf(InputField.prototype), 'destroy', this).call(this);
        }
    }]);

    return InputField;
}(_formElement2.default);

module.exports = InputField;

},{"./form-element":86,"underscore":81}],89:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _formElementGroup = require('./form-element-group');

var _formElementGroup2 = _interopRequireDefault(_formElementGroup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A callback function that fires when one of the radio button elements are selected
 * @callback Radios~onChange
 * @param {string} value - The value of the input element that was changed
 * @param {HTMLInputElement} input - The input element that was changed
 * @param {HTMLElement} UIElement - The container of the input element that was changed
 */

/**
 * Groups radio buttons elements.
 * @class Radios
 * @extends FormElement
 */

var Radios = function (_FormElementGroup) {
    _inherits(Radios, _FormElementGroup);

    /**
     * Initialization.
     * @param {object} options - Options passed into instance
     * @param {Array|HTMLInputElement} options.inputs - The collection of radio input elements
     * @param {Radios~onChange} [options.onChange] - A callback function that fires when one of the toggle elements are selected
     * @param {string} [options.containerClass] - The css class that will be applied to each toggle item's container
     * @param {string} [options.inputClass] - The css class that will be applied to each toggle item (input element)
     * @param {string} [options.selectedClass] - The css class that will be applied to a radio button item (UI-version) when it is selected
     * @param {string} [options.disabledClass] - The css class that will be applied to a radio button item (UI-version) when it is disabled
     * @param {string|Array} [options.value] - The string matching the name attribute of the toggle button to have selected initially (or an array of such strings)
     */

    function Radios(options) {
        _classCallCheck(this, Radios);

        options = _underscore2.default.extend({
            inputs: [],
            onChange: null,
            containerClass: 'ui-radio',
            inputClass: 'ui-radio-input',
            selectedClass: 'ui-radio-selected',
            disabledClass: 'ui-radio-disabled',
            value: null
        }, options);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Radios).call(this, options));

        _this.options = options;
        return _this;
    }

    /**
     * When one of the radio input elements are clicked.
     * @param {HTMLInputElement} formElement - The radio button element
     * @param {HTMLElement} UIElement - The ui element
     * @private
     */


    _createClass(Radios, [{
        key: '_onFormElementClick',
        value: function _onFormElementClick(formElement, UIElement) {
            var _this2 = this;

            if (this._lastRadioClicked !== formElement) {
                this.triggerAll(function (formEl, UIEl) {
                    if (!formEl.checked) {
                        UIEl.classList.remove(_this2.options.selectedClass);
                    } else {
                        UIEl.classList.add(_this2.options.selectedClass);
                    }
                });
                this._lastRadioClicked = formElement;
                this.triggerChange(formElement, UIElement);
            }
        }

        /**
         * When one of the radio UI elements are clicked.
         * @param {HTMLInputElement} formElement - The radio button element
         * @param {HTMLElement} UIElement - The ui element
         * @private
         */

    }, {
        key: '_onUIElementClick',
        value: function _onUIElementClick(formElement, UIElement) {
            var _this3 = this;

            if (this._lastRadioClicked !== formElement) {
                this.triggerAll(function (formEl, UIEl) {
                    if (formEl !== formElement) {
                        UIEl.classList.remove(_this3.options.selectedClass);
                        formEl.checked = false;
                    } else {
                        UIEl.classList.add(_this3.options.selectedClass);
                        formEl.checked = true;
                    }
                });
                this._lastRadioClicked = formElement;
                this.triggerChange(formElement, UIElement);
            }
        }

        /**
         * Selects the toggle item.
         * @param {Number} index - The index of the toggle item
         */

    }, {
        key: 'select',
        value: function select(index) {
            var input = this.getFormElement(index),
                toggle = this.getUIElement(index);
            if (!input.checked) {
                input.checked = true;
                toggle.classList.add(this.options.selectedClass);
                this.triggerChange(input, toggle);
            }

            this.triggerAll(function (formElement, UIElement, idx) {
                if (!formElement.checked) {
                    // deselect all other toggles if they are radio buttons
                    this.deselect(idx);
                }
            }.bind(this));
        }

        /**
         * Gets the unique identifier for radio buttons.
         * @returns {string}
         */

    }, {
        key: 'getElementKey',
        value: function getElementKey() {
            return 'radios';
        }
    }]);

    return Radios;
}(_formElementGroup2.default);

module.exports = Radios;

},{"./form-element-group":85,"underscore":81}],90:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @class SubmitButton
 */

var SubmitButton = function () {

    /**
     * Sets up stuff.
     * @abstract
     * @param {Object} options - Instantiation options
     */

    function SubmitButton(options) {
        _classCallCheck(this, SubmitButton);

        options = _underscore2.default.extend({
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


    _createClass(SubmitButton, [{
        key: 'onClick',
        value: function onClick(e) {
            if (this.options.onClick) {
                this.options.onClick(e);
            }
        }

        /**
         * Returns the submit button element
         * @returns {HTMLElement} the submit button
         * @abstract
         */

    }, {
        key: 'getSubmitButton',
        value: function getSubmitButton() {
            return this.options.el;
        }

        /**
         * Enables the form element.
         * @abstract
         */

    }, {
        key: 'enable',
        value: function enable() {
            var btn = this.getSubmitButton();
            btn.disabled = false;
            btn.classList.remove(this.options.disabledClass);
        }

        /**
         * Disables the form element.
         * @abstract
         */

    }, {
        key: 'disable',
        value: function disable() {
            var btn = this.getSubmitButton();
            btn.disabled = true;
            btn.classList.add(this.options.disabledClass);
        }

        /**
         * Removes event listeners.
         */

    }, {
        key: 'destroy',
        value: function destroy() {
            this.options.el.removeEventListener('click', this._onClickEventListener);
        }
    }]);

    return SubmitButton;
}();

module.exports = SubmitButton;

},{"underscore":81}],91:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _formElement = require('./form-element');

var _formElement2 = _interopRequireDefault(_formElement);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * The function that fires when the input value changes
 * @callback TextArea~onChange
 * @param {string} value - The new value of the input element
 * @param {HTMLTextAreaElement} input - The input element
 * @param {HTMLElement} UIElement - The container of the input element
 * @param {Event} event - The event
 */

/**
 * The function that is triggered when the input field has changed after a key has been pressed down
 * NOTE: This function can fire rapidly as a user types!
 * @callback TextArea~onKeyDownChange
 * @param {HTMLTextAreaElement} input - The updated input element
 * @param {HTMLElement} UIElement - The updated container of the input element
 * @param {Event} event - The event
 */

/**
 * Adds useful logic to an input field.
 * @class TextArea
 * @extends FormElement
 */

var TextArea = function (_FormElement) {
    _inherits(TextArea, _FormElement);

    /**
     * Initializes the Input Field class.
     * @param {object} options - Options passed into instance
     * @param {HTMLTextAreaElement} options.el - The textarea element
     * @param {TextArea~onChange} [options.onChange] - A callback function that fires when the input value changes
     * @param {TextArea~onKeyDownChange} [options.onKeyDownChange] - A callback function that fires when input has changed after key down press
     * @param {string} [options.containerClass] - The css class that will be applied to the container that is wrapped around the input field
     * @param {string} [options.inputClass] - The css class that will be applied to the the input field element
     * @param {string} [options.disabledClass] - The css class that will be applied to the input field container element when disabled
     * @param {string} [options.activeClass] - The css class that will be applied to the input field container element when in focus
     * @param {string} [options.value] - An initial value to set the input field to
     */

    function TextArea(options) {
        _classCallCheck(this, TextArea);

        options = _underscore2.default.extend({
            el: null,
            onChange: null,
            onKeyDownChange: null,
            containerClass: 'ui-textarea',
            inputClass: 'ui-textarea-input',
            disabledClass: 'ui-textarea-disabled',
            activeClass: 'ui-textarea-active',
            value: null
        }, options);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(TextArea).call(this, options));

        _this.options = options;

        _this.setup();
        return _this;
    }

    /**
     * Sets up events for showing/hiding tooltip.
     */


    _createClass(TextArea, [{
        key: 'setup',
        value: function setup() {
            var textArea = this.options.el,
                optionsValue = this.options.value || textArea.value;

            // add internal class if doesnt already exist
            textArea.classList.add(this.options.inputClass);

            this._container = this._buildUIElement(textArea);

            if (textArea.value !== optionsValue) {
                textArea.value = optionsValue;
            }

            this.origValue = optionsValue;
            this.origDisabled = textArea.disabled;

            // handle disabled state
            if (this.origDisabled) {
                this._container.classList.add(this.options.disabledClass);
            }

            this._bindEvents();
        }

        /**
         * Sets up events.
         * @private
         */

    }, {
        key: '_bindEvents',
        value: function _bindEvents() {
            var input = this.getFormElement();
            this.addEventListener(input, 'focus', '_onInputFocus', this);
            this.addEventListener(input, 'blur', '_onInputBlur', this);
            this.addEventListener(input, 'change', '_onInputValueChange', this);
            this.addEventListener(input, 'keydown', '_onInputKeyDown', this);
        }

        /**
         * Destroys events.
         * @private
         */

    }, {
        key: '_unbindEvents',
        value: function _unbindEvents() {
            var input = this.getFormElement();
            this.removeEventListener(input, 'focus', '_onInputFocus', this);
            this.removeEventListener(input, 'blur', '_onInputBlur', this);
            this.removeEventListener(input, 'change', '_onInputValueChange', this);
            this.removeEventListener(input, 'keydown', '_onInputKeyDown', this);
        }

        /**
         * When a key is pressed down while inside the input field.
         * @param {Event} e
         * @private
         */

    }, {
        key: '_onInputKeyDown',
        value: function _onInputKeyDown(e) {
            if (this.keyDownTimeoutId) {
                clearTimeout(this.keyDownTimeoutId);
            }
            // to ensure we have the most up-to-date the input field value,
            // we must defer the update evaluation until after 1 millisecond
            this.keyDownTimeoutId = setTimeout(this._triggerKeyDownChange.bind(this, e), 1);
        }

        /**
         * Triggers a change event.
         * @param e
         * @private
         */

    }, {
        key: '_triggerKeyDownChange',
        value: function _triggerKeyDownChange(e) {
            if (this.options.onKeyDownChange) {
                this.options.onKeyDownChange(this.getFormElement(), this.getUIElement(), e);
            }
        }

        /**
         * Sets the value of the input field.
         * @param {string} value - The new input field value
         */

    }, {
        key: 'setValue',
        value: function setValue(value) {
            var input = this.getFormElement(),
                currentVal = input.value;
            if (value !== currentVal) {
                input.value = value;
                this._triggerChange();
            }
        }

        /**
         * Gets the current input field value.
         * @returns {string} Returns current value
         */

    }, {
        key: 'getValue',
        value: function getValue() {
            return this.getFormElement().value;
        }

        /**
         * Builds the UI-friendly version of input field by wrapping it inside of a container.
         * @param {HTMLTextAreaElement} inputEl - The input element
         * @returns {HTMLElement} Returns the input element wrapped in its container
         * @private
         */

    }, {
        key: '_buildUIElement',
        value: function _buildUIElement(inputEl) {
            var parent = inputEl.parentNode;
            var outerEl = document.createElement('div');
            outerEl.classList.add(this.options.containerClass);
            parent.replaceChild(outerEl, inputEl);
            outerEl.appendChild(inputEl);
            return outerEl;
        }

        /**
         * When the input gains focus.
         * @private
         */

    }, {
        key: '_onInputFocus',
        value: function _onInputFocus() {
            this.getUIElement().classList.add(this.options.activeClass);
        }

        /**
         * When the input loses focus.
         * @private
         */

    }, {
        key: '_onInputBlur',
        value: function _onInputBlur() {
            this.getUIElement().classList.remove(this.options.activeClass);
        }

        /**
         * Triggers a value change.
         * @private
         */

    }, {
        key: '_triggerChange',
        value: function _triggerChange(e) {
            var args = [this.getValue(), this.getFormElement(), this.getUIElement()];
            if (e) {
                args.push(e);
            }
            if (this.options.onChange) {
                this.options.onChange.apply(this, args);
            }
        }

        /**
         * When the input value changes.
         * @param {Event} e - The event that was triggered
         * @private
         */

    }, {
        key: '_onInputValueChange',
        value: function _onInputValueChange(e) {
            this._triggerChange(e);
        }

        /**
         * Gets the input field element.
         * @returns {HTMLTextAreaElement} Returns the input field element
         */

    }, {
        key: 'getFormElement',
        value: function getFormElement() {
            return this.options.el;
        }

        /**
         * Gets the input field div element.
         * @returns {HTMLElement} Returns the checkbox div element.
         */

    }, {
        key: 'getUIElement',
        value: function getUIElement() {
            return this._container;
        }

        /**
         * Enables the button toggle.
         */

    }, {
        key: 'enable',
        value: function enable() {
            this.getFormElement().removeAttribute('disabled');
            this.getUIElement().classList.remove(this.options.disabledClass);
        }

        /**
         * Disables the button toggle.
         */

    }, {
        key: 'disable',
        value: function disable() {
            this.getFormElement().setAttribute('disabled', 'true');
            this.getUIElement().classList.add(this.options.disabledClass);
        }

        /**
         * Sets the input to nothing.
         */

    }, {
        key: 'clear',
        value: function clear() {
            this.setValue('');
        }

        /**
         * Gets the unique identifier for input fields.
         * @returns {string}
         */

    }, {
        key: 'getElementKey',
        value: function getElementKey() {
            return 'textArea';
        }

        /**
         * Destruction of this class.
         */

    }, {
        key: 'destroy',
        value: function destroy() {
            var container = this.getUIElement(),
                input = this.getFormElement();

            this._unbindEvents();

            container.parentNode.replaceChild(input, container);

            if (this.origDisabled) {
                input.setAttribute('disabled', 'true');
            }
            // set original value back
            this.setValue(this.origValue);

            _get(Object.getPrototypeOf(TextArea.prototype), 'destroy', this).call(this);
        }
    }]);

    return TextArea;
}(_formElement2.default);

module.exports = TextArea;

},{"./form-element":86,"underscore":81}]},{},[87])(87)
});