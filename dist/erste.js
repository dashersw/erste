(function(global){var h = {scope:{}};
h.defineProperty = "function" == typeof Object.defineProperties ? Object.defineProperty : function(a, b, c) {
  if (c.get || c.set) {
    throw new TypeError("ES3 does not support getters and setters.");
  }
  a != Array.prototype && a != Object.prototype && (a[b] = c.value);
};
h.getGlobal = function(a) {
  return "undefined" != typeof window && window === a ? a : "undefined" != typeof global && null != global ? global : a;
};
h.global = h.getGlobal(this);
h.SYMBOL_PREFIX = "jscomp_symbol_";
h.initSymbol = function() {
  h.initSymbol = function() {
  };
  h.global.Symbol || (h.global.Symbol = h.Symbol);
};
h.symbolCounter_ = 0;
h.Symbol = function(a) {
  return h.SYMBOL_PREFIX + (a || "") + h.symbolCounter_++;
};
h.initSymbolIterator = function() {
  h.initSymbol();
  var a = h.global.Symbol.iterator;
  a || (a = h.global.Symbol.iterator = h.global.Symbol("iterator"));
  "function" != typeof Array.prototype[a] && h.defineProperty(Array.prototype, a, {configurable:!0, writable:!0, value:function() {
    return h.arrayIterator(this);
  }});
  h.initSymbolIterator = function() {
  };
};
h.arrayIterator = function(a) {
  var b = 0;
  return h.iteratorPrototype(function() {
    return b < a.length ? {done:!1, value:a[b++]} : {done:!0};
  });
};
h.iteratorPrototype = function(a) {
  h.initSymbolIterator();
  a = {next:a};
  a[h.global.Symbol.iterator] = function() {
    return this;
  };
  return a;
};
h.makeIterator = function(a) {
  h.initSymbolIterator();
  var b = a[Symbol.iterator];
  return b ? b.call(a) : h.arrayIterator(a);
};
h.arrayFromIterator = function(a) {
  for (var b, c = [];!(b = a.next()).done;) {
    c.push(b.value);
  }
  return c;
};
h.arrayFromIterable = function(a) {
  return a instanceof Array ? a : h.arrayFromIterator(h.makeIterator(a));
};
h.inherits = function(a, b) {
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
h.array = h.array || {};
h.iteratorFromArray = function(a, b) {
  h.initSymbolIterator();
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
h.polyfill = function(a, b) {
  if (b) {
    var c = h.global;
    a = a.split(".");
    for (var d = 0;d < a.length - 1;d++) {
      var e = a[d];
      e in c || (c[e] = {});
      c = c[e];
    }
    a = a[a.length - 1];
    d = c[a];
    b = b(d);
    b != d && null != b && h.defineProperty(c, a, {configurable:!0, writable:!0, value:b});
  }
};
h.EXPOSE_ASYNC_EXECUTOR = !0;
h.FORCE_POLYFILL_PROMISE = !1;
h.polyfill("Promise", function(a) {
  function b(a) {
    this.state_ = 0;
    this.result_ = void 0;
    this.onSettledCallbacks_ = [];
    var b = this.createResolveAndReject_();
    try {
      a(b.resolve, b.reject);
    } catch (n) {
      b.reject(n);
    }
  }
  function c() {
    this.batch_ = null;
  }
  if (a && !h.FORCE_POLYFILL_PROMISE) {
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
  var d = h.global.setTimeout;
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
        } catch (p) {
          this.asyncThrow_(p);
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
    } catch (n) {
      this.reject_(n);
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
    } catch (p) {
      c.reject(p);
    }
  };
  b.prototype.then = function(a, c) {
    function d(a, b) {
      return "function" == typeof a ? function(b) {
        try {
          e(a(b));
        } catch (ha) {
          f(ha);
        }
      } : b;
    }
    var e, f, g = new b(function(a, b) {
      e = a;
      f = b;
    });
    this.callWhenSettled_(d(a, e), d(c, f));
    return g;
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
      for (var e = h.makeIterator(a), f = e.next();!f.done;f = e.next()) {
        b.resolve(f.value).callWhenSettled_(c, d);
      }
    });
  };
  b.all = function(a) {
    var c = h.makeIterator(a), d = c.next();
    return d.done ? b.resolve([]) : new b(function(a, e) {
      function f(b) {
        return function(c) {
          g[b] = c;
          n--;
          0 == n && a(g);
        };
      }
      var g = [], n = 0;
      do {
        g.push(void 0), n++, b.resolve(d.value).callWhenSettled_(f(g.length - 1), e), d = c.next();
      } while (!d.done);
    });
  };
  h.EXPOSE_ASYNC_EXECUTOR && (b.$jscomp$new$AsyncExecutor = function() {
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
var m = {}, aa = navigator.userAgent.match(/iPhone/i) && /OS ([6-9]|\d{2})_\d/.test(navigator.userAgent), q = {TAP:"tap", LONG_TAP:"longTap", SWIPE_RIGHT:"swipeRight", SWIPE_UP:"swipeUp", SWIPE_LEFT:"swipeLeft", SWIPE_DOWN:"swipeDown"};
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
      1 >= b.length / 3 || 60 > l.default.distance(b[1], b[2], b[b.length - 2], b[b.length - 1]) || (c = l.default.angle(b[1], b[2], b[b.length - 2], b[b.length - 1]), b = q.SWIPE_RIGHT, 45 < c && 135 > c ? b = q.SWIPE_DOWN : 135 < c && 225 > c ? b = q.SWIPE_LEFT : 225 < c && 315 > c && (b = q.SWIPE_UP), (c = document.createEvent("Event")) && c.initEvent(b, !0, !0), a.target.dispatchEvent(c), this.canSwipe = !1);
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
      var d = (new Date).getTime() - this.touchStartTime, b = document.createEvent("Event"), d = 800 < d ? q.LONG_TAP : q.TAP;
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
var u = {}, v = {}, w = {}, x, ca = "click mouseover mouseout mousemove mousedown mouseup scroll keyup keypress focus touchstart touchmove touchend tap longtap doubletap press pan swipe swipeTop swipeRight swipeBottom swipeLeft".split(" ");
function y() {
  ca.forEach(function(a) {
    return document.body.addEventListener(a, da);
  });
  x = new m.default;
  (new MutationObserver(function() {
    for (var a in w) {
      w[a].render(), delete w[a];
    }
  })).observe(document.body, {childList:!0, subtree:!0});
}
document.body ? y() : document.addEventListener("DOMContentLoaded", y);
var ea = function() {
  var a = document.createElement("div");
  return function(b) {
    a.innerHTML = b.trim();
    return a.removeChild(a.firstChild);
  };
}();
function fa(a) {
  var b = a, c = [], d, e;
  if (e = b.parentComps) {
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
  a.parentComps = e.join(",");
  return c;
}
function da(a) {
  a.targetEl = a.target;
  var b = fa(a.target), c = !1;
  do {
    if (c) {
      break;
    }
    a.targetEl = a.targetEl;
    for (var c = b, d = a, e = !1, f = 0;f < c.length;f++) {
      var g = c[f], n = g && g.events && g.events[d.type];
      if (n) {
        var p = Object.keys(n);
        if (!1 === ga(g, d, n, p)) {
          e = !0;
          break;
        }
      }
    }
    c = e;
  } while ((a.targetEl = a.targetEl.parentNode) && a.targetEl != document.body);
}
function ga(a, b, c, d) {
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
  a.rendered || (w[a.id] = a);
}, removeComponent:function(a) {
  delete v[a.id];
  delete w[a.id];
}, createElement:ea, markComponentRendered:function(a) {
  delete w[a.id];
}, get gestureHandler() {
  return x;
}};
/*
 EventEmitter2
 https://github.com/hij1nx/EventEmitter2

 Copyright (c) 2013 hij1nx
 Licensed under the MIT license.
*/
var A = {}, B = Array.isArray ? Array.isArray : function(a) {
  return "[object Array]" === Object.prototype.toString.call(a);
};
function C() {
  this._events = {};
  this._conf && D.call(this, this._conf);
}
function D(a) {
  a ? (this._conf = a, a.delimiter && (this.delimiter = a.delimiter), this._events.maxListeners = void 0 !== a.maxListeners ? a.maxListeners : 10, a.wildcard && (this.wildcard = a.wildcard), a.newListener && (this._events.newListener = a.newListener), a.verboseMemoryLeak && (this.verboseMemoryLeak = a.verboseMemoryLeak), this.wildcard && (this.listenerTree = {})) : this._events.maxListeners = 10;
}
function E(a, b) {
  this.verboseMemoryLeak ? console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit. Event name: %s.", a, b) : console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.", a);
  console.trace && console.trace();
}
function F(a) {
  this._events = {};
  this.verboseMemoryLeak = this.newListener = !1;
  D.call(this, a);
}
F.EventEmitter2 = F;
function G(a, b, c, d) {
  if (!c) {
    return [];
  }
  var e = [], f, g, n, p;
  n = b.length;
  p = b[d];
  var z = b[d + 1];
  if (d === n && c._listeners) {
    if ("function" === typeof c._listeners) {
      a && a.push(c._listeners);
    } else {
      for (b = 0, d = c._listeners.length;b < d;b++) {
        a && a.push(c._listeners[b]);
      }
    }
    return [c];
  }
  if ("*" === p || "**" === p || c[p]) {
    if ("*" === p) {
      for (f in c) {
        "_listeners" !== f && c.hasOwnProperty(f) && (e = e.concat(G(a, b, c[f], d + 1)));
      }
      return e;
    }
    if ("**" === p) {
      (p = d + 1 === n || d + 2 === n && "*" === z) && c._listeners && (e = e.concat(G(a, b, c, n)));
      for (f in c) {
        "_listeners" !== f && c.hasOwnProperty(f) && ("*" === f || "**" === f ? (c[f]._listeners && !p && (e = e.concat(G(a, b, c[f], n))), e = e.concat(G(a, b, c[f], d))) : e = f === z ? e.concat(G(a, b, c[f], d + 2)) : e.concat(G(a, b, c[f], d)));
      }
      return e;
    }
    e = e.concat(G(a, b, c[p], d + 1));
  }
  (g = c["*"]) && G(a, b, g, d + 1);
  if (c = c["**"]) {
    if (d < n) {
      for (f in c._listeners && G(a, b, c, n), c) {
        "_listeners" !== f && c.hasOwnProperty(f) && (f === z ? G(a, b, c[f], d + 2) : f === p ? G(a, b, c[f], d + 1) : (n = {}, n[f] = c[f], G(a, b, {"**":n}, d + 1)));
      }
    } else {
      c._listeners ? G(a, b, c, n) : c["*"] && c["*"]._listeners && G(a, b, c["*"], n);
    }
  }
  return e;
}
F.prototype.delimiter = ".";
k.exportProperty(F.prototype, "delimiter", F.prototype.delimiter);
F.prototype.setMaxListeners = function(a) {
  void 0 !== a && (this._events || C.call(this), this._events.maxListeners = a, this._conf || (this._conf = {}), this._conf.maxListeners = a);
};
k.exportProperty(F.prototype, "setMaxListeners", F.prototype.setMaxListeners);
F.prototype.event = "";
k.exportProperty(F.prototype, "event", F.prototype.event);
F.prototype.once = function(a, b) {
  this.many(a, 1, b);
  return this;
};
k.exportProperty(F.prototype, "once", F.prototype.once);
F.prototype.many = function(a, b, c) {
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
k.exportProperty(F.prototype, "many", F.prototype.many);
F.prototype.emit = function(a) {
  this._events || C.call(this);
  var b = arguments[0];
  if ("newListener" === b && !this.newListener && !this._events.newListener) {
    return !1;
  }
  var c = arguments.length, d, e, f, g;
  if (this._all && this._all.length) {
    g = this._all.slice();
    if (3 < c) {
      for (d = Array(c), e = 0;e < c;e++) {
        d[e] = arguments[e];
      }
    }
    f = 0;
    for (e = g.length;f < e;f++) {
      switch(this.event = b, c) {
        case 1:
          g[f].call(this, b);
          break;
        case 2:
          g[f].call(this, b, arguments[1]);
          break;
        case 3:
          g[f].call(this, b, arguments[1], arguments[2]);
          break;
        default:
          g[f].apply(this, d);
      }
    }
  }
  if (this.wildcard) {
    g = [], e = "string" === typeof b ? b.split(this.delimiter) : b.slice(), G.call(this, g, e, this.listenerTree, 0);
  } else {
    g = this._events[b];
    if ("function" === typeof g) {
      this.event = b;
      switch(c) {
        case 1:
          g.call(this);
          break;
        case 2:
          g.call(this, arguments[1]);
          break;
        case 3:
          g.call(this, arguments[1], arguments[2]);
          break;
        default:
          d = Array(c - 1);
          for (e = 1;e < c;e++) {
            d[e - 1] = arguments[e];
          }
          g.apply(this, d);
      }
      return !0;
    }
    g && (g = g.slice());
  }
  if (g && g.length) {
    if (3 < c) {
      for (d = Array(c - 1), e = 1;e < c;e++) {
        d[e - 1] = arguments[e];
      }
    }
    f = 0;
    for (e = g.length;f < e;f++) {
      switch(this.event = b, c) {
        case 1:
          g[f].call(this);
          break;
        case 2:
          g[f].call(this, arguments[1]);
          break;
        case 3:
          g[f].call(this, arguments[1], arguments[2]);
          break;
        default:
          g[f].apply(this, d);
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
F.prototype.emitAsync = function() {
  this._events || C.call(this);
  var a = arguments[0];
  if ("newListener" === a && !this.newListener && !this._events.newListener) {
    return Promise.resolve([!1]);
  }
  var b = [], c = arguments.length, d, e, f, g;
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
  this.wildcard ? (g = [], e = "string" === typeof a ? a.split(this.delimiter) : a.slice(), G.call(this, g, e, this.listenerTree, 0)) : g = this._events[a];
  if ("function" === typeof g) {
    switch(this.event = a, c) {
      case 1:
        b.push(g.call(this));
        break;
      case 2:
        b.push(g.call(this, arguments[1]));
        break;
      case 3:
        b.push(g.call(this, arguments[1], arguments[2]));
        break;
      default:
        d = Array(c - 1);
        for (e = 1;e < c;e++) {
          d[e - 1] = arguments[e];
        }
        b.push(g.apply(this, d));
    }
  } else {
    if (g && g.length) {
      if (3 < c) {
        for (d = Array(c - 1), e = 1;e < c;e++) {
          d[e - 1] = arguments[e];
        }
      }
      f = 0;
      for (e = g.length;f < e;f++) {
        switch(this.event = a, c) {
          case 1:
            b.push(g[f].call(this));
            break;
          case 2:
            b.push(g[f].call(this, arguments[1]));
            break;
          case 3:
            b.push(g[f].call(this, arguments[1], arguments[2]));
            break;
          default:
            b.push(g[f].apply(this, d));
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
k.exportProperty(F.prototype, "emitAsync", F.prototype.emitAsync);
F.prototype.on = function(a, b) {
  if ("function" === typeof a) {
    return this.onAny(a), this;
  }
  if ("function" !== typeof b) {
    throw Error("on only accepts instances of Function");
  }
  this._events || C.call(this);
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
          c._listeners ? ("function" === typeof c._listeners && (c._listeners = [c._listeners]), c._listeners.push(b), !c._listeners.warned && 0 < this._events.maxListeners && c._listeners.length > this._events.maxListeners && (c._listeners.warned = !0, E.call(this, c._listeners.length, d))) : c._listeners = b;
          break a;
        }
        d = a.shift();
      }
    }
    return this;
  }
  this._events[a] ? ("function" === typeof this._events[a] && (this._events[a] = [this._events[a]]), this._events[a].push(b), !this._events[a].warned && 0 < this._events.maxListeners && this._events[a].length > this._events.maxListeners && (this._events[a].warned = !0, E.call(this, this._events[a].length, a))) : this._events[a] = b;
  return this;
};
k.exportProperty(F.prototype, "on", F.prototype.on);
F.prototype.onAny = function(a) {
  if ("function" !== typeof a) {
    throw Error("onAny only accepts instances of Function");
  }
  this._all || (this._all = []);
  this._all.push(a);
  return this;
};
k.exportProperty(F.prototype, "onAny", F.prototype.onAny);
F.prototype.addListener = F.prototype.on;
k.exportProperty(F.prototype, "addListener", F.prototype.addListener);
F.prototype.off = function(a, b) {
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
    d = "string" === typeof a ? a.split(this.delimiter) : a.slice(), e = G.call(this, null, d, this.listenerTree, 0);
  } else {
    if (!this._events[a]) {
      return this;
    }
    d = this._events[a];
    e.push({_listeners:d});
  }
  for (var f = 0;f < e.length;f++) {
    var g = e[f];
    d = g._listeners;
    if (B(d)) {
      for (var n = -1, p = 0, z = d.length;p < z;p++) {
        if (d[p] === b || d[p].listener && d[p].listener === b || d[p]._origin && d[p]._origin === b) {
          n = p;
          break;
        }
      }
      if (0 > n) {
        continue;
      }
      this.wildcard ? g._listeners.splice(n, 1) : this._events[a].splice(n, 1);
      0 === d.length && (this.wildcard ? delete g._listeners : delete this._events[a]);
      this.emit("removeListener", a, b);
      return this;
    }
    if (d === b || d.listener && d.listener === b || d._origin && d._origin === b) {
      this.wildcard ? delete g._listeners : delete this._events[a], this.emit("removeListener", a, b);
    }
  }
  c(this.listenerTree);
  return this;
};
k.exportProperty(F.prototype, "off", F.prototype.off);
F.prototype.offAny = function(a) {
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
k.exportProperty(F.prototype, "offAny", F.prototype.offAny);
F.prototype.removeListener = F.prototype.off;
k.exportProperty(F.prototype, "removeListener", F.prototype.removeListener);
F.prototype.removeAllListeners = function(a) {
  if (0 === arguments.length) {
    return !this._events || C.call(this), this;
  }
  if (this.wildcard) {
    for (var b = "string" === typeof a ? a.split(this.delimiter) : a && a.slice(), b = G.call(this, null, b, this.listenerTree, 0), c = 0;c < b.length;c++) {
      b[c]._listeners = null;
    }
  } else {
    this._events && (this._events[a] = null);
  }
  return this;
};
k.exportProperty(F.prototype, "removeAllListeners", F.prototype.removeAllListeners);
F.prototype.listeners = function(a) {
  if (this.wildcard) {
    var b = [];
    a = "string" === typeof a ? a.split(this.delimiter) : a.slice();
    G.call(this, b, a, this.listenerTree, 0);
    return b;
  }
  this._events || C.call(this);
  this._events[a] || (this._events[a] = []);
  B(this._events[a]) || (this._events[a] = [this._events[a]]);
  return this._events[a];
};
k.exportProperty(F.prototype, "listeners", F.prototype.listeners);
F.prototype.listenerCount = function(a) {
  return this.listeners(a).length;
};
k.exportProperty(F.prototype, "listenerCount", F.prototype.listenerCount);
F.prototype.listenersAny = function() {
  return this._all ? this._all : [];
};
k.exportProperty(F.prototype, "listenersAny", F.prototype.listenersAny);
A.default = F;
var H = {};
function I() {
  A.default.call(this, {maxListeners:Infinity});
  this.id_ = u.default.getUid();
  this.template_ = this.element_ = null;
  this.rendered_ = !1;
  u.default.setComponent(this);
}
h.inherits(I, A.default);
I.prototype.tagExtension_ = function() {
  return '$1 id="' + this.id + '"';
};
I.prototype.toString = function() {
  if (this.template_) {
    return this.template_;
  }
  var a = /^(<[^>]+)/, b = this.template().trim();
  if (!b.match(a)) {
    throw Error("Template needs to start with a valid tag.");
  }
  return this.template_ = b = b.replace(/\s+/, " ").replace(a, this.tagExtension_());
};
k.exportProperty(I.prototype, "toString", I.prototype.toString);
I.prototype.$$ = function(a) {
  var b = [], c = this.el;
  c && (b = [].concat(h.arrayFromIterable(c.querySelectorAll(a))));
  return b;
};
k.exportProperty(I.prototype, "$$", I.prototype.$$);
I.prototype.$ = function(a) {
  var b = null, c = this.element_;
  c && (b = void 0 == a ? c : c.querySelector(a));
  return b;
};
k.exportProperty(I.prototype, "$", I.prototype.$);
I.prototype.render = function(a, b) {
  if (!this.rendered_) {
    if (!this.element_) {
      var c = document.getElementById(this.id);
      if (!c && !a) {
        return;
      }
      if (c && (a = c.parentElement, !b)) {
        this.element_ = c;
        this.rendered_ = !0;
        this.onAfterRender();
        return;
      }
      b = b ? b : a && a.children.length - 1 || -1;
      b = a && a.children[b];
      a && a.insertBefore(this.el, b || null);
      this.rendered_ = !0;
    }
    this.onAfterRender();
  }
};
k.exportProperty(I.prototype, "render", I.prototype.render);
I.prototype.onBeforeRender = function() {
};
I.prototype.onAfterRender = function() {
};
I.prototype.template = function() {
  return "<div></div>";
};
k.exportProperty(I.prototype, "template", I.prototype.template);
I.prototype.dispose = function() {
  u.default.removeComponent(this);
  this.removeAllListeners();
  this.element_ && this.element_.parentNode && this.element_.parentNode.removeChild(this.element_);
  this.element_ = null;
};
k.exportProperty(I.prototype, "dispose", I.prototype.dispose);
h.global.Object.defineProperties(I.prototype, {id:{configurable:!0, enumerable:!0, get:function() {
  return this.id_;
}}, el:{configurable:!0, enumerable:!0, get:function() {
  var a = this.element_;
  a || (a = this.element_ = document.getElementById(this.id) || u.default.createElement(this.toString()));
  return a;
}}, rendered:{configurable:!0, enumerable:!0, get:function() {
  if (!this.rendered_) {
    var a = document.getElementById(this.id);
    a && (this.element_ = a, this.rendered_ = !0, this.onAfterRender());
  }
  return this.rendered_;
}}});
H.default = I;
var J = {};
function K() {
  H.default.call(this);
  this.rendered = !1;
}
h.inherits(K, H.default);
K.prototype.render = function(a, b) {
  a = void 0 === a ? document.body : a;
  this.index = void 0 === b ? 0 : b;
  H.default.prototype.render.call(this, a);
};
K.prototype.onAfterRender = function() {
  H.default.prototype.onAfterRender.call(this);
  this.el.style.zIndex = this.index;
  this.el.style.transform = "translate3d(0, 0, " + this.index + "px)";
};
K.prototype.onActivation = function() {
};
K.prototype.template = function() {
  return "\n<view></view>\n";
};
K.prototype.tagExtension_ = function() {
  return '$1 id="' + this.id + '" view';
};
h.global.Object.defineProperties(K, {WIDTH:{configurable:!0, enumerable:!0, get:function() {
  if (!K.width_) {
    var a = window.getComputedStyle(document.body, null), a = parseInt(a && a.width || 0, 10);
    K.width_ = a;
  }
  return K.width_;
}}});
K.prototype.index = 0;
K.prototype.supportsBackGesture = !1;
K.prototype.hasSidebar = !1;
J.default = K;
var L = {};
function M(a) {
  this.history = [];
  this.lastTouches = [];
  this.state = M.State.DEFAULT;
  this.firstX = this.hideSidebarTimeout = this.currentView = this.rootEl = null;
  this.initialized_ = !1;
  a && (this.root_ = a);
}
M.prototype.init = function(a) {
  this.initialized_ = !0;
  a = a || this.root_;
  if (a instanceof J.default) {
    if (a.rendered) {
      this.rootEl = a.el;
    } else {
      throw Error("View Manager's root is not rendered yet");
    }
  } else {
    this.rootEl = a || document.body;
  }
  this.initTouchEvents_();
};
M.prototype.getLastViewInHistory = function() {
  return this.history[this.history.length - 1];
};
M.prototype.pull = function(a, b) {
  this.initialized_ || this.init();
  !a.rendered && this.rootEl && a.render(this.rootEl, this.topIndex += 2);
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
  a.el.style.transitionDuration = "0s";
  a.el.style.transform = "translate3d(100%, 0, " + a.index + "px)";
  requestAnimationFrame(function() {
    c.el.style.transitionDuration = "0.35s";
    a.el.style.transitionDuration = "0.35s";
    requestAnimationFrame(function() {
      a.el.style.transform = "translate3d(0, 0, " + a.index + "px)";
      c.el.style.transform = "translate3d(-30%, 0, " + c.index + "px)";
      a.el.style.boxShadow = "0 0 24px black";
    });
  });
  this.currentView = a;
  this.state = M.State.DEFAULT;
};
M.prototype.canGoBack = function() {
  return this.history && 0 < this.history.length;
};
M.prototype.push = function() {
  var a = this.history.pop(), b = this.currentView;
  a && (this.initialized_ || this.init(), window.requestAnimationFrame(function() {
    b.el.style.transitionDuration = "0s";
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
  }, 1000), this.state = M.State.DEFAULT);
};
M.prototype.setCurrentView = function(a, b) {
  this.initialized_ || this.init();
  !a.rendered && this.rootEl && a.render(this.rootEl, this.topIndex += 2);
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
  this.state == M.State.SIDEBAR_OPEN ? (b = "translate3d(" + (128 - J.default.WIDTH) + "px, 0, " + a.index + "px)", a.el.style.transform = b, this.toggleSidebar_(!1)) : (a.el.style.zIndex = a.index, a.el.style.transform = b, this.state = M.State.DEFAULT);
};
M.prototype.toggleSidebar = function() {
  this.initialized_ || this.init();
  this.toggleSidebar_(this.state == M.State.DEFAULT);
};
M.prototype.initTouchEvents_ = function() {
  this.rootEl && (this.rootEl.addEventListener("touchmove", this.onTouchMove_.bind(this), !1), this.rootEl.addEventListener("touchend", this.onTouchEnd_.bind(this), !1));
};
M.prototype.onTouchMove_ = function(a) {
  var b = a.changedTouches && a.changedTouches[0].clientX || 0;
  clearTimeout(this.hideSidebarTimeout);
  if (this.state == M.State.DEFAULT || this.state == M.State.SIDEBAR_OPEN) {
    this.firstX = b;
  }
  this.state == M.State.DEFAULT && (this.lastTouches = [], this.state = M.State.STARTED_GESTURE);
  this.state == M.State.STARTED_GESTURE && (50 >= b ? this.history.length && this.currentView && this.currentView.supportsBackGesture && (this.state = M.State.GOING_TO_BACK_VIEW) : this.currentView && this.currentView.hasSidebar && (this.lastTouches.push(this.firstX - b), 4 == this.lastTouches.length && this.lastTouches.shift(), 40 < this.lastTouches[2] - this.lastTouches[0] && (this.state = M.State.OPENING_SIDEBAR)));
  this.state == M.State.SIDEBAR_OPEN && (this.state = M.State.CLOSING_SIDEBAR);
  switch(this.state) {
    case M.State.GOING_TO_BACK_VIEW:
      this.backGestureTouchMove_(a);
      break;
    case M.State.CLOSING_SIDEBAR:
      this.closeSidebarTouchMove_(a);
      break;
    case M.State.OPENING_SIDEBAR:
      this.openSidebarTouchMove_(a);
  }
};
M.prototype.onTouchEnd_ = function(a) {
  switch(this.state) {
    case M.State.GOING_TO_BACK_VIEW:
      this.backGestureTouchEnd_(a);
      break;
    case M.State.OPENING_SIDEBAR:
      a = !0;
      3 > this.lastTouches[2] - this.lastTouches[0] && (a = !1);
      this.toggleSidebar_(a);
      break;
    case M.State.CLOSING_SIDEBAR:
      a = !0;
      -3 > this.lastTouches[2] - this.lastTouches[0] && (a = !1);
      this.toggleSidebar_(a);
      break;
    case M.State.SIDEBAR_OPEN:
      if (u.default.gestureHandler.canTap) {
        break;
      }
      this.toggleSidebar_(!1);
      break;
    default:
      this.state = M.State.DEFAULT;
  }
};
M.prototype.backGestureTouchEnd_ = function(a) {
  var b = this;
  if (this.firstX) {
    var c = this.history, d = this.getLastViewInHistory(), e = this.currentView, f = a.changedTouches && a.changedTouches[0].clientX || 0, g = l.default.lerp(0.15, 0.35, (J.default.WIDTH - f) / J.default.WIDTH);
    window.requestAnimationFrame(function() {
      e.el.style.transitionDuration = g + "s";
      d.el.style.transitionDuration = g + "s";
      var a = "100%", p = "0";
      if (f < J.default.WIDTH / 2) {
        var a = "0", p = "-30%", z = function() {
          d.el.style.transitionDuration = "0s";
          d.el.style.transform = "translate3d(-100%,-100%,0)";
          d.el.removeEventListener("transitionend", z);
        };
        d.el.addEventListener("transitionend", z);
      } else {
        b.currentView = b.getLastViewInHistory(), c.pop(), d.onActivation && d.onActivation(), setTimeout(function() {
          e.dispose();
        }, 1000);
      }
      e.el.style.transform = "translate3d(" + a + ", 0, " + e.index + "px)";
      d.el.style.transform = "translate3d(" + p + ", 0, " + (e.index - 1) + "px)";
      e.el.style.boxShadow = "0px 0 0px black";
    });
    this.state = M.State.DEFAULT;
  }
};
M.prototype.backGestureTouchMove_ = function(a) {
  if (this.history.length) {
    a.preventDefault();
    var b = this.history[this.history.length - 1], c = this.currentView, d = (a.changedTouches && a.changedTouches[0].clientX || 0) - this.firstX;
    a = J.default.WIDTH;
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
M.prototype.closeSidebarTouchMove_ = function(a) {
  var b = a.changedTouches && a.changedTouches[0].clientX || 0;
  this.lastTouches.push(this.firstX - b);
  4 == this.lastTouches.length && this.lastTouches.shift();
  a.preventDefault();
  var c = this.currentView, d = b - this.firstX - 4 * J.default.WIDTH / 5;
  window.requestAnimationFrame(function() {
    c.el.style.transitionDuration = "0s";
    c.el.style.transform = "translate3d(" + d + "px, 0, " + c.index + "px)";
  });
};
M.prototype.toggleSidebar_ = function(a) {
  var b = this, c = this.currentView, d = document.querySelector("sidebar");
  requestAnimationFrame(function() {
    c.el.style.transitionDuration = "0.35s";
    var e = 128 - J.default.WIDTH + "px", f = "0", g = c.index - 1 + "px";
    a ? d.style.transform = "translate3d(" + f + ", 0, " + g + ")" : (e = "0", f = "100%", g = 0, b.hideSidebarTimeout = setTimeout(function() {
      b.state == M.State.DEFAULT && (d.style.transform = "translate3d(" + f + ", 0, " + g + ")");
    }, 1000));
    c.el.style.transform = "translate3d(" + e + ", 0, " + c.index + "px)";
  });
  this.state = a ? M.State.SIDEBAR_OPEN : M.State.DEFAULT;
};
M.prototype.openSidebarTouchMove_ = function(a) {
  if (!u.default.gestureHandler.canTap) {
    var b = a.changedTouches && a.changedTouches[0].clientX || 0;
    this.lastTouches.push(this.firstX - b);
    4 == this.lastTouches.length && this.lastTouches.shift();
    a.preventDefault();
    var c = document.querySelector("sidebar"), d = this.currentView, e = b - this.firstX;
    0 <= e || (this.state = M.State.OPENING_SIDEBAR, window.requestAnimationFrame(function() {
      c.style.transform = "translate3d(0, 0, " + (d.index - 1) + "px)";
      c.style.transitionDuration = "0s";
      d.el.style.transitionDuration = "0s";
      d.el.style.transform = "translate3d(" + e + "px, 0, " + d.index + "px)";
    }));
  }
};
h.global.Object.defineProperties(M, {State:{configurable:!0, enumerable:!0, get:function() {
  return {DEFAULT:"default", STARTED_GESTURE:"started", CLOSING_SIDEBAR:"closingSidebar", OPENING_SIDEBAR:"openingSidebar", SIDEBAR_OPEN:"sidebarOpen", GOING_TO_BACK_VIEW:"going"};
}}});
M.prototype.topIndex = 1;
window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(a) {
  window.setTimeout(a, 1000 / 60);
};
L.default = M;
var N = {}, O = {en:{__name:"English"}}, P = O.en;
function Q(a, b) {
  O[a] = b;
}
k.exportSymbol("setDictionary$$module$$src$lib$locale", Q);
function R(a) {
  P = O[a];
}
k.exportSymbol("setLanguage$$module$$src$lib$locale", R);
function S(a, b) {
  for (var c = [], d = 1;d < arguments.length;++d) {
    c[d - 1] = arguments[d];
  }
  return (P[a] || a).replace(/{(\d+)}/g, function(a, b) {
    return "undefined" != typeof c[b] ? c[b] : a;
  });
}
k.exportSymbol("getLocalizedString$$module$$src$lib$locale", S);
N.default = {setDictionary:Q, setLanguage:R, getLocalizedString:S, __:S};
var ia = {};
function T() {
  H.default.call(this);
  this.vm = null;
}
h.inherits(T, H.default);
T.prototype.onSidebarItemTap = function(a) {
  if (a = a.targetEl && a.targetEl.getAttribute && a.targetEl.getAttribute("data-view")) {
    this.emit(T.EventType.SWITCH_VIEW, {view:a}), this.vm && this.vm.toggleSidebar();
  }
};
T.prototype.template = function() {
  return "\n<sidebar>\n    <sidebar-items>" + this.template_items() + "</sidebar-items>\n</sidebar>\n";
};
T.prototype.template_items = function() {
  return "";
};
h.global.Object.defineProperties(T.prototype, {mappings:{configurable:!0, enumerable:!0, get:function() {
  return {ITEM:"sidebar-item"};
}}, events:{configurable:!0, enumerable:!0, get:function() {
  var a = {};
  return {tap:(a[this.mappings.ITEM] = this.onSidebarItemTap, a)};
}}});
h.global.Object.defineProperties(T, {EventType:{configurable:!0, enumerable:!0, get:function() {
  return {SWITCH_VIEW:"switchView"};
}}});
ia.default = T;
var ja = {};
function U() {
  J.default.call(this);
  this.vm = null;
  this.views = [];
  this.activeItemIndex = null;
}
h.inherits(U, J.default);
U.width_ = J.default.width_;
U.prototype.onAfterRender = function() {
  J.default.prototype.onAfterRender.call(this);
  var a = this.$(this.mappings.VIEWS);
  if (!a) {
    throw Error("TabView template must have <views>");
  }
  this.vm = new L.default(a);
  this.activateItem(0);
};
U.prototype.onItemTap = function(a) {
  var b = this.$(this.mappings.ACTIVE_ITEM);
  b && b == a.targetEl || (b = this.$(this.mappings.ITEMS), a = [].indexOf.call(b && b.children, a.targetEl), this.activateItem(a));
};
U.prototype.activateItem = function(a) {
  if (!(0 > a)) {
    this.deactivateActiveItem();
    var b = this.$$(this.mappings.ITEM)[a];
    b && b.classList.add("active");
    this.views && this.views[a] && (this.vm.setCurrentView(this.views[a], !0), this.views[a].el.classList.add("active"));
    this.activeItemIndex = a;
  }
};
U.prototype.activateItemByName = function(a) {
  if (a = this.$(this.mappings.ITEM + "[data-view=" + a + "]")) {
    var b = this.$(this.mappings.ITEMS);
    a = [].indexOf.call(b && b.children, a);
    this.activateItem(a);
  }
};
U.prototype.deactivateActiveItem = function() {
  this.$$(this.mappings.ACTIVE).forEach(function(a) {
    return a.classList.remove("active");
  });
};
U.prototype.template = function() {
  return "\n<tab-view>\n    " + this.template_views() + "\n    <tab-bar>\n        <tab-items>\n            " + this.template_items() + "\n        </tab-items>\n    </tab-bar>\n</tab-view>\n";
};
U.prototype.template_views = function() {
  return "<views>" + this.views.join("") + "</views>";
};
U.prototype.template_items = function() {
  return "";
};
h.global.Object.defineProperties(U.prototype, {mappings:{configurable:!0, enumerable:!0, get:function() {
  return {ITEM:"tab-item", ITEMS:"tab-items", ACTIVE:".active", ACTIVE_ITEM:"tab-items .active", ACTIVE_VIEW:"views .active", VIEWS:"views"};
}}, events:{configurable:!0, enumerable:!0, get:function() {
  var a = {};
  return {touchend:(a[this.mappings.ITEM] = this.onItemTap.bind(this), a)};
}}});
ja.default = U;
var ka = {};
function V(a) {
  a = void 0 === a ? {hasBackButton:!1, hasMenuButton:!1, title:""} : a;
  H.default.call(this);
  this.vm = null;
  this.config = a;
}
h.inherits(V, H.default);
V.prototype.onBackButtonTap = function() {
  this.vm && this.vm.push();
};
V.prototype.onMenuButtonTap = function() {
  this.vm && this.vm.toggleSidebar();
};
V.prototype.template = function() {
  var a = this.config, b = "", c = "";
  a.hasBackButton && (b = "<back-button></back-button>");
  a.hasMenuButton && (c = "<menu-button></menu-button>");
  return "\n<nav-bar>" + b + c + a.title + "</nav-bar>\n";
};
h.global.Object.defineProperties(V.prototype, {mappings:{configurable:!0, enumerable:!0, get:function() {
  return {BACK_BUTTON:"back-button", MENU_BUTTON:"menu-button"};
}}, events:{configurable:!0, enumerable:!0, get:function() {
  var a = {};
  return {tap:(a[this.mappings.BACK_BUTTON] = this.onBackButtonTap, a[this.mappings.MENU_BUTTON] = this.onMenuButtonTap, a)};
}}});
ka.default = V;
var la = {};
function W() {
  A.default.call(this, {maxListeners:Infinity});
  this.reset();
  this.state_ = this.State.DEFAULT;
}
h.inherits(W, A.default);
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
h.global.Object.defineProperties(W.prototype, {State:{configurable:!0, enumerable:!0, get:function() {
  return {DEFAULT:"default", SHOULD_CHECK:"shouldCheck", REFRESHING:"refreshing"};
}}, EventType:{configurable:!0, enumerable:!0, get:function() {
  return {SHOULD_REFRESH:"refresh"};
}}});
la.default = W;
var ma = {};
function X(a) {
  H.default.call(this);
  this.model = new la.default;
  this.EventType = this.model.EventType;
  this.releaseListener_ = this.scrollListener_ = this.containerEl = this.scrollEl = null;
  a && this.register(a);
  this.bindModelEvents();
}
h.inherits(X, H.default);
X.prototype.bindModelEvents = function() {
  this.model.on(this.model.EventType.SHOULD_REFRESH, this.onShouldRefresh.bind(this));
};
X.prototype.onShouldRefresh = function() {
  var a = this, b = this.$(this.mappings.SPINNER), c = this.$(this.mappings.ARROW);
  window.requestAnimationFrame(function() {
    a.containerEl.style.transform = "translateY(" + a.height + "px)";
    a.containerEl.style.transition = "800ms cubic-bezier(.41,1,.1,1)";
    b && (b.style.opacity = 1);
    c && (c.style.opacity = 0);
    a.emit(a.model.EventType.SHOULD_REFRESH);
  });
};
X.prototype.onAfterRender = function() {
  H.default.prototype.onAfterRender.call(this);
  this.scrollEl || this.register(this.el.parentElement);
};
X.prototype.reset = function() {
  this.scrollEl && (this.containerEl.style.transform = "translateY(0)", this.containerEl.style.transition = "300ms ease-out");
  var a = this.$(this.mappings.SPINNER), b = this.$(this.mappings.ARROW);
  a && (a.style.opacity = 0);
  setTimeout(function() {
    b && (b.style.opacity = 1);
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
  return '\n<pull-to-refresh>\n    <pull-to-refresh-arrow></pull-to-refresh-arrow>\n    <div class="spinner"></div>\n</pull-to-refresh>\n';
};
X.prototype.dispose = function() {
  this.model.dispose();
  this.el && this.el.removeEventListener("scroll", this.scrollListener_);
  document.body.removeEventListener("touchend", this.releaseListener_);
  H.default.prototype.dispose.call(this);
};
h.global.Object.defineProperties(X.prototype, {mappings:{configurable:!0, enumerable:!0, get:function() {
  return {ARROW:"pull-to-refresh-arrow", SPINNER:".spinner"};
}}});
X.prototype.threshold = 135;
X.prototype.height = 96;
X.prototype.arrowOffset = 0;
ma.default = X;
var na = {};
function Y() {
  A.default.call(this, {maxListeners:Infinity});
  this.state_ = this.State.DEFAULT;
}
h.inherits(Y, A.default);
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
h.global.Object.defineProperties(Y.prototype, {State:{configurable:!0, enumerable:!0, get:function() {
  return {DEFAULT:"default", SHOULD_CHECK:"shouldCheck", LOADING:"loading"};
}}, EventType:{configurable:!0, enumerable:!0, get:function() {
  return {SHOULD_LOAD:"load"};
}}});
na.default = Y;
/*
 Throttle function
 https://remysharp.com/2010/07/21/throttling-function-calls

 Copyright (c) 2010 Remy Sharp
*/
var oa = {default:function(a, b, c) {
  var d = 0, e;
  return function(f) {
    for (var g = [], n = 0;n < arguments.length;++n) {
      g[n - 0] = arguments[n];
    }
    var p = +new Date;
    d && p < d + b ? (clearTimeout(e), e = setTimeout(function() {
      d = p;
      a.apply(c, g);
    }, b + d - p)) : (d = p, a.apply(c, g));
  };
}};
var pa = {};
function Z(a) {
  H.default.call(this);
  this.model = new na.default;
  this.EventType = this.model.EventType;
  this.scrollEl = this.scrollListener_ = null;
  this.endOfListText = "";
  this.throttle = oa.default(this.checkShouldLoadMore_, 100, this);
  a && this.register(a);
  this.bindModelEvents();
}
h.inherits(Z, H.default);
Z.prototype.bindModelEvents = function() {
  this.model.on(this.model.EventType.SHOULD_LOAD, this.onShouldLoad.bind(this));
};
Z.prototype.onShouldLoad = function() {
  this.emit(this.EventType.SHOULD_LOAD);
};
Z.prototype.render = function(a, b) {
  H.default.prototype.render.call(this, a, b);
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
  H.default.prototype.dispose.call(this);
};
pa.default = Z;
k.exportSymbol("$jscompDefaultExport$$module$$src$index", {Component:H.default, ViewManager:L.default, View:J.default, locale:N.default, Sidebar:ia.default, TabView:ja.default, NavBar:ka.default, PullToRefresh:ma.default, InfiniteScroll:pa.default, __:N.default.__});

const erste = this.$jscompDefaultExport$$module$$src$index;if(typeof define=='function'&&define.amd){define(function(){return erste})}else if(typeof module=='object'&&typeof exports=='object'){module.exports=erste}else{window.erste=erste}}).call(null, {});

//# sourceMappingURL=erste.js.map
