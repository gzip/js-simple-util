/* Copyright (c) 2013 Yahoo! Inc. All rights reserved.
Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms. */

// TODO SimpleStyle SimpleDom

(function() {
SimpleUtil = function()
{
    var doc = document,
        docEl = doc.documentElement,
        docStyle = docEl.style,
        docBody = doc.body,
        click = 'click',
        checked = 'checked',
        cln = 'className',
        owns = 'hasOwnProperty',
        innerHtml = 'innerHTML',
        proto = 'prototype',
        val = 'value',
        isA = function(obj, type)
        {
            return typeof obj == type;
        },
        clRegex = function(cl)
        {
            return new RegExp('(?:^|\\s+)' + cl + '(?:\\s+|$)');
        },
        regexTrim = /^\s+|\s+$/g,
        vendorPrefix = null,
        vendors = ['Webkit','Moz','O','ms'],
        // FF: transitionend, Opera: oTransitionEnd: (otransitionend v12), WebKit: webkitTransitionEnd, IE: MSTransitionEnd
        vendorExceptions = {
            //'Moz': {},
            'Webkit': {
                'transitionend': 'webkitTransitionEnd',
                'cancelAnimationFrame': 'webkitCancelRequestAnimationFrame',
                'optimizeSpeed': 'webkitOptimizeContrast'
            }
        };
    
    return {
        isUnd : function(obj)
        {
            return isA(obj, 'undefined');
        },
        
        isObj : function(obj)
        {
            return isA(obj, 'object');
        },
        
        isStr : function(obj)
        {
            return isA(obj, 'string');
        },
        
        isFunc : function(obj)
        {
            return isA(obj, 'function');
        },
        
        isNum : function(obj)
        {
            return isA(obj, 'number');
        },
        
        isBool : function(obj)
        {
            return isA(obj, 'boolean');
        },
        
        isArray : function(ar)
        {
            return Object[proto].toString.call(ar) === '[object Array]';
        },
        
        args : function(args)
        {
            return Array[proto].slice.apply(args);
        },
        
        get : function(obj, path, def)
        {
            var isObj = util.isObj(obj),
                props = isObj && util.isStr(path) ? path.split('.') : [],
                pl = props.length,
                p = 0;
            
            for (; p<pl && obj; p++)
            {
                obj = obj[props[p]];
            }
            
            return !isObj || !pl || util.isUnd(obj) ? def : obj;
        },
        
        set : function(obj, path, val, conditional)
        {
            var props = util.isObj(obj) && util.isStr(path) ? path.split('.') : [],
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
        
        merge : function(mergeTo, mergeFrom, clone)
        {
            if (clone) {
                mergeTo = util.merge({}, mergeTo);
            }
            
            if (util.isObj(mergeTo) && util.isObj(mergeFrom)) {
                for (var prop in mergeFrom) {
                    if (mergeFrom[owns](prop)) {
                        mergeTo[prop] = mergeFrom[prop];
                    }
                }
            }
            
            return mergeTo;
        },
        
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
        
        extend : function(target, source /*, methods, methods, methods...*/)
        {
            var c = 'constructor',
                p = 'parent';
            
            target[proto] = new source();
            target[proto][c] = target;
            target[p] = source[proto];
            target[p][c] = source;
            
            // merge methods to prototype
            util.args(arguments).slice(2).forEach(function(m)
            {
                util.merge(target[proto], m);
            });
        },
        
        bind : function(func, obj)
        {
            var args = util.args(arguments).slice(2);
            return function() {
                return func.apply(obj, args.concat(util.args(arguments)));
            }
        },
        
        getStyle : function(obj, style, def)
        {
            return util.get(obj, 'style.' + style, def);
        },
        
        setStyle : function(obj, style, val, resolve)
        {
            var objStyle = obj ? obj.style : null;
            //var objStyle = util.get(obj, 'style');
            if (objStyle) {
                if (resolve) {
                    style = util.resolvePrefix(style, objStyle);
                }
                objStyle[style] = util.isNum(val) && style !== 'zIndex' ? val + 'px' : val;
                //util.set(objStyle, resolve ? util.resolvePrefix(style) : style, val)
            }
        },
        
        setStyles : function(obj, styles, resolve)
        {
            for (var style in styles) {
                util.setStyle(obj, style, styles[style], resolve);
            }
        },
        
        getVendorPrefix : function(prop, forCss)
        {
            // resolve vendor prefix on first call
            if (vendorPrefix === null)
            {
                var cap = util.capitalize,
                    prop = prop || 'transform';
                
                vendors.forEach(function(vendor)
                {
                    if (vendor + util.capitalize(prop) in docStyle) {
                        vendorPrefix = vendor;
                    }
                });
            }
            
            return vendorPrefix && forCss ? '-' + vendorPrefix.toLowerCase() + '-' : vendorPrefix;
        },
        
        // TODO make more robust
        resolveStyle : function(prop)
        {
            return util.getVendorPrefix(null, true) + prop;
        },
        
        resolvePrefix : function(prop, obj, lower)
        {
            if (obj || prop.substr(0, 5) === 'trans')
            {
                var prefix = util.getVendorPrefix(),
                    exception = util.get(vendorExceptions, prefix + '.' + prop),
                    obj = obj || docStyle,
                    prefixed;
                
                if (exception) {
                    prop = exception;
                } else {
                    prefixed = (lower ? prefix.toLowerCase() : prefix) + util.capitalize(prop)
                }
                
                prop = prefixed && prefixed in obj ? prefixed : prop;
            }
            
            return prop;//(obj || docStyle)[prop] ? prop : null;
        },
        
        capitalize : function(str)
        {
            if (util.isStr(str) && str) {
                str = str.charAt(0).toUpperCase() + (str.length > 1 ? str.substr(1) : "");
            }
            return str;
        },
        
        trim : function(str)
        {
            return str.replace(regexTrim, '');
        },
        
        hasClass : function(el, cl)
        {
            return clRegex(cl).test(util.get(el, cln));
        },
        
        addClass : function(el, cl)
        {
            if (!util.hasClass(el, cl)) {
                util.setClass(el, util.trim(util.get(el, cln) + ' ' + cl));
            }
        },
        
        setClass : function(el, cl)
        {
            util.set(el, cln, cl);
        },
        
        delClass : function(el, cl)
        {
            var c = util.get(el, cln),
                regex;
            
            if (c) {
                regex = clRegex(cl);
                util.set(el, cln, c.replace(regex, ''));
            }
        },
        
        byName : function(n)
        {
            var el = doc.getElementsByName(n);
            return el ? el[0] : {};
        },
        
        byTag : function(tag, parent)
        {
            var el = (parent || doc).getElementsByTagName(tag);
            return el ? el[0] : {};
        },
        
        byId : function(id)
        {
            return doc.getElementById(id);
        },
        
        setAttrs : function(el, attrs, events)
        {
            if (el) {
                if (attrs) {
                    var attr, attribute;
                    for (attr in attrs) {
                        attribute = attrs[attr];
                        switch(attr)
                        {
                            case cln:
                            case innerHtml:
                                el[attr] = attribute;
                            break;
                            case 'parentNode':
                                attribute && attribute.appendChild(el);
                            break;
                            case 'styles':
                                util.setStyles(el, attribute, true);
                            break;
                            default:
                                el.setAttribute(attr, attribute);
                            break;
                        }
                    }
                }
                if (events) {
                    for (var ev in events) {
                        util.listen(el, ev, events[ev]);
                    }
                }
            }
            return el;
        },
        
        create : function(el, attrs, events)
        {
            var el = doc.createElement(el);
            return util.setAttrs(el, attrs, events);
        },
        
        remove : function(el)
        {
            util.parent(el).removeChild(el);
        },
        
        parent : function(el, level)
        {
            level = level || 1;
            do{
                el = el.parentNode;
            } while (--level);
            return el || {};
        },
        
        addScript : function (src)
        {
            var script = util.create('script', {src:src});
            
            util.listen(script, 'load', function() { util.remove(this); });
            util.byTag('head').appendChild(script);
        },
        
        request : function (url, opts)
        {
            var req = new XMLHttpRequest(),
                cb = opts.callback,
                method = opts.method || 'GET',
                headers = opts.headers || {},
                data = opts.data || null,
                json = opts.json;
            
            if (!util.isFunc(cb)) {
                return req;
            }
            
            if (!util.isUnd(json)) {
                headers['Content-Type'] = 'application/json';
                try {
                    data = JSON.stringify(json);
                } catch(e) {
                    if (cb) {
                        cb(e, null, req);
                    }
                }
            }
            
            if (url)
            {
                req.open(method, url);
                util.each(headers, function(value, key)
                {
                    req.setRequestHeader(key, value);
                });
                util.each(opts.props, function(value, key)
                {
                    req[key] = value;
                });
                
                req.onreadystatechange = function()
                {
                    var resp, status, headers;
                    if (req.readyState === 4) {
                        status = req.status;
                        if (status < 300 & status > 199) {
                            if (opts.parseHeaders) {
                                req.headers = {};
                                headers = req.getAllResponseHeaders().split("\n");
                                util.each(headers, function(hdr)
                                {
                                    var parsed = hdr.split(': ');
                                    if (parsed.length === 2) {
                                        req.headers[parsed[0].toLowerCase()] = parsed[1];
                                    }
                                });
                            }
                            
                            if (!util.isUnd(json)) {
                                try {
                                    resp = JSON.stringify(json);
                                } catch(e) {
                                    cb(e, null, req);
                                }
                            } else {
                                resp = req.responseText;
                            }
                            cb(null, resp, req);
                        } else {
                            cb({message: resp}, null, req);
                        }
                    }
                };
                req.send(data);
            }
            
            return req;
        },
        
        listen : function(obj, type, fn)
        {
            if(!util.isObj(obj)) return;
            
            var add = 'addEventListener',
                attach = 'attachEvent',
                ev = 'on'+type;
            
            if (obj[add]) {
                obj[add](type, fn, false);
            } else if (obj[attach]) {
                obj[attach](ev, function() { fn(window.event); } );
            } else {
                obj[ev] = fn;
            }
        },
        
        processEvent : function(e, prevent)
        {
            e = e || window.event;
            var el = e.target || e.srcElement;
            if (prevent) {
                if (e.preventDefault) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                e.returnValue = false;
                e.cancelBubble = true;
            }
            return el;
        },
        
        parseQuery : function()
        {
            var params = {},
                split = 'split',
                query = location.href[split](/[?#]/)[1];
            
            if (query) {
                query = query[split](/&/);
                for (var q in query) {
                    q = query[q][split](/=/);
                    params[q[0]] = q[1] || 1;
                }
            }
            
            return params;
        },
        
        getScroll : function ()
        {
            var scrollTop = 'scrollTop';
            return docEl[scrollTop] || docBody[scrollTop];
        },
        
        getOffset : function(el)
        {
            var parentNode = el,
                offsetLeft = 'offsetLeft',
                offsetTop = 'offsetTop',
                x = 0,
                y = 0;
            
            if (el) {
                x = el[offsetLeft];
                y = el[offsetTop];
                while(parentNode = parentNode.offsetParent) {
                    x += parentNode[offsetLeft];
                    y += parentNode[offsetTop];
                }
            }
            
            return {x: x, y: y};
        },
        
        onFrame : function ()
        {
        },
        
        cancelFrame : function ()
        {
        }
    }
}();
var win = window,
    util = SimpleUtil,
    wrap = function(name)
    {
        return function(f){ return win[util.resolvePrefix(name, win, true)](f); };
    };

util.onFrame = wrap('requestAnimationFrame');
util.cancelFrame = wrap('cancelAnimationFrame');
})();
