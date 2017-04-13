import ComponentManager from './component-manager';
import EventEmitter from './eventemitter2';

/**
 * @extends {EventEmitter}
 */
class Component extends EventEmitter {
    /**
     * Component is a role that determines your user interface. It defines what
     * your users see on the page. Component includes a lot of predefined
     * behaviors, like what happens when a user clicks on a button. Components
     * are extremely dummy, in that they have no memory, or state, of their
     * own. They know how to draw a user interface and how to handle user
     * input; which they delegate to the Representatives.
     */
    constructor() {
        super({
            maxListeners: Infinity
        });

        /**
         * @type {string}
         *
         * @private
         */
        this.id_ = ComponentManager.getUid();

        /**
         * @type {?Element}
         *
         * @private
         */
        this.element_ = null;

        /**
         * @type {?string}
         *
         * @protected
         */
        this.template_ = null;

        /**
         * @type {boolean}
         *
         * @protected
         */
        this.rendered_ = false;

        ComponentManager.setComponent(this);
    }

    /**
     * @return {string}
     */
    get id() {
        return this.id_;
    }

    /**
     * @return {!HTMLElement}
     */
    get el() {
        let rv = this.element_;
        if (!rv) {
            rv = this.element_ = document.getElementById(this.id) ||
                ComponentManager.createElement(this.toString());
        }

        return rv;
    }

    /**
     * @protected
     */
    tagExtension_() {
        return `$1 id="${this.id}"`;
    }

    /**
     * @override
     */
    toString() {
        if (this.template_) return this.template_;

        var tagRegex = /^(<[^>]+)/;
        var template = this.template().trim();

        if (!template.match(tagRegex))
            throw Error('Template needs to start with a valid tag.');

        template = template
            .replace(/\s+/, ' ')
            .replace(tagRegex, this.tagExtension_());

        this.template_ = template;

        return this.template_;
    }

    /**
     * @param {string} selector Selector
     * @return {!Array.<!Element>}
     */
    $$(selector) {
        let rv = [], el = this.el;

        if (el) rv = [...el.querySelectorAll(selector)];

        return rv;
    }

    /**
     * @param {string} selector Selector
     * @return {?Element}
     */
    $(selector) {
        let rv = null, el = this.element_;

        if (el) rv = selector == undefined ? el : el.querySelector(selector);

        return rv;
    }

    /**
     * Renders the {@link Component} into a given parent DOM element and returns
     * the result. May be called with an optional index to indicate where the
     * DOM element of this {@link Component} should be inserted in the parent.
     *
     * @param {!Element} rootEl Root element to render this component in.
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
            var el = document.getElementById(this.id);
            if (!el && !rootEl) return false;

            if (el) {
                rootEl = el.parentElement;
                if (!opt_index) {
                    this.element_ = el;
                    this.rendered_ = true;
                    this.onAfterRender();

                    return true;
                }
            }

            var index = opt_index ? opt_index : ((rootEl && rootEl.children.length - 1) || -1);
            var child = rootEl && rootEl.children[index];
            rootEl && rootEl.insertBefore(this.el, child || null);
            this.rendered_ = true;
        }

        this.onAfterRender();

        return true;
    }

    get rendered() {
        if (!this.rendered_) {
            var el = document.getElementById(this.id);
            if (el) {
                this.element_ = el;
                this.rendered_ = true;
                this.onAfterRender();
            }
        }

        return this.rendered_;
    }


    /**
     * Method called after a render process. Called automatically after each render. Subclasses should override
     * this method for tasks that should be done when the View is in document.
     */
    onAfterRender() { };


    /**
     * @return {string}
     */
    template() {
        return `<div></div>`;
    }

    /**
     * Call when removing this Component from memory
     */
    dispose() {
        ComponentManager.removeComponent(this);
        this.removeAllListeners();

        this.element_ && this.element_.parentNode && this.element_.parentNode.removeChild(this.element_);
        this.element_ = null;
    }
}

export default Component;
