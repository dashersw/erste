import Component from './lib/base/component';
import ViewManager from './lib/view-manager';
import View from './lib/view';
import Sidebar from './components/sidebar/sidebar';
import TabBar from './components/tabbar/tabbar';
import NavBar from './components/navbar/navbar';
import locale from './lib/locale';

/**
 * @export
 */
window.erste = {
    /**
     * @export
     */
    Component: Component,

    /**
     * @export
     */
    ViewManager: ViewManager,

    /**
     * @export
     */
    View: View,

    /**
     * @export
     */
    Sidebar: Sidebar,

    /**
     * @export
     */
    TabBar: TabBar,

    /**
     * @export
     */
    NavBar: NavBar,

    /**
     * @export
     */
    locale: locale
};
