import { Application } from '../core/Application';
import { AsyncTask } from '../core/AsyncTask';
import { GenericClassDecorator } from './GenericClassDecorator';
import { Type } from './Type';
import { ViewConfig } from '../models/ViewConfig.Interface';
import { HttpRequest, HttpRequestConfig } from '../providers/HttpRequest';
import { KeyValuePair } from '../core/ResourceDictionary';
import { BindingElement } from '@Framework/models/BindingElement.Interface';


const View = (config: ViewConfig) : GenericClassDecorator<Type<object>> => {
    return (target: Type<object>) => {
        const appPath: string = (Application.instance().config.BasePath !== '' ? Application.instance().config.BasePath + '/' : '');
        let baseUrl: string = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/${appPath}`;
        baseUrl += `${config.BasePath}`;
        
        getViewParameters(config, baseUrl)
        .completed((content: string) => {
            const parser: DOMParser = new DOMParser();
            const html: Document = parser.parseFromString(content, 'text/html');
            const body: HTMLBodyElement = html.getElementsByTagName('body')[0];
            const container: HTMLDivElement = html.createElement('div');
            const style = html.createElement('link');
            
            style.href = `${baseUrl}/${config.styles}`;
            style.rel = 'stylesheet';
            
            container.appendChild(style);
            
            Array.from(body.childNodes).forEach((node: Node, idx: number, array: ChildNode[]) => {
                container.appendChild(node);
            });
            
            const disabledNodes: Array<Element> = Array.from(container.querySelectorAll('[disabled]'));
            const hiddenNodes: Array<Element> = Array.from(container.querySelectorAll('[hidden]'));
            const clickNodes: Array<Element> = Array.from(container.querySelectorAll('[click]'));
            const bindingElements: Array<Element> = Array.from(container.getElementsByTagName('binding'));
            const bindings: BindingElement[] = new Array<BindingElement>();
            
            for (const el of bindingElements) {
                const model: string = el.getAttribute('model');
                bindings.push({ Element: el, Model: model });
            }
            
            target.prototype.ViewParameters = {Selector: config.selector, View: container, ClickNodes: clickNodes, Bindings: bindings};
            
        })
        .exception((error: any) => {
            const container: HTMLDivElement = document.createElement('div');
            container.innerHTML = '<h3>Error Loading Template</h3>';
            target.prototype.ViewParameters = {Selector: config.selector, View: container, ClickNodes: [], Bindings: []};
        });
        
    }    
}
//  TODO: Add Error Handling
const getViewParameters = (config: ViewConfig, baseUrl: string): AsyncTask<string> => {
    const reqConfig: HttpRequestConfig = { headers: new Array<KeyValuePair>(), BasePath: baseUrl, EnableCors: true };
    const requestor: HttpRequest = new HttpRequest(reqConfig);
    
    return requestor.loadFile(config.template);
    
}

export { View };