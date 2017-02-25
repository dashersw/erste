import Component from '../../lib/base/component';

export default class Sidebar extends Component {
    constructor() {
        super();

        /**
         * @export
         */
        this.vm = null;
    }

    /**
     * @export
     *
     * Dispatches a switch view event to listeners and toggles the sidebar of the view manager that
     * is responsible for this sidebar.
     *
     * @param {!{targetEl: !Element}} e Tap event.
     */
    onSidebarItemTap(e) {
        var view = e.targetEl && e.targetEl.getAttribute && e.targetEl.getAttribute('data-view');
        if (!view) return;

        this.emit(Sidebar.EventType.SWITCH_VIEW, {
            view: view
        });

        this.vm && this.vm.toggleSidebar();
    };


    /**
     * @export
     *
     * @override
     */
    template() {
        return `
<sidebar-view class="view">
    <sidebar-items>${this.template_items}</sidebar-items>
</sidebar-view>
`;
    };


    /**
     * @export
     *
     * @return {string} Returns the items for the sidebar.
     */
    get template_items() {
        return '';
    };


    /**
     * @export
     *
     * @enum {string} Dom mapping.
     */
    get mappings() {
        return {
            ITEM: 'sidebar-item'
        };
    }

    get events() {
        return {
            'tap': {
                [this.mappings.ITEM]: this.onSidebarItemTap.bind(this)
            }
        };
    }

    /**
     * @export
     */
    static get EventType() {
        return {
            SWITCH_VIEW: 'switchView'
        };
    }

}
