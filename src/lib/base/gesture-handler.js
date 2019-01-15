/**
 * @fileoverview GestureHandler adds the ability to capture gesture events on
 * touch enabled devices.
 * It listens to 'touchstart', 'touchmove' and 'touchend' events and generates
 * 'tap' or 'swipe' events with inherent heuristics.
 *
 * Currently, the tap algorithm begins with a touchstart, checks for touchend.
 * Any touchmove greater than 3px cancels the tap event, and if a touchend is
 * captured without a touchmove after a touchstart; it's registered as a tap,
 * and the GestureHandler dispatches a tap event on the touchend target.
 *
 * Swipe up, left, right and down gestures are also supported.
 *
 * Example usage:
 *
 *     document.body.addEventListener('tap', function() {
 *         console.log('tapped!');
 *     });
 */

import math from './math';

/**
 * iOS 6.0(+?) requires the target element to be manually derived.
 * @type {?boolean}
 */
const deviceIsIOSWithBadTarget = navigator.userAgent.match(/iPhone/i) &&
    (/OS ([6-9]|\d{2})_\d/).test(navigator.userAgent);

const EventType = {
    TAP: 'tap',
    LONG_TAP: 'longTap',
    SWIPE_RIGHT: 'swipeRight',
    SWIPE_UP: 'swipeUp',
    SWIPE_LEFT: 'swipeLeft',
    SWIPE_DOWN: 'swipeDown'
};

export default class GestureHandler {
    /**
     * Tracks and fires gestures on touch enabled devices.
     *
     * @param {!Element=} opt_el Provided, gesture handler will track gesture
     *                           events on this element. The default
     *                           value is document.body; but an optional
     *                           root element is inevitable for iframe's.
     */
    constructor(opt_el) {
        this.el = opt_el || document.body;

        this.isInMotion = false;
        this.canTap = false;
        this.canSwipe = false;

        /**
         * @type {number} Start time of the first touch in milliseconds since 1970
         */
        this.touchStartTime = 0;

        /**
         * @type {!Array.<number>} Touch list whose first element is the time of the first touch
         */
        this.touches = [];

        this.el.addEventListener('touchstart', this.onTouchstart.bind(this), false);
        this.el.addEventListener('touchmove', this.onTouchmove.bind(this), false);
        this.el.addEventListener('touchend', this.onTouchend.bind(this), false);
    }

    onTouchstart(e) {
        this.isInMotion = true;
        this.canTap = true;
        this.canSwipe = true;
        this.touchStartTime = new Date().getTime();

        var changedTouch = e.changedTouches[0];

        this.touches = [e.timeStamp, changedTouch.pageX, changedTouch.pageY];
    }

    onTouchmove(e) {
        var touches = this.touches,
            changedTouch = e.changedTouches[0];

        if (Math.abs(changedTouch.pageX - touches[1]) > 20 ||
            Math.abs(changedTouch.pageY - touches[2]) > 20)
            this.canTap = false;

        if (!this.canSwipe) return;

        touches.push(e.timeStamp, changedTouch.pageX, changedTouch.pageY);
        if (+new Date() > touches[0] + 100) {
            this.canSwipe = false;
            return;
        }

        // Filter the touches
        var date = e.timeStamp;
        touches = touches.filter((touch, index, arr) => {
            var relatedTimeStamp = arr[index - (index % 3)];
            return relatedTimeStamp > date - 250;
        });

        if ((touches.length / 3) <= 1) return;

        var distance = math.distance(touches[1], touches[2], touches[touches.length - 2], touches[touches.length - 1]);
        if (distance < 60) return;

        // calculate angle.
        var angle = math.angle(touches[1], touches[2], touches[touches.length - 2], touches[touches.length - 1]);

        var eventType = EventType.SWIPE_RIGHT;
        if (angle > 45 && angle < 135) {
            eventType = EventType.SWIPE_DOWN;
        }
        else if (angle > 135 && angle < 225) {
            eventType = EventType.SWIPE_LEFT;
        }
        else if (angle > 225 && angle < 315) {
            eventType = EventType.SWIPE_UP;
        }

        var swipe = document.createEvent("Event");
        swipe && swipe.initEvent(eventType, true, true);
        e.target.dispatchEvent(swipe);

        this.canSwipe = false;

    }

    onTouchend(e) {
        this.isInMotion = false;

        if (!this.canTap) return;

        var touches = this.touches,
            changedTouch = e.changedTouches[0];

        if (Math.abs(changedTouch.pageX - touches[1]) > 20 ||
            Math.abs(changedTouch.pageY - touches[2]) > 20) {
            this.canTap = false;
            return;
        }

        var tapTimeDiff = new Date().getTime() - this.touchStartTime;
        var tap = document.createEvent('Event');
        var eventName = tapTimeDiff > 800 ? EventType.LONG_TAP : EventType.TAP;
        tap && tap.initEvent(eventName, true, true);

        // Target element fix for iOS6+
        var targetElement = e.target;

        if (deviceIsIOSWithBadTarget)
            targetElement = document.elementFromPoint(changedTouch.pageX - window.pageXOffset,
                changedTouch.pageY - window.pageYOffset);

        targetElement.dispatchEvent(tap);
    }
}
