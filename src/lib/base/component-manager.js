import GestureHandler from './gesture-handler';
import getUid from './uid';

const componentRegistry = {};
const componentsToRender = {};

let gestureHandler;

const events = [
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
var mutationCounter = 0;
const onLoad = () => {
    events.forEach(type => document.body.addEventListener(type, handleEvent));

    gestureHandler = new GestureHandler();

    new MutationObserver(mutations => {
        for (let cmpId in componentsToRender) {
            componentsToRender[cmpId].render();

            delete componentsToRender[cmpId];
        }
    }).observe(document.body, { childList: true, subtree: true });;
}

if (document.body) onLoad();
else document.addEventListener('DOMContentLoaded', onLoad);

const createElement = (() => {
    const tempDiv = document.createElement('div');

    return htmlString => {
        tempDiv.innerHTML = htmlString.trim();
        return tempDiv.removeChild(tempDiv.firstChild);
    };
})();

const getParentComps = child => {
    let node = child, parentComps = [], comp, ids;

    if (ids = node.parentComps) {
        ids.split(',').forEach(id => parentComps.push(componentRegistry[id]));

        return parentComps;
    }

    ids = [];

    do {
        if (comp = componentRegistry[node.id]) {
            parentComps.push(comp);
            ids.push(node.id);
        }
    } while (node = node.parentNode);

    child.parentComps = ids.join(',');
    return parentComps;
}

const handleEvent = e => {
    e.targetEl = e.target;

    let comps = getParentComps(e.target),
        broken = false;

    do {
        if (broken) break;

        e['targetEl'] = e.targetEl;

        broken = callHandlers(comps, e);
    } while ((e.targetEl = e.targetEl.parentNode) && (e.targetEl != document.body));
}

/**
 * Given a list of componentsRegistry, checks whether any component would
 * respond to the given event and if so, executes the event handler
 * defined in the component.
 */
const callHandlers = (comps, e) => {
    let broken = false;

    for (let i = 0; i < comps.length; i++) {
        let comp = comps[i];
        let handlers = comp && comp.events && comp.events[e.type];

        if (!handlers) continue;

        let selectors = Object.keys(handlers);

        if (callHandler(comp, e, handlers, selectors) === false) {
            broken = true;
            break;
        }
    }

    return broken;
}

const callHandler = (comp, e, handlers, selectors) => {
    let rv = true;

    selectors.forEach(selector => {
        if (e.targetEl.matches && e.targetEl.matches(selector)) {
            let targetComponent = getComponent(e.targetEl.id);

            rv = handlers[selector].call(comp, e, targetComponent);
        }
    });

    return rv;
}

const getComponent = id => {
    return componentRegistry[id];
}

const setComponent = comp => {
    componentRegistry[comp.id] = comp;
    if (!comp.rendered) componentsToRender[comp.id] = comp;
}

const removeComponent = comp => {
    delete componentRegistry[comp.id];
    delete componentsToRender[comp.id];
}

const markComponentRendered = comp => {
    delete componentsToRender[comp.id];
}

export default {
    getUid: getUid,
    getComponent: getComponent,
    setComponent: setComponent,
    removeComponent: removeComponent,
    createElement: createElement,
    markComponentRendered: markComponentRendered,
    get gestureHandler() {
        return gestureHandler;
    }
}
