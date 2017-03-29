import View from './view';
import ComponentManager from '../lib/base/component-manager';
import math from '../lib/base/math';

export default class ViewManager {
    /**
     * This class handles view transitions and view history in a consistent
     * manner. Should be used by views who would like to contain other views.
     * Also, each application should have at least one ViewManager.
     *
     * @param {?Element} opt_root Root element for this ViewManager
     */
    constructor(opt_root) {
        /**
         * @type {!Array.<!View>}
         */
        this.history = [];
        this.lastTouches = [];
        this.state = ViewManager.State.DEFAULT;

        /**
         * @type {?Element}
         */
        this.rootEl = null;

        /**
         * @type {?View} Current active view.
         */
        this.currentView = null;

        this.hideSidebarTimeout = null;

        this.firstX = null;

        this.initialized_ = false;

        if (opt_root) this.root_ = opt_root;
    };

    /**
     * @param {(!View|!Element)=} opt_root Root element for this ViewManager
     */
    init(opt_root) {
        this.initialized_ = true;
        opt_root = opt_root || this.root_;

        if (opt_root instanceof View)
            if (!opt_root.rendered)
                throw new Error(`View Manager's root is not rendered yet`);
            else
                this.rootEl = opt_root.el;
        else
            this.rootEl = opt_root || document.body;

        this.initTouchEvents_();
    }

    /**
     * @return {!View}
     */
    getLastViewInHistory() {
        return this.history[this.history.length - 1];
    }


    /**
     * @param {!View} view View to pull into view.
     * @param {boolean=} opt_canGoBack Whether this view keeps history so that one can go back to the previous view.
     */
    pull(view, opt_canGoBack) {
        if (!this.initialized_) this.init();

        if (!view.rendered && this.rootEl) view.render(this.rootEl, this.topIndex += 2);

        var currentView = this.currentView;

        if (!currentView) return this.setCurrentView(view);

        if (opt_canGoBack) {
            this.history.push(currentView);

            const fn = () => {
                currentView.el.style.transitionDuration = '0s';
                currentView.el.style.transform = 'translate3d(-100%,-100%,0)';
                currentView.el.removeEventListener('transitionend', fn);
            };

            currentView.el.addEventListener('transitionend', fn);
        }
        else {
            var history = this.history.slice(0);
            this.history = [];

            setTimeout(() => {
                currentView.dispose();

                // Dispose all views in history.
                history.forEach(historicView => historicView.dispose());
            }, 1000);
        }

        view.el.style.transitionDuration = '0s';
        view.el.style.transform = `translate3d(100%, 0, ${view.index}px)`;

        requestAnimationFrame(() => {
            currentView.el.style.transitionDuration = '0.35s';
            view.el.style.transitionDuration = '0.35s';

            requestAnimationFrame(() => {
                view.el.style.transform = `translate3d(0, 0, ${view.index}px)`;
                currentView.el.style.transform = `translate3d(-30%, 0, ${currentView.index}px)`;
                view.el.style['boxShadow'] = '0 0 24px black';
            });
        });

        this.currentView = view;

        this.state = ViewManager.State.DEFAULT;
    };


    /**
     * Returns true if there is one or more views in history,
     * returns false otherwise.
     *
     * @return {boolean} Whether the view manager can push current view.
     */
    canGoBack() {
        return this.history && this.history.length > 0;
    };


    /**
     * Switches to the previous view if there's one.
     */
    push() {
        var lastView = this.history.pop(),
            currentView = this.currentView;

        if (!lastView) return;

        if (!this.initialized_) this.init();

        window.requestAnimationFrame(() => {
            currentView.el.style.transitionDuration = '0s';
            lastView.el.style.transitionDuration = '0s';
            lastView.el.style.transform = 'translate3d(-30%,0,0)';
            window.requestAnimationFrame(() => {
                lastView.el.style.transitionDuration = '0.35s';
                currentView.el.style.transitionDuration = '0.35s';

                lastView.el.style.transform = `translate3d(0, 0, ${lastView.index}px)`;
                currentView.el.style.transform = `translate3d(100%, 0, ${currentView.index}px)`;
                currentView.el.style['boxShadow'] = '0 0 0 black';
            });
        });

        this.currentView = lastView;
        lastView.onActivation && lastView.onActivation();

        setTimeout(() => currentView.dispose(), 1000);

        this.state = ViewManager.State.DEFAULT;
    };


    /**
     * Makes a given view the foremost view without animations and with disposing previous views in history.
     *
     * @param {!View} view The view to set as the foremost view.
     * @param {boolean=} opt_noDispose Whether to dispose the current view.
     */
    setCurrentView(view, opt_noDispose) {
        if (!this.initialized_) this.init();

        if (!view.rendered && this.rootEl) view.render(this.rootEl, this.topIndex += 2);

        var currentView = this.currentView;

        if (!opt_noDispose) {
            setTimeout(() => currentView && currentView.dispose(), 1000);
        } else if (currentView) {
            currentView.el.style.transitionDuration = '0s';
            currentView.el.style.transform = `translate3d(100%, 0, ${currentView.index}px)`;
        }

        view.index = this.topIndex += 2;
        this.currentView = view;
        this.currentView.onActivation && this.currentView.onActivation();

        // Dispose all views in history.
        this.history.forEach(historicView => historicView.dispose());

        this.history = [];

        var translation = `translate3d(0, 0, ${view.index}px)`;
        view.el.style.transitionDuration = '0s';

        if (this.state == ViewManager.State.SIDEBAR_OPEN) {
            translation = `translate3d(${128 - View.WIDTH}px, 0, ${view.index}px)`;

            view.el.style.transform = translation;
            this.toggleSidebar_(false);

            return;
        }

        view.el.style.zIndex = view.index;
        view.el.style.transform = translation;

        this.state = ViewManager.State.DEFAULT;
    };


    /**
     * Toggles the sidebar on or off according to its current state. This is to be used for a menu button, for example.
     */
    toggleSidebar() {
        if (!this.initialized_) this.init();

        this.toggleSidebar_(this.state == ViewManager.State.DEFAULT);
    };


    /**
     * Initializes touch event handlers for all touch end and touch move events ocurring on the root element.
     *
     * @private
     */
    initTouchEvents_() {
        if (!this.rootEl) return;

        this.rootEl.addEventListener('touchmove', this.onTouchMove_.bind(this), false);
        this.rootEl.addEventListener('touchend', this.onTouchEnd_.bind(this), false);
    };


    /**
     * Handles touch move events and decides how the view transitions should occur.
     *
     * @private
     */
    onTouchMove_(e) {
        var clientX = e.changedTouches && e.changedTouches[0].clientX || 0;
        clearTimeout(this.hideSidebarTimeout);

        if (this.state == ViewManager.State.DEFAULT || this.state == ViewManager.State.SIDEBAR_OPEN)
            this.firstX = clientX;

        if (this.state == ViewManager.State.DEFAULT) {
            this.lastTouches = [];

            this.state = ViewManager.State.STARTED_GESTURE;
        }

        if (this.state == ViewManager.State.STARTED_GESTURE) {
            if (clientX <= 50) {
                if (this.history.length && this.currentView && this.currentView.supportsBackGesture)
                    this.state = ViewManager.State.GOING_TO_BACK_VIEW;
            }
            else if (this.currentView && this.currentView.hasSidebar) {
                this.lastTouches.push(this.firstX - clientX);

                if (this.lastTouches.length == 4) this.lastTouches.shift();

                if (this.lastTouches[2] - this.lastTouches[0] > 40)
                    this.state = ViewManager.State.OPENING_SIDEBAR;
            }
        }

        if (this.state == ViewManager.State.SIDEBAR_OPEN)
            this.state = ViewManager.State.CLOSING_SIDEBAR;

        switch (this.state) {
            case ViewManager.State.GOING_TO_BACK_VIEW:
                this.backGestureTouchMove_(e);
                break;
            case ViewManager.State.CLOSING_SIDEBAR:
                this.closeSidebarTouchMove_(e);
                break;
            case ViewManager.State.OPENING_SIDEBAR:
                this.openSidebarTouchMove_(e);
                break;
        }
    };


    /**
     * Handles touch end events and decides how the view transitions should follow.
     *
     * @private
     */
    onTouchEnd_(e) {
        var state;

        switch (this.state) {
            case ViewManager.State.GOING_TO_BACK_VIEW:
                this.backGestureTouchEnd_(e);
                break;
            case ViewManager.State.OPENING_SIDEBAR:
                state = true;
                if (this.lastTouches[2] - this.lastTouches[0] < 3)
                    state = false;

                this.toggleSidebar_(state);
                break;
            case ViewManager.State.CLOSING_SIDEBAR:
                state = true;
                if (this.lastTouches[2] - this.lastTouches[0] < -3)
                    state = false;

                this.toggleSidebar_(state);
                break;
            case ViewManager.State.SIDEBAR_OPEN:
                if (ComponentManager.gestureHandler.canTap) return;
                this.toggleSidebar_(false);
                break;
            default:
                this.state = ViewManager.State.DEFAULT;
        }
    };


    /**
     * Handles touch end event when they occur in a back gesture.
     *
     * @private
     * @param {!TouchEvent} e Touch end event.
     */
    backGestureTouchEnd_(e) {
        if (!this.firstX) return;

        var history = this.history,
            lastView = this.getLastViewInHistory(),
            currentView = this.currentView,
            clientX = e.changedTouches && e.changedTouches[0].clientX || 0,
            duration = math.lerp(0.15, 0.35, (View.WIDTH - clientX) / View.WIDTH);

        window.requestAnimationFrame(() => {
            currentView.el.style.transitionDuration = duration + 's';
            lastView.el.style.transitionDuration = duration + 's';

            var currentViewX = '100%',
                lastViewX = '0';

            if (clientX < (View.WIDTH / 2)) {
                currentViewX = '0';
                lastViewX = '-30%';

                const fn = () => {
                    lastView.el.style.transitionDuration = '0s';
                    lastView.el.style.transform = 'translate3d(-100%,-100%,0)';
                    lastView.el.removeEventListener('transitionend', fn);
                }

                lastView.el.addEventListener('transitionend', fn);
            } else {
                this.currentView = /** View */this.getLastViewInHistory();
                history.pop();

                lastView.onActivation && lastView.onActivation();

                setTimeout(() => {
                    currentView.dispose();
                }, 1000);
            }

            currentView.el.style.transform = `translate3d(${currentViewX}, 0, ${currentView.index}px)`;
            lastView.el.style.transform = `translate3d(${lastViewX}, 0, ${currentView.index - 1}px)`;
            currentView.el.style['boxShadow'] = '0px 0 0px black';
        });

        this.state = ViewManager.State.DEFAULT;
    };


    /**
     * Handle touch move events when they occur in a back gesture.
     *
     * @private
     * @param {!TouchEvent} e Touch end event.
     */
    backGestureTouchMove_(e) {
        if (!this.history.length) return;

        /* Google Chrome will fire a touchcancel event about 200 milliseconds
         after touchstart if it thinks the user is panning/scrolling and you
         do not call event.preventDefault(). */
        e.preventDefault();
        var clientX = e.changedTouches && e.changedTouches[0].clientX || 0;

        var lastView = this.history[this.history.length - 1];
        var currentView = this.currentView;
        var currentViewDiff = clientX - this.firstX;
        var viewWidth = View.WIDTH;
        var lastViewDiff = Math.floor(math.lerp(-viewWidth * 0.3, 0, currentViewDiff / (viewWidth - this.firstX)));
        var boxShadow = Math.floor(math.lerp(1, 0, currentViewDiff / (viewWidth - this.firstX)) * 5) / 5;
        if (currentViewDiff < 0) return;

        window.requestAnimationFrame(() => {
            currentView.el.style.transitionDuration = '0s';
            lastView.el.style.transitionDuration = '0s';
            currentView.el.style.transform = `translate3d(${currentViewDiff}px, 0, ${currentView.index}px)`;
            lastView.el.style.transform = `translate3d(${lastViewDiff}px, 0, ${currentView.index - 1}px)`;

            currentView.el.style['boxShadow'] = `0px 0 24px rgba(0, 0, 0, ${boxShadow})`;
        });
    };


    /**
     * Close sidebar touch move functionality.
     *
     * @private
     * @param {!TouchEvent} e
     */
    closeSidebarTouchMove_(e) {
        var clientX = e.changedTouches && e.changedTouches[0].clientX || 0;

        this.lastTouches.push(this.firstX - clientX);

        if (this.lastTouches.length == 4) this.lastTouches.shift();

        /* Google Chrome will fire a touchcancel event about 200 milliseconds
         after touchstart if it thinks the user is panning/scrolling and you
         do not call event.preventDefault(). */
        e.preventDefault();

        var currentView = this.currentView;
        var viewWidth = View.WIDTH;
        var currentViewDiff = clientX - this.firstX - viewWidth * 4 / 5;
        window.requestAnimationFrame(() => {
            currentView.el.style.transitionDuration = '0s';
            currentView.el.style.transform = `translate3d(${currentViewDiff}px, 0, ${currentView.index}px)`;
        });
    };


    /**
     * Toggles the sidebar on or off according to a given state.
     *
     * @private
     * @param {boolean} state Whether to open or close the sidebar.
     */
    toggleSidebar_(state) {
        var currentView = this.currentView,
            sidebar = document.querySelector('sidebar');

        requestAnimationFrame(() => {
            currentView.el.style.transitionDuration = '0.35s';

            var currentViewX = `${128 - View.WIDTH}px`,
                sidebarX = '0',
                sidebarZ = `${currentView.index - 1}px`;

            if (!state) {
                currentViewX = '0';
                sidebarX = '100%';
                sidebarZ = 0;
                this.hideSidebarTimeout = setTimeout(() => {
                    if (this.state == ViewManager.State.DEFAULT)
                        sidebar.style.transform = `translate3d(${sidebarX}, 0, ${sidebarZ})`;
                }, 1000);
            } else {
                sidebar.style.transform = `translate3d(${sidebarX}, 0, ${sidebarZ})`;
            }
            currentView.el.style.transform = `translate3d(${currentViewX}, 0, ${currentView.index}px)`;
        });

        if (state)
            this.state = ViewManager.State.SIDEBAR_OPEN;
        else
            this.state = ViewManager.State.DEFAULT;
    };


    /**
     * Close sidebar touch move functionality.
     *
     * @private
     * @param {!TouchEvent} e
     */
    openSidebarTouchMove_(e) {
        if (ComponentManager.gestureHandler.canTap) return;

        var clientX = e.changedTouches && e.changedTouches[0].clientX || 0;
        this.lastTouches.push(this.firstX - clientX);

        if (this.lastTouches.length == 4) this.lastTouches.shift();

        /* Google Chrome will fire a touchcancel event about 200 milliseconds
         after touchstart if it thinks the user is panning/scrolling and you
         do not call event.preventDefault(). */
        e.preventDefault();

        var sidebar = document.querySelector('sidebar');
        var currentView = this.currentView;
        var currentViewDiff = clientX - this.firstX;

        if (currentViewDiff >= 0) return;
        this.state = ViewManager.State.OPENING_SIDEBAR;

        window.requestAnimationFrame(() => {
            sidebar.style.transform = `translate3d(0, 0, ${currentView.index - 1}px)`;
            sidebar.style.transitionDuration = '0s';

            currentView.el.style.transitionDuration = '0s';
            currentView.el.style.transform = `translate3d(${currentViewDiff}px, 0, ${currentView.index}px)`;
        });
    };

    /**
     * View manager states.
     *
     * @enum {string}
     */
    static get State() {
        return {
            DEFAULT: 'default',
            STARTED_GESTURE: 'started',
            CLOSING_SIDEBAR: 'closingSidebar',
            OPENING_SIDEBAR: 'openingSidebar',
            SIDEBAR_OPEN: 'sidebarOpen',
            GOING_TO_BACK_VIEW: 'going'
        }
    }
}


/**
 * 3d transform Z position for the uppermost view. Used to set the right view on top.
 * @type {number}
 */
ViewManager.prototype.topIndex = 1;


window.requestAnimationFrame = (() => {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();
