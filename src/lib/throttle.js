/*!
 * Throttle function
 *
 * https://remysharp.com/2010/07/21/throttling-function-calls
 *
 * Copyright (c) 2010 Remy Sharp
 */

/**
 * @param {!Function} fn
 * @param {number} threshhold
 * @param {?Object=} scope
 */
export default (fn, threshhold, scope) => {
    var last = 0,
        deferTimer;

    /**
     * @param {...*} args
     */
    var rv = (...args) => {
        /** @type {number} */
        var now = +new Date;

        if (last && (now < add(last, threshhold))) {
            clearTimeout(deferTimer);
            deferTimer = setTimeout(() => {
                last = now;
                fn.apply(scope, args);
            }, threshhold + last - now);
        } else {
            last = now;
            fn.apply(scope, args);
        }
    };

    return rv;
}

function add(a, b) {
    return a + b;
}
