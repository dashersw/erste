import Component from '../../lib/base/component';
import PullToRefreshModel from './pull-to-refresh-model';

/**
 * @extends {Component}
 */
export default class PullToRefresh extends Component {
    /**
     * P2RComponent is a small component which checks the scroll position of a
     * given DOM element, and if it's in
     * an appropriate position, fires a REFRESH event for the parent component
     * to act upon. When the parent component is
     * done with refreshing, it should reset this P2RComponent with the
     * reset() method.
     *
     * @param {!Element=} opt_el Optional element to track its scroll.
     */
    constructor(opt_el) {
        super();

        this.model = new PullToRefreshModel();

        /**
         * @export
         */
        this.EventType = this.model.EventType;
        this.scrollEl = null;
        this.containerEl = null;
        this.scrollListener_ = null;
        this.releaseListener_ = null;

        if (opt_el) this.register(opt_el);

        this.bindModelEvents();
    }

    bindModelEvents() {
        this.model.on(this.model.EventType.SHOULD_REFRESH, this.onShouldRefresh.bind(this));
    }

    /**
     * @export
     *
     * Triggered when the components decides a refresh action. This method should be overridden
     * to, for example, display a spinner animation during refresh.
     */
    onShouldRefresh() {
        var spinner = this.$(this.mappings.SPINNER);
        var arrow = this.$(this.mappings.ARROW);

        window.requestAnimationFrame(() => {
            this.containerEl.style.transform = `translateY(${this.height}px)`;
            this.containerEl.style.transition = '800ms cubic-bezier(.41,1,.1,1)';

            if (spinner) spinner.style.opacity = 1;
            if (arrow) arrow.style.opacity = 0;

            this.emit(this.model.EventType.SHOULD_REFRESH);
        });
    };


    /**
     * @override
     */
    onAfterRender() {
        super.onAfterRender();
        if (!this.scrollEl) this.register(this.el.parentElement);
    };


    /**
     * @export
     *
     * Resets the component state to default. This should be used to signal the
     * end of refreshing so that this component
     * can again check for pull to refresh.
     */
    reset() {
        if (this.scrollEl) {
            this.containerEl.style.transform = 'translateY(0)';
            this.containerEl.style.transition = '300ms ease-out';
        }

        var spinner = this.$(this.mappings.SPINNER);
        var arrow = this.$(this.mappings.ARROW);

        if (spinner) spinner.style.opacity = 0;

        setTimeout(() => {
            if (arrow) arrow.style.opacity = 1;
        }, 500);

        this.model.reset();
    };


    /**
     * @export
     *
     * Registers an element to track its scroll. This can be used for lazily introducing an element to track.
     *
     * @param {?Element} scrollEl Element to track.
     * @param {?Element=} containerEl Element to offset during activity.
     */
    register(scrollEl, containerEl) {
        if (!scrollEl) return;

        if (this.scrollListener_)
            this.scrollEl.removeEventListener('scroll', this.scrollListener_);
        if (this.releaseListener_)
            document.body.removeEventListener('touchend', this.releaseListener_);

        this.scrollEl = scrollEl;

        if (containerEl)
            this.containerEl = containerEl;
        else
            this.containerEl = scrollEl;

        this.reset();

        this.scrollListener_ = this.onScroll_.bind(this);
        this.releaseListener_ = this.onRelease_.bind(this);

        this.scrollEl.addEventListener('scroll', this.scrollListener_);
        document.body.addEventListener('touchend', this.releaseListener_);
    };


    /**
     * Scroll event handler for pull to refresh.
     *
     * @private
     *
     * @param {!Event} e Scroll event object.
     */
    onScroll_(e) {
        this.checkShouldRefresh();

        var rot = 0,
            scroll = -(e.target && e.target.scrollTop || 0),
            pos = this.arrowOffset + Math.pow(scroll, 0.75),
            rotationThreshold = this.threshold - 60;

        if (scroll >= rotationThreshold)
            rot = Math.min(180, (scroll - rotationThreshold) * 3);

        var arrow = this.$(this.mappings.ARROW);

        if (arrow)
            arrow.style.transform = `translateY(${pos}px) rotate(${rot}deg)`;
    };


    /**
     * Fires when the user lifts her finger to finish the scroll.
     * If the user scrolled enough, inform the model to refresh
     *
     * @private
     */
    onRelease_() {
        if (this.scrollEl.scrollTop < -this.threshold)
            this.model.refresh();
    };


    /**
     * If in an appropriate state, checks if the scroll position is right
     * and if so triggers a refresh event.
     */
    checkShouldRefresh() {
        this.model.triggerShouldCheckState();
    };


    /**
     * @override
     */
    template() {
        return `
<pull-to-refresh>
    <pull-to-refresh-arrow></pull-to-refresh-arrow>
    <div class="spinner"></div>
</pull-to-refresh>
`;
    };


    /**
     * @override
     */
    dispose() {
        this.model.removeAllListeners();
        this.el && this.el.removeEventListener('scroll', this.scrollListener_);
        document.body.removeEventListener('touchend', this.releaseListener_);

        super.dispose();
    };


    /**
     * @enum {string}
     */
    get mappings() {
        return {
            ARROW: 'pull-to-refresh-arrow',
            SPINNER: '.spinner'
        };
    }
}

/**
 * @export
 *
 * Threshold value for the release action. Releases after this threshold will trigger a refresh.
 *
 * @type {number}
 */
PullToRefresh.prototype.threshold = 135;


/**
 * @export
 *
 * Height of this component. This setting is used to offset the scroll view while refreshing.
 *
 * @type {number}
 */
PullToRefresh.prototype.height = 96;


/**
 * @export
 *
 * Start position of the arrow. This is adjusted for a spring-like effect.
 *
 * @type {number}
 */
PullToRefresh.prototype.arrowOffset = 0;
