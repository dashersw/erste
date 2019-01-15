import Component from '../../lib/base/component';

/**
 * @extends {Component}
 */
class Sidebar extends Component {
    constructor() {
        super();

        /**
         * @export
         */
        this.vm = null;
    }

    /**
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
     * @override
     */
    template() {
        return `
<sidebar>
    <sidebar-items>${this.template_items()}</sidebar-items>
</sidebar>
`;
    };


    /**
     * @return {string} Returns the items for the sidebar.
     */
    template_items() {
        return '';
    };


    /**
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
                [this.mappings.ITEM]: this.onSidebarItemTap
            }
        };
    }

    static get EventType() {
        return {
            SWITCH_VIEW: 'switchView'
        };
    }

}

export default Sidebar;
