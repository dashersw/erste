class EventEmitter {}
class DummyClass {}

class Component extends EventEmitter {
    render() {}
    template() {}
    dispose() {}
    onAfterRender() {}
    $$() {}
    $() {}
    toString() {}
}

Component.prototype.rendered;
Component.prototype.events;
Component.prototype.el;
Component.prototype.id;

class View extends Component {
    onActivation() {}
}

View.prototype.index;
View.prototype.hasSidebar;
View.prototype.supportsBackGesture;
View.prototype.WIDTH;

class TabView extends View {
    template_views() {}
    template_items() {}
    onItemTap() {}
    activateItem() {}
    activateItemByName() {}
    deactivateActiveItem() {}
}

TabView.prototype.activeItemIndex;
TabView.prototype.views;
TabView.prototype.vm;

class ViewManager extends DummyClass {
    pull() {}
    push() {}
    setCurrentView() {}
    canGoBack() {}
    toggleSidebar() {}
    getLastViewInHistory() {}
}

ViewManager.prototype.history;
ViewManager.prototype.currentView;

class Sidebar extends Component {
    onSidebarItemTap() {}
    template_items() {}
}

Sidebar.EventType = {
    SWITCH_VIEW: ''
};
Sidebar.prototype.vm;

class NavBar extends Component {
    onBackButtonTap() {}
    onMenuButtonTap() {}
}

NavBar.prototype.vm;
NavBar.prototype.config;
NavBar.prototype.hasBackButton; // required for config details
NavBar.prototype.hasMenuButton; // required for config details

class PullToRefresh extends Component {
    reset() {}
    register() {}
    onShouldRefresh() {}
}

PullToRefresh.prototype.threshold;
PullToRefresh.prototype.height;
PullToRefresh.prototype.arrowOffset;
PullToRefresh.prototype.EventType = {
    SHOULD_REFRESH: ''
};

class InfiniteScroll extends Component {
    reset() {}
    register() {}
    showSpinner() {}
    showEndOfList() {}
}

InfiniteScroll.prototype.EventType = {
    SHOULD_LOAD: ''
};

InfiniteScroll.prototype.endOfListText = '';
