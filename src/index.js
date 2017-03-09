import Component from './lib/base/component';
import ViewManager from './lib/view-manager';
import View from './lib/view';
import locale from './lib/locale';
import Sidebar from './components/sidebar/sidebar';
import TabBar from './components/tabbar/tabbar';
import NavBar from './components/navbar/navbar';
import PullToRefresh from './components/pull-to-refresh/pull-to-refresh';
import InfiniteScroll from './components/infinite-scroll/infinite-scroll';

/**
 * @export
 */
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
    TabBar: TabBar,
    /** @export */
    NavBar: NavBar,
    /** @export */
    PullToRefresh: PullToRefresh,
    /** @export */
    InfiniteScroll: InfiniteScroll
};
