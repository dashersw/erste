import Component from '../../lib/base/component';

/**
 * @extends {Component}
 */
class NavBar extends Component {
    /**
     * Includes back button for back navigation.
     *
     * @param {NavBar.NavBarOptions=} opt_config Config parameters to
     *        include things like title.
     */
    constructor(opt_config = {hasBackButton: false, hasMenuButton: false, title: ''}) {
        super();

        /**
         * @export
         */
        this.vm = null;

        /**
         * @export
         */
        this.config = opt_config;
    }

    /**
     * @export
     *
     * Back button tap event handler.
     */
    onBackButtonTap() {
        this.vm && this.vm.push();
    };

    /**
     * @export
     */
    onMenuButtonTap() {
        this.vm && this.vm.toggleSidebar();
    };

    /**
     * @override
     */
    template() {
        var config = this.config,
            backButton = '',
            menuButton = '';

        if (config.hasBackButton) backButton = `<back-button></back-button>`;
        if (config.hasMenuButton) menuButton = `<menu-button></menu-button>`;

        return `
<nav-bar>${backButton}${menuButton}${config.title}</nav-bar>
`;
    }

    get mappings() {
        return {
            BACK_BUTTON: 'back-button',
            MENU_BUTTON: 'menu-button'
        };
    }

    /** @override */
    get events() {
        return {
            'tap': {
                [this.mappings.BACK_BUTTON]: this.onBackButtonTap,
                [this.mappings.MENU_BUTTON]: this.onMenuButtonTap
            }
        };
    }
}

/**
* @typedef {{hasBackButton: boolean, hasMenuButton: boolean, title: string}}
*/
NavBar.NavBarOptions;

export default NavBar;
