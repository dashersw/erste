class Component {
    render() {}
    template() {}
    dispose() {}
    onAfterRender() {}
    onBeforeRender() {}
    $$() {}
    $() {}
}

Component.prototype.events;

class View extends Component {
    template_content() {}
    onActivation() {}
}

View.prototype.index;
View.prototype.hasSidebar;
View.prototype.supportsBackGesture;
View.prototype.rendered;

class TabView extends View {
    template_views() {}
    template_items() {}
    onItemTap() {}
    activateItem() {}
    activateItemByName() {}
    deactivateActiveItem() {}
}

TabView.prototype.views;
TabView.prototype.vm;

class ViewManager {
    pull() {}
    push() {}
    setCurrentView() {}
    canGoBack() {}
    toggleSidebar() {}
}

ViewManager.prototype.topIndex;

class Sidebar extends Component {
    onSidebarItemTap() {}
    template_items() {}
}

class NavBar extends Component {
    onBackButtonTap() {}
    onMenuButtonTap() {}
}

NavBar.prototype.vm;
NavBar.prototype.hasBackButton;
NavBar.prototype.hasMenuButton;

class PullToRefresh extends Component {
    reset() {}
    register() {}
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
