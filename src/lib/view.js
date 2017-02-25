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
     * @export
     *
     * Overridden to make document.body the default parent element. This method also saves if a view is already rendered.
     * Original opt_index parameter is also overridden with the view index. In this case, this view will always be appended
     * to the body.
     *
     * @override
     *
     * @param {!HTMLElement=} opt_rootEl Root element to render this view in.
     * @param {number=} opt_index The index of this view in z-axis.
     */
    render(opt_rootEl = document.body, opt_index = 0) {
        this.onBeforeRender();
        this.rendered = true;

        this.index = opt_index;

        super.render(opt_rootEl);

        this.el.style.zIndex = this.index;
        this.onAfterRender();
    }

    /**
     * @export
     *
     * Method called before a render process. Called automatically before each render. Subclasses should override
     * this method for tasks that should be done right before the View enters the document.
     */
    onBeforeRender() { };


    /**
     * @export
     *
     * Method called after a render process. Called automatically after each render. Subclasses should override
     * this method for tasks that should be done when the View is in document.
     */
    onAfterRender() { };


    /**
     * @export
     *
     * Method called when the View is being activated by a ViewManager. Subclasses should override this method for tasks
     * that should be done when the View is in viewport, such as updating information, etc.
     */
    activate() { };


    /**
     * @export
     *
     * Overriden to include 'view' as a class name.
     *
     * @override
     */
    template() {
        return `
<view class="${this.className}"
    style="-webkit-transform: translate3d(100%, 0, ${this.index}px)">
    ${this.template_content}
</view>`;
    };


    /**
     * @export
     *
     * Empty content template. Subclasses should override this method and implement necessary markup here.
     *
     * @return {string} Content markup for the view.
     */
    get template_content() {
        return '';
    };
}



/**
 * @export
 *
 * View index in z-axis. This should be used as the z value for initial translate3d style declaration.
 *
 * @type {number}
 */
View.prototype.index = 0;


/**
 * @export
 *
 * Determines whether the view should support back gestures to go back in history or not.
 *
 * @type {boolean}
 */
View.prototype.supportsBackGesture = true;


/**
 * @export
 *
 * True if the view allows sidebar access. This lets the view manager orchestrate touch gestures for the sidebar menu.
 * Default is false.
 *
 * @type {boolean}
 */
View.prototype.hasSidebar = false;


/**
 * @export
 *
 * Defines CSS class names for the view.
 *
 * @type {string}
 */
View.prototype.className = '';


var bodyStyle = window.getComputedStyle(document.body, null);

/**
 * @export
 *
 * @type {number} Gives the device width.
 */
View.WIDTH = parseInt(bodyStyle && bodyStyle.width || 0, 10);

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
