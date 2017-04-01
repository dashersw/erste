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
     * @param {?Element=} opt_base Base element
     * @param {number=} opt_index Base element
     */
    render(opt_base, opt_index) {
        if (this.rendered_) return;

        if (!this.element_) {
            var el = document.getElementById(this.id);
            if (!el && !opt_base) return;
            if (el) {
                opt_base = el.parentElement;
                if (!opt_index) {
                    this.element_ = el;
                    this.rendered_ = true;
                    this.onAfterRender();

                    return;
                }
            }

            var index = opt_index ? opt_index : ((opt_base && opt_base.children.length - 1) || -1);
            var child = opt_base && opt_base.children[index];
            opt_base && opt_base.insertBefore(this.el, child || null);
            this.rendered_ = true;
        }

        this.onAfterRender();
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
     * Method called before a render process. Called automatically before each render. Subclasses should override
     * this method for tasks that should be done right before the View enters the document.
     */
    onBeforeRender() { };


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
