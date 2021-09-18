import { AsyncTask } from '../core/AsyncTask';
import { UIBase } from '../core/UIBase';
import { DialogViewParameters, DialogView } from '../models/DialogViewParameters.Interface';

class DialogBase extends UIBase {
    DialogParameters: DialogViewParameters;
    
    protected monitorHeaderHiddenInterval: number;
    protected monitorHeaderDisabledInterval: number;
    
    protected monitorFooterHiddenInterval: number;
    protected monitorFooterDisabledInterval: number;
    
    private ModalMask: HTMLElement;
    private Container: HTMLElement;
    protected ModalBody: HTMLElement;
    
    private task: AsyncTask<any>;
    private templateIndex: number;
    
    constructor() { super(); }
    
    open(): AsyncTask<any>   {
        this.preOpen();
        
        const self = this;
        
        this.task = new AsyncTask<any>();
        this.templateIndex = 0;
        
        this.ModalMask = document.createElement('modal-mask');
        this.Container = document.createElement('modal-container');
        this.ModalBody = document.createElement('modal-body');
        
        this.ModalMask.style.position = 'fixed';
        this.ModalMask.style.left = '0';
        this.ModalMask.style.top = '0';
        this.ModalMask.style.width = '100%';
        this.ModalMask.style.height = '100%';
        this.ModalMask.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        
        const body: HTMLBodyElement = document.getElementsByTagName('body')[0];
        
        body.appendChild(this.ModalMask);
        
        setTimeout(() => {
            const header: HTMLElement = document.createElement('modal-header');
            const footer: HTMLElement = document.createElement('modal-footer');
            
            header.appendChild(self.DialogParameters.Header.View);
            footer.appendChild(self.DialogParameters.Footer.View);
            
            self.monitorAttributeValues();
            
            if (self.DialogParameters.Header.ClickNodes) {
                const nodes: Array<Element> = self.DialogParameters.Header.ClickNodes as Array<Element>;
                
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
                        self[methodName](args);
                    };
                });
                
            }
            
            if (self.DialogParameters.Footer.ClickNodes) {
                const nodes: Array<Element> = self.DialogParameters.Footer.ClickNodes as Array<Element>;
                
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
                        self[methodName](args);
                    };
                });
                
            }
            
            self.Container.appendChild(header);
            self.Container.appendChild(this.ModalBody);
            self.Container.appendChild(footer);
            self.Container.hidden = true;
            
            body.appendChild(self.Container);
            
            self.addResizeRegion();
            
            self.renderView();
            self.postOpen();
            
            self.Container.hidden = false;
            
            header.onmousedown = self.headerMouseDown;
            
        }, 300);
        
        return this.task;
        
    }
    
    preOpen() : void {}
    postOpen() : void {}
    
    cancel() {
        this.task.cancel(undefined);
        this.removeDialog();
    }
    
    complete(result?: any) {
        this.task.conclude(result);
        this.removeDialog();
    }
    
    moveNext() {
        this.templateIndex++;
        
        if (this.templateIndex >= this.DialogParameters.Views.length) {
            this.templateIndex = this.DialogParameters.Views.length - 1;
            return;
        }
        
        this.renderView();
        
    }
    
    movePrev() {
        this.templateIndex--;
        
        if (this.templateIndex < 0) {
            this.templateIndex = 0;
            return;
        }
        
        this.renderView();
        
    }
    
    lastViewReached(): boolean {
        return (this.templateIndex === (this.DialogParameters.Views.length - 1));
    }
    
    private renderView() {
        this.dispose();
        
        while (this.ModalBody.children.length > 0) {
            this.ModalBody.removeChild(this.ModalBody.children.item(0));
        }
        
        const dlgView: DialogView = this.DialogParameters.Views[this.templateIndex];
        
        const disabledNodes: Array<Element> = Array.from((<HTMLElement>dlgView.View).querySelectorAll('[ng-disabled]'));
        const hiddenNodes: Array<Element> = Array.from((<HTMLElement>dlgView.View).querySelectorAll('[ng-hidden]'));
        
        if (disabledNodes) {
            const nodes: Array<Element> = disabledNodes as Array<Element>;
            
            nodes.forEach((value, key, parent) => {
                const node: HTMLElement = value as HTMLElement;
                const clickAttribute = node.getAttribute('ng-disabled');
                const parts = clickAttribute.split('(');
                const methodName = parts[0];
                const disabled = this[methodName]()
                
                if (disabled !== '') {
                    node.setAttribute('disabled', disabled);
                } else {
                    node.removeAttribute('disabled');
                }
                
            });
            
        }
        
        if (hiddenNodes) {
            const nodes: Array<Element> = hiddenNodes as Array<Element>;
            
            nodes.forEach((value, key, parent) => {
                const node: HTMLElement = value as HTMLElement;
                const clickAttribute = node.getAttribute('ng-hidden');
                const parts = clickAttribute.split('(');
                const methodName = parts[0];
                const hidden = this[methodName]()
                
                if (hidden !== '') {
                    node.setAttribute('hidden', hidden);
                } else {
                    node.removeAttribute('hidden');
                }
                
            });
            
        }
        
        if (dlgView.Bindings) {
            for (const binding of dlgView.Bindings) {
                this.watchProperty(binding);
            }
        }
        
        if (dlgView.ClickNodes) {
            const nodes: Array<Element> = dlgView.ClickNodes as Array<Element>;
            
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
        
        this.ModalBody.appendChild(dlgView.View);
        this.bindInputFields(dlgView.View as HTMLElement);
        
    }
    
    private addResizeRegion() {
        const svg: SVGSVGElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        const resizeFooter: HTMLDivElement = document.createElement('div');
        
        svg.style.width = '15px';
        svg.style.height = '15px';
        svg.style.position = 'absolute';
        svg.style.right = '0';
        svg.style.bottom = '0';
        svg.style.cursor = 'se-resize';
        
        resizeFooter.style.position = 'absolute';
        resizeFooter.style.left = '0';
        resizeFooter.style.bottom = '0';
        resizeFooter.style.width = '100%';
        resizeFooter.style.height = '15px';
        
        resizeFooter.appendChild(svg);
        this.Container.appendChild(resizeFooter);
        
        svg.appendChild(this.createLine(15, 4, 4, 15, '#999', 1));
        svg.appendChild(this.createLine(15, 7, 7, 15, '#999', 1));
        svg.appendChild(this.createLine(15, 10, 10, 15, '#999', 1));
        svg.appendChild(this.createLine(15, 13, 13, 15, '#999', 1));
        
        svg.onmousedown = this.resizeMouseDown;
        
    }
    
    private createLine(x1, x2, y1, y2, color, wid): SVGLineElement {
      const line: SVGLineElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  
      line.setAttributeNS(null, 'x1', x1);
      line.setAttributeNS(null, 'x2', x2);
      line.setAttributeNS(null, 'y1', y1);
      line.setAttributeNS(null, 'y2', y2);
  
      line.style.stroke = color;
      line.style.strokeWidth = wid;
  
      return line;
  
    }
  
    private removeDialog() {
        this.dispose();
        this.disposeById(this.monitorHeaderDisabledInterval);
        this.disposeById(this.monitorHeaderHiddenInterval);
        this.disposeById(this.monitorFooterDisabledInterval);
        this.disposeById(this.monitorFooterHiddenInterval);
        while (this.bindings.length > 0) {
            this.bindings.splice(0, 1);
        }
        document.getElementsByTagName('body')[0].removeChild(this.Container);
        document.getElementsByTagName('body')[0].removeChild(this.ModalMask);
    }
    
    private headerMouseDown(ev: MouseEvent) {
        let coords = { x1: 0, x2: ev.clientX, y1: 0, y2: ev.clientY };
        const closeDrag = (e: MouseEvent) => {
            document.onmouseup = null;
            document.onmousemove = null;
        }
        const dragElement = (e: MouseEvent) => {
            const elmnt: HTMLElement = document.getElementsByTagName('modal-container')[0] as HTMLElement;
            coords.x1 = e.clientX - coords.x2;
            coords.x2 = e.clientX;
            coords.y1 = e.clientY - coords.y2;
            coords.y2 = e.clientY;
            elmnt.style.top = (elmnt.offsetTop + (coords.y1)) + 'px';
            elmnt.style.left = (elmnt.offsetLeft + (coords.x1)) + 'px';
        };
        document.onmouseup = closeDrag;
        document.onmousemove = dragElement;
    }
    
    private resizeMouseDown(ev: MouseEvent) {
        const elmnt: HTMLElement = document.getElementsByTagName('modal-container')[0] as HTMLElement;
        let resizeArgs = {
            startX: ev.clientX,
            startY: ev.clientY,
            startWidth: parseInt(document.defaultView.getComputedStyle(elmnt).width, 10),
            startHeight: parseInt(document.defaultView.getComputedStyle(elmnt).height, 10)
        };
        const closeResize = (e: MouseEvent) => {
            document.onmouseup = null;
            document.onmousemove = null;
            window.dispatchEvent(new Event('dialogresized'));
        }
        const resizeElement = (e: MouseEvent) => {
            const elmnt: HTMLElement = document.getElementsByTagName('modal-container')[0] as HTMLElement;
            const width: number = resizeArgs.startWidth + (e.clientX - resizeArgs.startX);
            const height: number = resizeArgs.startHeight + (e.clientY - resizeArgs.startY);
            elmnt.style.width = width + 'px';
            elmnt.style.height = height + 'px';
        };
        document.onmouseup = closeResize;
        document.onmousemove = resizeElement;
    }
    
    private monitorAttributeValues() {
        const self = this;
        const headerDisabledNodes: Array<Element> = Array.from((<HTMLElement>this.DialogParameters.Header.View).querySelectorAll('[ng-disabled]'));
        const headerHiddenNodes: Array<Element> = Array.from((<HTMLElement>this.DialogParameters.Header.View).querySelectorAll('[ng-hidden]'));
        const footerDisabledNodes: Array<Element> = Array.from((<HTMLElement>this.DialogParameters.Footer.View).querySelectorAll('[ng-disabled]'));
        const footerHiddenNodes: Array<Element> = Array.from((<HTMLElement>this.DialogParameters.Footer.View).querySelectorAll('[ng-hidden]'));
        
        if (headerDisabledNodes) {
            
            this.monitorHeaderDisabledInterval = setInterval((nodes: Array<Element>) => {
                    
                nodes.forEach((value, key, parent) => {
                    const node: HTMLElement = value as HTMLElement;
                    const clickAttribute = node.getAttribute('ng-disabled');
                    const parts = clickAttribute.split('(');
                    const methodName = parts[0];
                    const disabled = self[methodName]()
                    
                    if (disabled !== '') {
                        node.setAttribute('disabled', disabled);
                    } else {
                        node.removeAttribute('disabled');
                    }
                    
                });
                
            }, 200, headerDisabledNodes as Array<Element>);
            
        }
        
        if (headerHiddenNodes) {
            
            this.monitorHeaderHiddenInterval = setInterval((nodes: Array<Element>) => {
                    
                nodes.forEach((value, key, parent) => {
                    const node: HTMLElement = value as HTMLElement;
                    const clickAttribute = node.getAttribute('ng-hidden');
                    const parts = clickAttribute.split('(');
                    const methodName = parts[0];
                    const disabled = self[methodName]()
                    
                    if (disabled !== '') {
                        node.setAttribute('hidden', disabled);
                    } else {
                        node.removeAttribute('hidden');
                    }
                    
                });
                
            }, 200, headerHiddenNodes as Array<Element>);
            
        }
        
        
        if (footerDisabledNodes) {
            
            this.monitorFooterDisabledInterval = setInterval((nodes: Array<Element>) => {
                    
                nodes.forEach((value, key, parent) => {
                    const node: HTMLElement = value as HTMLElement;
                    const clickAttribute = node.getAttribute('ng-disabled');
                    const parts = clickAttribute.split('(');
                    const methodName = parts[0];
                    const disabled = self[methodName]()
                    
                    if (disabled !== '') {
                        node.setAttribute('disabled', disabled);
                    } else {
                        node.removeAttribute('disabled');
                    }
                    
                });
                
            }, 200, footerDisabledNodes as Array<Element>);
            
        }
        
        if (footerHiddenNodes) {
            
            this.monitorFooterHiddenInterval = setInterval((nodes: Array<Element>) => {
                    
                nodes.forEach((value, key, parent) => {
                    const node: HTMLElement = value as HTMLElement;
                    const clickAttribute = node.getAttribute('ng-hidden');
                    const parts = clickAttribute.split('(');
                    const methodName = parts[0];
                    const disabled = self[methodName]()
                    
                    if (disabled !== '') {
                        node.setAttribute('hidden', disabled);
                    } else {
                        node.removeAttribute('hidden');
                    }
                    
                });
                
            }, 200, footerHiddenNodes as Array<Element>);
            
        }
        
    }
    
    protected disposeById(intervalId: number) {
        clearInterval(intervalId);
    }
    
}

export { DialogBase };
