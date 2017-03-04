import Component from '../../lib/base/component';

export default class NavBar extends Component {
    /**
     * Includes back button for back navigation.
     *
     * @param {NavBar.NavBarOptions=} opt_config Config parameters to
     *        include things like title.
     */
    constructor(opt_config = {hasBackButton: false, hasMenuButton: false, title: ''}) {
        super();
        this.vm = null;

        this.config = opt_config;

        this.hasBackButton = this.config.hasBackButton;
        this.hasMenuButton = this.config.hasMenuButton;
    }

    /**
     * Back button tap event handler.
     */
    onBackButtonTap() {
        this.vm.push();
    };

    onMenuButtonTap() {
        if (this.menuButtonHandler) return this.menuButtonHandler();

        this.vm.toggleSidebar();
    };

    /**
     * @override
     */
    template() {
        var backButton = '',
            menuButton = '';

        if (this.hasBackButton) backButton = `<back-button></back-button>`;
        if (this.hasMenuButton) menuButton = `<menu-button></menu-button>`;

        return `
<nav-bar>${backButton}${menuButton}${this.config.title || ''}</nav-bar>
`;
    }

    get mappings() {
        return {
            BACK_BUTTON: 'back-button',
            MENU_BUTTON: 'menu-button'
        };
    }

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
