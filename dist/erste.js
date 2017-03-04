
(function(){
var g = {scope:{}};
g.defineProperty = "function" == typeof Object.defineProperties ? Object.defineProperty : function(a, b, c) {
  if (c.get || c.set) {
    throw new TypeError("ES3 does not support getters and setters.");
  }
  a != Array.prototype && a != Object.prototype && (a[b] = c.value);
};
g.getGlobal = function(a) {
  return "undefined" != typeof window && window === a ? a : "undefined" != typeof global && null != global ? global : a;
};
g.global = g.getGlobal(this);
g.SYMBOL_PREFIX = "jscomp_symbol_";
g.initSymbol = function() {
  g.initSymbol = function() {
  };
  g.global.Symbol || (g.global.Symbol = g.Symbol);
};
g.symbolCounter_ = 0;
g.Symbol = function(a) {
  return g.SYMBOL_PREFIX + (a || "") + g.symbolCounter_++;
};
g.initSymbolIterator = function() {
  g.initSymbol();
  var a = g.global.Symbol.iterator;
  a || (a = g.global.Symbol.iterator = g.global.Symbol("iterator"));
  "function" != typeof Array.prototype[a] && g.defineProperty(Array.prototype, a, {configurable:!0, writable:!0, value:function() {
    return g.arrayIterator(this);
  }});
  g.initSymbolIterator = function() {
  };
};
g.arrayIterator = function(a) {
  var b = 0;
  return g.iteratorPrototype(function() {
    return b < a.length ? {done:!1, value:a[b++]} : {done:!0};
  });
};
g.iteratorPrototype = function(a) {
  g.initSymbolIterator();
  a = {next:a};
  a[g.global.Symbol.iterator] = function() {
    return this;
  };
  return a;
};
g.makeIterator = function(a) {
  g.initSymbolIterator();
  var b = a[Symbol.iterator];
  return b ? b.call(a) : g.arrayIterator(a);
};
g.arrayFromIterator = function(a) {
  for (var b, c = [];!(b = a.next()).done;) {
    c.push(b.value);
  }
  return c;
};
g.arrayFromIterable = function(a) {
  return a instanceof Array ? a : g.arrayFromIterator(g.makeIterator(a));
};
g.inherits = function(a, b) {
  function c() {
  }
  c.prototype = b.prototype;
  a.prototype = new c;
  a.prototype.constructor = a;
  for (var d in b) {
    if (Object.defineProperties) {
      var e = Object.getOwnPropertyDescriptor(b, d);
      e && Object.defineProperty(a, d, e);
    } else {
      a[d] = b[d];
    }
  }
};
g.array = g.array || {};
g.iteratorFromArray = function(a, b) {
  g.initSymbolIterator();
  a instanceof String && (a += "");
  var c = 0, d = {next:function() {
    if (c < a.length) {
      var e = c++;
      return {value:b(e, a[e]), done:!1};
    }
    d.next = function() {
      return {done:!0, value:void 0};
    };
    return d.next();
  }};
  d[Symbol.iterator] = function() {
    return d;
  };
  return d;
};
g.polyfill = function(a, b) {
  if (b) {
    var c = g.global;
    a = a.split(".");
    for (var d = 0;d < a.length - 1;d++) {
      var e = a[d];
      e in c || (c[e] = {});
      c = c[e];
    }
    a = a[a.length - 1];
    d = c[a];
    b = b(d);
    b != d && null != b && g.defineProperty(c, a, {configurable:!0, writable:!0, value:b});
  }
};
g.EXPOSE_ASYNC_EXECUTOR = !0;
g.FORCE_POLYFILL_PROMISE = !1;
g.polyfill("Promise", function(a) {
  function b(a) {
    this.state_ = 0;
    this.result_ = void 0;
    this.onSettledCallbacks_ = [];
    var b = this.createResolveAndReject_();
    try {
      a(b.resolve, b.reject);
    } catch (p) {
      b.reject(p);
    }
  }
  function c() {
    this.batch_ = null;
  }
  if (a && !g.FORCE_POLYFILL_PROMISE) {
    return a;
  }
  c.prototype.asyncExecute = function(a) {
    null == this.batch_ && (this.batch_ = [], this.asyncExecuteBatch_());
    this.batch_.push(a);
    return this;
  };
  c.prototype.asyncExecuteBatch_ = function() {
    var a = this;
    this.asyncExecuteFunction(function() {
      a.executeBatch_();
    });
  };
  var d = g.global.setTimeout;
  c.prototype.asyncExecuteFunction = function(a) {
    d(a, 0);
  };
  c.prototype.executeBatch_ = function() {
    for (;this.batch_ && this.batch_.length;) {
      var a = this.batch_;
      this.batch_ = [];
      for (var b = 0;b < a.length;++b) {
        var c = a[b];
        delete a[b];
        try {
          c();
        } catch (q) {
          this.asyncThrow_(q);
        }
      }
    }
    this.batch_ = null;
  };
  c.prototype.asyncThrow_ = function(a) {
    this.asyncExecuteFunction(function() {
      throw a;
    });
  };
  b.prototype.createResolveAndReject_ = function() {
    function a(a) {
      return function(d) {
        c || (c = !0, a.call(b, d));
      };
    }
    var b = this, c = !1;
    return {resolve:a(this.resolveTo_), reject:a(this.reject_)};
  };
  b.prototype.resolveTo_ = function(a) {
    if (a === this) {
      this.reject_(new TypeError("A Promise cannot resolve to itself"));
    } else {
      if (a instanceof b) {
        this.settleSameAsPromise_(a);
      } else {
        var c;
        a: {
          switch(typeof a) {
            case "object":
              c = null != a;
              break a;
            case "function":
              c = !0;
              break a;
            default:
              c = !1;
          }
        }
        c ? this.resolveToNonPromiseObj_(a) : this.fulfill_(a);
      }
    }
  };
  b.prototype.resolveToNonPromiseObj_ = function(a) {
    var b = void 0;
    try {
      b = a.then;
    } catch (p) {
      this.reject_(p);
      return;
    }
    "function" == typeof b ? this.settleSameAsThenable_(b, a) : this.fulfill_(a);
  };
  b.prototype.reject_ = function(a) {
    this.settle_(2, a);
  };
  b.prototype.fulfill_ = function(a) {
    this.settle_(1, a);
  };
  b.prototype.settle_ = function(a, b) {
    if (0 != this.state_) {
      throw Error("Cannot settle(" + a + ", " + b | "): Promise already settled in state" + this.state_);
    }
    this.state_ = a;
    this.result_ = b;
    this.executeOnSettledCallbacks_();
  };
  b.prototype.executeOnSettledCallbacks_ = function() {
    if (null != this.onSettledCallbacks_) {
      for (var a = this.onSettledCallbacks_, b = 0;b < a.length;++b) {
        a[b].call(), a[b] = null;
      }
      this.onSettledCallbacks_ = null;
    }
  };
  var e = new c;
  b.prototype.settleSameAsPromise_ = function(a) {
    var b = this.createResolveAndReject_();
    a.callWhenSettled_(b.resolve, b.reject);
  };
  b.prototype.settleSameAsThenable_ = function(a, b) {
    var c = this.createResolveAndReject_();
    try {
      a.call(b, c.resolve, c.reject);
    } catch (q) {
      c.reject(q);
    }
  };
  b.prototype.then = function(a, c) {
    function d(a, b) {
      return "function" == typeof a ? function(b) {
        try {
          e(a(b));
        } catch (ga) {
          f(ga);
        }
      } : b;
    }
    var e, f, h = new b(function(a, b) {
      e = a;
      f = b;
    });
    this.callWhenSettled_(d(a, e), d(c, f));
    return h;
  };
  b.prototype.catch = function(a) {
    return this.then(void 0, a);
  };
  b.prototype.callWhenSettled_ = function(a, b) {
    function c() {
      switch(d.state_) {
        case 1:
          a(d.result_);
          break;
        case 2:
          b(d.result_);
          break;
        default:
          throw Error("Unexpected state: " + d.state_);
      }
    }
    var d = this;
    null == this.onSettledCallbacks_ ? e.asyncExecute(c) : this.onSettledCallbacks_.push(function() {
      e.asyncExecute(c);
    });
  };
  b.resolve = function(a) {
    return a instanceof b ? a : new b(function(b) {
      b(a);
    });
  };
  b.reject = function(a) {
    return new b(function(b, c) {
      c(a);
    });
  };
  b.race = function(a) {
    return new b(function(c, d) {
      for (var e = g.makeIterator(a), f = e.next();!f.done;f = e.next()) {
        b.resolve(f.value).callWhenSettled_(c, d);
      }
    });
  };
  b.all = function(a) {
    var c = g.makeIterator(a), d = c.next();
    return d.done ? b.resolve([]) : new b(function(a, e) {
      function f(b) {
        return function(c) {
          h[b] = c;
          p--;
          0 == p && a(h);
        };
      }
      var h = [], p = 0;
      do {
        h.push(void 0), p++, b.resolve(d.value).callWhenSettled_(f(h.length - 1), e), d = c.next();
      } while (!d.done);
    });
  };
  g.EXPOSE_ASYNC_EXECUTOR && (b.$jscomp$new$AsyncExecutor = function() {
    return new c;
  });
  return b;
}, "es6-impl", "es3");
var k = k || {};
k.global = this;
k.isDef = function(a) {
  return void 0 !== a;
};
k.exportPath_ = function(a, b, c) {
  a = a.split(".");
  c = c || k.global;
  a[0] in c || !c.execScript || c.execScript("var " + a[0]);
  for (var d;a.length && (d = a.shift());) {
    !a.length && k.isDef(b) ? c[d] = b : c = c[d] ? c[d] : c[d] = {};
  }
};
k.define = function(a, b) {
  k.exportPath_(a, b);
};
k.DEBUG = !0;
k.abstractMethod = function() {
  throw Error("unimplemented abstract method");
};
k.addSingletonGetter = function(a) {
  a.getInstance = function() {
    if (a.instance_) {
      return a.instance_;
    }
    k.DEBUG && (k.instantiatedSingletons_[k.instantiatedSingletons_.length] = a);
    return a.instance_ = new a;
  };
};
k.instantiatedSingletons_ = [];
k.isString = function(a) {
  return "string" == typeof a;
};
k.isObject = function(a) {
  var b = typeof a;
  return "object" == b && null != a || "function" == b;
};
k.getUid = function(a) {
  return a[k.UID_PROPERTY_] || (a[k.UID_PROPERTY_] = ++k.uidCounter_);
};
k.hasUid = function(a) {
  return !!a[k.UID_PROPERTY_];
};
k.removeUid = function(a) {
  null !== a && "removeAttribute" in a && a.removeAttribute(k.UID_PROPERTY_);
  try {
    delete a[k.UID_PROPERTY_];
  } catch (b) {
  }
};
k.UID_PROPERTY_ = "closure_uid_" + (1e9 * Math.random() >>> 0);
k.uidCounter_ = 0;
k.exportSymbol = function(a, b, c) {
  k.exportPath_(a, b, c);
};
k.exportProperty = function(a, b, c) {
  a[b] = c;
};
var l = {default:{angle:function(a, b, c, d) {
  a = 180 * Math.atan2(d - b, c - a) / Math.PI % 360;
  return 0 > 360 * a ? a + 360 : a;
}, distance:function(a, b, c, d) {
  return Math.pow(a - c, 2) + Math.pow(b - d, 2);
}, lerp:function(a, b, c) {
  return a + c * (b - a);
}}};
var m = {}, aa = navigator.userAgent.match(/iPhone/i) && /OS ([6-9]|\d{2})_\d/.test(navigator.userAgent), n = {TAP:"tap", LONG_TAP:"longTap", SWIPE_RIGHT:"swipeRight", SWIPE_UP:"swipeUp", SWIPE_LEFT:"swipeLeft", SWIPE_DOWN:"swipeDown"};
function r(a) {
  this.el = a || document.body;
  this.canSwipe = this.canTap = this.isInMotion = !1;
  this.touchStartTime = 0;
  this.touches = [];
  this.el.addEventListener("touchstart", this.onTouchstart.bind(this), !1);
  this.el.addEventListener("touchmove", this.onTouchmove.bind(this), !1);
  this.el.addEventListener("touchend", this.onTouchend.bind(this), !1);
}
r.prototype.onTouchstart = function(a) {
  this.canSwipe = this.canTap = this.isInMotion = !0;
  this.touchStartTime = (new Date).getTime();
  var b = a.changedTouches[0];
  this.touches = [a.timeStamp, b.pageX, b.pageY];
};
r.prototype.onTouchmove = function(a) {
  var b = this.touches, c = a.changedTouches[0];
  if (20 < Math.abs(c.pageX - b[1]) || 20 < Math.abs(c.pageY - b[2])) {
    this.canTap = !1;
  }
  if (this.canSwipe) {
    if (b.push(a.timeStamp, c.pageX, c.pageY), +new Date > b[0] + 100) {
      this.canSwipe = !1;
    } else {
      var d = a.timeStamp, b = b.filter(function(a, b, c) {
        return c[b - b % 3] > d - 250;
      });
      1 >= b.length / 3 || 60 > l.default.distance(b[1], b[2], b[b.length - 2], b[b.length - 1]) || (c = l.default.angle(b[1], b[2], b[b.length - 2], b[b.length - 1]), b = n.SWIPE_RIGHT, 45 < c && 135 > c ? b = n.SWIPE_DOWN : 135 < c && 225 > c ? b = n.SWIPE_LEFT : 225 < c && 315 > c && (b = n.SWIPE_UP), (c = document.createEvent("Event")) && c.initEvent(b, !0, !0), a.target.dispatchEvent(c), this.canSwipe = !1);
    }
  }
};
r.prototype.onTouchend = function(a) {
  this.isInMotion = !1;
  if (this.canTap) {
    var b = this.touches, c = a.changedTouches[0];
    if (20 < Math.abs(c.pageX - b[1]) || 20 < Math.abs(c.pageY - b[2])) {
      this.canTap = !1;
    } else {
      var d = (new Date).getTime() - this.touchStartTime, b = document.createEvent("Event"), d = 800 < d ? n.LONG_TAP : n.TAP;
      b && b.initEvent(d, !0, !0);
      b && (b.target = a.target);
      a = a.target;
      aa && (a = document.elementFromPoint(c.pageX - window.pageXOffset, c.pageY - window.pageYOffset));
      a.dispatchEvent(b);
    }
  }
};
m.default = r;
var t = {}, ba = Math.floor(2147483648 * Math.random());
t.default = function() {
  return (ba++).toString(36);
};
var u = {}, v = {}, w, ca = "click mouseover mouseout mousemove mousedown mouseup scroll keyup keypress focus touchstart touchmove touchend tap longtap doubletap press pan swipe swipeTop swipeRight swipeBottom swipeLeft".split(" ");
function x() {
  ca.forEach(function(a) {
    return document.body.addEventListener(a, da);
  });
  w = new m.default;
}
"complete" === document.readyState ? x() : document.addEventListener("DOMContentLoaded", x);
var ea = function() {
  var a = document.createElement("div");
  return function(b) {
    a.innerHTML = b.trim();
    return a.removeChild(a.firstChild);
  };
}();
function fa(a) {
  var b = a, c = [], d, e;
  if (e = b.getAttribute && b.getAttribute("data-comp")) {
    return e.split(",").forEach(function(a) {
      return c.push(v[a]);
    }), c;
  }
  e = [];
  do {
    if (d = v[b.id]) {
      c.push(d), e.push(b.id);
    }
  } while (b = b.parentNode);
  a.setAttribute("data-comp", e.join(","));
  return c;
}
function da(a) {
  a.targetEl = a.target;
  var b = fa(a.target), c = !1;
  do {
    if (c) {
      break;
    }
    for (var c = b, d = a, e = !1, f = 0;f < c.length;f++) {
      var h = c[f], p = h && h.events && h.events[d.type];
      if (p) {
        var q = Object.keys(p);
        if (!1 === ha(h, d, p, q)) {
          e = !0;
          break;
        }
      }
    }
    c = e;
  } while ((a.targetEl = a.targetEl.parentNode) && a.targetEl != document.body);
}
function ha(a, b, c, d) {
  var e = !0;
  d.forEach(function(d) {
    b.targetEl.matches && b.targetEl.matches(d) && (e = c[d].call(a, b, v[b.targetEl.id]));
  });
  return e;
}
u.default = {getUid:t.default, getComponent:function(a) {
  return v[a];
}, setComponent:function(a) {
  v[a.id] = a;
}, removeComponent:function(a) {
  delete v[a.id];
}, createElement:ea, get gestureHandler() {
  return w;
}};
/*
 EventEmitter2
 https://github.com/hij1nx/EventEmitter2

 Copyright (c) 2013 hij1nx
 Licensed under the MIT license.
*/
var y = {}, z = Array.isArray ? Array.isArray : function(a) {
  return "[object Array]" === Object.prototype.toString.call(a);
};
function B() {
  this._events = {};
  this._conf && C.call(this, this._conf);
}
function C(a) {
  a ? (this._conf = a, a.delimiter && (this.delimiter = a.delimiter), this._events.maxListeners = void 0 !== a.maxListeners ? a.maxListeners : 10, a.wildcard && (this.wildcard = a.wildcard), a.newListener && (this._events.newListener = a.newListener), a.verboseMemoryLeak && (this.verboseMemoryLeak = a.verboseMemoryLeak), this.wildcard && (this.listenerTree = {})) : this._events.maxListeners = 10;
}
function D(a, b) {
  this.verboseMemoryLeak ? console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit. Event name: %s.", a, b) : console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.", a);
  console.trace && console.trace();
}
function E(a) {
  this._events = {};
  this.verboseMemoryLeak = this.newListener = !1;
  C.call(this, a);
}
E.EventEmitter2 = E;
function F(a, b, c, d) {
  if (!c) {
    return [];
  }
  var e = [], f, h, p, q;
  p = b.length;
  q = b[d];
  var A = b[d + 1];
  if (d === p && c._listeners) {
    if ("function" === typeof c._listeners) {
      a && a.push(c._listeners);
    } else {
      for (b = 0, d = c._listeners.length;b < d;b++) {
        a && a.push(c._listeners[b]);
      }
    }
    return [c];
  }
  if ("*" === q || "**" === q || c[q]) {
    if ("*" === q) {
      for (f in c) {
        "_listeners" !== f && c.hasOwnProperty(f) && (e = e.concat(F(a, b, c[f], d + 1)));
      }
      return e;
    }
    if ("**" === q) {
      (q = d + 1 === p || d + 2 === p && "*" === A) && c._listeners && (e = e.concat(F(a, b, c, p)));
      for (f in c) {
        "_listeners" !== f && c.hasOwnProperty(f) && ("*" === f || "**" === f ? (c[f]._listeners && !q && (e = e.concat(F(a, b, c[f], p))), e = e.concat(F(a, b, c[f], d))) : e = f === A ? e.concat(F(a, b, c[f], d + 2)) : e.concat(F(a, b, c[f], d)));
      }
      return e;
    }
    e = e.concat(F(a, b, c[q], d + 1));
  }
  (h = c["*"]) && F(a, b, h, d + 1);
  if (c = c["**"]) {
    if (d < p) {
      for (f in c._listeners && F(a, b, c, p), c) {
        "_listeners" !== f && c.hasOwnProperty(f) && (f === A ? F(a, b, c[f], d + 2) : f === q ? F(a, b, c[f], d + 1) : (p = {}, p[f] = c[f], F(a, b, {"**":p}, d + 1)));
      }
    } else {
      c._listeners ? F(a, b, c, p) : c["*"] && c["*"]._listeners && F(a, b, c["*"], p);
    }
  }
  return e;
}
E.prototype.delimiter = ".";
k.exportProperty(E.prototype, "delimiter", E.prototype.delimiter);
E.prototype.setMaxListeners = function(a) {
  void 0 !== a && (this._events || B.call(this), this._events.maxListeners = a, this._conf || (this._conf = {}), this._conf.maxListeners = a);
};
k.exportProperty(E.prototype, "setMaxListeners", E.prototype.setMaxListeners);
E.prototype.event = "";
k.exportProperty(E.prototype, "event", E.prototype.event);
E.prototype.once = function(a, b) {
  this.many(a, 1, b);
  return this;
};
k.exportProperty(E.prototype, "once", E.prototype.once);
E.prototype.many = function(a, b, c) {
  function d() {
    0 === --b && e.off(a, d);
    c.apply(this, arguments);
  }
  var e = this;
  if ("function" !== typeof c) {
    throw Error("many only accepts instances of Function");
  }
  d._origin = c;
  this.on(a, d);
  return e;
};
k.exportProperty(E.prototype, "many", E.prototype.many);
E.prototype.emit = function(a) {
  this._events || B.call(this);
  var b = arguments[0];
  if ("newListener" === b && !this.newListener && !this._events.newListener) {
    return !1;
  }
  var c = arguments.length, d, e, f, h;
  if (this._all && this._all.length) {
    h = this._all.slice();
    if (3 < c) {
      for (d = Array(c), e = 0;e < c;e++) {
        d[e] = arguments[e];
      }
    }
    f = 0;
    for (e = h.length;f < e;f++) {
      switch(this.event = b, c) {
        case 1:
          h[f].call(this, b);
          break;
        case 2:
          h[f].call(this, b, arguments[1]);
          break;
        case 3:
          h[f].call(this, b, arguments[1], arguments[2]);
          break;
        default:
          h[f].apply(this, d);
      }
    }
  }
  if (this.wildcard) {
    h = [], e = "string" === typeof b ? b.split(this.delimiter) : b.slice(), F.call(this, h, e, this.listenerTree, 0);
  } else {
    h = this._events[b];
    if ("function" === typeof h) {
      this.event = b;
      switch(c) {
        case 1:
          h.call(this);
          break;
        case 2:
          h.call(this, arguments[1]);
          break;
        case 3:
          h.call(this, arguments[1], arguments[2]);
          break;
        default:
          d = Array(c - 1);
          for (e = 1;e < c;e++) {
            d[e - 1] = arguments[e];
          }
          h.apply(this, d);
      }
      return !0;
    }
    h && (h = h.slice());
  }
  if (h && h.length) {
    if (3 < c) {
      for (d = Array(c - 1), e = 1;e < c;e++) {
        d[e - 1] = arguments[e];
      }
    }
    f = 0;
    for (e = h.length;f < e;f++) {
      switch(this.event = b, c) {
        case 1:
          h[f].call(this);
          break;
        case 2:
          h[f].call(this, arguments[1]);
          break;
        case 3:
          h[f].call(this, arguments[1], arguments[2]);
          break;
        default:
          h[f].apply(this, d);
      }
    }
    return !0;
  }
  if (!this._all && "error" === b) {
    if (arguments[1] instanceof Error) {
      throw arguments[1];
    }
    throw Error("Uncaught, unspecified 'error' event.");
  }
  return !!this._all;
};
E.prototype.emitAsync = function() {
  this._events || B.call(this);
  var a = arguments[0];
  if ("newListener" === a && !this.newListener && !this._events.newListener) {
    return Promise.resolve([!1]);
  }
  var b = [], c = arguments.length, d, e, f, h;
  if (this._all) {
    if (3 < c) {
      for (d = Array(c), e = 1;e < c;e++) {
        d[e] = arguments[e];
      }
    }
    f = 0;
    for (e = this._all.length;f < e;f++) {
      switch(this.event = a, c) {
        case 1:
          b.push(this._all[f].call(this, a));
          break;
        case 2:
          b.push(this._all[f].call(this, a, arguments[1]));
          break;
        case 3:
          b.push(this._all[f].call(this, a, arguments[1], arguments[2]));
          break;
        default:
          b.push(this._all[f].apply(this, d));
      }
    }
  }
  this.wildcard ? (h = [], e = "string" === typeof a ? a.split(this.delimiter) : a.slice(), F.call(this, h, e, this.listenerTree, 0)) : h = this._events[a];
  if ("function" === typeof h) {
    switch(this.event = a, c) {
      case 1:
        b.push(h.call(this));
        break;
      case 2:
        b.push(h.call(this, arguments[1]));
        break;
      case 3:
        b.push(h.call(this, arguments[1], arguments[2]));
        break;
      default:
        d = Array(c - 1);
        for (e = 1;e < c;e++) {
          d[e - 1] = arguments[e];
        }
        b.push(h.apply(this, d));
    }
  } else {
    if (h && h.length) {
      if (3 < c) {
        for (d = Array(c - 1), e = 1;e < c;e++) {
          d[e - 1] = arguments[e];
        }
      }
      f = 0;
      for (e = h.length;f < e;f++) {
        switch(this.event = a, c) {
          case 1:
            b.push(h[f].call(this));
            break;
          case 2:
            b.push(h[f].call(this, arguments[1]));
            break;
          case 3:
            b.push(h[f].call(this, arguments[1], arguments[2]));
            break;
          default:
            b.push(h[f].apply(this, d));
        }
      }
    } else {
      if (!this._all && "error" === a) {
        return arguments[1] instanceof Error ? Promise.reject(arguments[1]) : Promise.reject("Uncaught, unspecified 'error' event.");
      }
    }
  }
  return Promise.all(b);
};
k.exportProperty(E.prototype, "emitAsync", E.prototype.emitAsync);
E.prototype.on = function(a, b) {
  if ("function" === typeof a) {
    return this.onAny(a), this;
  }
  if ("function" !== typeof b) {
    throw Error("on only accepts instances of Function");
  }
  this._events || B.call(this);
  this.emit("newListener", a, b);
  if (this.wildcard) {
    a: {
      a = "string" === typeof a ? a.split(this.delimiter) : a.slice();
      for (var c = 0, d = a.length;c + 1 < d;c++) {
        if ("**" === a[c] && "**" === a[c + 1]) {
          break a;
        }
      }
      c = this.listenerTree;
      for (d = a.shift();void 0 !== d;) {
        c[d] || (c[d] = {});
        c = c[d];
        if (0 === a.length) {
          c._listeners ? ("function" === typeof c._listeners && (c._listeners = [c._listeners]), c._listeners.push(b), !c._listeners.warned && 0 < this._events.maxListeners && c._listeners.length > this._events.maxListeners && (c._listeners.warned = !0, D.call(this, c._listeners.length, d))) : c._listeners = b;
          break a;
        }
        d = a.shift();
      }
    }
    return this;
  }
  this._events[a] ? ("function" === typeof this._events[a] && (this._events[a] = [this._events[a]]), this._events[a].push(b), !this._events[a].warned && 0 < this._events.maxListeners && this._events[a].length > this._events.maxListeners && (this._events[a].warned = !0, D.call(this, this._events[a].length, a))) : this._events[a] = b;
  return this;
};
k.exportProperty(E.prototype, "on", E.prototype.on);
E.prototype.onAny = function(a) {
  if ("function" !== typeof a) {
    throw Error("onAny only accepts instances of Function");
  }
  this._all || (this._all = []);
  this._all.push(a);
  return this;
};
k.exportProperty(E.prototype, "onAny", E.prototype.onAny);
E.prototype.addListener = E.prototype.on;
k.exportProperty(E.prototype, "addListener", E.prototype.addListener);
E.prototype.off = function(a, b) {
  function c(a) {
    if (void 0 !== a) {
      var b = Object.keys(a), d;
      for (d in b) {
        var e = b[+d], f = a[e];
        f instanceof Function || "object" !== typeof f || null === f || (0 < Object.keys(f).length && c(a[e]), 0 === Object.keys(f).length && delete a[e]);
      }
    }
  }
  if ("function" !== typeof b) {
    throw Error("removeListener only takes instances of Function");
  }
  var d, e = [];
  if (this.wildcard) {
    d = "string" === typeof a ? a.split(this.delimiter) : a.slice(), e = F.call(this, null, d, this.listenerTree, 0);
  } else {
    if (!this._events[a]) {
      return this;
    }
    d = this._events[a];
    e.push({_listeners:d});
  }
  for (var f = 0;f < e.length;f++) {
    var h = e[f];
    d = h._listeners;
    if (z(d)) {
      for (var p = -1, q = 0, A = d.length;q < A;q++) {
        if (d[q] === b || d[q].listener && d[q].listener === b || d[q]._origin && d[q]._origin === b) {
          p = q;
          break;
        }
      }
      if (0 > p) {
        continue;
      }
      this.wildcard ? h._listeners.splice(p, 1) : this._events[a].splice(p, 1);
      0 === d.length && (this.wildcard ? delete h._listeners : delete this._events[a]);
      this.emit("removeListener", a, b);
      return this;
    }
    if (d === b || d.listener && d.listener === b || d._origin && d._origin === b) {
      this.wildcard ? delete h._listeners : delete this._events[a], this.emit("removeListener", a, b);
    }
  }
  c(this.listenerTree);
  return this;
};
k.exportProperty(E.prototype, "off", E.prototype.off);
E.prototype.offAny = function(a) {
  var b, c, d;
  if (a && this._all && 0 < this._all.length) {
    for (d = this._all, b = 0, c = d.length;b < c;b++) {
      if (a === d[b]) {
        d.splice(b, 1);
        this.emit("removeListenerAny", a);
        break;
      }
    }
  } else {
    d = this._all;
    b = 0;
    for (c = d.length;b < c;b++) {
      this.emit("removeListenerAny", d[b]);
    }
    this._all = [];
  }
  return this;
};
k.exportProperty(E.prototype, "offAny", E.prototype.offAny);
E.prototype.removeListener = E.prototype.off;
k.exportProperty(E.prototype, "removeListener", E.prototype.removeListener);
E.prototype.removeAllListeners = function(a) {
  if (0 === arguments.length) {
    return !this._events || B.call(this), this;
  }
  if (this.wildcard) {
    for (var b = "string" === typeof a ? a.split(this.delimiter) : a && a.slice(), b = F.call(this, null, b, this.listenerTree, 0), c = 0;c < b.length;c++) {
      b[c]._listeners = null;
    }
  } else {
    this._events && (this._events[a] = null);
  }
  return this;
};
k.exportProperty(E.prototype, "removeAllListeners", E.prototype.removeAllListeners);
E.prototype.listeners = function(a) {
  if (this.wildcard) {
    var b = [];
    a = "string" === typeof a ? a.split(this.delimiter) : a.slice();
    F.call(this, b, a, this.listenerTree, 0);
    return b;
  }
  this._events || B.call(this);
  this._events[a] || (this._events[a] = []);
  z(this._events[a]) || (this._events[a] = [this._events[a]]);
  return this._events[a];
};
k.exportProperty(E.prototype, "listeners", E.prototype.listeners);
E.prototype.listenerCount = function(a) {
  return this.listeners(a).length;
};
k.exportProperty(E.prototype, "listenerCount", E.prototype.listenerCount);
E.prototype.listenersAny = function() {
  return this._all ? this._all : [];
};
k.exportProperty(E.prototype, "listenersAny", E.prototype.listenersAny);
y.default = E;
var G = {};
function H() {
  y.default.call(this, {maxListeners:Infinity});
  this.id_ = u.default.getUid();
  this.template_ = this.element_ = null;
  u.default.setComponent(this);
}
g.inherits(H, y.default);
H.prototype.toString = function() {
  if (this.template_) {
    return this.template_;
  }
  var a = /^(<[^>]+)/, b = this.template().trim();
  if (!b.match(a)) {
    throw Error("Template needs to start with a valid tag.");
  }
  return this.template_ = b = b.replace(/\s+/, " ").replace(a, '$1 id="' + this.id + '"');
};
k.exportProperty(H.prototype, "toString", H.prototype.toString);
H.prototype.$$ = function(a) {
  var b = [], c = this.el;
  c && (b = [].concat(g.arrayFromIterable(c.querySelectorAll(a))));
  return b;
};
k.exportProperty(H.prototype, "$$", H.prototype.$$);
H.prototype.$ = function(a) {
  var b = null, c = this.el;
  c && (b = void 0 == a ? c : c.querySelector(a));
  return b;
};
k.exportProperty(H.prototype, "$", H.prototype.$);
H.prototype.render = function(a, b) {
  a && a.insertBefore(this.el, a.children[b ? b : a.children.length - 1] || null);
};
k.exportProperty(H.prototype, "render", H.prototype.render);
H.prototype.template = function() {
  return "<div></div>";
};
k.exportProperty(H.prototype, "template", H.prototype.template);
H.prototype.dispose = function() {
  u.default.removeComponent(this);
  this.removeAllListeners();
  this.element_ && this.element_.parentNode && this.element_.parentNode.removeChild(this.element_);
  this.element_ = null;
};
k.exportProperty(H.prototype, "dispose", H.prototype.dispose);
g.global.Object.defineProperties(H.prototype, {id:{configurable:!0, enumerable:!0, get:function() {
  return this.id_;
}}, el:{configurable:!0, enumerable:!0, get:function() {
  var a = this.element_;
  a || (a = this.element_ = document.getElementById(this.id) || u.default.createElement(this.toString()));
  return a;
}}});
G.default = H;
var I = {};
function J() {
  G.default.call(this);
  this.rendered = !1;
}
g.inherits(J, G.default);
J.prototype.render = function(a, b) {
  a = void 0 === a ? document.body : a;
  b = void 0 === b ? 0 : b;
  this.onBeforeRender();
  this.rendered = !0;
  this.index = b;
  G.default.prototype.render.call(this, a);
  this.el.style.zIndex = this.index;
  this.onAfterRender();
};
k.exportProperty(J.prototype, "render", J.prototype.render);
J.prototype.onBeforeRender = function() {
};
k.exportProperty(J.prototype, "onBeforeRender", J.prototype.onBeforeRender);
J.prototype.onAfterRender = function() {
};
k.exportProperty(J.prototype, "onAfterRender", J.prototype.onAfterRender);
J.prototype.onActivation = function() {
};
k.exportProperty(J.prototype, "onActivation", J.prototype.onActivation);
J.prototype.template = function() {
  return "\n<view " + (this.className ? 'class="' + this.className + '"' : "") + '\n    style="transform: translate3d(100%, 0, ' + this.index + 'px)">\n    ' + this.template_content() + "\n</view>";
};
k.exportProperty(J.prototype, "template", J.prototype.template);
J.prototype.template_content = function() {
  return "";
};
k.exportProperty(J.prototype, "template_content", J.prototype.template_content);
g.global.Object.defineProperties(J, {WIDTH:{configurable:!0, enumerable:!0, get:function() {
  if (!J.width_) {
    var a = window.getComputedStyle(document.body, null), a = parseInt(a && a.width || 0, 10);
    J.width_ = a;
  }
  return J.width_;
}}});
J.prototype.index = 0;
k.exportProperty(J.prototype, "index", J.prototype.index);
J.prototype.supportsBackGesture = !0;
k.exportProperty(J.prototype, "supportsBackGesture", J.prototype.supportsBackGesture);
J.prototype.hasSidebar = !1;
k.exportProperty(J.prototype, "hasSidebar", J.prototype.hasSidebar);
J.prototype.className = "";
k.exportProperty(J.prototype, "className", J.prototype.className);
I.default = J;
var K = {};
function L(a) {
  this.history = [];
  this.lastTouches = [];
  this.state = L.State.DEFAULT;
  this.rootEl = a || document.body;
  this.currentView = null;
  this.initTouchEvents_();
  this.firstX = this.hideSidebarTimeout = null;
}
L.prototype.getLastViewInHistory = function() {
  return this.history[this.history.length - 1];
};
L.prototype.pull = function(a, b) {
  a.rendered || a.render(this.rootEl, this.topIndex += 2);
  var c = this.currentView;
  if (!c) {
    return this.setCurrentView(a);
  }
  if (b) {
    this.history.push(c);
    var d = function() {
      c.el.style.transitionDuration = "0s";
      c.el.style.transform = "translate3d(-100%,-100%,0)";
      c.el.removeEventListener("transitionend", d);
    };
    c.el.addEventListener("transitionend", d);
  } else {
    var e = this.history.slice(0);
    this.history = [];
    setTimeout(function() {
      c.dispose();
      e.forEach(function(a) {
        return a.dispose();
      });
    }, 1000);
  }
  setTimeout(function() {
    c.el.style.transitionDuration = "0.35s";
    a.el.style.transform = "translate3d(0, 0, " + a.index + "px)";
    c.el.style.transform = "translate3d(-30%, 0, " + c.index + "px)";
    a.el.style.boxShadow = "0 0 24px black";
  }, 50);
  this.currentView = a;
  this.state = L.State.DEFAULT;
};
k.exportProperty(L.prototype, "pull", L.prototype.pull);
L.prototype.canGoBack = function() {
  return this.history && 0 < this.history.length;
};
k.exportProperty(L.prototype, "canGoBack", L.prototype.canGoBack);
L.prototype.push = function() {
  var a = this.history.pop(), b = this.currentView;
  a && (window.requestAnimationFrame(function() {
    a.el.style.transitionDuration = "0s";
    a.el.style.transform = "translate3d(-30%,0,0)";
    window.requestAnimationFrame(function() {
      a.el.style.transitionDuration = "0.35s";
      b.el.style.transitionDuration = "0.35s";
      a.el.style.transform = "translate3d(0, 0, " + a.index + "px)";
      b.el.style.transform = "translate3d(100%, 0, " + b.index + "px)";
      b.el.style.boxShadow = "0 0 0 black";
    });
  }), this.currentView = a, a.onActivation && a.onActivation(), setTimeout(function() {
    return b.dispose();
  }, 1000), this.state = L.State.DEFAULT);
};
k.exportProperty(L.prototype, "push", L.prototype.push);
L.prototype.setCurrentView = function(a, b) {
  a.rendered || a.render(this.rootEl, this.topIndex += 2);
  var c = this.currentView;
  b ? c && (c.el.style.transitionDuration = "0s", c.el.style.transform = "translate3d(100%, 0, " + c.index + "px)") : setTimeout(function() {
    return c && c.dispose();
  }, 1000);
  a.index = this.topIndex += 2;
  this.currentView = a;
  this.currentView.onActivation && this.currentView.onActivation();
  this.history.forEach(function(a) {
    return a.dispose();
  });
  this.history = [];
  b = "translate3d(0, 0, " + a.index + "px)";
  a.el.style.transitionDuration = "0s";
  this.state == L.State.SIDEBAR_OPEN ? (b = "translate3d(" + (128 - I.default.WIDTH) + "px, 0, " + a.index + "px)", a.el.style.transform = b, this.toggleSidebar_(!1)) : (a.el.style.transform = b, this.state = L.State.DEFAULT);
};
k.exportProperty(L.prototype, "setCurrentView", L.prototype.setCurrentView);
L.prototype.toggleSidebar = function() {
  this.toggleSidebar_(this.state == L.State.DEFAULT);
};
k.exportProperty(L.prototype, "toggleSidebar", L.prototype.toggleSidebar);
L.prototype.initTouchEvents_ = function() {
  this.rootEl.addEventListener("touchmove", this.onTouchMove_.bind(this), !1);
  this.rootEl.addEventListener("touchend", this.onTouchEnd_.bind(this), !1);
};
L.prototype.onTouchMove_ = function(a) {
  var b = a.changedTouches && a.changedTouches[0].clientX || 0;
  clearTimeout(this.hideSidebarTimeout);
  if (this.state == L.State.DEFAULT || this.state == L.State.SIDEBAR_OPEN) {
    this.firstX = b;
  }
  this.state == L.State.DEFAULT && (this.lastTouches = [], this.state = L.State.STARTED_GESTURE);
  this.state == L.State.STARTED_GESTURE && (50 >= b ? this.history.length && this.currentView && this.currentView.supportsBackGesture && (this.state = L.State.GOING_TO_BACK_VIEW) : this.currentView && this.currentView.hasSidebar && (this.lastTouches.push(this.firstX - b), 4 == this.lastTouches.length && this.lastTouches.shift(), 40 < this.lastTouches[2] - this.lastTouches[0] && (this.state = L.State.OPENING_SIDEBAR)));
  this.state == L.State.SIDEBAR_OPEN && (this.state = L.State.CLOSING_SIDEBAR);
  switch(this.state) {
    case L.State.GOING_TO_BACK_VIEW:
      this.backGestureTouchMove_(a);
      break;
    case L.State.CLOSING_SIDEBAR:
      this.closeSidebarTouchMove_(a);
      break;
    case L.State.OPENING_SIDEBAR:
      this.openSidebarTouchMove_(a);
  }
};
L.prototype.onTouchEnd_ = function(a) {
  switch(this.state) {
    case L.State.GOING_TO_BACK_VIEW:
      this.backGestureTouchEnd_(a);
      break;
    case L.State.OPENING_SIDEBAR:
      a = !0;
      3 > this.lastTouches[2] - this.lastTouches[0] && (a = !1);
      this.toggleSidebar_(a);
      break;
    case L.State.CLOSING_SIDEBAR:
      a = !0;
      -3 > this.lastTouches[2] - this.lastTouches[0] && (a = !1);
      this.toggleSidebar_(a);
      break;
    case L.State.SIDEBAR_OPEN:
      if (u.default.gestureHandler.canTap) {
        break;
      }
      this.toggleSidebar_(!1);
      break;
    default:
      this.state = L.State.DEFAULT;
  }
};
L.prototype.backGestureTouchEnd_ = function(a) {
  var b = this;
  if (this.firstX) {
    var c = this.history, d = this.getLastViewInHistory(), e = this.currentView, f = a.changedTouches && a.changedTouches[0].clientX || 0, h = l.default.lerp(0.15, 0.35, (I.default.WIDTH - f) / I.default.WIDTH);
    window.requestAnimationFrame(function() {
      e.el.style.transitionDuration = h + "s";
      d.el.style.transitionDuration = h + "s";
      var a = "100%", q = "0";
      if (f < I.default.WIDTH / 2) {
        var a = "0", q = "-30%", A = function() {
          d.el.style.transitionDuration = "0s";
          d.el.style.transform = "translate3d(-100%,-100%,0)";
          d.el.removeEventListener("transitionend", A);
        };
        d.el.addEventListener("transitionend", A);
      } else {
        b.currentView = b.getLastViewInHistory(), c.pop(), d.onActivation && d.onActivation(), setTimeout(function() {
          e.dispose();
        }, 1000);
      }
      e.el.style.transform = "translate3d(" + a + ", 0, " + e.index + "px)";
      d.el.style.transform = "translate3d(" + q + ", 0, " + (e.index - 1) + "px)";
      e.el.style.boxShadow = "0px 0 0px black";
    });
    this.state = L.State.DEFAULT;
  }
};
L.prototype.backGestureTouchMove_ = function(a) {
  if (this.history.length) {
    a.preventDefault();
    var b = this.history[this.history.length - 1], c = this.currentView, d = (a.changedTouches && a.changedTouches[0].clientX || 0) - this.firstX;
    a = I.default.WIDTH;
    var e = Math.floor(l.default.lerp(0.3 * -a, 0, d / (a - this.firstX))), f = Math.floor(5 * l.default.lerp(1, 0, d / (a - this.firstX))) / 5;
    0 > d || window.requestAnimationFrame(function() {
      c.el.style.transitionDuration = "0s";
      b.el.style.transitionDuration = "0s";
      c.el.style.transform = "translate3d(" + d + "px, 0, " + c.index + "px)";
      b.el.style.transform = "translate3d(" + e + "px, 0, " + (c.index - 1) + "px)";
      c.el.style.boxShadow = "0px 0 24px rgba(0, 0, 0, " + f + ")";
    });
  }
};
L.prototype.closeSidebarTouchMove_ = function(a) {
  var b = a.changedTouches && a.changedTouches[0].clientX || 0;
  this.lastTouches.push(this.firstX - b);
  4 == this.lastTouches.length && this.lastTouches.shift();
  a.preventDefault();
  var c = this.currentView, d = b - this.firstX - 4 * I.default.WIDTH / 5;
  window.requestAnimationFrame(function() {
    c.el.style.transitionDuration = "0s";
    c.el.style.transform = "translate3d(" + d + "px, 0, " + c.index + "px)";
  });
};
L.prototype.toggleSidebar_ = function(a) {
  var b = this, c = this.currentView, d = document.querySelector("sidebar");
  setTimeout(function() {
    c.el.style.transitionDuration = "0.35s";
    var e = 128 - I.default.WIDTH + "px", f = "0", h = c.index - 1 + "px";
    a ? d.style.transform = "translate3d(" + f + ", 0, " + h + ")" : (e = "0", f = "100%", h = 0, b.hideSidebarTimeout = setTimeout(function() {
      b.state == L.State.DEFAULT && (d.style.transform = "translate3d(" + f + ", 0, " + h + ")");
    }, 1000));
    c.el.style.transform = "translate3d(" + e + ", 0, " + c.index + "px)";
  }, 10);
  this.state = a ? L.State.SIDEBAR_OPEN : L.State.DEFAULT;
};
L.prototype.openSidebarTouchMove_ = function(a) {
  if (!u.default.gestureHandler.canTap) {
    var b = a.changedTouches && a.changedTouches[0].clientX || 0;
    this.lastTouches.push(this.firstX - b);
    4 == this.lastTouches.length && this.lastTouches.shift();
    a.preventDefault();
    var c = document.querySelector("sidebar"), d = this.currentView, e = b - this.firstX;
    0 <= e || (this.state = L.State.OPENING_SIDEBAR, window.requestAnimationFrame(function() {
      c.style.transform = "translate3d(0, 0, " + (d.index - 1) + "px)";
      c.style.transitionDuration = "0s";
      d.el.style.transitionDuration = "0s";
      d.el.style.transform = "translate3d(" + e + "px, 0, " + d.index + "px)";
    }));
  }
};
g.global.Object.defineProperties(L, {State:{configurable:!0, enumerable:!0, get:function() {
  return {DEFAULT:"default", STARTED_GESTURE:"started", CLOSING_SIDEBAR:"closingSidebar", OPENING_SIDEBAR:"openingSidebar", SIDEBAR_OPEN:"sidebarOpen", GOING_TO_BACK_VIEW:"going"};
}}});
L.prototype.topIndex = 1;
k.exportProperty(L.prototype, "topIndex", L.prototype.topIndex);
window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(a) {
  window.setTimeout(a, 1000 / 60);
};
K.default = L;
var M = {}, N = {en:{__name:"English"}}, O = N.en;
function P(a, b) {
  N[a] = b;
}
k.exportSymbol("setDictionary$$module$$src$lib$locale", P);
function Q(a) {
  O = N[a];
}
k.exportSymbol("setLanguage$$module$$src$lib$locale", Q);
function R(a, b) {
  for (var c = [], d = 1;d < arguments.length;++d) {
    c[d - 1] = arguments[d];
  }
  return (O[a] || a).replace(/{(\d+)}/g, function(a, b) {
    return "undefined" != typeof c[b] ? c[b] : a;
  });
}
k.exportSymbol("getLocalizedString$$module$$src$lib$locale", R);
M.default = {setDictionary:P, setLanguage:Q, getLocalizedString:R, __:R};
var S = {};
function T() {
  G.default.call(this);
  this.vm = null;
}
g.inherits(T, G.default);
T.prototype.onSidebarItemTap = function(a) {
  if (a = a.targetEl && a.targetEl.getAttribute && a.targetEl.getAttribute("data-view")) {
    this.emit(T.EventType.SWITCH_VIEW, {view:a}), this.vm && this.vm.toggleSidebar();
  }
};
k.exportProperty(T.prototype, "onSidebarItemTap", T.prototype.onSidebarItemTap);
T.prototype.template = function() {
  return "\n<sidebar>\n    <sidebar-items>" + this.template_items() + "</sidebar-items>\n</sidebar>\n";
};
k.exportProperty(T.prototype, "template", T.prototype.template);
T.prototype.template_items = function() {
  return "";
};
k.exportProperty(T.prototype, "template_items", T.prototype.template_items);
g.global.Object.defineProperties(T.prototype, {mappings:{configurable:!0, enumerable:!0, get:function() {
  return {ITEM:"sidebar-item"};
}}, events:{configurable:!0, enumerable:!0, get:function() {
  var a = {};
  return {tap:(a[this.mappings.ITEM] = this.onSidebarItemTap, a)};
}}});
g.global.Object.defineProperties(T, {EventType:{configurable:!0, enumerable:!0, get:function() {
  return {SWITCH_VIEW:"switchView"};
}}});
S.default = T;
var ia = {};
function U() {
  I.default.call(this);
  this.vm = null;
  this.views = [];
}
g.inherits(U, I.default);
U.width_ = I.default.width_;
U.prototype.onAfterRender = function() {
  this.vm = new K.default(this.el);
};
k.exportProperty(U.prototype, "onAfterRender", U.prototype.onAfterRender);
U.prototype.onItemTap = function(a) {
  var b = this.$(this.mappings.ACTIVE);
  b && b == a.targetEl || (b = this.$(this.mappings.ITEMS), a = [].indexOf.call(b && b.children, a.targetEl), this.activateItem(a));
};
k.exportProperty(U.prototype, "onItemTap", U.prototype.onItemTap);
U.prototype.activateItem = function(a) {
  if (-1 != a) {
    this.deactivateActiveItem();
    var b = this.$$(this.mappings.ITEM)[a];
    b && b.classList.add("active");
    this.views && this.views[a] && this.vm.setCurrentView(this.views[a], !0);
  }
};
k.exportProperty(U.prototype, "activateItem", U.prototype.activateItem);
U.prototype.activateItemByName = function(a) {
  if (a = this.$(this.mappings.ITEM + "[data-view=" + a + "]")) {
    var b = this.$(this.mappings.ITEMS);
    a = [].indexOf.call(b && b.children, a);
    this.activateItem(a);
  }
};
k.exportProperty(U.prototype, "activateItemByName", U.prototype.activateItemByName);
U.prototype.deactivateActiveItem = function() {
  var a = this.$(this.mappings.ACTIVE);
  a && a.classList.remove("active");
};
k.exportProperty(U.prototype, "deactivateActiveItem", U.prototype.deactivateActiveItem);
U.prototype.template_content = function() {
  return "\n        " + this.template_views() + "\n<tab-bar>\n    <tab-items>\n        " + this.template_items() + "\n    </tab-items>\n</tab-bar>\n";
};
k.exportProperty(U.prototype, "template_content", U.prototype.template_content);
U.prototype.template_views = function() {
  return this.views.join("");
};
U.prototype.template_items = function() {
  return "";
};
k.exportProperty(U.prototype, "template_items", U.prototype.template_items);
g.global.Object.defineProperties(U.prototype, {mappings:{configurable:!0, enumerable:!0, get:function() {
  return {ITEM:"tab-item", ITEMS:"tab-items", ACTIVE:".active"};
}}, events:{configurable:!0, enumerable:!0, get:function() {
  var a = {};
  return {touchend:(a[this.mappings.ITEM] = this.onItemTap.bind(this), a)};
}}});
ia.default = U;
var ja = {};
function V(a) {
  a = void 0 === a ? {hasBackButton:!1, hasMenuButton:!1, title:""} : a;
  G.default.call(this);
  this.vm = null;
  this.config = a;
  this.hasBackButton = this.config.hasBackButton;
  this.hasMenuButton = this.config.hasMenuButton;
}
g.inherits(V, G.default);
V.prototype.onBackButtonTap = function() {
  this.vm.push();
};
V.prototype.onMenuButtonTap = function() {
  if (this.menuButtonHandler) {
    return this.menuButtonHandler();
  }
  this.vm.toggleSidebar();
};
V.prototype.template = function() {
  var a = "", b = "";
  this.hasBackButton && (a = "<back-button></back-button>");
  this.hasMenuButton && (b = "<menu-button></menu-button>");
  return "\n<nav-bar>" + a + b + (this.config.title || "") + "</nav-bar>\n";
};
g.global.Object.defineProperties(V.prototype, {mappings:{configurable:!0, enumerable:!0, get:function() {
  return {BACK_BUTTON:"back-button", MENU_BUTTON:"menu-button"};
}}, events:{configurable:!0, enumerable:!0, get:function() {
  var a = {};
  return {tap:(a[this.mappings.BACK_BUTTON] = this.onBackButtonTap, a[this.mappings.MENU_BUTTON] = this.onMenuButtonTap, a)};
}}});
ja.default = V;
var ka = {};
function W() {
  y.default.call(this, {maxListeners:Infinity});
  this.reset();
  this.state_ = this.State.DEFAULT;
}
g.inherits(W, y.default);
W.prototype.reset = function() {
  this.state_ = this.State.DEFAULT;
};
W.prototype.triggerShouldCheckState = function() {
  this.state_ != this.State.REFRESHING && (this.state_ = this.State.SHOULD_CHECK);
};
W.prototype.shouldCheck = function() {
  return this.state_ == this.State.SHOULD_CHECK;
};
W.prototype.refresh = function() {
  this.shouldCheck() && (this.state_ = this.State.REFRESHING, this.emit(this.EventType.SHOULD_REFRESH));
};
g.global.Object.defineProperties(W.prototype, {State:{configurable:!0, enumerable:!0, get:function() {
  return {DEFAULT:"default", SHOULD_CHECK:"shouldCheck", REFRESHING:"refreshing"};
}}, EventType:{configurable:!0, enumerable:!0, get:function() {
  return {SHOULD_REFRESH:"refresh"};
}}});
ka.default = W;
var la = {};
function X(a) {
  G.default.call(this);
  this.model = new ka.default;
  this.EventType = this.model.EventType;
  this.releaseListener_ = this.scrollListener_ = this.containerEl = this.scrollEl = null;
  a && this.register(a);
  this.bindModelEvents();
}
g.inherits(X, G.default);
X.prototype.bindModelEvents = function() {
  this.model.on(this.model.EventType.SHOULD_REFRESH, this.onShouldRefresh.bind(this));
};
X.prototype.onShouldRefresh = function() {
  var a = this, b = this.$(this.mappings.SPINNER), c = this.$(this.mappings.ARROW);
  window.requestAnimationFrame(function() {
    a.containerEl.style.transform = "translateY(" + a.height + "px)";
    a.containerEl.style.transition = "800ms cubic-bezier(.41,1,.1,1)";
    b && (b.style.visibility = "visible");
    c && (c.style.visibility = "hidden");
    a.emit(a.model.EventType.SHOULD_REFRESH);
  });
};
X.prototype.render = function(a, b) {
  G.default.prototype.render.call(this, a, b);
  this.scrollEl || this.register(this.el.parentElement);
};
X.prototype.reset = function() {
  this.scrollEl && (this.containerEl.style.transform = "translateY(0)", this.containerEl.style.transition = "300ms ease-out");
  var a = this.$(this.mappings.SPINNER), b = this.$(this.mappings.ARROW);
  a && (a.style.visibility = "hidden");
  setTimeout(function() {
    b && (b.style.visibility = "visible");
  }, 500);
  this.model.reset();
};
X.prototype.register = function(a, b) {
  a && (this.scrollListener_ && this.scrollEl.removeEventListener("scroll", this.scrollListener_), this.releaseListener_ && document.body.removeEventListener("touchend", this.releaseListener_), this.scrollEl = a, this.containerEl = b ? b : a, this.reset(), this.scrollListener_ = this.onScroll_.bind(this), this.releaseListener_ = this.onRelease_.bind(this), this.scrollEl.addEventListener("scroll", this.scrollListener_), document.body.addEventListener("touchend", this.releaseListener_));
};
X.prototype.onScroll_ = function(a) {
  this.checkShouldRefresh();
  var b = 0, c = -(a.target && a.target.scrollTop || 0);
  a = this.arrowOffset + Math.pow(c, 0.75);
  var d = this.threshold - 60;
  c >= d && (b = Math.min(180, 3 * (c - d)));
  if (c = this.$(this.mappings.ARROW)) {
    c.style.transform = "translateY(" + a + "px) rotate(" + b + "deg)";
  }
};
X.prototype.onRelease_ = function() {
  this.scrollEl.scrollTop < -this.threshold && this.model.refresh();
};
X.prototype.checkShouldRefresh = function() {
  this.model.triggerShouldCheckState();
};
X.prototype.template = function() {
  return "\n<pull-to-refresh>\n    <pull-to-refresh-arrow></pull-to-refresh-arrow>\n    <pull-to-refresh-spinner></pull-to-refresh-spinner>\n</pull-to-refresh>\n";
};
X.prototype.dispose = function() {
  this.model.dispose();
  this.el && this.el.removeEventListener("scroll", this.scrollListener_);
  document.body.removeEventListener("touchend", this.releaseListener_);
  G.default.prototype.dispose.call(this);
};
g.global.Object.defineProperties(X.prototype, {mappings:{configurable:!0, enumerable:!0, get:function() {
  return {ARROW:"pull-to-refresh-arrow", SPINNER:"pull-to-refresh-spinner"};
}}});
X.prototype.threshold = 135;
X.prototype.height = 96;
X.prototype.arrowOffset = 0;
la.default = X;
var ma = {};
function Y() {
  y.default.call(this, {maxListeners:Infinity});
  this.state_ = this.State.DEFAULT;
}
g.inherits(Y, y.default);
Y.prototype.reset = function() {
  this.state_ = this.State.DEFAULT;
};
Y.prototype.triggerShouldCheckState = function() {
  this.state_ != this.State.LOADING && (this.state_ = this.State.SHOULD_CHECK);
};
Y.prototype.shouldCheck = function() {
  return this.state_ == this.State.SHOULD_CHECK;
};
Y.prototype.load = function() {
  this.shouldCheck() && (this.state_ = this.State.LOADING, this.emit(this.EventType.SHOULD_LOAD));
};
g.global.Object.defineProperties(Y.prototype, {State:{configurable:!0, enumerable:!0, get:function() {
  return {DEFAULT:"default", SHOULD_CHECK:"shouldCheck", LOADING:"loading"};
}}, EventType:{configurable:!0, enumerable:!0, get:function() {
  return {SHOULD_LOAD:"load"};
}}});
ma.default = Y;
/*
 Throttle function
 https://remysharp.com/2010/07/21/throttling-function-calls

 Copyright (c) 2010 Remy Sharp
*/
var na = {default:function(a, b, c) {
  var d = 0, e;
  return function(f) {
    for (var h = [], p = 0;p < arguments.length;++p) {
      h[p - 0] = arguments[p];
    }
    var q = +new Date;
    d && q < d + b ? (clearTimeout(e), e = setTimeout(function() {
      d = q;
      a.apply(c, h);
    }, b + d - q)) : (d = q, a.apply(c, h));
  };
}};
var oa = {};
function Z(a) {
  G.default.call(this);
  this.model = new ma.default;
  this.EventType = this.model.EventType;
  this.scrollEl = this.scrollListener_ = null;
  this.endOfListText = "";
  this.throttle = na.default(this.checkShouldLoadMore_, 100, this);
  a && this.register(a);
  this.bindModelEvents();
}
g.inherits(Z, G.default);
Z.prototype.bindModelEvents = function() {
  this.model.on(this.model.EventType.SHOULD_LOAD, this.onShouldLoad.bind(this));
};
Z.prototype.onShouldLoad = function() {
  this.emit(this.EventType.SHOULD_LOAD);
};
Z.prototype.render = function(a, b) {
  G.default.prototype.render.call(this, a, b);
  this.el || this.register(this.el.parentElement);
};
Z.prototype.reset = function() {
  this.model.reset();
};
Z.prototype.register = function(a) {
  a && (this.reset(), this.scrollEl && this.scrollEl.removeEventListener("scroll", this.scrollListener_), this.scrollEl = a, this.scrollListener_ = this.onScroll_.bind(this), this.scrollEl.addEventListener("scroll", this.scrollListener_));
};
Z.prototype.onScroll_ = function() {
  this.throttle();
};
Z.prototype.checkShouldLoadMore_ = function() {
  this.model.triggerShouldCheckState();
  if (this.model.shouldCheck()) {
    var a = this.scrollEl;
    a && a.scrollHeight > a.offsetHeight && a.scrollTop > a.scrollHeight - a.offsetHeight - 400 && this.model.load();
  }
};
Z.prototype.showSpinner = function() {
  this.el.classList.add("spinner");
  this.el.innerText = "";
  this.reset();
};
Z.prototype.showEndOfList = function() {
  this.el.innerText = this.endOfListText;
  this.el.classList.remove("spinner");
};
Z.prototype.template = function() {
  return "<inf-scroll></inf-scroll>";
};
Z.prototype.dispose = function() {
  this.model.dispose();
  this.scrollEl.removeEventListener(this.scrollListener_);
  G.default.prototype.dispose.call(this);
};
oa.default = Z;
window.erste = {Component:G.default, ViewManager:K.default, View:I.default, locale:M.default, Sidebar:S.default, TabBar:ia.default, NavBar:ja.default, PullToRefresh:la.default, InfiniteScroll:oa.default};
k.exportSymbol("window.erste", window.erste);



if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(function() {
        return erste;
    });
} else if (typeof exports === 'object') {
    // CommonJS
    exports.erste = erste;
}
else {
    // Browser global.
    window.erste = erste;
}
}).call(this);


//# sourceMappingURL=erste.min.js.map
