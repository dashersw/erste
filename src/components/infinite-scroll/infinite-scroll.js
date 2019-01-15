import Component from '../../lib/base/component';
import InfiniteScrollModel from './infinite-scroll-model';
import throttle from '../../lib/throttle';

/**
 * @extends {Component}
 */
class InfiniteScroll extends Component {
    /**
     * InfiniteScrollComponent is a small component which checks the scroll
     * position of a given DOM element, and if it's in
     * an appropriate position, fires a LOAD event for the parent component
     * to act upon. When the parent component is
     * done loading new items, it should reset this InfiniteScrollComponent
     * with the reset() method.
     *
     * @param {!Element=} opt_el Optional element to track its scroll.
     */
    constructor(opt_el) {
        super();
        this.model = new InfiniteScrollModel();

        /**
         * @export
         */
        this.EventType = this.model.EventType;

        this.scrollListener_ = null;
        this.scrollEl = null;

        /**
         * Message to show when no more items are available to load.
         *
         * @type {string}
         */
        this.endOfListText = '';

        this.throttle = throttle(this.checkShouldLoadMore_, 100, this);

        if (opt_el) this.register(opt_el);
        this.bindModelEvents();
    }

    bindModelEvents() {
        this.model.on(this.model.EventType.SHOULD_LOAD, this.onShouldLoad.bind(this));
    }

    onShouldLoad() {
        this.emit(this.EventType.SHOULD_LOAD);
    }


    /**
     * @override
     */
    render(opt_base, opt_index) {
        var rv = super.render(opt_base, opt_index);

        if (!this.el) this.register(this.el.parentElement);

        return rv;
    };


    /**
     * @export
     *
     * Resets the component state to default. This should be used to signal
     * the end of loading so that this component
     * can again check for loading.
     */
    reset() {
        this.model.reset();
    };


    /**
     * @export
     *
     * Registers an element to track its scroll. This can be used for lazily introducing an element to track.
     *
     * @param {?Element} el Element to track.
     */
    register(el) {
        if (!el) return;

        this.reset();

        this.scrollEl && this.scrollEl.removeEventListener('scroll', this.scrollListener_);

        this.scrollEl = el;
        this.scrollListener_ = this.onScroll_.bind(this);
        this.scrollEl.addEventListener('scroll', this.scrollListener_);
    };


    /**
     * Scroll event handler for infinite scroll. Fires the throttle to check for
     * the correct load more position.
     *
     * @private
     */
    onScroll_() {
        this.throttle();
    };


    /**
     * If in an appropriate state, checks if the scroll position is right and if so triggers a load more event.
     *
     * @private
     */
    checkShouldLoadMore_() {
        this.model.triggerShouldCheckState();
        if (!this.model.shouldCheck()) return;

        var el = this.scrollEl;
        if (!el) return;

        if (el.scrollHeight > el.offsetHeight && // the element can actually scroll
            el.scrollTop > el.scrollHeight - el.offsetHeight - 400) // and we're in a good position to load more
            this.model.load();
    };


    /**
     * @export
     *
     * Shows spinner during load.
     */
    showSpinner() {
        this.el.classList.add('spinner');
        this.el.innerText = '';
        this.reset();
    };


    /**
     * @export
     *
     * Shows end of list message if no more items are available.
     */
    showEndOfList() {
        this.el.innerText = this.endOfListText;
        this.el.classList.remove('spinner');
    };


    /**
     * @override
     */
    template() {
        return `<inf-scroll></inf-scroll>`;
    };


    /**
     * @override
     */
    dispose() {
        this.model.removeAllListeners();
        this.scrollEl.removeEventListener('scroll', this.scrollListener_);

        super.dispose();
    };
}

export default InfiniteScroll;
