const EventType = {
    TAP: 'tap',
    LONG_TAP: 'longTap',
    SWIPE_RIGHT: 'swipeRight',
    SWIPE_UP: 'swipeUp',
    SWIPE_LEFT: 'swipeLeft',
    SWIPE_DOWN: 'swipeDown'
};

class MouseGestureHandler {
    /**
     * Tracks and fires gestures on touch enabled devices.
     *
     * @param {!HTMLElement=} element Provided, gesture handler will track gesture
     *                           events on this element. The default
     *                           value is document.body; but an optional
     *                           root element is inevitable for iframe's.
     */
    constructor(element) {
        this.element = element || document.body;
        this.isMouseDown = false;
        /**
         * @type {number | null}
         */
        this.startX = null;
        /**
         * @type {number | null}
         */
        this.startY = null;
        /**
         * @type {number | null}
         */
        this.angle = null;
        /**
         * @type {number | null}
         */
        this.startTimestamp = null;

        this.element.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.element.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.element.addEventListener('mouseup', this.onMouseUp.bind(this));
    }

    /**
     * Checks if the mouse x and y is inside the tappable range
     *
     * @param {number} mouseX
     * @param {number} mouseY
     * @returns {boolean}
     */
    getIsMouseInTapRange(mouseX, mouseY) {
        const dx = mouseX - this.startX;
        const dy = mouseY - this.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= 3;
    }

    /**
     * @returns {string}
     */
    getSwipeEvent() {
        if (this.angle >= 45 && this.angle < 135) {
            return EventType.SWIPE_UP;
        }

        if (this.angle >= 135 && this.angle < 225) {
            return EventType.SWIPE_RIGHT;
        }

        if (this.angle >= 225 && this.angle < 315) {
            return EventType.SWIPE_DOWN;
        }

        if (this.angle >= 315 || this.angle < 45) {
            return EventType.SWIPE_LEFT;
        }

        throw new Error('Angle is out of range');
    }

    /**
     * @param {MouseEvent} e
     * @returns {number | null}
     */
    getSwipeAngle(e) {
        if ((this.startX !== 0 && !this.startX) || (this.startY !== 0 && !this.startY)) {
            return null;
        }
    
        const endX = e.screenX + e.movementX;
        const endY = e.screenY + e.movementY;
        const deltaX = endX - this.startX;
        const deltaY = endY - this.startY;
        return Math.atan2(deltaY, deltaX) * 180 / Math.PI + 180;
    }

    /**
     * @param {MouseEvent} e
     * @returns {void}
     */
    onMouseDown(e) {
        this.startTimestamp = e.timeStamp;
        this.isMouseDown = true;
        this.startX = e.screenX;
        this.startY = e.screenY;
    }

    /**
     * @param {MouseEvent} e
     * @returns {void}
     */
    onMouseMove(e) {
        if (!this.isMouseDown) return;

        const angle = this.getSwipeAngle(e);

        if (angle === 0 || angle) {
            this.angle = angle;
        }
    }

    /**
     * @param {MouseEvent} e
     * @returns {void}
     */
    onMouseUp(e) {
        if (this.getIsMouseInTapRange(e.screenX, e.screenY)) {
            const tapType = e.timeStamp - this.startTimestamp > 800 ? EventType.LONG_TAP : EventType.TAP;
            const event = new Event(tapType, { bubbles: true, cancelable: true });
            e.target.dispatchEvent(event);
        } else {
            const event = new Event(this.getSwipeEvent(), { bubbles: true, cancelable: true });
            console.log(event);
            e.target.dispatchEvent(event);
        }

        // Clean-up
        this.isMouseDown = false;
        this.angle = null;
        this.startX = null;
        this.startY = null;
        this.startTimestamp = null;
    }
}

export default MouseGestureHandler;