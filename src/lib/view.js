import Component from './base/component';


/**
 * The default view class for all views. Handles default overrides for
 * Component such as rendering to body by default.
 */
export default class View extends Component {
    constructor() {
        super();

        this.rendered = false;
    }


    /**
     * Overridden to make document.body the default parent element. This method also saves if a view is already rendered.
     * Original opt_index parameter is also overridden with the view index. In this case, this view will always be appended
     * to the body.
     *
     * @override
     *
     * @param {?Element=} opt_rootEl Root element to render this view in.
     * @param {number=} opt_index The index of this view in z-axis.
     */
    render(opt_rootEl = document.body, opt_index = 0) {
        this.index = opt_index;

        super.render(opt_rootEl);
    }

    onAfterRender() {
        super.onAfterRender();

        this.el.style.zIndex = this.index;
        this.el.style.transform = `translate3d(0, 0, ${this.index}px)`;
    }

    /**
     * Method called when the View is being activated by a ViewManager. Subclasses should override this method for tasks
     * that should be done when the View is in viewport, such as updating information, etc.
     */
    onActivation() { };

    /**
     * Overriden to include 'view' as a class name.
     *
     * @override
     */
    template() {
        return `
<view></view>
`;
    };

    /**
     * @protected
     */
    tagExtension_() {
        return `$1 id="${this.id}" view`;
    }

    /**
     * @export
     *
     * @return {number} Gives the device width.
     */
    static get WIDTH() {
        if (!View.width_) {
            var bodyStyle = window.getComputedStyle(document.body, null);

            var width = parseInt(bodyStyle && bodyStyle.width || 0, 10);

            View.width_ = width;
            return View.width_;
        }
        else {
            return View.width_;
        }
    }
}



/**
 * View index in z-axis. This should be used as the z value for initial translate3d style declaration.
 *
 * @type {number}
 */
View.prototype.index = 0;


/**
 * Determines whether the view should support back gestures to go back in history or not.
 *
 * @type {boolean}
 */
View.prototype.supportsBackGesture = false;


/**
 * True if the view allows sidebar access. This lets the view manager orchestrate touch gestures for the sidebar menu.
 * Default is false.
 *
 * @type {boolean}
 */
View.prototype.hasSidebar = false;

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
