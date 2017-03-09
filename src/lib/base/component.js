import ComponentManager from './component-manager';
import EventEmitter2 from './eventemitter2';

export default class Component extends EventEmitter2 {
    /**
     * Component is a role that determines your user interface. It defines what
     * your users see on the page. Component includes a lot of predefined
     * behaviors, like what happens when a user clicks on a button. Components
     * are extremely dummy, in that they have no memory, or state, of their
     * own. They know how to draw a user interface and how to handle user
     * input; which they delegate to the Representatives.
     *
     * @export
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
         * @private
         */
        this.template_ = null;

        ComponentManager.setComponent(this);
    }

    /**
     * @export
     * @return {string}
     */
    get id() {
        return this.id_;
    }

    /**
     * @export
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
     * @export
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
            .replace(tagRegex, `$1 id="${this.id}"`);

        this.template_ = template;

        return this.template_;
    }

    /**
     * @export
     * @param {string} selector Selector
     * @return {!Array.<?Element>}
     */
    $$(selector) {
        let rv = [], el = this.el;

        if (el) rv = [...el.querySelectorAll(selector)];

        return rv;
    }

    /**
     * @export
     * @param {string} selector Selector
     * @return {?Element}
     */
    $(selector) {
        let rv = null, el = this.el;

        if (el) rv = selector == undefined ? el : el.querySelector(selector);

        return rv;
    }

    /**
     * @export
     * @param {!HTMLElement=} opt_base Base element
     * @param {number=} opt_index Base element
     */
    render(opt_base, opt_index) {
        if (!opt_base) return;

        var child = opt_base.children[opt_index ? opt_index : opt_base.children.length - 1];
        opt_base.insertBefore(this.el, child || null);
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
     * @export
     * @return {string}
     */
    template() {
        return `<div></div>`;
    }

    /**
     * @export
     * Call when removing this Component from memory
     */
    dispose() {
        ComponentManager.removeComponent(this);
        this.removeAllListeners();

        this.element_ && this.element_.parentNode && this.element_.parentNode.removeChild(this.element_);
        this.element_ = null;
    }
}
