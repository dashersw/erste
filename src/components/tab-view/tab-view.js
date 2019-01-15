import View from '../../lib/view';
import ViewManager from '../../lib/view-manager';

/**
 * @extends {View}
 */
export default class TabView extends View {
    constructor() {
        super();

        /**
         * @export
         */
        this.vm = null;

        /**
         * @export
         *
         * @type {!Array.<!View>}
         */
        this.views = [];

        /**
         * @export
         */
        this.activeItemIndex = null;
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
     * @export
     *
     * @param {!{targetEl: !Element}} e Item touch event handler.
     */
    onItemTap(e) {
        var activeItem = this.$(this.mappings.ACTIVE_ITEM);
        if (activeItem && activeItem == e.targetEl) return;

        var items = this.$(this.mappings.ITEMS);
        var itemIndex = [].indexOf.call(items && items.children, e.targetEl);

        this.activateItem(itemIndex);
    };

    /**
     * @export
     *
     * Adds active class to item.
     * @param {number} index Index of the item to be active.
     */
    activateItem(index) {
        if (index < 0) return;

        this.deactivateActiveItem();
        var item = this.$$(this.mappings.ITEM)[index];
        item && item.classList.add('active');

        if (this.views && this.views[index]) {
            this.vm.setCurrentView(this.views[index], true);
            this.views[index].el.classList.add('active');
        }

        this.activeItemIndex = index;
    };

    /**
     * @export
     *
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
     * @export
     *
     * Removes active class of active item.
     */
    deactivateActiveItem() {
        var activeThings = this.$$(this.mappings.ACTIVE);
        activeThings.forEach(el => el.classList.remove('active'));
    };



    /**
     * @override
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

    /**
     * @export
     *
     */
    template_views() {
        return `<views>${this.views.join('')}</views>`;
    }

    /**
     * @export
     *
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
            ACTIVE_ITEM: 'tab-items .active',
            ACTIVE_VIEW: 'views .active',
            VIEWS: 'views'
        };
    }

    /**
     * @override
     */
    get events() {
        return {
            'touchend': {
                [this.mappings.ITEM]: this.onItemTap.bind(this)
            }
        }
    }
}
