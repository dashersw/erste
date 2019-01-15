import EventEmitter from '../../lib/base/eventemitter3';

/**
 * Model for the infinite scroll component. Manages loading states to prevent
 * performance problems like double actions.
 *
 * @extends {EventEmitter}
 */
export default class InfiniteScrollModel extends EventEmitter {
    constructor() {
        super();

        this.state_ = this.State.DEFAULT;
    }

    /**
     * Resets the component state to default state.
     */
    reset() {
        this.state_ = this.State.DEFAULT;
    }


    /**
     * If the component is not in LOADING state, it should check to see if it
     * should load. This method will be triggered on every scroll event.
     */
    triggerShouldCheckState() {
        if (this.state_ != this.State.LOADING)
            this.state_ = this.State.SHOULD_CHECK;
    };


    /**
     * Informs the caller if this model is in an appropriate state for checking
     * the right (scroll) position.
     *
     * @return {boolean} Whether the component should check for the right
     *                   (scroll) position.
     */
    shouldCheck() {
        return this.state_ == this.State.SHOULD_CHECK;
    };


    /**
     * Emits a load event to inform the parent component that it's at the
     * end of a scroll and should load more items.
     */
    load() {
        if (!this.shouldCheck()) return;

        this.state_ = this.State.LOADING;

        this.emit(this.EventType.SHOULD_LOAD);
    };


    /**
     * Load more states.
     *
     * @enum {string}
     */
    get State() {
        return {
            DEFAULT: 'default',
            SHOULD_CHECK: 'shouldCheck',
            LOADING: 'loading'
        }
    };


    /**
     * Event types for this model.
     *
     * @enum {string}
     */
    get EventType() {
        return {
            SHOULD_LOAD: 'load'
        }
    };
}
