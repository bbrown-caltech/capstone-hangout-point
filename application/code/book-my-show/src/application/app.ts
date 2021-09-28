import { Application, MainView } from '../framework/core/Application';
import { Route } from '../framework/core/RouteManager';

import { appConfig, endpoints } from './config';

Application.instance().setConfig(appConfig);

class App extends MainView {
    private static _instance: App;
    
    private configLoader: any;
    
    private constructor() { super(); }
    
    static instance(): App {
        if (!App._instance) {
            App._instance = new App();
        }
        return App._instance;
    }
    
    async postInit() {
        const self = this;
        
        const bookingEditorLoader = await import('./views/booking-editor/booking-editor.view.js');
        
        Application.instance().addRoutes([
            new Route('booking', '/booking', Application.instance()
                    .createView<import('./views/booking-editor/booking-editor.view.js').BookingEditor>(bookingEditorLoader.BookingEditor))
        ]);

    }
    
}

Application.instance().run(App.instance());
