import Component from './base/component';


/**
 * The default view class for all the views in an erste application. A
 * {@link View} is simply a {@link Component} with additional
 * convenience features. For example, a {@link View} renders to `document.body`
 * by default, whereas a {@link Component} silently ignores the call if no root
 * is provided. Also, regardless of the template, a `view` attribute is added
 * to the root DOM elements of each {@link View}, so that uniform styling
 * across all views is possible without much heavy-lifting.
 *
 * For implementing full-screen, navigable views, users should subclass
 * {@link View}.
 *
 * erste requires you to manually instantiate
 * all the views in your application.
 *
 * @extends {Component}
 */
export default class View extends Component {
    /**
     * Creates a new {@link View} instance. Users should subclass this class
     * to incorporate their own functionality, as the default View instance
     * doesn't provide anything out of the box.
     *
     * @example
     *
     * class RootView extends erste.View {
     *     template() {
     *         return `
     *         <root-view>
     *             <h1>Hello world!</h1>
     *             <button>Click me!</button>
     *         </root-view>
     *         `;
     *     }
     *
     *     onTapButton() {
     *         this.$('h1').innerText = 'Thanks for the tap!';
     *     }
     *
     *     get events() {
     *         return {
     *             'tap': {
     *                 'button': this.onTapButton
     *             }
     *         }
     *     }
     * }
     *
     * new RootView().render(); // renders into body.
     *
     */
    constructor() {
        super();
    }

    /**
     * Renders the view into a parent DOM element. The default root element
     * is `document.body`, so for the sake of simplicity, one can just call
     * `view.render()` to render the view into the DOM.
     *
     * @override
     *
     * @param {?Element=} opt_rootEl=document.body Root element
     * to render this view in.
     * @param {number=} opt_index The index of this view in z-axis.
     */
    render(opt_rootEl = document.body, opt_index = 0) {
        this.index = opt_index;

        return super.render(/** @type {!Element} */(opt_rootEl));
    }


    /**
     * This method is similar to `viewDidAppear` or `componentDidMount` methods
     * found in other frameworks. It's called automatically when the view is
     * rendered into the DOM. This method already sets the`z-index` property
     * and accompanying CSS transforms appropriately, positioning the view to
     * its correct place.
     *
     * Override to provide custom functionality after the view's root element
     * enters the DOM. This can be listening to additional DOM events or
     * manipulating element properties.
     *
     * Make sure to call `super.onAfterRender()` when you override this method.
     *
     * @override
     */
    onAfterRender() {
        super.onAfterRender();

        this.el.style.zIndex = this.index;
        this.el.style.transform = `translate3d(0, 0, ${this.index}px)`;
    }


    /**
     * @export
     *
     * This method is called after the view is activated by a ViewManager, i.e.,
     * either `pull`ed or set as the current view using
     * {@link ViewManager#setCurrentView|setCurrentView}.
     *
     * Subclasses should override this method for tasks that should be done
     * when the View is in viewport, such as updating information, etc.
     */
    onActivation() { };


    /**
     * Default template for views. Uses a custom element `<view>`, which should
     * be set to `display: block` for proper looks.
     *
     * @example
     * You can use the following CSS rule in your implementation:
     *
     * ```css
     * [view] {
     *     position: absolute;
     *     transition: transform .35s;
     *     z-index: 0;
     *     top: 0px;
     *     bottom: 0px;
     *     width: 100%;
     *     overflow: hidden;
     *     -webkit-overflow-scrolling: touch;
     * }
     * ```
     * @override
     */
    template() {
        return `
<view></view>
`;
    };


    /**
     * Provides template for populating the `id` field and adding the `view`
     * attribute.
     *
     * Should not be overridden.
     *
     * @override
     *
     * @protected
     */
    tagExtension_() {
        return `$1 id="${this.id}" view`;
    }


    /**
     * @export
     *
     * Returns the width of the viewport in pixels.
     *
     * @return {number} The device width.
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
 * @export
 *
 * View index in z-axis. This is used as the Z-value for initial translate3d
 * CSS declaration.
 *
 * @type {number}
 */
View.prototype.index = 0;


/**
 * @export
 *
 * Determines whether the view should support back gestures to
 * go back in history of a {@link ViewManager}.
 *
 * @type {boolean}
 */
View.prototype.supportsBackGesture = false;


/**
 * @export
 *
 * Determines whether the view allows swipe / drag gestures to reveal an
 * associated sidebar. This lets the view manager orchestrate the touch gestures
 * for revealing the sidebar menu.
 *
 * @type {boolean}
 */
View.prototype.hasSidebar = false;
