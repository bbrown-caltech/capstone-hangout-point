import { Application, DataTypeArgs } from '../../../framework/core/Application';
import { KeyValuePair } from '../../../framework/core/ResourceDictionary';
import { Dialog } from '../../../framework/decorators/Dialog';
import { DialogBase } from '../../../framework/core/DialogBase';
import { UIBase } from '../../../framework/core/UIBase';
import { RepeatingDataView } from '../../../framework/core/RepeatingDataView';
import { DataViewFilter, DataViewFilterField } from '../../../framework/core/DataViewFilter';
import { HttpRequest, HttpRequestConfig } from '../../../framework/providers/HttpRequest';
import { DateFormatProvider } from '../../../framework/providers/DateFormatProvider';
import { Paginator } from '../../../framework/core/Paginator';
import { DataSorter } from '../../../framework/core/DataSorter';
import { CustomEvent } from '../../../framework/models/CustomEvent.Interface';

import { Pikaday } from '../../../libs/pikaday/pikaday';
import { PikadayOptions } from '../../../libs/pikaday/options';

import { LocalStorageDao, TableInfo } from '../../data/LocalStorageDao'

import { AuxDataService } from '../../services/aux-data.service';
import { EmitterService } from '../../services/emitter.service';
import { ProductEditorService } from '../../services/product-editor.service';

import { Country } from '../../models/aux-data/Country.Interface'
import { Platform } from '../../models/aux-data/Platform.Interface'
import { MilitaryService } from '../../models/aux-data/Service.Interface'

import { Emitter } from '../../models/emitters/Emitter.Interface';
import { Product } from '../../models/product/Product.Interface';
import { SelectedElnot } from '../../models/misc/SelectedElnot.Interface';
import { IProductComments, IComment } from '../../models/product/ProductComments.Interface';
import { ProductEmitter } from '../../models/product/ProductEmitter.Interface';
import { EmitterSearchResult, EmitterHistory, ProductDelivery } from '../../models/emitters/EmitterSearchResult.Interface';

import { PlatformControl, PlatformControlContainer } from '../../../application/models/product/Platform.Control';
import { ProgressControl } from '../../models/product/Progress.Control';
import { ProductPlatform } from '../../models/product/ProductPlatform.Interface';
import { EwSystem } from '../../models/product/EwSystem.Interface';

import { EmitterSearchParameter } from '../../models/emitters/EmitterSearchParameter.Interface';
import { EmitterSearchService } from '../../services/emitter-search.service';

import { ProductEditor } from '../../controls/ProductEditor.Control';
import { appConfig } from '../../config';

@Dialog({
    selector: 'add-product',
    BasePath: 'js/application/dialogs/add-product',
    template: '',
    styles: 'add-product.dialog.css',
    headerTemplate: 'add-product.dialog-header.html',
    templates: [
        'add-product.dialog-view.product-creator.html',
        'add-product.dialog-view.elnot-selection.html'
    ],
    footerTemplate: 'add-product.dialog-footer.html'
})
class AddProductDialog extends DialogBase {
    TotalSelected: number = 0;
    ElnotSelectionMessage: string = '';
    
    private storageDao: LocalStorageDao;
    
    private containerWidth = 690;
    private productEditorControl: ProductEditor;
    
    private container: HTMLDivElement;
    private displayingInfoPanel: boolean = false;
    private progress: ProgressControl;
    
    private showFilter = true;
    private displaySaveProduct = true;
    private displaySaveElnots = false;
    private displayNextElnots = false;
    private displayPrevElnots = false;
    
    private selectedCountryCode: string;
    private editCountries: Country[];
    private countries: Country[];
    private platforms: Platform[];
    private militaryBranches: MilitaryService[];
    private emitters: Emitter[];
    private availableEmitters: SelectedElnot[];
    private selectedEmitters: SelectedElnot[];
    
    private displayEmitters = [];
    private displayIndex = 0;
    
    selectedPlatforms = '';
    platform = '';
    
    private platformRepeat: RepeatingDataView;
    // private productRepeater: RepeatingDataView;
    private serviceRepeat: RepeatingDataView;
    private countryRepeat: RepeatingDataView;
    private selectedCountriesRepeat: RepeatingDataView;
    private elnotRepeat: RepeatingDataView;
    private selectedElnotRepeat: RepeatingDataView;
    private emitterInfoListRepeat: RepeatingDataView;
    private paginator: Paginator;
    private selectedElnotPaginator: Paginator;
    
    private platformContainer: PlatformControlContainer;
    
    private ndpEmitterList: string[];
    private historicalEmitterList: string[];
    private productElnots: string[];
    
    constructor(private auxService: AuxDataService,
                private productEditor: ProductEditorService,
                private emitterService: EmitterService,
                private searchService: EmitterSearchService) { super(); }
    
    preOpen() {
        const self = this;
        this.editCountries = new Array<Country>();
        this.availableEmitters = new Array<SelectedElnot>();
        this.selectedEmitters = new Array<SelectedElnot>();
        
        this.storageDao = new LocalStorageDao('fist');
        this.storageDao.Tables.push({ TableName: 'files', PrimaryFieldName: 'productId', PrimaryIndexName: 'files_productId_Index'});
        this.storageDao.initDb();
        
        this.progress = new ProgressControl();
        this.progress.steps.push({name: 'Apply NDP', sequenceId: 1, completed: false, col: undefined, image: undefined});
        this.progress.steps.push({name: 'Apply Historical', sequenceId: 1, completed: false, col: undefined, image: undefined});
        this.progress.steps.push({name: 'Other', sequenceId: 1, completed: false, col: undefined, image: undefined});
        this.progress.init();
        
        this.loadPanelTemplate();
        
        this.auxService.getCountries()
        .completed((result: Country[]) => {
            self.countries = result;
        }).exception((error: any) => {
           console.log('Product Pre-Init: Get Countries', error); 
        });
        this.auxService.getPlatforms()
        .completed((result: Platform[]) => {
            self.platforms = result;
        }).exception((error: any) => {
           console.log('Product Pre-Init: Get Platforms', error); 
        });
        this.auxService.getServices()
        .completed((result: MilitaryService[]) => {
            self.militaryBranches = result;
        }).exception((error: any) => {
           console.log('Product Pre-Init: Get Military Services', error); 
        });
        this.emitterService.getEmitters()
        .completed((result: Emitter[]) => {
            self.emitters = result;
            for (const emitter of self.emitters) {
                self.availableEmitters.push({
                    emitterId: emitter.emitterId,
                    name: emitter.name,
                    function: emitter.function,
                    elnot: emitter.elnot,
                    Selected: false,
                    policyApplied: false,
                    policyClasses: []
                });
            }
        }).exception((error: any) => {
           console.log('Product Pre-Init: Get Emitters', error); 
        });
        
    }
    
    postOpen() {
        const self = this;
        
        self.productEditor.SelectedProduct = self.productEditor.createProductPlaceholder();
        self.platformContainer = new PlatformControlContainer('platformContainer');
        
        setTimeout(() => {
            
            while (self.ModalBody.children.length > 0) {
                self.ModalBody.removeChild(self.ModalBody.children.item(0));
            }
            
            self.productEditorControl = new ProductEditor(self.containerWidth,
                                                          self.productEditor.SelectedProduct,
                                                          self.countries,
                                                          self.platforms,
                                                          self.militaryBranches,
                                                          self.productEditor);
            //
            self.productEditorControl.init();
            self.ModalBody.appendChild(self.productEditorControl.container);
            
        }, 400);
        
    }
    
    cancel() {
        this.productEditor.SelectedProduct = this.productEditor.createProductPlaceholder();
        
        super.cancel();
        this.serviceRepeat?.dispose();
        this.platformRepeat?.dispose();
        this.countryRepeat?.dispose();
        this.selectedCountriesRepeat?.dispose();
        
    }
    
    disposeDialog() {
        this.productEditor.SelectedProduct = this.productEditor.createProductPlaceholder();
        this.TotalSelected = 0;
        this.ElnotSelectionMessage = '';
    
        this.progress.dispose();
        
        this.showFilter = true;
        this.displaySaveProduct = true;
        this.displaySaveElnots = false;
        this.displayNextElnots = false;
        this.displayPrevElnots = false;
        
        this.selectedCountryCode = '';
        this.editCountries = undefined;
        this.countries = undefined;
        this.platforms = undefined;
        this.militaryBranches = undefined;
        this.emitters = undefined;
        this.availableEmitters = undefined;
        this.selectedEmitters = undefined;
        
        this.displayEmitters = [];
        this.displayIndex = 0;
        
        this.selectedPlatforms = '';
        this.platform = '';
        this.serviceRepeat?.dispose();
        this.platformRepeat?.dispose();
        this.countryRepeat?.dispose();
        this.selectedCountriesRepeat?.dispose();
        this.elnotRepeat?.dispose();
        this.selectedElnotRepeat?.dispose();
        this.emitterInfoListRepeat?.dispose();
        this.closeInfoPanel();
    }
    
    private loadPanelTemplate() {
        const containerPanels: HTMLCollection = document.getElementsByClassName('elnot-information-panel');
        
        if (containerPanels) {
            for (let i = 0; i < containerPanels.length; i++) {
                const parent: Node = containerPanels[i].parentNode;
                if (parent) {
                    parent.removeChild(containerPanels[i]);
                }
            }
        }
        
        this.displayingInfoPanel = false;
        
        const self = this;
        const appPath: string = (Application.instance().config.BasePath !== '' ? Application.instance().config.BasePath + '/' : '');
        const basePath: string = 'js/application/dialogs/add-product';
        let baseUrl: string = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/${appPath}`;
        baseUrl += `${basePath}`;
        
        const reqConfig: HttpRequestConfig = { headers: new Array<KeyValuePair>(), BasePath: baseUrl, EnableCors: true };
        const requestor: HttpRequest = new HttpRequest(reqConfig);
        
        self.container = document.createElement('div');
        self.container.classList.add('elnot-information-panel');
        
        requestor.loadFile('add-product.dialog-information.html')
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
     *  SAVE PRODUCT METHODS
     *****************************************************************************************/
    saveProduct() {
        const self = this;
        console.log('Save Product: ', this.productEditorControl);
        this.productEditorControl.save().completed((product: Product) => {
            self.productEditor.SelectedProduct = self.productEditor.createProductPlaceholder();
            self.complete(product);
        });
        
    }
    
    saveProductAndNext() {
        const self = this;
        
        // alert('Saving & Next!');
        
        // console.log('Save Product: ', self.productEditorControl);
        this.productEditorControl.save().completed((product: Product) => {
            const route: string = `/${appConfig.BasePath}${appConfig.BasePath !== '' ? '/' : ''}elnot-selector?productId=${product.productId}`
            
            // if (self.storageDao.ready === true) {
            //     const key: IDBValidKey = product.productId;
            //     const comments: IProductComments = {
            //         productId: product.productId,
            //         comments: new Array<IComment>()
            //     };
            //     comments.comments.push({
            //         commentDate: DateFormatProvider.toDateTimeString(new Date()),
            //         enteredBy: appConfig.CurrentUser.Name,
            //         text: product.comments
            //     });
            //     self.storageDao.save<IProductComments>('comments', comments, key).completed((result: IDBValidKey) => {
            //         console.log('Add Comment Success: ', result); 
            //     }).exception((error: any) => {
            //         console.log('Add Comment Error: ', error); 
            //     });
            // }
            
            self.productEditor.SelectedProduct = self.productEditor.createProductPlaceholder();
            self.complete(product);
            history.pushState({selector: 'elnot-selector'}, 'elnot-selector', route);
            
        });
        
    }
    
    /*****************************************************************************************
     *  ELNOT SELECTION METHODS
     *****************************************************************************************/
    private buildElnotDisplay() {
        const self = this;
        const ndpEmitters: SelectedElnot[] = new Array<SelectedElnot>();
        const historicEmitters: SelectedElnot[] = new Array<SelectedElnot>();
        const allOtherEmitters: SelectedElnot[] = new Array<SelectedElnot>();
        
        for (const emitter of self.availableEmitters) {
            const existsInLcd: boolean = self.ndpEmitterList.indexOf(emitter.elnot) > -1;
            
            if (existsInLcd) {
                ndpEmitters.push(emitter);
            }
            
        }
        
        for (const emitter of self.availableEmitters) {
            const existsInLcd: boolean = self.ndpEmitterList.indexOf(emitter.elnot) > -1;
            const existsInHistory: boolean = self.historicalEmitterList.indexOf(emitter.elnot) > -1;
            
            if (existsInHistory && !existsInLcd) {
                historicEmitters.push(emitter);
            }
            
        }
        
        for (const emitter of self.availableEmitters) {
            const existsInLcd: boolean = self.ndpEmitterList.indexOf(emitter.elnot) > -1;
            const existsInHistory: boolean = self.historicalEmitterList.indexOf(emitter.elnot) > -1;
            
            if (!existsInHistory && !existsInLcd) {
                allOtherEmitters.push(emitter);
            }
            
        }
        
        self.displayEmitters.push(ndpEmitters);
        self.displayEmitters.push(historicEmitters);
        self.displayEmitters.push(allOtherEmitters);
        
    }
    
    moveNextElnots() {
        const self = this;
        const displayMessage = ['Select ELNOT\'s by NDP Policy', 'Select ELNOT\'s by Historic Approval', 'Select From All Other ELNOT\'s'];
        console.log(self.displayIndex);
        self.displayIndex++;
        while (self.displayIndex < self.displayEmitters.length && self.displayEmitters[self.displayIndex].length === 0) {
            self.displayIndex++;
        }
        console.log(self.displayIndex);
        if (self.displayIndex === 0) {
            self.paginator.setData(self.displayEmitters[self.displayIndex]);
            self.ElnotSelectionMessage = displayMessage[self.displayIndex];
            
            const evt: CustomEvent<ProgressControl> = new CustomEvent<ProgressControl>('selectnext', {detail: this.progress});
            window.dispatchEvent(evt);
            
            if (self.displayEmitters[(self.displayIndex + 1)].length === 0 &&
                self.displayEmitters[(self.displayIndex + 2)].length === 0) {
                self.displaySaveElnots = true;
                self.displayNextElnots = false;
                return;
            }
            
            if (self.displayEmitters[(self.displayIndex + 1)].length === 0 &&
                self.displayEmitters[(self.displayIndex + 2)].length > 0) {
                self.displayIndex++;
            }
            
            self.displaySaveElnots = false;
            self.displayNextElnots = true;
            
            return;
        }
        
        if (self.displayIndex === 1) {
            self.paginator.setData(self.displayEmitters[self.displayIndex]);
            self.ElnotSelectionMessage = displayMessage[self.displayIndex];
            
            const evt: CustomEvent<ProgressControl> = new CustomEvent<ProgressControl>('selectnext', {detail: this.progress});
            window.dispatchEvent(evt);
            
            if (self.displayEmitters[(self.displayIndex + 1)].length === 0) {
                self.displaySaveElnots = true;
                self.displayNextElnots = false;
                return;
            }
            
            self.displaySaveElnots = false;
            self.displayNextElnots = true;
            
            return;
        }
        
        if (self.displayIndex === 2) {
            self.paginator.setData(self.displayEmitters[self.displayIndex]);
            self.ElnotSelectionMessage = displayMessage[self.displayIndex];
            self.displaySaveElnots = true;
            self.displayNextElnots = false;
            
            const evt: CustomEvent<ProgressControl> = new CustomEvent<ProgressControl>('selectnext', {detail: this.progress});
            window.dispatchEvent(evt);
            
        }
        
    }
    
    movePrevElnots() {
        const evt: CustomEvent<ProgressControl> = new CustomEvent<ProgressControl>('selectprevious', {detail: this.progress});
        window.dispatchEvent(evt);
        this.displayIndex--;
    }
    
    selectElnot(elnot: SelectedElnot, ev: MouseEvent) {
        const node: HTMLElement = ev.target as HTMLElement;
        
        node.classList.remove('elnot-selected');
        
        if (elnot.Selected) {
            this.TotalSelected--;
            elnot.Selected = false;
            this.moveItem(elnot, this.selectedEmitters, this.displayEmitters[this.displayIndex]);
        } else {
            this.TotalSelected++
            elnot.Selected = true;
            node.classList.add('elnot-selected');
            this.moveItem(elnot, this.displayEmitters[this.displayIndex], this.selectedEmitters);
        }
        
        console.log(this.displayEmitters[this.displayIndex]);
        this.paginator.setData(this.displayEmitters[this.displayIndex]);
        this.selectedElnotPaginator.setData(this.selectedEmitters);
        
    }
    
    setElnotClass(emitter: SelectedElnot, node: HTMLElement) {
        if (emitter.Selected) {
            node.classList.add('elnot-selected');
        }
    }
    
    saveElnots() {
        const self = this;
        
        for (const elnot of self.selectedEmitters) {
            if (elnot.Selected) {
                let emitter: ProductEmitter = {
                    name: elnot.name,
                    function: elnot.function,
                    elnot: elnot.elnot,
                    platforms: (this.selectedPlatforms !== '' ? this.selectedPlatforms.split(',') : ['Truck']),
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
        
        this.productEditor.saveProduct(self.productEditor.SelectedProduct).completed((product: Product) => {
            
            self.productEditor.SelectedProduct = self.productEditor.createProductPlaceholder();
            self.complete(product);
            self.serviceRepeat.dispose();
            self.platformRepeat.dispose();
            self.countryRepeat.dispose();
            self.selectedCountriesRepeat.dispose();
            self.closeInfoPanel();
            
        });

    }
    
    private moveItem(emitter: SelectedElnot, source: SelectedElnot[], destination: SelectedElnot[]) {
        let itemFound: boolean = false;
        
        for (let i = 0; i < source.length; i++) {
            if (emitter.emitterId === source[i].emitterId) {
                source.splice(i, 1);
                break;
            }
        }
        
        for (let i = 0; i < destination.length; i++) {
            if (emitter.emitterId < destination[i].emitterId) {
                destination.splice(i, 0, emitter);
                itemFound = true;
                break;
            }
        }
        
        if (!itemFound) {
            destination.push(emitter);
        }
        
    }
    
    private renderElnotInfo(elnot: SelectedElnot) {
        return;
        
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
    
    
    /*****************************************************************************************
     *  COUNTRY SELECTION METHODS
     *****************************************************************************************/
    addCountry(evt): void {
        const countryCode: string = this.selectedCountryCode.toString();
        let itemsAdded: boolean = false;
        
        if (countryCode === '') { return; }
        
        for (const c of this.countries) {
          if (c.countryCode === countryCode) {
            this.editCountries.push({countryCode: c.countryCode, countryName: c.countryName});
            this.productEditor.SelectedProduct.countries.push(countryCode);
            itemsAdded = true;
            break;
          }
        }
        
        if (itemsAdded === true) {
            this.selectedCountriesRepeat.refresh(this.editCountries);
        }
        
        this.selectedCountryCode = '';
        this.countryRepeat.refresh(this.countries);
        
    }
        
    removeCountry(cntry: Country): void {
        let itemsRemoved: boolean = false;
        
        if (cntry === undefined || cntry === null) { return; }

        for (let i = 0; i < this.editCountries.length; i++) {
            if (this.editCountries[i].countryCode === cntry.countryCode) {
                this.editCountries.splice(i, 1);
                itemsRemoved = true;
                break;
            }
        }

        for (let i = 0; i < this.productEditor.SelectedProduct.countries.length; i++) {
            if (this.productEditor.SelectedProduct.countries[i] === cntry.countryCode) {
                this.productEditor.SelectedProduct.countries.splice(i, 1);
                break;
            }
        }

        if (itemsRemoved === true) {
            this.selectedCountriesRepeat.refresh(this.editCountries);
        }
        
        this.selectedCountryCode = '';
        this.countryRepeat.refresh(this.countries);
        
    }

    addPlatform() {
        const pForm: string = this.removeEscapeChars(this.platform.toString());
        this.platformContainer.add({
            name: pForm,
            ewSystems: new Array<EwSystem>()
        });
        this.platformRepeat.refresh(this.platforms);
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
    
    getDisplayNext(): string {
        const hidden: string = (this.displayNextElnots === true ? '' : 'hidden');
        return hidden;
    }
    
    getDisplayPrev(): string {
        const hidden: string = (this.displayPrevElnots === true ? '' : 'hidden');
        return hidden;
    }
    //  TODO: Display based on real logic
    displayEmitterFilter() {
        const hidden: string = (this.displayPrevElnots === true ? '' : 'hidden');
        return hidden;
    }
}

export { AddProductDialog };