import { ResourceDictionary } from './ResourceDictionary';
import { DataViewFilter, FilterField } from './DataViewFilter';
import { Paginator } from './Paginator';
import { DataSorter } from './DataSorter';
import { UIBase } from './UIBase';

interface RepeatingDataViewConfig {
    scope: UIBase;
    dataSet: any[];
    transformFunctions: ResourceDictionary;
    paginator: Paginator;
    filter: DataViewFilter;
    sorter: DataSorter;
}

interface RepeatedRowValue {
    fieldName: string;
    currentValue: any;
}

interface RepeatedDataRow {
    modelIndex: number;
    element: HTMLElement;
    template: string;
    FieldValues: RepeatedRowValue[];
}

class RepeatingDataView {
    private template: HTMLElement;
    private parent: HTMLElement;
    
    private renderedData: RepeatedDataRow[];
    private totalRecords: number;
    private paged: boolean;
    private rendering: boolean;
    private filtering: boolean;
    private filteredData: any[];
    
    private disabledNodeInterval: number;
    private hiddenNodeInterval: number;
    private monitorDataInterval: number;
    
    constructor(private elementId: string, private config: Partial<RepeatingDataViewConfig>) {
        const element: HTMLElement = document.getElementById(this.elementId);
        
        if (element) {
            this.parent = element.parentElement;
            this.template = element.cloneNode(true) as HTMLElement;
            this.template.removeAttribute('id');
            this.template.style.display = '';
        }
        
        this.paged = ((this.config !== undefined && this.config !== null) &&
                      (this.config.paginator !== undefined && this.config.paginator !== null));
        
        this.init();
    }
    
    refresh(dataSet: any[]) {
        const self = this;
        
        self.config.dataSet = dataSet;
        
        if (!self.paged) {
            self.renderView(self, self.config.dataSet);
        } else {
            self.totalRecords = self.config.dataSet.length;
            self.config.paginator.setData(self.config.dataSet);
        }
        
    }
    
    sort(fieldName: string, transformer?: (value: any) => any) {
        const self = this;
        
        if (self.config.sorter) {
            
            if (!self.paged) {
                self.config.sorter.sort(self.filteredData, fieldName, transformer);
                self.rendering = true;
                self.renderView(self, self.filteredData);
            }
            else {
                self.config.sorter.sort(self.config.dataSet, fieldName, transformer);
                self.rendering = true;
                self.config.paginator.refresh(self.config.dataSet);
            }
        }
        
    }
    
    dispose() {
        this.onDispose();
    }
    
    private init() {
        const self = this;
        if (!self.parent || !self.template || !self.config || !self.config.dataSet) { return; }
        
        setTimeout(() => {
            
            if (!self.paged) {
                self.renderView(self, self.config.dataSet);
            } else {
                self.totalRecords = self.config.dataSet.length;
                self.config.paginator.paged = (data: any) => {
                    // console.log('Pagination', data);
                    self.renderView(self, data);
                    self.monitorData();
                };
                self.config.paginator.setData(self.config.dataSet);
                self.config.paginator.init();
            }
            
            // self.monitorData();
            
        }, 300);
        
        if (this.config.filter) {
            const stillFiltering = (): boolean => {
                for (const field of self.config.filter.items()) {
                    if (field.input.value.trim() !== '') {
                        return true;
                    }
                }
                return false;
            };
            for (const field of this.config.filter.items()) {
                field.input.onkeyup = (ev: KeyboardEvent) => {
                    if (!this.paged) {
                        const dataSet: any[] = this.config.filter.Filter(self.config.dataSet, field);
                        self.filtering = (stillFiltering() === true);
                        self.renderView(self, dataSet);
                    } else {
                        const dataSet: any[] = this.config.filter.Filter(self.config.dataSet, field);
                        self.filtering = (stillFiltering() === true);
                        self.config.paginator.refresh(dataSet);
                    }
                }
            }
        }
    }
    
    private evalTest(arg1: any, idx: number) {
        console.log(`Eval Test ${idx}`, arg1);
    }
    private renderView(self: RepeatingDataView, dataSet: any[]) {
        const rgx = /\{\{\w{1,}\}\}/gm;
        
        self.renderedData = new Array<RepeatedDataRow>();
        self.filteredData = dataSet;
        
        while (self.parent?.children.length > 0) {
            self.parent?.removeChild(self.parent?.children.item(0));
        }
        
        //  TODO: Implement This Method Instead
        // console.log('Calling evalTest...');
        // eval('for (let i = 0; i < self.config.dataSet.length; i++) {const row = self.config.dataSet[i]; self.evalTest(row, i);}');
        
        if (self.monitorDataInterval > 0) { clearInterval(self.monitorDataInterval); }
        if (self.hiddenNodeInterval > 0) { clearInterval(self.hiddenNodeInterval); }
        if (self.disabledNodeInterval > 0) { clearInterval(self.disabledNodeInterval); }
        
        for (let i = 0; i < dataSet.length; i++) {
            const row = dataSet[i];
            let found: boolean = false;
            let htmlRow: HTMLElement = self.template.cloneNode(true) as HTMLElement;
            let html: string = htmlRow.innerHTML;
            const repeatedRow: RepeatedDataRow = {
                modelIndex: i,
                element: htmlRow,
                template: html,
                FieldValues: new Array<RepeatedRowValue>()
            };
            
            
            
            const bindings = htmlRow.outerHTML.match(rgx);
            // console.log(html);
            // console.log(bindings);
            for (const binding in bindings) {
                const attrName = bindings[binding].replace('{{', '').replace('}}', '');
                
                if (row[attrName]) {
                    // console.log('Repeat', htmlRow);
                    const transform: Function = (self.config.transformFunctions && self.config.transformFunctions.containsKey(attrName) ?
                                                self.config.transformFunctions.get(attrName) : undefined);
                    html = html.replace(bindings[binding], self.removeEscapeChars((transform ? transform(row[attrName]) : row[attrName])));
                    
                    for (let j: number = 0; j < htmlRow.attributes.length; j++) {
                        let attrVal: string = htmlRow.attributes.item(j).value;
                        attrVal = attrVal.replace(bindings[binding], self.removeEscapeChars((transform ? transform(row[attrName]) : row[attrName])));
                        htmlRow.attributes.item(j).value = attrVal;
                    }
                    
                    repeatedRow.FieldValues.push({fieldName: attrName, currentValue: row[attrName]});
                    found = true;
                }
            }
            
            if (found) {
                htmlRow.innerHTML = html;
                
                const classNodes: Array<Element> = Array.from(htmlRow.querySelectorAll('[ng-class]'));
                const disabledNodes: Array<Element> = Array.from(htmlRow.querySelectorAll('[ng-disabled]'));
                const hiddenNodes: Array<Element> = Array.from(htmlRow.querySelectorAll('[ng-hidden]'));
                const clickNodes: Array<Element> = Array.from(htmlRow.querySelectorAll('[click]'));
                
                if (disabledNodes) {
                    
                    if (disabledNodes.length === 0 && htmlRow.hasAttribute('ng-disabled')) {
                        disabledNodes.push(htmlRow);
                    }
                    
                    const nodes: Array<Element> = disabledNodes as Array<Element>;
                    
                    if (self.disabledNodeInterval > 0) { clearInterval(self.disabledNodeInterval); }
                    self.disabledNodeInterval = setInterval((nodes: Element[]) => {
                        
                        nodes.forEach((value, key, parent) => {
                            const node: HTMLElement = value as HTMLElement;
                            const clickAttribute = node.getAttribute('ng-disabled');
                            const parts = clickAttribute.split('(');
                            const methodName = parts[0];
                            const disabled = self.config.scope[methodName](row)
                            
                            if (disabled !== '') {
                                node.setAttribute('disabled', disabled);
                            } else {
                                node.removeAttribute('disabled');
                            }
                            
                        });
                        
                    }, 200, nodes);
                    
                }
                
                if (hiddenNodes) {
                    
                    if (hiddenNodes.length === 0 && htmlRow.hasAttribute('ng-hidden')) {
                        hiddenNodes.push(htmlRow);
                    }
                    
                    const nodes: Array<Element> = hiddenNodes as Array<Element>;
                    
                    if (self.hiddenNodeInterval > 0) { clearInterval(self.hiddenNodeInterval); }
                    self.hiddenNodeInterval = setInterval((nodes: Element[]) => {
                        
                        nodes.forEach((value, key, parent) => {
                            const node: HTMLElement = value as HTMLElement;
                            const clickAttribute = node.getAttribute('ng-hidden');
                            const parts = clickAttribute.split('(');
                            const methodName = parts[0];
                            const hidden = self.config.scope[methodName](row)
                            
                            if (hidden !== '') {
                                node.setAttribute('hidden', hidden);
                            } else {
                                node.removeAttribute('hidden');
                            }
                            
                        });
                        
                    }, 200, nodes);
                    
                }
                
                if (classNodes) {
                    
                    if (classNodes.length === 0 && htmlRow.hasAttribute('ng-class')) {
                        classNodes.push(htmlRow);
                    }
                    
                    const nodes: Array<Element> = classNodes as Array<Element>;
                    
                    nodes.forEach((value, key, parent) => {
                        const node: HTMLElement = value as HTMLElement;
                        const clickAttribute = node.getAttribute('ng-class');
                        const parts = clickAttribute.split('(');
                        const methodName = parts[0];
                        self.config.scope[methodName](row, node)
                    });
                    
                }
                
                if (clickNodes) {
                    
                    if (htmlRow.hasAttribute('click')) {
                        clickNodes.push(htmlRow);
                    }
                    
                    const nodes: Array<Element> = clickNodes as Array<Element>;
                    
                    nodes.forEach((value, key, parent) => {
                        const node: HTMLElement = value as HTMLElement;
                        const clickAttribute = node.getAttribute('click');
                        const parts = clickAttribute.split('(');
                        const methodName = parts[0];
                        
                        node.onclick = (ev: MouseEvent) => {
                            self.config.scope[methodName](row, ev);
                        };
                        
                        node.oncontextmenu = (ev: MouseEvent) => {
                            self.config.scope[methodName](row, ev);
                        }
                        
                    });
                    
                }
                
                self.parent.appendChild(htmlRow);
                self.renderedData.push(repeatedRow);
            }
        }
        
        self.rendering = false;
        
    }
    
    private monitorData() {
        const self = this;
        const rgx = /\{\{\w{1,}\}\}/gm;
        
        self.monitorDataInterval = setInterval(() => {
            
            if (!self.paged) {
                
                if (!self.filtering && !self.rendering && self.config.dataSet.length !== self.renderedData.length) {
                    self.rendering = true;
                    self.renderView(self, self.config.dataSet);
                }
                
            } else {
                
                if (!self.filtering && !self.rendering && self.config.dataSet.length !== self.totalRecords) {
                    self.rendering = true;
                    self.totalRecords = self.config.dataSet.length;
                    self.config.paginator.refresh(self.config.dataSet);
                }
                
            }
            
            if (!self.filtering && !self.rendering) {
                for (const renderedRow of self.renderedData) {
                    if (renderedRow.modelIndex < self.filteredData.length) {
                        const row = self.filteredData[renderedRow.modelIndex];
                        let ValueChanged: boolean = false;
                        LoopFieldValues:
                        for (const rv of renderedRow.FieldValues) {
                            if (rv.currentValue !== row[rv.fieldName]) {
                                ValueChanged = true;
                                break LoopFieldValues;
                            }
                        }
                        
                        if (ValueChanged) {
                            const bindings = renderedRow.template.match(rgx);
                            let html = renderedRow.template;
                            renderedRow.FieldValues = new Array<RepeatedRowValue>();
                            for (const binding in bindings) {
                                const attrName = bindings[binding].replace('{{', '').replace('}}', '');
                                const transform: Function = (self.config.transformFunctions && self.config.transformFunctions.containsKey(attrName) ?
                                                self.config.transformFunctions.get(attrName) : undefined);
                                if (row[attrName]) {
                                    html = html.replace(bindings[binding], self.removeEscapeChars((transform ? transform(row[attrName]) : row[attrName])));
                                    renderedRow.FieldValues.push({fieldName: attrName, currentValue: row[attrName]});
                                }
                            }
                            renderedRow.element.innerHTML = html;
                            
                            //  TODO: PROVIDE BETTER MECHANISM FOR UPDATING THE VALUE SO THIS ISN'T NECESSARY
                            const classNodes: Array<Element> = Array.from(renderedRow.element.querySelectorAll('[ng-class]'));
                            const disabledNodes: Array<Element> = Array.from(renderedRow.element.querySelectorAll('[ng-disabled]'));
                            const hiddenNodes: Array<Element> = Array.from(renderedRow.element.querySelectorAll('[ng-hidden]'));
                            const clickNodes: Array<Element> = Array.from(renderedRow.element.querySelectorAll('[click]'));
                            
                            if (disabledNodes) {
                                
                                if (disabledNodes.length === 0 && renderedRow.element.hasAttribute('ng-disabled')) {
                                    disabledNodes.push(renderedRow.element);
                                }
                                
                                const nodes: Array<Element> = disabledNodes as Array<Element>;
                                
                                if (self.disabledNodeInterval > 0) { clearInterval(self.disabledNodeInterval); }
                                self.disabledNodeInterval = setInterval((nodes: Element[]) => {
                                    
                                    nodes.forEach((value, key, parent) => {
                                        const node: HTMLElement = value as HTMLElement;
                                        const clickAttribute = node.getAttribute('ng-disabled');
                                        const parts = clickAttribute.split('(');
                                        const methodName = parts[0];
                                        const disabled = self.config.scope[methodName](row)
                                        
                                        if (disabled !== '') {
                                            node.setAttribute('disabled', disabled);
                                        } else {
                                            node.removeAttribute('disabled');
                                        }
                                        
                                    });
                                    
                                }, 200, nodes);
                                
                            }
                            
                            if (hiddenNodes) {
                                
                                if (hiddenNodes.length === 0 && renderedRow.element.hasAttribute('ng-hidden')) {
                                    hiddenNodes.push(renderedRow.element);
                                }
                                
                                const nodes: Array<Element> = hiddenNodes as Array<Element>;
                                
                                if (self.hiddenNodeInterval > 0) { clearInterval(self.hiddenNodeInterval); }
                                self.hiddenNodeInterval = setInterval((nodes: Element[]) => {
                                    
                                    nodes.forEach((value, key, parent) => {
                                        const node: HTMLElement = value as HTMLElement;
                                        const clickAttribute = node.getAttribute('ng-hidden');
                                        const parts = clickAttribute.split('(');
                                        const methodName = parts[0];
                                        const hidden = self.config.scope[methodName](row)
                                        
                                        if (hidden !== '') {
                                            node.setAttribute('hidden', hidden);
                                        } else {
                                            node.removeAttribute('hidden');
                                        }
                                        
                                    });
                                    
                                }, 200, nodes);
                                
                            }
                                        
                            if (classNodes) {
                                
                                if (classNodes.length === 0 && renderedRow.element.hasAttribute('ng-class')) {
                                    classNodes.push(renderedRow.element);
                                }
                                
                                const nodes: Array<Element> = classNodes as Array<Element>;
                                
                                nodes.forEach((value, key, parent) => {
                                    const node: HTMLElement = value as HTMLElement;
                                    const clickAttribute = node.getAttribute('ng-class');
                                    const parts = clickAttribute.split('(');
                                    const methodName = parts[0];
                                    self.config.scope[methodName](row, node)
                                });
                                
                            }
                            
                            if (clickNodes) {
                                
                                if (clickNodes.length === 0 && renderedRow.element.hasAttribute('click')) {
                                    clickNodes.push(renderedRow.element);
                                }
                                
                                const nodes: Array<Element> = clickNodes as Array<Element>;
                                
                                nodes.forEach((value, key, parent) => {
                                    const node: HTMLElement = value as HTMLElement;
                                    const clickAttribute = node.getAttribute('click');
                                    const parts = clickAttribute.split('(');
                                    const methodName = parts[0];
                                    
                                    node.onclick = (ev: MouseEvent) => {
                                        self.config.scope[methodName](row, ev);
                                    };
                                    
                                    node.oncontextmenu = (ev: MouseEvent) => {
                                        self.config.scope[methodName](row, ev);
                                    };
                                });
                                
                            }
                            
                        }
                        
                    }
                }
            }
            
            
        }, 100);
        
    }
    
    private removeEscapeChars(text: string): string {
        try
        {
            return decodeURIComponent(text);
        }
        catch (e)
        {
            return text;
        }
    };
    
    private onDispose() {
        clearInterval(this.hiddenNodeInterval);
        clearInterval(this.disabledNodeInterval);
        clearInterval(this.monitorDataInterval);
        this.renderedData = null;
        while (this.parent.children.length > 0) {
            this.parent.removeChild(this.parent.children.item(0));
        }
        let htmlRow: HTMLElement = this.template.cloneNode(true) as HTMLElement;
        htmlRow.setAttribute('id', this.elementId);
        htmlRow.style.display = 'none';
        this.parent.appendChild(htmlRow);
        if (this.paged) {
            this.config.paginator.dispose();
        }
    }
}

export { RepeatingDataView, RepeatingDataViewConfig };