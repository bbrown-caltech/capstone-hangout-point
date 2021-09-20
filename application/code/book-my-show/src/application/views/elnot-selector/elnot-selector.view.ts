import { DataTypeArgs } from '../../../framework/core/Application';
import { DateFormatProvider } from '../../../framework/providers/DateFormatProvider';
import { View } from '../../../framework/decorators/View';
import { UIBase } from '../../../framework/core/UIBase';
import { ViewModel } from '../../../framework/core/ViewModel';
import { RepeatingDataView } from '../../../framework/core/RepeatingDataView';
import { ResourceDictionary } from '../../../framework/core/ResourceDictionary';
import { DataViewFilter } from '../../../framework/core/DataViewFilter';
import { Paginator } from '../../../framework/core/Paginator';
import { DataSorter } from '../../../framework/core/DataSorter';

import { EmitterService } from '../../services/emitter.service';
import { EmitterSearchService } from '../../services/emitter-search.service';
import { ProductReviewService } from '../../services/product-review.service';
import { ProductEditorService } from '../../services/product-editor.service';

import { EmitterSearchParameter } from '../../models/emitters/EmitterSearchParameter.Interface';

import { Emitter } from '../../models/emitters/Emitter.Interface';
import { EmitterHistory } from '../../models/emitters/EmitterHistory.Interface';
import { ElnotApprovalHistory, ElnotRecentHistory, HistoryCondenser } from '../../models/emitters/EmitterSearchResult.Interface';

import { SelectedElnot } from '../../models/misc/SelectedElnot.Interface';

import { Product } from '../../models/product/Product.Interface';
import { ProductEmitter } from '../../models/product/ProductEmitter.Interface';

import { ProgressControl } from '../../models/product/Progress.Control';

import { UserPromptDialog } from '../../dialogs/user-prompt/user-prompt.dialog';
import { appConfig } from '../../config';

class SelectedProductEmitter {
    emitterId: number;
    name: string;
    function: string;
    elnot: string;
    platforms: string[];
    userCountries: string[];
    includeInProduct: boolean;
    excludeReason: string;
    owner: string;
    systemId: string;
    cedId: string;
    source: string;
    displayIndex: number;
    
    constructor() {
    }
    
    toProductEmitter(): ProductEmitter {
        return {
            name: this.name,
            function: this.function,
            elnot: this.elnot,
            platforms: this.platforms,
            userCountries: this.userCountries,
            includeInProduct: this.includeInProduct,
            excludeReason: this.excludeReason,
            owner: this.owner,
            systemId: this.systemId,
            cedId: this.cedId
        };
    }
    
}

@View({
    selector: 'elnot-selector',
    BasePath: 'js/application/views/elnot-selector',
    template: 'elnot-selector.view.html',
    styles: 'elnot-selector.view.css'
})
class ElnotSelectorView extends ViewModel {
    TotalSelected: number = 0;
    ElnotSelectionMessage: string = '';
    
    private nullAvailable: SelectedElnot[];
    
    private userPrompted = false;
    private showFilter = false;
    
    private origin: string;
    private productId: number;
    private selectedProduct: Product;
    
    private recentHistory: ElnotRecentHistory[];
    private emitterHistory: EmitterHistory[];
    
    private progress: ProgressControl;
    private progressPanel: HTMLDivElement;
    
    private productEmitterRepeat: RepeatingDataView;
    private emitterHistoryRepeat: RepeatingDataView;
    private elnotRepeat: RepeatingDataView;
    private elnotPaginator: Paginator;
    private productEmitterPaginator: Paginator;
    
    
    private emitters: Emitter[];
    private availableEmitters: SelectedElnot[];
    private selectedEmitters: SelectedElnot[];
    private selectedElnot: SelectedElnot;
    
    private ndpEmitterList: string[];
    private aorEmitterList: string[];
    private historicalEmitterList: string[];
    private allOthersEmitterList: string[];
    private productElnots: string[];
    
    private approvalHistory: ElnotApprovalHistory[];
    private productEmitters: SelectedProductEmitter[];
    
    private displayEmitters = [];
    private displayIndex = -1;
    private postInitComplete: boolean = false;
    private elnotListBuilt: boolean = false;
    
    constructor(private reviewService: ProductReviewService,
                private productEditor: ProductEditorService,
                private emitterService: EmitterService,
                private searchService: EmitterSearchService) { super(); }
    
    preInit(): void {
        const self = this;
        
        //  Initialize Class Emitter Objects
        this.availableEmitters = new Array<SelectedElnot>();
        this.selectedEmitters = new Array<SelectedElnot>();
        this.approvalHistory = new Array<ElnotApprovalHistory>();
        this.productEmitters = new Array<SelectedProductEmitter>();
        this.ndpEmitterList =  new Array<string>();
        this.aorEmitterList =  new Array<string>();
        this.historicalEmitterList =  new Array<string>();
        this.allOthersEmitterList =  new Array<string>();
        this.recentHistory = new Array<ElnotRecentHistory>();
        
        this.origin = '';
        
        //  Declare & Initialize Emitter Search Parameter Objects 
        let searchDate: Date = new Date();
        searchDate.setDate(searchDate.getDate()-appConfig.totalPolicyDays);
        
        const ndpSearchParam: Partial<EmitterSearchParameter> = {
            onlyApprovedByPolicy: true,
            deliverToCountries: []
        };
        const aorSearchParam: Partial<EmitterSearchParameter> = {
            onlyInAOR: true,
            deliverToCountries: []
        };
        const historicalSearchParam: Partial<EmitterSearchParameter> = {
            onlyApprovedSince: DateFormatProvider.toString(searchDate, 'YYYY-MM-DD'),
            includeProductHistory: true,
            deliverToCountries: []
        };
        const otherSearchParam: Partial<EmitterSearchParameter> = {
            deliverToCountries: []
        };
        
        if (this.queryParams && this.queryParams.length > 0) {
            for (let i = 0; i < this.queryParams.length; i++) {
                if (this.queryParams[i].Key === 'productId') {
                    this.productId = parseInt(this.queryParams[i].Value);
                }
                if (this.queryParams[i].Key === 'origin') {
                    this.origin = this.queryParams[i].Value;
                }
            }
        }
        
        //  Get the Product for the Passed productId Value
        this.productEditor.getProductById(this.productId)
        .completed((result: Product) => {
            self.selectedProduct = result;
            for (const c of self.selectedProduct.countries) {
                ndpSearchParam.deliverToCountries.push(c);
                aorSearchParam.deliverToCountries.push(c);
                historicalSearchParam.deliverToCountries.push(c);
                otherSearchParam.deliverToCountries.push(c);
            }
            
            //  Get NDP Emitters
            this.searchService.getSearchEmitters(ndpSearchParam)
            .completed((result: EmitterHistory[]) => {
                
                if (result) {
                    for (const elnot of result) {
                        self.ndpEmitterList.push(elnot.elnot);
                    }
                }
            }).exception((error: any) => {
                console.log('Get NDP Emitters Error: ', error); 
            });
            
            //  Get AOR Emitters
            this.searchService.getSearchEmitters(aorSearchParam)
            .completed((result: EmitterHistory[]) => {
                
                if (result) {
                    for (const elnot of result) {
                        self.aorEmitterList.push(elnot.elnot);
                    }
                }
            }).exception((error: any) => {
                console.log('Get AOR Emitters Error: ', error); 
            });
            
            //  Get History for All Emitters
            this.searchService.getSearchEmitters(historicalSearchParam)
            .completed((result: EmitterHistory[]) => {
                console.log('Get Historical Data: ', result);
                self.emitterHistory = result;
                self.recentHistory = HistoryCondenser.condense(self.emitterHistory);
                if (result) {
                    for (const elnot of result) {
                        let foundInProduct: boolean = false;
                        for (const p of (elnot as EmitterHistory).products) {
                            if (p.elnotInProduct === true) {
                                foundInProduct = true;
                                break;
                            }
                        }
                        if (foundInProduct === true) {
                            self.historicalEmitterList.push(elnot.elnot);
                        }
                    }
                }
            }).exception((error: any) => {
                console.log('Get Historical Emitters Error: ', error); 
            });
            
            //  Get All Other Emitters
            this.searchService.getSearchEmitters(otherSearchParam)
            .completed((result: EmitterHistory[]) => {
                
                if (result) {
                    for (const elnot of result) {
                        self.allOthersEmitterList.push(elnot.elnot);
                    }
                }
            }).exception((error: any) => {
                console.log('Get All Other Emitters Error: ', error); 
            });
            
            
            //  Add Event Listener to Signal When to Initialize the Progress Meter
            window.addEventListener('elnotdisplaybuilt', self.initializeProgressMeter);
            
            setTimeout(() => {
                //  This Method will Build the Display Array and Signal to Initialize the Progress Meter
                self.buildElnotDisplay();
            }, 500);
            
        }).exception((error: any) => {
           console.log('Pre-Init Error - Get Product: ', error); 
        });
        
        //  Get All Emitters
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
    
    postInit(): void {
        const self = this;
        
        setTimeout(() => {
            const emitterTransforms: ResourceDictionary = new ResourceDictionary();
            emitterTransforms.add('userCountries', self.combinedArray);
            emitterTransforms.add('platforms', self.combinedArray);
            emitterTransforms.add('elnots', self.combinedArray);
            
            self.productEmitterPaginator = new Paginator('emitterPaginator');
            self.productEmitterPaginator.setPageSize(25);
            
            const emitterFilter: DataViewFilter = new DataViewFilter();
            
            emitterFilter.Add([
                { FieldName: 'name', InputControlID: 'emitterNameFilter', DataType: DataTypeArgs.String },
                { FieldName: 'function', InputControlID: 'functionFilter', DataType: DataTypeArgs.String },
                { FieldName: 'elnot', InputControlID: 'elnotsFilter', DataType: DataTypeArgs.String, transformer: self.combinedArray },
                { FieldName: 'platforms', InputControlID: 'platformsFilter', DataType: DataTypeArgs.String, transformer: self.combinedArray },
                { FieldName: 'userCountries', InputControlID: 'userCountriesFilter', DataType: DataTypeArgs.String, transformer: self.combinedArray },
                { FieldName: 'source', InputControlID: 'sourceFilter', DataType: DataTypeArgs.String }
            ])
            self.productEmitterRepeat = new RepeatingDataView('productEmitterRepeat', {
                scope: self as UIBase,
                dataSet: self.productEmitters,
                transformFunctions: emitterTransforms,
                paginator: self.productEmitterPaginator,
                filter: emitterFilter,
                sorter: new DataSorter(['name', 'function', 'elnot', 'platforms', 'userCountries', 'source'])
            });
            
            
            self.emitterHistoryRepeat = new RepeatingDataView('emitterHistoryRepeat', {
                scope: self as UIBase,
                dataSet: self.approvalHistory,
                transformFunctions: undefined,
                paginator: undefined,
                filter: undefined,
                sorter: undefined
            });
            
            const elnotFilter: DataViewFilter = new DataViewFilter();
            
            elnotFilter.Add([
                { FieldName: 'elnot', InputControlID: 'elnotFilter', DataType: DataTypeArgs.String }
            ]);
            self.elnotPaginator = new Paginator('elnotPaginator');
            self.elnotPaginator.setPageSize(154);
            self.elnotRepeat = new RepeatingDataView('elnotRepeat', {
                scope: self as UIBase,
                dataSet: [],
                transformFunctions: undefined,
                paginator: self.elnotPaginator,
                filter: elnotFilter,
                sorter: new DataSorter(['elnot'])
            });
            
            if (self.selectedProduct.emitters.length > 0) {
                self.userPrompted = true;
                
                for (let e = 0; e < self.selectedProduct.emitters.length; e++) {
                    const elnot: string = self.selectedProduct.emitters[e].elnot;
                    
                    for (let i = 0 ; i < self.displayEmitters.length; i++) {
                        for (let j = 0; j < self.displayEmitters[i].length; j++) {
                            const emitter: SelectedElnot = self.displayEmitters[i][j] as SelectedElnot;
                            
                            if (emitter.elnot === elnot) {
                                self.addElnotToProduct(emitter, i);
                            }
                            
                        }
                    }
                    
                }
                
            }
            
            self.postInitComplete = true;
            
            setTimeout(() => {
                const container: HTMLElement = document.getElementById('container') as HTMLElement;
                const totalCols: number = Math.floor(container.offsetWidth / 106);
                const totalRows: number = Math.floor(container.offsetHeight / 36);
                const pageSize: number = totalCols * totalRows;
                
                self.elnotPaginator.resize(pageSize);
                    
                window.addEventListener('resize', function(){
                    const container: HTMLElement = document.getElementById('container') as HTMLElement;
                    // const height: number = self.ModalBody.offsetHeight - 140;
                    // container.style.height = height + 'px';
                    
                    const totalCols: number = Math.floor(container.offsetWidth / 106);
                    const totalRows: number = Math.floor(container.offsetHeight / 36);
                    const pageSize: number = totalCols * totalRows;
                    
                    self.elnotPaginator.resize(pageSize);
                })

            }, 300);
            
        }, 200);
        
    }
    
    closeSelection() {
        let route: string = '';
        
        if (this.origin === 'editor') {
            route = `/${appConfig.BasePath}${appConfig.BasePath !== '' ? '/' : ''}product-editor?productId=${this.productId}`;
            history.pushState({selector: 'product-editor'}, 'product-editor', route);
        } else {
            route = `/${appConfig.BasePath}${appConfig.BasePath !== '' ? '/' : ''}product`
            history.pushState({selector: 'product'}, 'product', route);
        }
        
    }
    
    dispose() {
        super.dispose();
        this.progress.dispose();
        this.TotalSelected = 0;
        this.ElnotSelectionMessage = '';
        this.displayEmitters = [];
        this.displayIndex = -1;
        this.userPrompted = false;
        this.elnotListBuilt = false;
        this.postInitComplete = false;
    }
    
    /**************************************************************************************************************
     *  EDIT PRODUCT METHODS
     **************************************************************************************************************/    
    saveProduct() {
        const self = this;
        
        self.selectedProduct.emitters = new Array<ProductEmitter>();
        
        for (const emitter of self.productEmitters) {
            self.selectedProduct.emitters.push(emitter.toProductEmitter());
        }
        
        this.productEditor.saveProduct(self.selectedProduct).completed((product: Product) => {
            let route: string;
            
            self.progress.dispose();
            
            if (this.origin === 'editor') {
                route = `/${appConfig.BasePath}${appConfig.BasePath !== '' ? '/' : ''}product-editor?productId=${product.productId}`;
                history.pushState({selector: 'product-editor'}, 'product-editor', route);
            } else {
                route = `/${appConfig.BasePath}${appConfig.BasePath !== '' ? '/' : ''}product`;
                history.pushState({selector: 'product'}, 'product', route);
            }
            
        });

    }

    addElnot() {
        
        if (this.selectedElnot) {
            this.addElnotToProduct(this.selectedElnot, this.displayIndex);
            this.productEmitterPaginator.refresh(this.productEmitters);
            this.elnotPaginator.setData(this.displayEmitters[this.displayIndex]);
            this.selectedElnot = undefined;
        }
        
        const highlightedElnots = document.getElementsByClassName('elnot-selected');
            
        if (highlightedElnots) {
            for (let i = 0; i < highlightedElnots.length; i++) {
                highlightedElnots.item(i).classList.remove('elnot-selected');
            }
        }
        
        this.clearElnotInfo();
        
    }
    
    removeElnot(emitter: SelectedProductEmitter, ev: MouseEvent) {
        const performDelete: boolean = confirm('Are you sure you want to remove the selected ELNOT?');
        
        if (performDelete) {
            let elnot: SelectedElnot;
            
            for (const e of this.selectedEmitters) {
                if (e.emitterId === emitter.emitterId) {
                    elnot = e;
                    break;
                }
            }
            
            if (elnot) {
                
                for (let i = 0; i < this.productEmitters.length; i++) {
                    if (this.productEmitters[i].emitterId === emitter.emitterId) {
                        this.productEmitters.splice(i, 1);
                        break;
                    }
                }
                
                this.productEmitterPaginator.refresh(this.productEmitters);
            
                elnot.Selected = false;
                this.TotalSelected--;
                this.moveItem(elnot, this.selectedEmitters, this.displayEmitters[emitter.displayIndex]);
                this.elnotPaginator.setData(this.displayEmitters[this.displayIndex]);
                
            }
        }
        
        const highlightedElnots = document.getElementsByClassName('elnot-selected');
            
        if (highlightedElnots) {
            for (let i = 0; i < highlightedElnots.length; i++) {
                highlightedElnots.item(i).classList.remove('elnot-selected');
            }
        }
        
    }
    
    private buildElnotDisplay() {
        const self = this;
        const ndpEmitters: SelectedElnot[] = new Array<SelectedElnot>();
        const aorEmitters: SelectedElnot[] = new Array<SelectedElnot>();
        const historicEmitters: SelectedElnot[] = new Array<SelectedElnot>();
        const allOtherEmitters: SelectedElnot[] = new Array<SelectedElnot>();
        let cnt: number = 0;
        
        for (const emitter of self.availableEmitters) {
            const existsInNdp: boolean = self.ndpEmitterList.indexOf(emitter.elnot) > -1;
            const existsInAor: boolean = self.aorEmitterList.indexOf(emitter.elnot) > -1;
            const existsInHistory: boolean = self.historicalEmitterList.indexOf(emitter.elnot) > -1;
            
            if (existsInNdp === true) {
                ndpEmitters.push(emitter);
            }
            
            if (existsInAor === true && existsInNdp === false) {
                aorEmitters.push(emitter);
            }
            
            if (existsInHistory === true && existsInNdp === false && existsInAor === false) {
                historicEmitters.push(emitter);
            }
            
            if (existsInHistory === false && existsInNdp === false && existsInAor === false) {
                allOtherEmitters.push(emitter);
            }
            
        }
        
        self.displayEmitters.push(ndpEmitters);
        self.displayEmitters.push(aorEmitters);
        self.displayEmitters.push(historicEmitters);
        self.displayEmitters.push(allOtherEmitters);
        
        const evt: CustomEvent<ElnotSelectorView> = new CustomEvent<ElnotSelectorView>('elnotdisplaybuilt', {detail: self});
        window.dispatchEvent(evt);
        
        self.elnotListBuilt = true;
        
    }
    
    private initializeProgressMeter(evt: CustomEvent<ElnotSelectorView>) {
        const self: ElnotSelectorView = evt.detail as ElnotSelectorView;
        const intervalId: number = setInterval(() => {
            
            if (self.postInitComplete === true && self.elnotListBuilt === true) {
                clearInterval(intervalId);
                
                let sequenceId: number = 1;
                
                self.progressPanel = document.getElementById('progressMeterPanel') as HTMLDivElement;
                
                self.progress = new ProgressControl();
                
                if (self.displayEmitters[0].length > 0) {
                    self.progress.steps.push({name: 'Apply NDP', sequenceId: sequenceId++, completed: false, col: undefined, image: undefined});
                }
                
                if (self.displayEmitters[1].length > 0) {
                    self.progress.steps.push({name: 'Apply AOR', sequenceId: sequenceId++, completed: false, col: undefined, image: undefined});
                }
                
                if (self.displayEmitters[2].length > 0) {
                    self.progress.steps.push({name: 'Apply Historical', sequenceId: sequenceId++, completed: false, col: undefined, image: undefined});
                }
                
                if (self.displayEmitters[3].length > 0) {
                    self.progress.steps.push({name: 'Other', sequenceId: sequenceId++, completed: false, col: undefined, image: undefined});
                }
                
                self.progress.init(self.progressPanel);
                self.progress.previousButton.disabled = true;
                self.progress.previousButton.onclick = (ev: MouseEvent) => {
                    self.movePrevElnots();
                };
                self.progress.nextButton.onclick = (ev: MouseEvent) => {
                    self.moveNextElnots();
                };
                
                self.moveNextElnots();
            }
            
        }, 100);
        
        window.removeEventListener('elnotdisplaybuilt', self.initializeProgressMeter);
        
    }
    
    moveNextElnots() {
        const self = this;
        const displayMessage = ['Select ELNOT\'s by NDP Policy', 'Select ELNOT\'s by AOR', 'Select ELNOT\'s by Historic Approval', 'Select From All Other ELNOT\'s'];
        
        self.displayIndex++;
        while (self.displayIndex < self.displayEmitters.length && self.displayEmitters[self.displayIndex].length === 0) {
            self.displayIndex++;
        }
        
        self.progress.previousButton.disabled = (self.progress.steps.length === 1 || self.displayIndex === 0);
        
        //  NDP Policy
        if (self.displayIndex === 0) {
            
            if (self.userPrompted === false) {
                const dialog: UserPromptDialog = new UserPromptDialog('Select All NDP Policy ELNOTS?');
                
                dialog.open()
                .completed((result: any) => {
                    self.nullAvailable = new Array<SelectedElnot>();
                    
                    while(self.displayEmitters[self.displayIndex].length > 0) {
                        const elnot: SelectedElnot = self.displayEmitters[self.displayIndex][0] as SelectedElnot;
                        elnot.Selected = true;
                        self.addElnotToProduct(elnot, this.displayIndex);
                    }
                    
                    self.productEmitterPaginator.refresh(self.productEmitters);
                    self.elnotPaginator.setData(self.displayEmitters[self.displayIndex]);
                    self.moveNextElnots();
                    
                })
                .cancelled((result: any) => {
                    
                });
                
            }
            
            self.userPrompted = true;
            
            self.elnotRepeat.refresh(self.displayEmitters[self.displayIndex]);
            self.elnotPaginator.setData(self.displayEmitters[self.displayIndex]);
            self.ElnotSelectionMessage = displayMessage[self.displayIndex];
            
            const evt: CustomEvent<ProgressControl> = new CustomEvent<ProgressControl>('selectnext', {detail: this.progress});
            window.dispatchEvent(evt);
            
            if (self.displayEmitters[(self.displayIndex + 1)].length === 0 &&
                self.displayEmitters[(self.displayIndex + 2)].length === 0 &&
                self.displayEmitters[(self.displayIndex + 3)].length === 0) {
                self.progress.nextButton.disabled = true;
                return;
            }
            
            if (self.displayEmitters[(self.displayIndex + 1)].length === 0 &&
                self.displayEmitters[(self.displayIndex + 2)].length > 0) {
                self.displayIndex++;
            }
            
            if (self.displayEmitters[(self.displayIndex + 1)].length === 0 &&
                self.displayEmitters[(self.displayIndex + 2)].length === 0 &&
                self.displayEmitters[(self.displayIndex + 3)].length > 0) {
                self.displayIndex += 2;
            }
            
            self.progress.nextButton.disabled = false;
            
            return;
        }
        
        //  AOR Policy
        if (self.displayIndex === 1) {
            self.elnotRepeat.refresh(self.displayEmitters[self.displayIndex]);
            self.elnotPaginator.setData(self.displayEmitters[self.displayIndex]);
            self.ElnotSelectionMessage = displayMessage[self.displayIndex];
            
            const evt: CustomEvent<ProgressControl> = new CustomEvent<ProgressControl>('selectnext', {detail: this.progress});
            window.dispatchEvent(evt);
            
            if (self.displayEmitters[(self.displayIndex - 1)].length === 0) {
                self.progress.previousButton.disabled = true;
            }
            
            if (self.displayEmitters[self.displayIndex].length === 0 &&
                    self.displayEmitters[(self.displayIndex + 1)].length === 0 &&
                    self.displayEmitters[(self.displayIndex + 2)].length > 0) {
                self.displayIndex += 2;
            } else if (self.displayEmitters[(self.displayIndex + 1)].length === 0 &&
                    self.displayEmitters[(self.displayIndex + 2)].length === 0) {
                self.progress.nextButton.disabled = true;
                return;
            }
            
            self.progress.nextButton.disabled = false;
            
            return;
        }
        
        //  Historical Approval
        if (self.displayIndex === 2) {
            self.elnotRepeat.refresh(self.displayEmitters[self.displayIndex]);
            self.elnotPaginator.setData(self.displayEmitters[self.displayIndex]);
            self.ElnotSelectionMessage = displayMessage[self.displayIndex];
            
            const evt: CustomEvent<ProgressControl> = new CustomEvent<ProgressControl>('selectnext', {detail: this.progress});
            window.dispatchEvent(evt);
            
            if (self.displayEmitters[(self.displayIndex - 1)].length === 0 &&
                self.displayEmitters[(self.displayIndex - 2)].length === 0) {
                self.progress.previousButton.disabled = true;
            }
            
            if (self.displayEmitters[(self.displayIndex + 1)].length === 0) {
                self.progress.nextButton.disabled = true;
                return;
            }
            
            self.progress.nextButton.disabled = false;
            
            return;
        }
        
        //  Everything Else
        if (self.displayIndex === 3) {
            self.elnotRepeat.refresh(self.displayEmitters[self.displayIndex]);
            self.elnotPaginator.setData(self.displayEmitters[self.displayIndex]);
            self.ElnotSelectionMessage = displayMessage[self.displayIndex];
            self.progress.nextButton.disabled = true;
            
            const evt: CustomEvent<ProgressControl> = new CustomEvent<ProgressControl>('selectnext', {detail: this.progress});
            window.dispatchEvent(evt);
            
        }
        
    }
    
    movePrevElnots() {
        const self = this;
        const displayMessage = ['Select ELNOT\'s by NDP Policy', 'Select ELNOT\'s by AOR', 'Select ELNOT\'s by Historic Approval', 'Select From All Other ELNOT\'s'];
        
        self.displayIndex--;
        self.displayIndex = (self.displayIndex < 0 ? 0 : self.displayIndex);
        
        while (self.displayIndex > 0 && self.displayEmitters[self.displayIndex].length === 0) {
            self.displayIndex--;
        }
        
        self.progress.nextButton.disabled = self.progress.steps.length === 1;
        self.progress.previousButton.disabled = (self.progress.steps.length === 1 || self.displayIndex === 0);
        
        if (self.displayIndex === 2 && (
                self.displayEmitters[self.displayIndex - 1].length === 0 &&
                self.displayEmitters[self.displayIndex - 2].length === 0)) {
            self.progress.previousButton.disabled = true;
        }
        
        if (self.displayIndex === 1 && self.displayEmitters[self.displayIndex - 1].length === 0) {
            self.progress.previousButton.disabled = true;
        }
        
        self.elnotRepeat.refresh(self.displayEmitters[self.displayIndex]);
        self.elnotPaginator.setData(self.displayEmitters[self.displayIndex]);
        self.ElnotSelectionMessage = displayMessage[self.displayIndex];
        
        const evt: CustomEvent<ProgressControl> = new CustomEvent<ProgressControl>('selectprevious', {detail: self.progress});
        window.dispatchEvent(evt);
    }
    
    selectElnot(elnot: SelectedElnot, ev: MouseEvent) {
        const node: HTMLElement = ev.target as HTMLElement;
        const highlightedElnot: HTMLDivElement = document.getElementsByClassName('elnot-selected')[0] as HTMLDivElement;
        
        if (highlightedElnot) {
            highlightedElnot.classList.remove('elnot-selected');
        }
        
        if (this.selectedElnot) {
            this.selectedElnot.Selected = false;
        }
        
        if (ev.button === 0) {
            this.clearElnotInfo();
            this.selectedElnot = elnot;
            elnot.Selected = true;
            node.classList.add('elnot-selected');
            this.renderElnotInfo(elnot);
        }
        
        if (ev.button === 2) {
            ev.preventDefault();
            this.clearElnotInfo();
            elnot.Selected = true;
            this.selectedElnot = elnot;
            this.addElnot();
        }
        
        
    }
    
    setElnotClass(emitter: SelectedElnot, node: HTMLElement) {
        if (emitter.Selected) {
            node.classList.add('elnot-selected');
        }
    }
    
    private addElnotToProduct(selectedElnot: SelectedElnot, displayIndex: number) {
        
        if (selectedElnot) {
            const elnotSource: string[] = ['NDP Policy', 'AOR Policy', 'Historical Approval', '&nbsp;'];
            let emitter: Emitter;
            
            for (const e of this.emitters) {
                if (e.emitterId === selectedElnot.emitterId) {
                    emitter = e;
                    break;
                }
            }
            
            // productEmitters
            let elnot: SelectedProductEmitter = new SelectedProductEmitter();
            elnot.emitterId = selectedElnot.emitterId;
            elnot.name = selectedElnot.name;
            elnot.function = selectedElnot.function;
            elnot.platforms = emitter.platformTypes;
            elnot.userCountries = emitter.userCountryCodes;
            elnot.includeInProduct = true;
            elnot.excludeReason = '';
            elnot.owner = '';
            elnot.systemId = '';
            elnot.cedId = '';
            elnot.elnot = emitter.elnot;
            elnot.source = elnotSource[displayIndex];
            elnot.displayIndex = displayIndex;
            
            this.productEmitters.push(elnot);
            
            this.TotalSelected++
            this.moveItem(selectedElnot, this.displayEmitters[displayIndex], this.selectedEmitters);
        }
        else {
            this.nullAvailable.push(selectedElnot);
        }
        
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
        // return;
        
        let emitter: Emitter = undefined;
            
        for (const e of this.emitters) {
            if (e.emitterId === elnot.emitterId) {
                emitter = e;
                break;
            }
        }
        
        if (emitter) {
            this.displayElnotInfo(emitter);
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
        const ewirdbSystems: HTMLSelectElement = document.getElementById('ewirdbSystems') as HTMLSelectElement;
        
        while (this.approvalHistory.length > 0) {
            this.approvalHistory.splice(0, 1);
        }
        
        for (const h of this.emitterHistory) {
            if (h.elnot === emitter.elnot) {
                this.approvalHistory = HistoryCondenser.denormalizedHistory(h);
            }
        }
        
        this.emitterHistoryRepeat.refresh(this.approvalHistory);
        
        if (elnotName && elnotFunction && cedUpdateDate &&
            elnotStatus && primaryPlatformType) {
            elnotName.value = emitter.name;
            elnotFunction.value = emitter.function;
            cedUpdateDate.value = emitter.cedUpdateDate;
            elnotStatus.value = emitter.status;
            primaryPlatformType.value = emitter.primaryPlatformType;
        } else {
            console.log('Cannot display elnot information...');
        }
        
        this.setSelectOptions(originCountryCodes, emitter.originCountryCodes);
        this.setSelectOptions(userCountryCodes, emitter.userCountryCodes);
        this.setSelectOptions(platformTypes, emitter.platformTypes);
        this.setSelectOptions(secondaryNames, emitter.secondaryNames);
        
        const ewirdbSystemIds: string[] = []
        for (const system of emitter.ewirdbSystems) {
            ewirdbSystemIds.push(system.systemId + " (" + system.lastModifiedDate + ")");
        }
        this.setSelectOptions(ewirdbSystems, ewirdbSystemIds);
        
    }
    
    private clearElnotInfo() {
        const elnotName: HTMLInputElement = document.getElementById('elnotName') as HTMLInputElement;
        const elnotFunction: HTMLInputElement = document.getElementById('elnotFunction') as HTMLInputElement;
        const cedUpdateDate: HTMLInputElement = document.getElementById('cedUpdateDate') as HTMLInputElement;
        const elnotStatus: HTMLInputElement = document.getElementById('elnotStatus') as HTMLInputElement;
        const primaryPlatformType: HTMLInputElement = document.getElementById('primaryPlatformType') as HTMLInputElement;
        const originCountryCodes: HTMLSelectElement = document.getElementById('originCountryCodes') as HTMLSelectElement;
        const userCountryCodes: HTMLSelectElement = document.getElementById('userCountryCodes') as HTMLSelectElement;
        const platformTypes: HTMLSelectElement = document.getElementById('platformTypes') as HTMLSelectElement;
        const secondaryNames: HTMLSelectElement = document.getElementById('secondaryNames') as HTMLSelectElement;
        const ewirdbSystems: HTMLSelectElement = document.getElementById('ewirdbSystems') as HTMLSelectElement;
        
        while (this.approvalHistory.length > 0) {
            this.approvalHistory.splice(0, 1);
        }
        
        this.emitterHistoryRepeat.refresh(this.approvalHistory);
        
        if (elnotName && elnotFunction && cedUpdateDate &&
            elnotStatus && primaryPlatformType) {
            elnotName.value = '';
            elnotFunction.value = '';
            cedUpdateDate.value = '';
            elnotStatus.value = '';
            primaryPlatformType.value = '';
        }
        
        this.setSelectOptions(originCountryCodes, []);
        this.setSelectOptions(userCountryCodes, []);
        this.setSelectOptions(platformTypes, []);
        this.setSelectOptions(secondaryNames, []);
        this.setSelectOptions(ewirdbSystems, []);
        
    }
    
    private setSelectOptions(select: HTMLSelectElement, options: string[]) {
        if (!select) { return; }
        
        while (select.options.length > 0) {
            select.removeChild(select.options[0]);
        }
        
        for (let option of options) {
            const opt: HTMLOptionElement = document.createElement('option');
            opt.value = option;
            opt.text = option;
            select.options.add(opt);
        }
        
    }
    
    
    /**************************************************************************************************************
     *  MISC HELPER METHODS
     **************************************************************************************************************/
    sort(args: any[]) {
        const fieldName: string = args[0];
        const sortArgs: ResourceDictionary = new ResourceDictionary();
        sortArgs.add('productId', undefined);
        sortArgs.add('service', undefined);
        sortArgs.add('countries', this.displayCountries);
        sortArgs.add('productType', this.getProduct);
        sortArgs.add('caseNumber', undefined);
        sortArgs.add('emitters', this.emitterLength)
        this.productEmitterRepeat.sort(fieldName, sortArgs.get(fieldName));
    }
    
    showHideFilter() {
        // console.log('Product Filter', this.showFilter);
        this.showFilter = (this.showFilter !== true && this.origin === '');
        // console.log('Product Filter', this.showFilter);
    }
    
    // getShowProductEditor(): string {
    //     return (this.editingProduct ? '' : 'hidden');
    // }
    
    disableEdit(p: Product): string {
        if (!p) { return ''; }
        return (p.statusCode === 'DLV' ? 'disabled' : '');
    }
    
    displayFilter(): string {
        const hidden: string = (this.showFilter ? '' : 'hidden');
        // console.log('Display Filter', hidden);
        return hidden;
    }
    
    displayEmitterFilter(): string {
        const hidden: string = (this.showFilter === true ? '' : 'hidden');
        return hidden;
    }
    
    
    /**************************************************************************************************************
     *  DATA TRANSFORMATION METHODS
     **************************************************************************************************************/
    emitterLength(emitters: ProductEmitter[]): string {
        return emitters.length.toString();
    }

    normalizedDate(date: string): string {
        return DateFormatProvider.toShortDateString(new Date(date));
    }

    getProduct(product: string): string {
        switch (product.toLowerCase()) {
            case 'i':
                return 'Indirect';
            default:
                return 'Direct';
        }
    }

    displayCountries(countries: string[]): string {
        let value = '';

        if (countries === undefined || countries === null) { return ''; }

        for (let i = 0; i < countries.length; i++) {
        value += (i === 0 ? countries[i] : ', ' + countries[i]);
        }

        return value;

    }

    combinedArray(array: string[]): string {
        let value = '';
        if (array !== undefined && array !== null) {
          for (let i = 0; i < array.length; i++) {
            value += (i === 0 ? array[i] : ', ' + array[i]);
          }
        }
        return value;
    }
    
}

export { ElnotSelectorView };
