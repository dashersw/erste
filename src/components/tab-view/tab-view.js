import View from '../../lib/view';
import ViewManager from '../../lib/view-manager';

export default class TabView extends View {
    constructor() {
        super();

        this.vm = null;

        /**
         * @type {!Array.<!View>}
         */
        this.views = [];
    }

    /**
     * @override
     */
    onAfterRender() {
        super.onAfterRender();

        var $views = this.$(this.mappings.VIEWS);
        if (!$views) throw new Error('TabView template must have <views>');

        this.vm = new ViewManager($views);
        this.activateItem(0);
    };

    /**
     * @param {!{targetEl: !Element}} e Item touch event handler.
     */
    onItemTap(e) {
        var activeItem = this.$(this.mappings.ACTIVE);
        if (activeItem && activeItem == e.targetEl) return;

        var items = this.$(this.mappings.ITEMS);
        var itemIndex = [].indexOf.call(items && items.children, e.targetEl);

        this.activateItem(itemIndex);
    };

    /**
     * Adds active class to item.
     * @param {number} index Index of the item to be active.
     */
    activateItem(index) {
        if (index == -1) return;

        this.deactivateActiveItem();
        var item = this.$$(this.mappings.ITEM)[index];
        item && item.classList.add('active');

        if (this.views && this.views[index])
            this.vm.setCurrentView(this.views[index], true);
    };



    /**
     * Activates a tab bar item with a given name. If an item for the given the name isn't found, does nothing.
     *
     * @param {string} name Name for the tab bar item.
     */
    activateItemByName(name) {
        var child = this.$(this.mappings.ITEM + '[data-view=' + name + ']');
        if (!child) return;

        var items = this.$(this.mappings.ITEMS);
        var itemIndex = [].indexOf.call(items && items.children, child);

        this.activateItem(itemIndex);
    };


    /**
     * Removes active class of active item.
     */
    deactivateActiveItem() {
        var activeItem = this.$(this.mappings.ACTIVE);
        activeItem && activeItem.classList.remove('active');
    };



    /**
     * @return {string} Base template of NavigationBar component.
     */
    template() {
        return `
<tab-view>
    ${this.template_views()}
    <tab-bar>
        <tab-items>
            ${this.template_items()}
        </tab-items>
    </tab-bar>
</tab-view>
`;
    };

    template_views() {
        return `<views>${this.views.join('')}</views>`;
    }

    /**
     * @return {string} Template for tab bar items.
     */
    template_items() {
        return '';
    };

    /**
     * @enum {string} Dom mappings.
     */
    get mappings() {
        return {
            ITEM: 'tab-item',
            ITEMS: 'tab-items',
            ACTIVE: '.active',
            VIEWS: 'views'
        };
    }

    get events() {
        return {
            'touchend': {
                [this.mappings.ITEM]: this.onItemTap.bind(this)
            }
        }
    }
}
