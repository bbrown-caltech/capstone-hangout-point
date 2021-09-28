import { Route, RouteManager } from './RouteManager';
import { ViewModel } from './ViewModel';
import { Injector } from '../providers/Injector';
import { Type } from '../decorators/Type';
import { ApplicationConfig } from '../models/ApplicationConfig.Interface';
import { RepeatingDataView } from './RepeatingDataView';
import { BindingElement } from '../models/BindingElement.Interface';
import { UIBase } from './UIBase';

enum DataTypeArgs
{
    Int = 0,
    Float = 1,
    Date = 2,
    Time = 3,
    DateTime = 4,
    Boolean = 5,
    String = 6,
    Image = 7
}


//  Provides a Simple Interface for Determining the Numeric Data Type Value
class DataTypeCollection {
    [name: string]: DataTypeArgs;

    constructor() {}

    //  Returns a Default Instance of DataTypeCollection
    static Instance(): DataTypeCollection {
        var _instance = new DataTypeCollection();

        _instance["INT"] = DataTypeArgs.Int;
        _instance["FLOAT"] = DataTypeArgs.Float;
        _instance["DATE"] = DataTypeArgs.Date;
        _instance["TIME"] = DataTypeArgs.Time;
        _instance["DATETIME"] = DataTypeArgs.DateTime;
        _instance["BOOLEAN"] = DataTypeArgs.Boolean;
        _instance["STRING"] = DataTypeArgs.String;

        return _instance;

    }

}


class MainView extends UIBase {
    
    constructor() { super(); }
    
    async init() {
        const clickNodes: Array<Element> = Array.from(document.querySelectorAll('[click]'));
        const bindingElements: Array<Element> = Array.from(document.getElementsByTagName('binding'));
        
        this.handleHidden();
        this.handleDisabled();
        
        for (const el of bindingElements) {
            const model: string = el.getAttribute('model');
            this.watchProperty({ Element: el, Model: model });
        }
        
        if (clickNodes) {
            const nodes: Array<Element> = clickNodes as Array<Element>;
                
            nodes.forEach((value, key, parent) => {
                const node: HTMLElement = value as HTMLElement;
                const clickAttribute = node.getAttribute('click');
                const parts = clickAttribute.split('(');
                const methodName = parts[0];
                const argParts = parts[1].replace(')', '').split(',');
                const args = [];
                    
                for (const ap of argParts) {
                    args.push(ap);
                }
                
                node.onclick = (ev: MouseEvent) => {
                    args.push(ev);
                    this[methodName](args);
                };
                
                node.oncontextmenu = (ev: MouseEvent) => {
                    args.push(ev);
                    this[methodName](args);
                };
            });
                
        }
        
        await this.postInit();
    }
    
    async postInit() {}

    private handleHidden() {
        const hiddenNodes: Array<Element> = Array.from(document.querySelectorAll('[ng-hidden]'));
        const self = this;
        
        if (hiddenNodes) {
            const nodes: Array<Element> = hiddenNodes as Array<Element>;
            
            setInterval((nodes: Element[]) => {
                
                nodes.forEach((value, key, parent) => {
                    const node: HTMLElement = value as HTMLElement;
                    const clickAttribute = node.getAttribute('ng-hidden');
                    const parts = clickAttribute.split('(');
                    const methodName = parts[0];
                    const hidden = self[methodName]()
                    
                    if (hidden !== '') {
                        node.setAttribute('hidden', hidden);
                    } else {
                        node.removeAttribute('hidden');
                    }
                    
                });
                
            }, 200, nodes);
            
        }
        
    }
    
    private handleDisabled() {
        const disabledNodes: Array<Element> = Array.from(document.querySelectorAll('[ng-disabled]'));
        const self = this;
        
        if (disabledNodes) {
            const nodes: Array<Element> = disabledNodes as Array<Element>;
            
            setInterval((nodes: Element[]) => {
                
                nodes.forEach((value, key, parent) => {
                    const node: HTMLElement = value as HTMLElement;
                    const clickAttribute = node.getAttribute('ng-disabled');
                    const parts = clickAttribute.split('(');
                    const methodName = parts[0];
                    const disabled = self[methodName]();
                    
                    if (disabled !== '') {
                        node.setAttribute('disabled', disabled);
                    } else {
                        node.removeAttribute('disabled');
                    }
                    
                });
                
            }, 200, nodes);
            
        }
        
    }

}


class Application {
    public config: ApplicationConfig;
    
    private static _instance: Application;
    private static currentView: ViewModel;
    
    private constructor() { }
    
    static instance(): Application {
        if (!Application._instance) {
            Application._instance = new Application();
        }
        return Application._instance;
    }
    
    async run(root?: MainView) {
        
        if (root) {
            await root.init();
        }
        
        history.pushState = ( f => function pushState(){
            var ret = f.apply(this, arguments);
            window.dispatchEvent(new Event('pushstate'));
            window.dispatchEvent(new Event('locationchange'));
            return ret;
        })(history.pushState);

        history.replaceState = ( f => function replaceState(){
            var ret = f.apply(this, arguments);
            window.dispatchEvent(new Event('replacestate'));
            window.dispatchEvent(new Event('locationchange'));
            return ret;
        })(history.replaceState);

        window.addEventListener('popstate',()=>{
            window.dispatchEvent(new Event('locationchange'))
        });

        window.addEventListener('locationchange', function(){
            const path: string = window.location.pathname;
            const route: Route = RouteManager.instance().getRouteByPath(path);
            Application.handleRouteChange(route);
        })

        if (RouteManager.instance().hasRoutes()) {
            RouteManager.instance().monitor();
            
            setTimeout(() => {
                const route: Route = RouteManager.instance().getCurrentOrDefaultRoute();
                Application.handleRouteChange(route);
            }, 300);
        }
        
    }
    
    createView<T>(target: Type<T>): ViewModel {
        return Injector.resolve<T>(target) as any as ViewModel;
    }
    
    addRoute(route: Route) {
        if (!route) { return; }
        RouteManager.instance().addRoute(route);
    }
    
    addRoutes(routes: Route[]) {
        if (!routes) { return; }
        for (const route of routes) {
            RouteManager.instance().addRoute(route);
        }
    }
    
    setConfig(config: ApplicationConfig) {
        this.config = config;
    }
    
    private static handleRouteChange(route: Route) {
        const rgx = /\{\{\w{1,}(\|\w{1,})?\}\}/gm;
        const viewModel: ViewModel = route.view as ViewModel;
        const div: HTMLDivElement = viewModel.ViewParameters.View as HTMLDivElement;
        
        if (Application.currentView) {
            Application.currentView.disposeView();
        }
        
        route.view.queryParams = route.getQueryParams().queryParams;
        route.view.init();
        
        if (Application.currentView) {
            const keys = Object.keys(Application.currentView);
            for (const key of keys) {
                if (Object.prototype.toString.call(Application.currentView[key]) === '[object Object]' &&
                    Application.currentView[key] instanceof RepeatingDataView) {
                    (Application.currentView[key] as RepeatingDataView)?.dispose();
                }
            }
        }
        
        Application.currentView = route.view;
        
    }
    
}

const combinePartials = (derivedCtor: any, baseCtors: any[]) => {
    baseCtors.forEach(baseCtor => {
      Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
        Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
      });
    });
}

const removeEscapeChars = (text: string): string => {
    try
    {
        return decodeURIComponent(text);
    }
    catch (e)
    {
        return text;
    }
};

export { Application, MainView, DataTypeArgs, DataTypeCollection, combinePartials, removeEscapeChars };
