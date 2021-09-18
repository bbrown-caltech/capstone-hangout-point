import { Application, DataTypeArgs } from '../../../framework/core/Application';
import { KeyValuePair } from '../../../framework/core/ResourceDictionary';
import { Dialog } from '../../../framework/decorators/Dialog';
import { DialogBase } from '../../../framework/core/DialogBase';
import { UIBase } from '../../../framework/core/UIBase';
import { RepeatingDataView } from '../../../framework/core/RepeatingDataView';
import { DateFormatProvider } from '../../../framework/providers/DateFormatProvider';
import { HttpRequest, HttpRequestConfig } from '../../../framework/providers/HttpRequest';
import { DataViewFilter, DataViewFilterField } from '../../../framework/core/DataViewFilter';
import { Paginator } from '../../../framework/core/Paginator';
import { DataSorter } from '../../../framework/core/DataSorter';

import { EmitterService } from '../../services/emitter.service';
import { ProductEditorService } from '../../services/product-editor.service';

import { Emitter } from '../../models/emitters/Emitter.Interface';
import { Product } from '../../models/product/Product.Interface';
import { SelectedElnot } from '../../models/misc/SelectedElnot.Interface';
import { ProductEmitter } from '../../models/product/ProductEmitter.Interface';
import { EmitterSearchResult, EmitterHistory, ProductDelivery } from '../../models/emitters/EmitterSearchResult.Interface';

import { EmitterSearchParameter } from '../../models/emitters/EmitterSearchParameter.Interface';
import { EmitterSearchService } from '../../services/emitter-search.service';


@Dialog({
    selector: 'add-elnots',
    BasePath: 'js/application/dialogs/add-elnots',
    template: '',
    styles: 'add-elnots.dialog.css',
    headerTemplate: 'add-elnots.dialog-header.html',
    templates: [
        'add-elnots.dialog-view.elnot-selection.html'
    ],
    footerTemplate: 'add-elnots.dialog-footer.html'
})
class AddElnotsDialog extends DialogBase {
    TotalSelected: number = 0;
    
    private container: HTMLDivElement;
    private displayingInfoPanel: boolean = false;
    
    private showFilter = true;
    private displaySaveProduct = true;
    private displaySaveElnots = false;
    
    private emitters: Emitter[];
    private selectedEmitters: SelectedElnot[];
    
    private elnotRepeat: RepeatingDataView;
    private paginator: Paginator;
    
    private ndpEmitterList: string[];
    private historicalEmitterList: string[];
    private productElnots: string[];
    
    constructor(private productEditor: ProductEditorService,
                private emitterService: EmitterService,
                private searchService: EmitterSearchService) { super(); }
    
    preOpen() {
        const self = this;
        const ndpSearchParam: Partial<EmitterSearchParameter> = {
            onlyApprovedByPolicy: true,
            deliverToCountries: []
        };
        const historicalSearchParam: Partial<EmitterSearchParameter> = {
            onlyApprovedByPolicy: false,
            onlyApprovedSince: '2021-01-01',
            deliverToCountries: []
        };
        const elnots: string[] = new Array<string>();
        this.selectedEmitters = new Array<SelectedElnot>();
        
        this.loadPanelTemplate();
        
        for (const c of this.productEditor.SelectedProduct.countries) {
            ndpSearchParam.deliverToCountries.push(c);
            historicalSearchParam.deliverToCountries.push(c);
        }
        
        for (const e of this.productEditor.SelectedProduct.emitters) {
            elnots.push(e.elnot);
        }
        
        this.searchService.getSearchEmitters(ndpSearchParam)
        .completed((result: EmitterHistory[]) => {
            self.ndpEmitterList =  new Array<string>();
            if (result) {
                for (const elnot of result) {
                    self.ndpEmitterList.push(elnot.elnot);
                }
            }
        }).exception((error: any) => {
           console.log('Product Pre-Init: Get NDP Emitters', error); 
        });
        
        this.searchService.getSearchEmitters(historicalSearchParam)
        .completed((result: EmitterHistory[]) => {
            self.historicalEmitterList =  new Array<string>();
            if (result) {
                for (const elnot of result) {
                    self.historicalEmitterList.push(elnot.elnot);
                }
            }
        }).exception((error: any) => {
           console.log('Product Pre-Init: Get Historical Emitters', error); 
        });
        
        
        this.emitterService.getEmitters()
        .completed((result: Emitter[]) => {
            self.emitters = result;
            
            setTimeout(() => {
                self.buildEmitterList();
            }, 400);
            
        }).exception((error: any) => {
           console.log('Product Pre-Init: Get Emitters', error); 
        });
    }
    
    postOpen() {
        const self = this;
        
        setTimeout(() => {
            const filter: DataViewFilter = new DataViewFilter();
            
            filter.Add([
                { FieldName: 'elnot', InputControlID: 'elnotFilter', DataType: DataTypeArgs.String }
            ]);
            self.paginator = new Paginator('elnotPaginator');
            self.paginator.setPageSize(50);
            self.elnotRepeat = new RepeatingDataView('elnotRepeat', {
                scope: self as UIBase,
                dataSet: self.selectedEmitters,
                transformFunctions: undefined,
                paginator: self.paginator,
                filter: filter,
                sorter: new DataSorter(['elnot'])
            });
            self.paginator.refresh(self.selectedEmitters);
            console.log('Post-Open: ', self.selectedEmitters);
            setTimeout(() => {
                const container: HTMLElement = document.getElementById('container') as HTMLElement;
                const totalCols: number = Math.floor(container.offsetWidth / 106);
                const totalRows: number = Math.floor(container.offsetHeight / 36);
                const pageSize: number = totalCols * totalRows;
                
                self.paginator.resize(pageSize);
                    
                window.addEventListener('dialogresized', function(){
                    const container: HTMLElement = document.getElementById('container') as HTMLElement;
                    const height: number = self.ModalBody.offsetHeight - 140;
                    container.style.height = height + 'px';
                    
                    const totalCols: number = Math.floor(container.offsetWidth / 106);
                    const totalRows: number = Math.floor(container.offsetHeight / 36);
                    const pageSize: number = totalCols * totalRows;
                    
                    self.paginator.resize(pageSize);
                })

                const policySelect: HTMLSelectElement = document.getElementById("policy") as HTMLSelectElement;
                
                policySelect.onchange = (ev: Event) => {
                    if (policySelect.value === 'None') {
                        self.resetElnotView();
                        return;
                    }
                    if (policySelect.value === 'LCD') {
                        self.showLcdElnots();
                        return;
                    }
                    if (policySelect.value === 'HIST') {
                        self.showHistoricalElnots();
                        return;
                    }
                };
                
            }, 500);
            
        }, 400);
        
    }
    
    private loadPanelTemplate() {
        const containerPanels: HTMLCollection = document.getElementsByClassName('elnot-information-panel');
        
        if (containerPanels) {
            for (let i = 0; i < containerPanels.length; i++) {
                containerPanels[i].removeChild(containerPanels[i]);
            }
        }
        
        this.displayingInfoPanel = false;
        
        const self = this;
        const appPath: string = (Application.instance().config.BasePath !== '' ? Application.instance().config.BasePath + '/' : '');
        const basePath: string = 'js/application/dialogs/add-elnots';
        let baseUrl: string = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/${appPath}`;
        baseUrl += `${basePath}`;
        
        const reqConfig: HttpRequestConfig = { headers: new Array<KeyValuePair>(), BasePath: baseUrl, EnableCors: true };
        const requestor: HttpRequest = new HttpRequest(reqConfig);
        
        self.container = document.createElement('div');
        self.container.classList.add('elnot-information-panel');
        
        requestor.loadFile('add-elnots.dialog-information.html')
        .completed((content: string) => {
            const parser: DOMParser = new DOMParser();
            const html: Document = parser.parseFromString(content, 'text/html');
            const body: HTMLBodyElement = html.getElementsByTagName('body')[0];
            
            Array.from(body.childNodes).forEach((node: Node, idx: number, array: ChildNode[]) => {
                self.container.appendChild(node);
            });
            
            const clickNodes: Array<Element> = Array.from(self.container.querySelectorAll('[click]'));
            
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
                        self[methodName](args);
                        ev.preventDefault();
                        ev.stopPropagation();
                    };
                });
                
            }
            
        })
        .exception((error: any) => {
            const content: HTMLDivElement = document.createElement('div');
            content.style.margin = '10px';
            content.innerHTML = '<h3>Error Loading Template</h3>';
            self.container.appendChild(content);
        });
        
    }
    
    
    /*****************************************************************************************
     *  ELNOT SELECTION METHODS
     *****************************************************************************************/
    selectElnot(elnot: SelectedElnot, ev: MouseEvent) {
        const node: HTMLElement = ev.target as HTMLElement;
        
        if (elnot.Selected) {
            this.TotalSelected--;
            elnot.Selected = false;
            if (elnot.policyApplied) {
                node.classList.remove(elnot.policyClasses[1]);
                node.classList.add(elnot.policyClasses[0]);
                // console.log('Set Elnot Class: ', elnot.policyClasses[0]);
            } else {
                node.classList.remove('elnot-selected');
                // console.log('Removing Elnot Class: elnot-selected');
            }
        } else {
            this.TotalSelected++
            elnot.Selected = true;
            if (elnot.policyApplied) {
                node.classList.remove(elnot.policyClasses[0]);
            }
            node.classList.add(elnot.policyClasses[1]);
            // console.log('Set Elnot Class: ', elnot.policyClasses[1]);
        }
        
        this.renderElnotInfo(elnot);
        
    }
    
    private renderElnotInfo(elnot: SelectedElnot) {
        let emitter: Emitter = undefined;
            
        for (const e of this.emitters) {
            if (e.emitterId === elnot.emitterId) {
                emitter = e;
                break;
            }
        }
        
        const containerPanels: HTMLCollection = document.getElementsByClassName('elnot-information-panel');
        
        if (containerPanels) {
            this.displayingInfoPanel = containerPanels.length > 0;
        }
        
        if (emitter) {
                    
            if (!this.displayingInfoPanel) {
                this.displayingInfoPanel = true;
                document.getElementsByTagName('body')[0].appendChild(this.container);
            }
            
            setTimeout(() => {
                this.displayElnotInfo(emitter);
            }, 500);
        }
        
    }
    
    private displayElnotInfo(emitter: Emitter) {
        const elnotName: HTMLInputElement = document.getElementById('elnotName') as HTMLInputElement;
        const elnotFunction: HTMLInputElement = document.getElementById('elnotFunction') as HTMLInputElement;
        const cedUpdateDate: HTMLInputElement = document.getElementById('cedUpdateDate') as HTMLInputElement;
        const elnotStatus: HTMLInputElement = document.getElementById('elnotStatus') as HTMLInputElement;
        const primaryPlatformType: HTMLInputElement = document.getElementById('primaryPlatformType') as HTMLInputElement;
        const originCountryCodes: HTMLSelectElement = document.getElementById('originCountryCodes') as HTMLSelectElement;
        const userCountryCodes: HTMLSelectElement = document.getElementById('userCountryCodes') as HTMLSelectElement;
        const platformTypes: HTMLSelectElement = document.getElementById('platformTypes') as HTMLSelectElement;
        const secondaryNames: HTMLSelectElement = document.getElementById('secondaryNames') as HTMLSelectElement;
        
        if (elnotName && elnotFunction && cedUpdateDate &&
            elnotStatus && primaryPlatformType) {
            elnotName.value = emitter.name;
            elnotFunction.value = emitter.function;
            cedUpdateDate.value = emitter.cedUpdateDate;
            elnotStatus.value = emitter.status;
            primaryPlatformType.value = emitter.primaryPlatformType;
        }
        
        this.setSelectOptions(originCountryCodes, emitter.originCountryCodes);
        this.setSelectOptions(userCountryCodes, emitter.userCountryCodes);
        this.setSelectOptions(platformTypes, emitter.platformTypes);
        this.setSelectOptions(secondaryNames, emitter.secondaryNames);
        
    }
    
    private setSelectOptions(select: HTMLSelectElement, options: string[]) {
        if (!select) { return; }
        
        while (select.options.length > 0) {
            select.removeChild(select.options[0]);
        }
        
        for (let i = 0; i < options.length; i++) {
            const opt: HTMLOptionElement = document.createElement('option');
            opt.value = options[i];
            opt.text = options[i];
            select.options.add(opt);
        }
        
    }
    
    closeInfoPanel() {
        const containerPanels: HTMLCollection = document.getElementsByClassName('elnot-information-panel');
        const body: HTMLBodyElement = document.getElementsByTagName('body')[0];
        
        if (containerPanels) {
            if (!this.displayingInfoPanel) {
                this.displayingInfoPanel = true;
            }
        }
        
        if (this.displayingInfoPanel) {
            this.displayingInfoPanel = false;
            const parent: Node = this.container.parentNode;
            if (parent) {
                parent.removeChild(this.container);
            }
        }
        
    }
    
    cancel() {
        const elnots: string[] = new Array<string>();
        const selectedElnots: HTMLCollection = document.getElementsByClassName('elnot-selected');
        
        for (const e of this.productEditor.SelectedProduct.emitters) {
            elnots.push(e.elnot);
        }
        
        console.log(selectedElnots);
        
        for (let i = 0; i < selectedElnots.length; i++) {
            if (elnots.indexOf(selectedElnots[i].innerHTML) === -1) {
                selectedElnots[i].classList.remove('elnot-selected');
            }
        }
        
        this.closeInfoPanel();
        this.elnotRepeat.dispose();
        super.cancel();
        console.log('Closing dialog');
    }
    
    setElnotClass(emitter: SelectedElnot, node: HTMLElement) {
        if (emitter.Selected) {
            if (emitter.policyApplied) {
                node.classList.remove(emitter.policyClasses[0]);
                node.classList.add(emitter.policyClasses[1]);
            } else {
                node.classList.add(emitter.policyClasses[1]);
            }
        } else {
            if (emitter.policyApplied) {
                node.classList.remove(emitter.policyClasses[1]);
                node.classList.add(emitter.policyClasses[0]);
            } else {
                node.classList.remove('elnot-selected');
            }
        }
    }
    
    saveElnots() {
        const self = this;
        // console.log('Save Elnots - Before Save Init: ', self.selectedEmitters);
        
        const elnots: string[] = new Array<string>();
        const selectedElnots: HTMLCollection = document.getElementsByClassName('elnot-selected');
        
        for (let i = 0; i < selectedElnots.length; i++) {
            elnots.push(selectedElnots[i].innerHTML);
        }
        
        for (const elnot of this.selectedEmitters) {
            if (elnots.indexOf(elnot.name) !== -1 && elnot.Selected === false) {
                elnot.Selected = true;
            }
        }
        
        
        self.productEditor.SelectedProduct.emitters = new Array<ProductEmitter>();
        for (const elnot of self.selectedEmitters) {
            if (elnot.Selected) {
                let emitter: ProductEmitter = {
                    name: elnot.name,
                    function: elnot.function,
                    elnot: elnot.elnot,
                    platforms: ['Truck'],
                    userCountries: ['CN'],
                    includeInProduct: true,
                    excludeReason: '',
                    owner: '',
                    systemId: '',
                    cedId: ''
                };
                self.productEditor.SelectedProduct.emitters.push(emitter);
            }            
        }
        
        // console.log('Save Elnots - Before Save: ', self.productEditor.SelectedProduct.emitters);
        
        this.productEditor.saveProduct(self.productEditor.SelectedProduct).completed((product: Product) => {
            
            self.productEditor.SelectedProduct = (product ?
                                                  self.productEditor.cloneProduct(product) :
                                                  self.productEditor.SelectedProduct);
            // console.log('Save Elnots - After Save: ', self.productEditor.SelectedProduct.emitters);
            self.complete(product);
            self.closeInfoPanel();
            self.elnotRepeat.dispose();
        });

    }
    
    
    applyPolicy() {
        const self = this;
        const policySelect: HTMLSelectElement = document.getElementById("policy") as HTMLSelectElement;
        
        if (policySelect.value === 'None') {
            self.removePolicySelection();
            return;
        }
        
        if (policySelect.value === 'LCD') {
            self.applyLcdPolicy();
            return;
        }
        
        if (policySelect.value === 'HIST') {
            self.applyHistoricalPolicy();
            return;
        }
        
    }
    
    private applyLcdPolicy() {
        const self = this;
        const deselect = confirm('Deselect previously selected ELNOT\'s?');
        
        if (self.ndpEmitterList !== undefined && self.ndpEmitterList !== null && self.ndpEmitterList.length > 0) {
            this.TotalSelected = 0;
            
            for (const emitter of self.selectedEmitters) {
                const hasPolicy: boolean = self.ndpEmitterList.indexOf(emitter.elnot) > -1;
                
                emitter.policyApplied = (emitter.policyApplied ? !deselect : false);
                emitter.Selected = (hasPolicy ? hasPolicy : !deselect);
                emitter.policyApplied = (emitter.policyApplied ? emitter.policyApplied : hasPolicy);
                
                if (hasPolicy) {
                    emitter.policyClasses[0] = 'lcd-elnot-deselected';
                    emitter.policyClasses[1] =  'lcd-elnot-selected';
                } else {
                    emitter.policyClasses[0] = '';
                    emitter.policyClasses[1] = 'elnot-selected';
                }
                
                if (emitter.Selected) {
                    this.TotalSelected++;
                }
                
            }
        
            self.paginator.refresh(self.selectedEmitters);
        }
        
    }
    
    private applyHistoricalPolicy() {
        const self = this;
        const deselect = confirm('Deselect previously selected ELNOT\'s?');
        
        if (self.historicalEmitterList !== undefined && self.historicalEmitterList !== null && self.historicalEmitterList.length > 0) {
            this.TotalSelected = 0;
            
            for (const emitter of self.selectedEmitters) {
                const hasPolicy: boolean = self.historicalEmitterList.indexOf(emitter.elnot) > -1;
                
                emitter.policyApplied = (emitter.policyApplied ? !deselect : false);
                emitter.Selected = (hasPolicy ? hasPolicy : !deselect);
                emitter.policyApplied = (emitter.policyApplied ? emitter.policyApplied : hasPolicy);
                
                if (hasPolicy) {
                    emitter.policyClasses[0] = 'hist-elnot-deselected';
                    emitter.policyClasses[1] = 'hist-elnot-selected';
                } else {
                    emitter.policyClasses[0] = '';
                    emitter.policyClasses[1] = 'elnot-selected';
                }
                
                if (emitter.Selected) {
                    this.TotalSelected++;
                }
                
            }
        
            self.paginator.refresh(self.selectedEmitters);
        }
        
    }
    
    private removePolicySelection() {
        const self = this;
        const deselect = confirm('Reset to originally selected ELNOT\'s?');
        
        if (!deselect) { return; }
        
        this.TotalSelected = 0;
        
        for (const emitter of self.selectedEmitters) {
            const originalSelection: boolean = self.productElnots.indexOf(emitter.elnot) > -1;
            
            emitter.policyApplied = false;
            emitter.Selected = originalSelection;
            
            if (originalSelection) {
                emitter.policyClasses[0] = 'elnot-prev-selected';
                emitter.policyClasses[1] = 'elnot-selected';
            } else {
                emitter.policyClasses[0] = '';
                emitter.policyClasses[1] = 'elnot-selected';
            }
            
            if (emitter.Selected) {
                this.TotalSelected++;
            }
            
        }
        
        self.paginator.refresh(self.selectedEmitters);
        
    }
    
    clearSelected() {
        const self = this;
        const confirmDeselect = confirm('Are you sure you want to clear all selected ELNOT\'s?');
        
        if (!confirmDeselect) { return; }
        
        this.TotalSelected = 0;
        
        for (const emitter of self.selectedEmitters) {
            emitter.policyApplied = false;
            emitter.Selected = false;
            emitter.policyClasses[0] = '';
            emitter.policyClasses[1] = 'elnot-selected';
            
            if (emitter.Selected) {
                this.TotalSelected++;
            }
            
        }
        
        self.paginator.refresh(self.selectedEmitters);
        
    }
    
    private showLcdElnots() {
        const self = this;
        
        for (const emitter of self.selectedEmitters) {
            const exists: boolean = self.ndpEmitterList.indexOf(emitter.elnot) > -1;
            
            if (exists) {
                emitter.policyApplied = true;
                emitter.policyClasses[0] = 'lcd-elnot-deselected';
                emitter.policyClasses[1] = 'lcd-elnot-selected';
            } else {
                emitter.policyApplied = false;
                emitter.policyClasses[0] = ''
                emitter.policyClasses[1] = 'elnot-selected';
            }
            
        }
        
        self.paginator.refresh(self.selectedEmitters);
        
    }
    
    private showHistoricalElnots() {
        const self = this;
        
        for (const emitter of self.selectedEmitters) {
            const exists: boolean = self.historicalEmitterList.indexOf(emitter.elnot) > -1;
            
            if (exists) {
                emitter.policyApplied = true;
                emitter.policyClasses[0] = 'hist-elnot-deselected';
                emitter.policyClasses[1] = 'hist-elnot-selected';
            } else {
                emitter.policyApplied = false;
                emitter.policyClasses[0] = ''
                emitter.policyClasses[1] = 'elnot-selected';
            }
            
        }
        
        self.paginator.refresh(self.selectedEmitters);
        
    }
    
    private resetElnotView() {
        const self = this;
        
        for (const emitter of self.selectedEmitters) {
            const exists: boolean = self.productElnots.indexOf(emitter.elnot) > -1;
            
            if (exists) {
                emitter.policyApplied = true;
                emitter.policyClasses[0] = 'elnot-prev-selected';
                emitter.policyClasses[1] = 'elnot-selected';
            } else {
                emitter.policyApplied = false;
                emitter.policyClasses[0] = ''
                emitter.policyClasses[1] = 'elnot-selected';
            }
            
        }
        
        self.paginator.refresh(self.selectedEmitters);
        
    }
    
    private buildEmitterList() {
        const self = this;
        
        self.productElnots = new Array<string>();
        
        for (const e of this.productEditor.SelectedProduct.emitters) {
            self.productElnots.push(e.elnot);
        }
        
        for (const emitter of self.emitters) {
            const exists: boolean = self.productElnots.indexOf(emitter.elnot) > -1;
            const selectedElnot: SelectedElnot = {
                emitterId: emitter.emitterId,
                name: emitter.name,
                function: emitter.function,
                elnot: emitter.elnot,
                Selected: exists,
                policyApplied: exists,
                policyClasses: []
            };
            
            if (exists) {
                selectedElnot.policyClasses.push('elnot-prev-selected', 'elnot-selected');
                this.TotalSelected++;
            } else {
                selectedElnot.policyClasses.push('', 'elnot-selected');
            }
            
            self.selectedEmitters.push(selectedElnot);
            
        }
        
    }
    
    /*****************************************************************************************
     *  MISC METHODS
     *****************************************************************************************/
    getShowFilter(): string {
        return (this.showFilter === true ? '' : 'hidden');
    }
    
    getDisplaySaveProduct(): string {
        const hidden: string = (this.displaySaveProduct === true ? '' : 'hidden');
        return hidden;
    }
    
    getDisplaySaveElnots(): string {
        const hidden: string = (this.displaySaveElnots === true ? '' : 'hidden');
        return hidden;
    }
    
}

export { AddElnotsDialog };