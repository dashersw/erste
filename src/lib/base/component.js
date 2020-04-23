import ComponentManager from './component-manager';
import EventEmitter from './eventemitter3';


/**
 * {@link Component} is a role that determines an aspect of your user interface.
 * It defines what your users see on the page. Every {@link Component} includes
 * a set of behaviors, like what happens when a user clicks on a button.
 *
 * {@link Component}s should be dummy, in that they should have no memory,
 * or state, of their own. {@link Component}s know how to draw a user interface
 * and how to handle user input; whose business logic should be delegated to
 * other classes in the system.
 *
 * @extends {EventEmitter}
 */
export default class Component extends EventEmitter {
    /**
     * Creates a new {@link View} instance. Users should subclass this class
     * to incorporate their own functionality, as the default View instance
     * doesn't provide anything out of the box.
     *
     * @example
     *
     * import {Component} from 'erste';
     *
     * class ButtonWithLabel extends Component {
     *     template() {
     *         return `
     *         <button-with-label>
     *             <h1>Hello world!</h1>
     *             <button>Tap me!</button>
     *         </button-with-label>
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
     * @param {Object!} props Properties that will be saved as `this.props`.
     */
    constructor(props = {}) {
        super();

        /**
         * @type {string}
         *
         * @private
         * @const
         */
        this.id_ = ComponentManager.getInstance().getUid();

        /**
         * @type {?HTMLElement}
         *
         * @private
         */
        this.element_ = null;

        /**
         * The HTML template of a {@link Component}.
         *
         * @type {?string}
         *
         * @private
         */
        this.template_ = null;

        /**
         * Whether the {@link Component} has been rendered into the DOM.
         *
         * @type {boolean}
         *
         * @private
         */
        this.rendered_ = false;

        /**
         * @export
         *
         * An object that holds the properties passed to the constructor at instantiation.
         *
         * @type {!Object}
         */
        this.props = props;

        ComponentManager.getInstance().setComponent(this);

        this.created(this.props);
        this.createdHooks(this.props);
    }


    /**
     * @export
     *
     * This method is called after a {@link Component} is created, but before it's
     * rendered into the DOM.
     *
     * Subclasses should override this method for tasks that should be done
     * when the {@link Component} is created. It's a convenient method that can be
     * used instead of overriding the constructor.
     *
     * @param {!Object} props The properties passed onto this {@link Component}
     * at instantiation.
     */
    created(props) {}

    /**
     * @export
     *
     * This method is called after a {@link Component} is created, but before it's
     * rendered into the DOM.
     *
     * Plugins should override this method for tasks that should be done
     * when the {@link Component} is created. It's a convenient method that can be
     * used instead of overriding the constructor.
     *
     * @param {!Object} props The properties passed onto this {@link Component}
     * at instantiation.
     */
    createdHooks(props) {}

    /**
     * @export
     *
     * The auto-generated, unique id of the {@link Component}.
     *
     * @return {string}
     */
    get id() {
        return this.id_;
    }


    /**
     * @export
     *
     * The DOM element of the {@link Component}. This is a getter that first
     * checks whether the component has been rendered as a DOM element, and
     * returns the `HTMLElement` if so. If the component hasn't been rendered
     * yet, it looks for the element in the DOM. If it's still not yet in the
     * DOM, it renders the element to a DOM element and returns it accordingly.
     *
     * @return {!HTMLElement}
     */
    get el() {
        let rv = this.element_;
        if (!rv) {
            rv = this.element_ = /** @type {!HTMLElement} */ (document.getElementById(this.id) ||
                 (ComponentManager.getInstance().createElement(this.toString())));
        }

        return rv;
    }


    /**
     * Provides template for populating the `id` field of a component.
     *
     * Should not be overridden.
     *
     * @protected
     */
    tagExtension_() {
        return `$1 id="${this.id}"`;
    }


    /**
     * @export
     *
     * This method makes sure that users can conveniently include
     * {@link Component}s in the template of an owner component. Whenever a
     * {@link Component} is cast to a string, we calculate the template and
     * return it.
     *
     * Notice that this is only a template, and does not correspond to the
     * actual {@link Component} instance. In other words, one can't move a
     * {@link Component} instance from a parent to a new parent simply by using
     * its template in the new parent.
     *
     * @override
     */
    toString() {
        if (this.template_) return this.template_;

        var tagRegex = /^(<[^>]+)/;
        var template = this.template(this.props).trim();

        if (!template.match(tagRegex))
            throw Error('Template needs to start with a valid tag.');

        template = template
            .replace(/\s+/, ' ')
            .replace(tagRegex, this.tagExtension_());

        this.template_ = template;

        return this.template_;
    }

    /**
     * @export
     *
     * Given a query selector, returns an array of child `Element`s of this
     * {@link Component} or an empty array if no results are found. This is a
     * wrapper around `el.querySelectorAll`, and conveniently returns an array
     * instead of a `NodeList`, so all array operations work.
     *
     * @param {string} selector Selector to retrieve child `Element`s
     * @return {!Array.<!Element>} The list of child `Element`s or an empty list
     */
    $$(selector) {
        let rv = [], el = this.el;

        if (el) rv = [...el.querySelectorAll(selector)];

        return rv;
    }

    /**
     * @export
     *
     * Given a query selector, returns the first child `Element` of this
     * {@link Component} or null if no results are found or the
     * {@link Component} hasn't been rendered yet. This is a wrapper around
     * `el.querySelector`.
     *
     * @param {string} selector Selector
     * @return {?HTMLElement}
     */
    $(selector) {
        let rv = null, el = this.element_;

        if (el) rv = selector == undefined ? el : /** @type {HTMLElement} */(el.querySelector(selector));

        return rv;
    }


    /**
     * @export
     *
     * Renders the {@link Component} into a given parent DOM element and returns
     * the result. May be called with an optional index to indicate where the
     * DOM element of this {@link Component} should be inserted in the parent.
     *
     * @param {!HTMLElement} rootEl Root element to render this component in.
     * @param {number=} opt_index The index of this component within the parent
     * component. This may be used to render a new child before an existing
     * child in the parent.
     *
     * @return {boolean} Whether the component is rendered. Note that it might
     * have already been rendered, not as a direct result of this call to
     * {@link #Component+render|component.render()}.
     */
    render(rootEl, opt_index) {
        if (this.rendered_) return true;

        if (!this.element_) {

            var el = /** @type {HTMLElement} */ (document.getElementById(this.id));
            if (!el && !rootEl) return false;

            if (el) {
                rootEl = /** @type {!HTMLElement} */(el.parentElement);
                if (!opt_index) {
                    this.element_ = el;
                    this.rendered_ = true;
                    this.onAfterRender();
                    this.onAfterRenderHooks();

                    setTimeout(() => requestAnimationFrame(() => this.onAfterRenderAsync()));

                    return true;
                }
            }

            var index = opt_index ? opt_index : ((rootEl && rootEl.children.length - 1) || -1);
            var child = rootEl && rootEl.children[index];
            rootEl && rootEl.insertBefore(this.el, child || null);
            this.rendered_ = true;
        }

        this.onAfterRender();
        this.onAfterRenderHooks();

        setTimeout(() => requestAnimationFrame(() => this.onAfterRenderAsync()));

        return true;
    }

    /**
     * @export
     */
    get rendered() {
        if (!this.rendered_) {
            var el = document.getElementById(this.id);
            if (el) {
                this.element_ = /** @type {HTMLElement} */(el);
                this.rendered_ = true;
                this.onAfterRender();
                this.onAfterRenderHooks();
            }
        }

        return this.rendered_;
    }


    /**
     * @export
     *
     * This method is called after a render process either as a direct result
     * of a {@link #Component+render|component.render()} call or after the
     * template of this component is inserted into the DOM.
     *
     * Subclasses should override this method for tasks that should be done
     * when the {@link Component} is in the document.
     */
    onAfterRender() {}

    /**
     * @export
     *
     * This method is called after a render process either as a direct result
     * of a {@link #Component+render|component.render()} call or after the
     * template of this component is inserted into the DOM. The main difference
     * with {@link #Component+onAfterRender|component.onAfterRender()} is that
     * this method is for operations that need to be implemented
     * asynchronously — such as CSS transitions. Effectively, this saves you
     * from calling requestAnimationFrame or setTimeout yourself.
     *
     * Subclasses should override this method for tasks that should be done
     * asynchronously after the {@link Component} is rendered in the document.
     */
    onAfterRenderAsync() {}

    /**
     * @export
     *
     * This method is called after a {@link Component} is rendered.
     *
     * Plugins should override this method for tasks that should be done
     * when the {@link Component} is rendered. It's a convenient method that
     * can be used instead of overriding `onAfterRender`.
     */
    onAfterRenderHooks() {
        const attachEvents = (eventName) => {
            if (!this.__events[eventName]) return

            Object.keys(this.__events[eventName]).forEach(selector => {
                const els = this.$$(selector)
                const fn = this.__events[eventName][selector].bind(this)

                els.forEach(el => {
                    el['__ersteEventHandlers'] = el['__ersteEventHandlers'] || {}
                    el['__ersteEventHandlers'][eventName] = fn
                    el.addEventListener(eventName, fn)
                })
            })
        }

        attachEvents('focus')
        attachEvents('blur')
    }

    /**
     * @export
     *
     * Default template for {@link Component}s. Returns an empty `<div>` by
     * default and should be overridden to provide actual HTML templates.
     *
     * A template can also contain another {@link Component} directly, as in the
     * example below. This is a very handy way of rendering component
     * hierarchies.
     *
     * @example
     *
     * template() {
     *     this.buttonWithLabel = new ButtonWithLabel();
     *
     *     return `
     *     <div>
     *         <h1>Label</h1>
     *         ${this.buttonWithLabel}
     *     </div>
     *     `;
     * }
     *
     * @param {!Object} props The properties passed onto this {@link Component}
     * at instantiation.
     * @return {string}
     */
    template(props) {
        return `<div></div>`;
    }

    /**
     * @export
     *
     * This method should be called when this {@link Component} is being
     * removed.
     *
     * Make sure to override this method in your {@link Component}s if
     * they have side effects that should be cleared, e.g. removing event
     * listeners, and make sure to call `super()`.
     *
     * The base implementation here removes all event listeners attached to this
     * {@link Component} and also removes the {@link Component} from the
     * {@link ComponentManager}. Finally, it removes the DOM element from the
     * document.
     */
    dispose() {
        ComponentManager.getInstance().removeComponent(this);
        this.removeAllListeners();

        const detachEvents = eventName => {
            if (!this.__events[eventName]) return

            Object.keys(this.__events[eventName]).forEach(selector => {
                const els = this.$$(selector)

                els.forEach(el => {
                    const fn = el['__ersteEventHandlers'][eventName]
                    el.removeEventListener(eventName, fn)
                })
            })
        }

        detachEvents('focus')
        detachEvents('blur')


        this.element_ && this.element_.parentNode && this.element_.parentNode.removeChild(this.element_);
        this.element_ = null;
    }
}

/**
 * @export
 *
 * @type {Object|undefined}
 */
Component.prototype.events = undefined

/**
 * @type {Object|undefined}
 */
Component.prototype.__events = undefined
