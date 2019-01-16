export { default as Component } from './lib/base/component';
export { default as ViewManager } from './lib/view-manager';
export { default as View } from './lib/view';
export { default as locale } from './lib/locale';
export { default as Sidebar } from './components/sidebar/sidebar';
export { default as TabView } from './components/tab-view/tab-view';
export { default as NavBar } from './components/navbar/navbar';
export { default as PullToRefresh } from './components/pull-to-refresh/pull-to-refresh';
export { default as InfiniteScroll } from './components/infinite-scroll/infinite-scroll';

import Component from './lib/base/component';
import ViewManager from './lib/view-manager';
import View from './lib/view';
import locale from './lib/locale';
import Sidebar from './components/sidebar/sidebar';
import TabView from './components/tab-view/tab-view';
import NavBar from './components/navbar/navbar';
import PullToRefresh from './components/pull-to-refresh/pull-to-refresh';
import InfiniteScroll from './components/infinite-scroll/infinite-scroll';

/** @export */
export default {
    /** @export */
    Component: Component,
    /** @export */
    ViewManager: ViewManager,
    /** @export */
    View: View,
    /** @export */
    locale: locale,
    /** @export */
    Sidebar: Sidebar,
    /** @export */
    TabView: TabView,
    /** @export */
    NavBar: NavBar,
    /** @export */
    PullToRefresh: PullToRefresh,
    /** @export */
    InfiniteScroll: InfiniteScroll,
    /** @export */
    __: locale.__
};

export const __ = locale.__;
