// Copyright (c) 2013 Yahoo! Inc. All rights reserved. Copyrights licensed under the MIT License.
// See the accompanying LICENSE file for terms.

// TODO SimpleStyle SimpleDom
(function(win) {
/**
 * A lightweight utility library when a full Javascript framework isn't necessary.
 * @namespace SimpleUtil
 */
SimpleUtil = function()
{
    var isA = function(obj, type)
        {
            return typeof obj == type;
        },
        owns = 'hasOwnProperty',
        proto = 'prototype',
        val = 'value',
        regexTrim = /^\s+|\s+$/g;
        
    function resolvePath(path) {
        return util.isArray(path) && path || (util.isStr(path) ? path.split('.') : [])
    }
    
    return {
        /**
         * Test for undefined.
         * @param  {mixed}  obj Object to test.
         * @return {Boolean}
         */
        isUnd : function(obj)
        {
            return isA(obj, 'undefined');
        },
 
        /**
         * Test for null.
         * @param  {mixed}  obj Object to test.
         * @return {Boolean}
         */
        isNull : function(obj)
        {
            return obj === null;
        },

        /**
         * Test for an object.
         * @param  {mixed}  obj Object to test.
         * @return {Boolean}
         */
        isObj : function(obj)
        {
            return isA(obj, 'object') && obj !== null;
        },

        /**
         * Test for a string.
         * @param  {mixed}  obj Object to test.
         * @return {Boolean}
         */
        isStr : function(obj)
        {
            return isA(obj, 'string');
        },

        /**
         * Test for a function.
         * @param  {mixed}  obj Object to test.
         * @return {Boolean}
         */
        isFunc : function(obj)
        {
            return isA(obj, 'function');
        },

        /**
         * Test for a number.
         * @param  {mixed}  obj Object to test.
         * @return {Boolean}
         */
        isNum : function(obj)
        {
            return isA(obj, 'number');
        },

        /**
         * Test for a boolean.
         * @param  {mixed}  obj Object to test.
         * @return {Boolean}
         */
        isBool : function(obj)
        {
            return isA(obj, 'boolean');
        },

        /**
         * Test for an array.
         * @param  {mixed}  obj Object to test.
         * @return {Boolean}
         */
        isArray : function(ar)
        {
            return Object[proto].toString.call(ar) === '[object Array]';
        },

        /**
         * Convert `arguments` to an array.
         * @param  {object} args Arguments object.
         * @return {array} Arguments
         */
        args : function(args)
        {
            return Array[proto].slice.apply(args);
        },

        /**
         * Get a value [deep] in an object.
         * @param  {object} obj Object to get a value from.
         * @param  {string|array} path Property path, e.g. "foo.bar.baz".
         * @param  {mixed} [def] Default value if nothing is found.
         * @return {mixed} Value or default.
         */
        get : function(obj, path, def)
        {
            var isObj = util.isObj(obj),
                props = resolvePath(path),
                pl = isObj ? props.length : 0,
                p = 0;
            
            for (; p<pl && obj; p++)
            {
                obj = obj[props[p]];
            }
            
            return !isObj || !pl || util.isUnd(obj) ? def : obj;
        },

        /**
         * Set a value [deep] in an object.
         * @param  {object} obj Object to set a value on.
         * @param  {string|array} path Property path, e.g. "foo.bar.baz"
         * @param  {mixed} val Value to set.
         * @param {boolean} [conditional] Only set if not already present.
         * @return {object} Object.
         */
        set : function(obj, path, val, conditional)
        {
            var props = util.isObj(obj) ? resolvePath(path) : [],
                prop,
                pl = props.length,
                p = 0;
            
            for (; p<pl; p++)
            {
                prop = props[p];
                if (!obj[owns](prop) || (p === pl-1 && !conditional)) {
                    obj[prop] = p < pl-1 || util.isUnd(val) ? {} : val;
                }
                obj = obj[prop];
            }
            
            return obj;
        },

        /**
         * Pick keys from an object to generate a new object.
         * @param  {object} obj Object to get values from.
         * @param  {object} keys Object containing the desired keys.
         * @return {mixed} New object or false on error.
         */
        remix : function(obj, keys)
        {
            if (!util.isObj(obj) || !util.isObj(keys)) {
                return false;
            }
            
            var result = {};
            
            util.each(keys, function eachKey(srcpath, tgtpath) {
                util.set(result,
                    (srcpath && srcpath.path) || srcpath || tgtpath,
                    util.get(obj, tgtpath, srcpath && srcpath.def)
                );
            });
            
            return result;
        },

        /**
         * Merge properties from one object to another.
         * @param  {object} mergeTo Object to merge to.
         * @param  {object} mergeFrom Object to merge from.
         * @param  {boolean} [clone] Clone the object rather than augment.
         * @return {object}
         */
        merge : function(mergeTo, mergeFrom, clone)
        {
            var obj = util.isObj;
            if (clone) {
                mergeTo = util.merge({}, mergeTo);
            }
            
            if (obj(mergeTo) && obj(mergeFrom)) {
                for (var prop in mergeFrom) {
                    if (mergeFrom[owns](prop)) {
                        if (obj(mergeFrom[prop]) && !util.isNull(mergeTo[prop])) {
                            mergeTo[prop] = util.merge(mergeTo[prop], mergeFrom[prop], clone);
                        } else {
                            mergeTo[prop] = mergeFrom[prop];
                        }
                    }
                }
            }
            
            return mergeTo;
        },

        /**
         * Clone an object.
         * @param  {object} obj Object to clone.
         * @return {object} Cloned object.
         */
        clone : function(obj)
        {
            return util.merge({}, obj, true);
        },
 
        /**
         * Apply a function to each value in an array or object.
         * @param  {object,array}  obj Collection to apply to.
         * @param  {function} fn Function to apply.
         */
        each : function(obj, fn)
        {
            if (util.isFunc(fn)) {
                if (util.isObj(obj)) {
                    for (var o in obj) {
                        if (obj[owns](o)) {
                            fn(obj[o], o, obj);
                        }
                    }
                } else if (util.isArray(obj)) {
                    for (var o = 0, ol = obj.length; o<ol; o++) {
                        fn(obj[o], o, obj);
                    }
                }
            }
        },

        /**
         * Extend one class with another.
         * @param  {function} target Target class.
         * @param  {function} source Source class.
         * @param  {array} [methods] Additional methods.
         * @param  {array} [methods] Additional methods.
         */
        extend : function(target, source /*, methods, methods, methods...*/)
        {
            var c = 'constructor',
                p = 'parent',
                methods = util.args(arguments).slice(2);
            
            target[proto] = new source();
            target[proto][c] = target;
            target[p] = source[proto];
            target[p][c] = source;
            
            // merge methods to prototype
            util.each(methods, function(m)
            {
                util.merge(target[proto], m);
            });
        },

        /**
         * Bind a function to a particular scope (`this`).
         * @param  {function} fn Function to bind.
         * @param  {object} [obj=window] Scope object (`this` when function executes).
         * @param  {array} [prefill] Prefill arguments.
         * @param  {array} [postfill] Postfill arguments.
         * @return {function} Bound function.
         */
        bind : function(fn, obj, prefill, postfill)
        {
            return function() {
                return fn.apply(obj || win, [].concat(prefill || [], util.args(arguments), postfill || []));
            };
        },

        /**
         * Capitalize a string of text.
         * @param  {string} str String to capitalize.
         * @return {string} Capitalized string.
         */
        capitalize : function(str)
        {
            if (util.isStr(str) && str) {
                str = str.charAt(0).toUpperCase() + (str.length > 1 ? str.substr(1) : "");
            }
            return str;
        },

        /**
         * Trim whitespace from the beginning and ending of a string.
         * @param  {string} str String to trim.
         * @return {string} Trimmed string.
         */
        trim : function(str)
        {
            return str.replace(regexTrim, '');
        },
    };
}();
var util = SimpleUtil;
if (typeof module !== 'undefined') {
    module.exports = util;
}
}(this));

