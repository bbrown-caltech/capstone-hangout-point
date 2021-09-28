import { Application } from './Application';
import { KeyValuePair } from './ResourceDictionary';
import { ViewModel } from './ViewModel';

class Route {
    
    queryParams: KeyValuePair[];
    
    constructor(public selector: string, public route: string, public view: ViewModel) {
        this.queryParams = new Array<KeyValuePair>();
    }
    
    getQueryParams(): Route {
        this.queryParams = this.parseQueryString();
        return this;
    }
    
    private parseQueryString(): KeyValuePair[] {
        const queryString = window.location.search.substring(1);
        const parts: string[] = queryString.split('&');
        const pairs: KeyValuePair[] = new Array<KeyValuePair>();
        
        if (parts && parts.length > 0) {
            parts.forEach((value: string, idx: number, items: string[]) => {
                const parameters: string[] = value.split('=');
                if (parameters && parameters.length === 2) {
                    pairs.push({ Key: parameters[0], Value: parameters[1] });
                }
            })
        }
        
        return pairs;
        
    }

}

class RouteManager {
    private static _instance: RouteManager;
    
    private defaultRoute: Route;
    private routes: KeyValuePair[];
    
    private intervalId: number;
    private appPath: string;
    
    private _currentRoute: Route;
    currentRoute(): Route {
        if (this._currentRoute === undefined || this._currentRoute === null) {
            this._currentRoute = this.defaultRoute;
        }
        return this._currentRoute;
    }
    
    static instance(): RouteManager {
        if (!RouteManager._instance) {
            RouteManager._instance = new RouteManager();
        }
        return RouteManager._instance;
    }
    
    constructor() {
        this.routes = new Array<KeyValuePair>();
        this.appPath = (Application.instance().config.BasePath !== '' ? '/' + Application.instance().config.BasePath : '');
    }
    
    monitor(): void {
        const self = this;
        let currentPath: string = window.location.pathname;
        this.intervalId = setInterval(() => {
            const path: string = window.location.pathname.replace(self.appPath, '');
            const pathIndex: number = self.indexOfByPath(path);
            
            if (currentPath !== path) {
                const route: Route = self.getRouteByPath(path);
                const index: number = self.indexOf(route.selector);
                if (index === -1) {
                    history.pushState({selector: route.selector}, route.selector, `${self.appPath}${route.route}`);
                }
                currentPath = route.route;
                self._currentRoute = route;
            }
            
            if (pathIndex === -1) {
                history.pushState({selector: self.defaultRoute.selector}, self.defaultRoute.selector, `${self.appPath}${self.defaultRoute.route}`);
                currentPath = self.defaultRoute.route;
                self._currentRoute = self.defaultRoute;
            }
            
        }, 100);
    }
    
    stop() {
        clearInterval(this.intervalId);
    }
    
    hasRoutes(): boolean {
        return ((this.routes !== undefined && this.routes !== null && this.routes.length > 0) &&
                (this.defaultRoute !== undefined && this.defaultRoute !== null));
    }
    
    addRoute(route: Route) {
        if (!route) { return; }
        if (!this.defaultRoute) { this.defaultRoute = route; }
        const index: number = this.indexOf(route.selector);
        if (index < 0) {
            this.routes.push({ Key: route.selector, Value: route });
        } else {
            this.routes[index] = { Key: route.selector, Value: route };
        }
    }
    
    addRoutes(routes: Route[]) {
        if (!routes) { return; }
        for (const route of routes) {
            this.addRoute(route);
        }
    }
    
    getDefaultRoute(): Route {
        return this.defaultRoute;
    }
    
    getCurrentOrDefaultRoute(): Route {
        const path: string = window.location.pathname.replace(this.appPath, '');
        const pathIndex: number = this.indexOfByPath(path);
        if (pathIndex === -1) {
            return this.defaultRoute;
        } else {
            const route: Route = this.getRouteByPath(path);
            return route;
        }
    }
    
    setDefaultRoute(route: Route) {
        if (!route) { return; }
        this.defaultRoute = route;
    }
    
    indexOf(selector: string): number {
        for (let i: number = 0; i < this.routes.length; i++) {
            if (this.routes[i].Key === selector) {
                return i;
            }
        }
        return -1;
    }
    
    indexOfByPath(path: string): number {
        for (let i: number = 0; i < this.routes.length; i++) {
            if ((<Route>this.routes[i].Value).route === path) {
                return i;
            }
        }
        return -1;
    }
    
    getRouteBySelector(selector: string): Route {
        if (selector === '') { return this.defaultRoute; }
        for (const route of this.routes) {
            if (route.Key === selector) {
                return (<Route>route.Value);
            }
        }
        return this.defaultRoute;
    }
    
    getRouteByPath(path: string): Route {
        if (path.indexOf(this.appPath) > -1) { path = path.replace(this.appPath, ''); }
        for (const route of this.routes) {
            if ((<Route>route.Value).route === path) {
                return (<Route>route.Value);
            }
        }
        return this.defaultRoute;
    }
    
}

export { Route, RouteManager };
