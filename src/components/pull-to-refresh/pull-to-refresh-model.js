import EventEmitter from '../../lib/base/eventemitter3';

/**
 * Model for the pull to refresh component. Manages refreshing states to prevent
 * performance problems like double actions.
 *
 * @extends {EventEmitter}
 */
export default class P2RComponentModel extends EventEmitter {
    constructor() {
        super();

        this.reset();

        this.state_ = this.State.DEFAULT;
    }

    reset() {
        this.state_ = this.State.DEFAULT;
    }


    /**
     * If the component is not in REFRESHING state, it should check to see if it
     * should refresh. This method will be triggered on every scroll event.
     */
    triggerShouldCheckState() {
        if (this.state_ != this.State.REFRESHING)
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
     * Dispatches a refresh event to inform the parent component that it's at the appropriate
     * position for refresh.
     */
    refresh() {
        if (!this.shouldCheck()) return;

        this.state_ = this.State.REFRESHING;

        this.emit(this.EventType.SHOULD_REFRESH);
    };



    /**
     * Pull to refresh states.
     *
     * @enum {string}
     */
    get State() {
        return {
            DEFAULT: 'default',
            SHOULD_CHECK: 'shouldCheck',
            REFRESHING: 'refreshing'
        }
    };


    /**
     * Event types for this model.
     *
     * @enum {string}
     */
    get EventType() {
        return {
            SHOULD_REFRESH: 'refresh'
        }
    }
}
