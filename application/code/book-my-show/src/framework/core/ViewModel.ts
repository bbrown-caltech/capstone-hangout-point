import { UIBase } from './UIBase';
import { KeyValuePair } from './ResourceDictionary';
import { ViewParameters } from '../models/ViewParameters.Interface';

class ViewModel extends UIBase {
    ViewParameters: ViewParameters;
    queryParams: KeyValuePair[];
    
    constructor() { super(); }
    
    init(): void   {
        this.preInit();
        
        const view: HTMLElement = document.getElementsByTagName('view-item')[0] as HTMLElement;
        const self = this;
        
        while (view.children.length > 0) {
            view.removeChild(view.children.item(0));
        }
        
        if (!this.monitorInterval) {
            this.monitorInterval = new Array<number>();
        }
        
        setTimeout(() => {
            
            const disabledNodes: Array<Element> = Array.from((<HTMLElement>self.ViewParameters.View).querySelectorAll('[ng-disabled]'));
            const hiddenNodes: Array<Element> = Array.from((<HTMLElement>self.ViewParameters.View).querySelectorAll('[ng-hidden]'));
            
            if (self.ViewParameters.Bindings) {
                for (const binding of self.ViewParameters.Bindings) {
                    self.watchProperty(binding);
                }
            }
            
            if (disabledNodes) {
                const nodes: Array<Element> = disabledNodes as Array<Element>;
                
                this.monitorInterval.push(setInterval((nodes: Element[]) => {
                    
                    nodes.forEach((value, key, parent) => {
                        const node: HTMLElement = value as HTMLElement;
                        const clickAttribute = node.getAttribute('ng-disabled');
                        const parts = clickAttribute.split('(');
                        const methodName = parts[0];
                        const disabled = self[methodName]()
                        
                        if (disabled !== '') {
                            node.setAttribute('disabled', disabled);
                            // console.log('Disabling Node', node);
                        } else {
                            node.removeAttribute('disabled');
                        }
                        
                    });
                    
                }, 200, nodes));
                
            }
            
            if (hiddenNodes) {
                const nodes: Array<Element> = hiddenNodes as Array<Element>;
                
                this.monitorInterval.push(setInterval((nodes: Element[]) => {
                    
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
                    
                }, 200, nodes));
                
            }
            
            if (self.ViewParameters.ClickNodes) {
                const nodes: Array<Element> = self.ViewParameters.ClickNodes as Array<Element>;
                
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
                    
                    // console.log(methodName);
                    node.onclick = (ev: MouseEvent) => {
                        args.push(ev);
                        self[methodName](args);
                        ev.preventDefault();
                        ev.stopPropagation();
                    };
                    
                    node.oncontextmenu = (ev: MouseEvent) => {
                        args.push(ev);
                        self[methodName](args);
                        ev.preventDefault();
                        ev.stopPropagation();
                    };
                    
                });
                
            }
            
            view.appendChild(self.ViewParameters.View);
            
            self.postInit();
            self.bindInputFields(self.ViewParameters.View as HTMLElement);
            
        }, 700);
        
    }
    
    disposeView() {
        this.dispose();
    }
    
    preInit() : void {}
    postInit() : void {}
    
}

export { ViewModel };
