import GestureHandler from './gesture-handler';
import getUid from './uid';
import Component from './component';

const events = [
    'blur',
    'click',
    'mouseover',
    'mouseout',
    'mousemove',
    'mousedown',
    'mouseup',
    'scroll',
    'keyup',
    'keypress',
    'focus',
    'focusin',
    'focusout',
    'paste',
    'input',
    'touchstart',
    'touchmove',
    'touchend',
    'tap',
    'longtap',
    'doubletap',
    'press',
    'pan',
    'swipe',
    'swipeTop',
    'swipeRight',
    'swipeBottom',
    'swipeLeft'
];

const nonBubblingEventsMap = {
    'blur': 1,
    'focus': 1,
    'abort': 1,
    'canplay': 1,
    'canplaythrough': 1,
    'durationchange': 1,
    'emptied': 1,
    'ended': 1,
    'error': 1,
    'loadeddata': 1,
    'loadedmetadata': 1,
    'loadstart': 1,
    'pause': 1,
    'play': 1,
    'playing': 1,
    'progress': 1,
    'ratechange': 1,
    'seeked': 1,
    'seeking': 1,
    'stalled': 1,
    'suspend': 1,
    'timeupdate': 1,
    'volumechange': 1,
    'waiting': 1
};


// match & select "[eventType] [css selector]"
const handlerMethodPattern = new RegExp(`^(${events.join('|')}|${Object.keys(nonBubblingEventsMap).join('|')}) (.*)`);

/**
 * Fills events object of given component class from method names that match event handler pattern.
 *
 * @param {!Component} comp Component instance to decorate events for.
 */
function decorateEvents(comp) {
    const originalPrototype = /** @type {!Function} */(comp.constructor).prototype;

    if (originalPrototype.__events) return;

    const nonBubblingEvents = [];

    let events = {};

    if ('events' in originalPrototype && originalPrototype.events) {
        events = originalPrototype.events;
    }

    const methods = [];

    let prototype = originalPrototype;

    do {
        methods.push(...Object.getOwnPropertyNames(/** @type {!Object} */(prototype)));
        prototype = Object.getPrototypeOf(/** @type {!Object} */(prototype));
    } while (prototype != Component.prototype && Object.getPrototypeOf(/** @type {!Object} */(prototype)));

    methods
        .map(propertyName => handlerMethodPattern.exec(propertyName))
        .filter(x => x)
        .forEach(([methodName, eventType, eventTarget]) => {
            events[eventType] = events[eventType] || {};

            if (eventType in nonBubblingEventsMap) nonBubblingEvents.push(eventType);

            /** @suppress {checkTypes} */
            events[eventType][eventTarget] = comp[methodName];
        });

    originalPrototype.__nonBubblingEvents = nonBubblingEvents;
    originalPrototype.__events = events;
}

const createElement = (() => {
    const tempDiv = document.createElement('div');

    return htmlString => {
        tempDiv.innerHTML = htmlString.trim();
        return tempDiv.removeChild(tempDiv.firstChild);
    };
})();

export default class ComponentManager {
    constructor() {
        this.componentRegistry = {};
        this.componentsToRender = {};
        this.gestureHandler = undefined;

        if (document.body) this.onLoad();
        else document.addEventListener('DOMContentLoaded', () => this.onLoad());

        this.getUid = getUid;
        this.createElement = createElement;
    
    }

    handleEvent(e) {
        e.targetEl = e.target;

        let comps = this.getParentComps(e.target),
            broken = false;

        do {
            if (broken) break;

            e['targetEl'] = e.targetEl;

            broken = this.callHandlers(comps, e);
        } while ((e.targetEl = e.targetEl.parentNode) && (e.targetEl != document.body));
    }

    onLoad() {
        events.forEach(type => document.body.addEventListener(type, this.handleEvent.bind(this)));

        this.gestureHandler = new GestureHandler();

        new MutationObserver(mutations => {
            for (let cmpId in this.componentsToRender) {
                const rendered = this.componentsToRender[cmpId].render();

                if (rendered) delete this.componentsToRender[cmpId];
            }
        }).observe(document.body, { childList: true, subtree: true });
    }

    getParentComps(child) {
        let node = child, parentComps = [], comp, ids;

        if (ids = node.parentComps) {
            ids.split(',').forEach(id => parentComps.push(this.componentRegistry[id]));

            return parentComps;
        }

        ids = [];

        do {
            if (comp = this.componentRegistry[node.id]) {
                parentComps.push(comp);
                ids.push(node.id);
            }
        } while (node = node.parentNode);

        child.parentComps = ids.join(',');
        return parentComps;
    }

    /**
   * Given a list of componentsRegistry, checks whether any component would
   * respond to the given event and if so, executes the event handler
   * defined in the component.
   */
    callHandlers(comps, e) {
        let broken = false;

        for (let i = 0; i < comps.length; i++) {
            let comp = comps[i];
            const events = comp && comp.__events;
            let handlers = events[e.type];

            if (!handlers) continue;

            let selectors = Object.keys(handlers);

            if (this.callHandler(comp, e, handlers, selectors) === false) {
                broken = true;
                break;
            }
        }

        return broken;
    }

    callHandler(comp, e, handlers, selectors) {
        let rv = true;

        selectors.forEach(selector => {
            if (e.targetEl.matches && e.targetEl.matches(selector)) {
                let targetComponent = this.getComponent(e.targetEl.id);

                rv = handlers[selector].call(comp, e, targetComponent);
            }
        });

        return rv;
    }

    /**
  * Given an id, returns a component in the registry.
  *
  * @param {string} id Id for the component instance.
  */
    getComponent(id) {
        return this.componentRegistry[id];
    }

    /**
   * Registers a component to the component registry, setting it up for render if it hasn't already
   * been rendered.
   *
   * Also, if this is the first time this type of component is registered, it checks and decomposes
   * the event handler declaration syntax sugar.
   *
   * @param {!Component} comp Component instance to register.
   */
    setComponent(comp) {
        this.componentRegistry[comp.id] = comp;
        if (!comp.rendered) this.componentsToRender[comp.id] = comp;
        if (!comp.__events) decorateEvents(comp);
    }

    /**
  * Given an id, removes a component from the registry.
  *
  * @param {!Component} comp Component instance to remove.
  */
    removeComponent(comp) {
        delete this.componentRegistry[comp.id];
        delete this.componentsToRender[comp.id];
    }

    /**
  * Given an id, marks a component as rendered, removing it from the render queue.
  *
  * @param {!Component} comp Component instance to mark as rendered.
  */
    markComponentRendered(comp) {
        delete this.componentsToRender[comp.id];
    }

    static getInstance() {
        if (!ComponentManager.instance) 
            ComponentManager.instance = new ComponentManager();

        return ComponentManager.instance;
    }

}

