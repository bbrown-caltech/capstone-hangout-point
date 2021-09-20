import { Application } from '../core/Application';
import { AsyncTask } from '../core/AsyncTask';
import { GenericClassDecorator } from './GenericClassDecorator';
import { Type } from './Type';
import { DialogConfig } from '../models/DialogConfig.Interface';
import { HttpRequest, HttpRequestConfig } from '../providers/HttpRequest';
import { KeyValuePair } from '../core/ResourceDictionary';
import { DialogView } from '../models/DialogViewParameters.Interface';
import { BindingElement } from '@Framework/models/BindingElement.Interface';

const Dialog = (config: DialogConfig) : GenericClassDecorator<Type<object>> => {
    return (target: Type<object>) => {
        const appPath: string = (Application.instance().config.BasePath !== '' ? Application.instance().config.BasePath + '/' : '');
        let baseUrl: string = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/${appPath}`;
        // baseUrl += (window.location.pathname === '/' ? window.location.pathname : `${window.location.pathname}/`);
        baseUrl += `${config.BasePath}`;
        
        // console.log('Dialog', baseUrl);
        
        target.prototype.DialogParameters = {Selector: config.selector, Views: new Array<DialogView>(),
                                             Header: undefined, Footer: undefined};
        
        getTemplate(config.headerTemplate, baseUrl)
        .completed((content: string) => {
            // console.log('Dialog', content);
            
            const parser: DOMParser = new DOMParser();
            const html: Document = parser.parseFromString(content, 'text/html');
            const body: HTMLBodyElement = html.getElementsByTagName('body')[0];
            const container: HTMLDivElement = html.createElement('div');
            const style = html.createElement('link');
            
            style.href = `${baseUrl}/${config.styles}`;
            style.rel = 'stylesheet';
            // console.log('Dialog', style.href);
            container.appendChild(style);
            
            Array.from(body.childNodes).forEach((node: Node, idx: number, array: ChildNode[]) => {
                container.appendChild(node);
            });
            
            const clickNodes: Array<Element> = Array.from(container.querySelectorAll('[click]'));
            
            target.prototype.DialogParameters.Header = {View: container, ClickNodes: clickNodes};
            // console.log(target.prototype.DialogParameters);
        })
        .exception((error: any) => {
            const container: HTMLDivElement = document.createElement('div');
            container.innerHTML = '<h3>Error Loading Template</h3>';
            target.prototype.DialogParameters.Header = container;
        });
        
        getTemplate(config.footerTemplate, baseUrl)
        .completed((content: string) => {
            // console.log('Dialog', content);
            
            const parser: DOMParser = new DOMParser();
            const html: Document = parser.parseFromString(content, 'text/html');
            const body: HTMLBodyElement = html.getElementsByTagName('body')[0];
            const container: HTMLDivElement = html.createElement('div');
            
            Array.from(body.childNodes).forEach((node: Node, idx: number, array: ChildNode[]) => {
                container.appendChild(node);
            });
            
            const clickNodes: Array<Element> = Array.from(container.querySelectorAll('[click]'));
            
            target.prototype.DialogParameters.Footer = {View: container, ClickNodes: clickNodes};
            // console.log(target.prototype.DialogParameters);
        })
        .exception((error: any) => {
            const container: HTMLDivElement = document.createElement('div');
            container.innerHTML = '<h3>Error Loading Template</h3>';
            target.prototype.DialogParameters.Footer = container;
        });
        
        for (let i = 0; i < config.templates.length; i++) {
            target.prototype.DialogParameters.Views.push(undefined);
            
            ((template: string, baseUrl: string, idx: number) => {
                getTemplate(config.templates[idx], baseUrl)
                .completed((content: string) => {
                    // console.log('Dialog', content);
                    
                    const parser: DOMParser = new DOMParser();
                    const html: Document = parser.parseFromString(content, 'text/html');
                    const body: HTMLBodyElement = html.getElementsByTagName('body')[0];
                    const container: HTMLDivElement = html.createElement('div');
                    
                    Array.from(body.childNodes).forEach((node: Node, idx: number, array: ChildNode[]) => {
                        container.appendChild(node);
                    });
                    
                    const clickNodes: Array<Element> = Array.from(container.querySelectorAll('[click]'));
                    const bindingElements: Array<Element> = Array.from(container.getElementsByTagName('binding'));
                    const bindings: BindingElement[] = new Array<BindingElement>();
                    
                    for (const el of bindingElements) {
                        const model: string = el.getAttribute('model');
                        bindings.push({ Element: el, Model: model });
                    }
                    
                    target.prototype.DialogParameters.Views[idx] = {View: container, ClickNodes: clickNodes, Bindings: bindings};
                    // console.log(target.prototype.DialogParameters);
                })
                .exception((error: any) => {
                    const container: HTMLDivElement = document.createElement('div');
                    container.innerHTML = '<h3>Error Loading Template</h3>';
                    target.prototype.DialogParameters.Views[idx] = {View: container, ClickNodes: []};
                });
            })(config.templates[i], baseUrl, i);
        }
        
    }    
}
//  TODO: Add Error Handling
const getTemplate = (template: string, baseUrl: string): AsyncTask<string> => {
    const reqConfig: HttpRequestConfig = { headers: new Array<KeyValuePair>(), BasePath: baseUrl, EnableCors: true };
    const requestor: HttpRequest = new HttpRequest(reqConfig);
    // console.log('Dialog:', `${baseUrl}/${template}`);
    
    return requestor.loadFile(template);
    
}

export { Dialog };