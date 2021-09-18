import { Application, MainView } from '../framework/core/Application';
import { Route } from '../framework/core/RouteManager';
import { Menu, MenuItemCommandTypeArgs } from '../framework/UI/Menu';

import { appConfig, endpoints } from './config';
import { UserAuthService } from './services/user-auth.service';
import { LdapUser } from './models/auth/LdapUser.Interface';
import { MiscResponse } from './models/auth/MiscResponse.Interface';

Application.instance().setConfig(appConfig);

class App extends MainView {
    private static _instance: App;
    
    private configLoader: any;
    private userService: UserAuthService;
    
    private constructor() { super(); }
    
    static instance(): App {
        if (!App._instance) {
            App._instance = new App();
        }
        return App._instance;
    }
    
    async postInit() {
        const self = this;
        this.getJwt();
        
        const dashboardLoader = await import('./views/dashboard/dashboard.view.js');
        const productViewLoader = await import('./views/product/product.view.js');
        const editorViewLoader = await import('./views/product-editor/product-editor.view.js');
        const elnotSelectorViewLoader = await import('./views/elnot-selector/elnot-selector.view.js');
        
        Application.instance().addRoutes([
            new Route('dashboard', '/dashboard', Application.instance()
                    .createView<import('./views/dashboard/dashboard.view.js').Dashboard>(dashboardLoader.Dashboard)),
            new Route('product', '/product', Application.instance()
                    .createView<import('./views/product/product.view.js').ProductView>(productViewLoader.ProductView)),
            new Route('product-editor', '/product-editor', Application.instance()
                    .createView<import('./views/product-editor/product-editor.view.js').ProductEditorView>(editorViewLoader.ProductEditorView)),
            new Route('elnot-selector', '/elnot-selector', Application.instance()
                    .createView<import('./views/elnot-selector/elnot-selector.view.js').ElnotSelectorView>(elnotSelectorViewLoader.ElnotSelectorView))
        ]);

        this.userService = new UserAuthService();
        // let connection = indexedDB.open('fms', 1);
        
        // connection.
        this.userService.getUser()
        .completed((result: LdapUser) => {
            appConfig.CurrentUser = result;
        }).exception(async (error: any) => {
            console.log('Application Init - Get Current User: ', error); 
            alert('User not logged in!');
            sessionStorage.removeItem('jwt');
            appConfig.Token = '';
            window.location.href = endpoints.get("LoginPath");
        });
        
    }
    
    /**************************************************************************************************************
     *  ADD USER MENU METHODS
     **************************************************************************************************************/
    addMainMenu() {
        const btn: HTMLButtonElement = document.getElementById('btnMenu') as HTMLButtonElement;
        const menu: Menu = new Menu([
            {
                Scope: this,
                CommandType: MenuItemCommandTypeArgs.None,
                Command: '',
                MenuIcon: '',
                LabelText: `Welcome, ${appConfig.CurrentUser.Name}!`,
                ApplySeparator: false,
                Arguments: []
            },
            {
                Scope: this,
                CommandType: MenuItemCommandTypeArgs.None,
                Command: '',
                MenuIcon: '',
                LabelText: `&nbsp;`,
                ApplySeparator: false,
                Arguments: []
            },
            {
                Scope: this,
                CommandType: MenuItemCommandTypeArgs.Route,
                Command: `/${appConfig.BasePath}${appConfig.BasePath !== '' ? '/' : ''}dashboard`,
                MenuIcon: '<i class="fas fa-tachometer-alt"></i>',
                LabelText: 'Dashboard',
                ApplySeparator: false,
                Arguments: []
            },
            {
                Scope: this,
                CommandType: MenuItemCommandTypeArgs.Method,
                Command: 'logout',
                MenuIcon: '<i class="fas fa-sign-out-alt"></i>',
                LabelText: 'Logout',
                ApplySeparator: true,
                Arguments: []
            }
        ]);
        Menu.showMenu(btn, menu);
    }
    
    async logout() {
        
        this.userService.logout()
        .completed((result: MiscResponse) => {
            if (result.Successful === true) {
                const url: string = `${window.location.protocol}//${window.location.hostname}${endpoints.get('LoginPath')}`
                console.log('Login Path: ', url)
                setTimeout(() => {
                    window.location.href = url;
                }, 2000);
            } else {
                alert('Unable to logout!');
                console.log('Application Logout: ', result.Data);
            }
        }).exception((error: any) => {
            alert('Unable to logout!');
            console.log('Application Logout: ', error);
        });
        
    }
    
    private getJwt(): void {
        if (appConfig.Environment.toUpperCase() !== 'DEV' && sessionStorage.getItem('jwt')) {
            appConfig.Token = sessionStorage.getItem('jwt');
        }
    }
}

Application.instance().run(App.instance());
