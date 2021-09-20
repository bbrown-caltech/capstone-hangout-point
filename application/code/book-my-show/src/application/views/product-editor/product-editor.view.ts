import { DataTypeArgs } from '../../../framework/core/Application';
import { DateFormatProvider } from '../../../framework/providers/DateFormatProvider';
import { View } from '../../../framework/decorators/View';
import { UIBase } from '../../../framework/core/UIBase';
import { AsyncTask } from '../../../framework/core/AsyncTask';
import { ViewModel } from '../../../framework/core/ViewModel';
import { Menu, MenuItem, MenuAlignmentArgs, MenuItemCommandTypeArgs } from '../../../framework/UI/Menu';
import { RepeatingDataView } from '../../../framework/core/RepeatingDataView';
import { KeyValuePair, ResourceDictionary } from '../../../framework/core/ResourceDictionary';
import { DataViewFilter, DataViewFilterField } from '../../../framework/core/DataViewFilter';
import { Paginator } from '../../../framework/core/Paginator';
import { DataSorter } from '../../../framework/core/DataSorter';
import { CustomEvent } from '../../../framework/models/CustomEvent.Interface';

import { AuxDataService } from '../../services/aux-data.service';
import { EmitterService } from '../../services/emitter.service';
import { ProductEditorService } from '../../services/product-editor.service';
import { ProductReviewService } from '../../services/product-review.service';
import { EmitterSearchService } from '../../services/emitter-search.service';

import { LocalStorageDao, TableInfo } from '../../data/LocalStorageDao'

import { Country } from '../../models/aux-data/Country.Interface'
import { Platform } from '../../models/aux-data/Platform.Interface'
import { MilitaryService } from '../../models/aux-data/Service.Interface'

import { Emitter } from '../../models/emitters/Emitter.Interface';
import { EmitterHistory } from '../../models/emitters/EmitterHistory.Interface';
import { Product } from '../../models/product/Product.Interface';
import { ProductEmitter } from '../../models/product/ProductEmitter.Interface';
import { ProductReview } from '../../models/product/ProductReview.Interface';
import { IProductComments, IComment } from '../../models/product/ProductComments.Interface';
import { IProductFiles, IFile } from '../../models/product/ProductFiles.Interface';
import { PlatformControl, PlatformControlContainer } from '../../../application/models/product/Platform.Control';
import { ProgressControl } from '../../models/product/Progress.Control';
import { ProductPlatform } from '../../models/product/ProductPlatform.Interface';
import { EwSystem } from '../../models/product/EwSystem.Interface';

import { ProductEditor } from '../../controls/ProductEditor.Control';
import { AddFileDialog } from '../../dialogs/add-file/add-file.dialog';
import { AddElnotsDialog } from '../../dialogs/add-elnots/add-elnots.dialog';
import { AddProductDialog } from '../../dialogs/add-product/add-product.dialog';
import { ViewFileDialog } from '../../dialogs/view-file/view-file.dialog';
import { ImportProductDialog } from '../../dialogs/import-product/import-product.dialog';

import { appConfig } from '../../config';

interface ElnotApprovalHistory {
    elnot: string;
    reviewDate: string;
    dia: string;
    nsa: string;
}

interface SelectedProductEmitter {
    emitterId: number;
    name: string;
    function: string;
    platforms: string[];
    userCountries: string[];
    includeInProduct: boolean;
    excludeReason: string;
    owner: string;
    systemId: string;
    cedId: string;
    elnot: string;
    reviewDate: string;
    dia: string;
    nsa: string;
    displayIndex: number;
}

@View({
    selector: 'product-editor',
    BasePath: 'js/application/views/product-editor',
    template: 'product-editor.view.html',
    styles: 'product-editor.view.css'
})
class ProductEditorView extends ViewModel {
    private showFilter = false;
    private editingProduct = false;
    private showEmitterFilter = false;
    
    private storageDao: LocalStorageDao;
    private comments: IProductComments;
    private files: IProductFiles;
    
    private productId: number;
    private selectedProduct: Product;
    
    private containerWidth = 550;
    private productEditorControl: ProductEditor;
    
    private countries: Country[];
    private platforms: Platform[];
    private militaryBranches: MilitaryService[];
    
    private productEmitterRepeat: RepeatingDataView;
    private commentsRepeat: RepeatingDataView;
    private filesRepeat: RepeatingDataView;
    
    private productEmitterPaginator: Paginator;
    private filePaginator: Paginator;
    
    constructor(private auxService: AuxDataService,
                private reviewService: ProductReviewService,
                private productEditor: ProductEditorService,
                private emitterService: EmitterService,
                private searchService: EmitterSearchService) { super(); }
    
    preInit(): void {
        const self = this;
        
        this.storageDao = new LocalStorageDao('fist');
        this.storageDao.initDb();
        
        if (this.queryParams && this.queryParams.length > 0) {
            for (let i = 0; i < this.queryParams.length; i++) {
                if (this.queryParams[i].Key === 'productId') {
                    this.productId = parseInt(this.queryParams[i].Value);
                    break;
                }
            }
        }
        
        this.productEditor.getProductById(this.productId)
        .completed((result: Product) => {
            self.selectedProduct = result;
        }).exception((error: any) => {
           console.log('Pre-Init Error - Get Product: ', error); 
        });
        
        
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
        
    }
    
    postInit(): void {
        const self = this;
        
        setTimeout(() => {
            const productEditPanel: HTMLDivElement = document.getElementById('productEditPanel') as HTMLDivElement;
            
            while (productEditPanel.children.length > 0) {
                productEditPanel.removeChild(productEditPanel.children.item(0));
            }
            
            self.productEditorControl = new ProductEditor(self.containerWidth,
                                                          self.selectedProduct,
                                                          self.countries,
                                                          self.platforms,
                                                          self.militaryBranches,
                                                          self.productEditor);
            //
            self.productEditorControl.init();
            productEditPanel.appendChild(self.productEditorControl.container);
            
            
            self.commentsRepeat = new RepeatingDataView('commentsRepeat', {
                scope: self as UIBase,
                dataSet: [],
                transformFunctions: undefined,
                paginator: undefined,
                filter: undefined,
                sorter: undefined
            });
            
            
            self.filePaginator = new Paginator('filePaginator');
            self.filePaginator.setPageSize(5);
            self.filesRepeat = new RepeatingDataView('productFileList', {
                scope: self as UIBase,
                dataSet: [],
                transformFunctions: undefined,
                paginator: self.filePaginator,
                filter: undefined,
                sorter: undefined
            });
            
            
            
            const emitterTransforms: ResourceDictionary = new ResourceDictionary();
            emitterTransforms.add('userCountries', self.combinedArray);
            emitterTransforms.add('platforms', self.combinedArray);
            emitterTransforms.add('elnots', self.combinedArray);
            
            self.productEmitterPaginator = new Paginator('emitterPaginator');
            self.productEmitterPaginator.setPageSize(12);
            
            const emitterFilter: DataViewFilter = new DataViewFilter();
            
            emitterFilter.Add([
                { FieldName: 'name', InputControlID: 'emitterNameFilter', DataType: DataTypeArgs.String },
                { FieldName: 'function', InputControlID: 'functionFilter', DataType: DataTypeArgs.String },
                { FieldName: 'elnots', InputControlID: 'elnotsFilter', DataType: DataTypeArgs.String, transformer: self.combinedArray },
                { FieldName: 'platforms', InputControlID: 'platformsFilter', DataType: DataTypeArgs.String, transformer: self.combinedArray },
                { FieldName: 'userCountries', InputControlID: 'userCountriesFilter', DataType: DataTypeArgs.String, transformer: self.combinedArray }
            ])
            self.productEmitterRepeat = new RepeatingDataView('productEmitterRepeat', {
                scope: self as UIBase,
                dataSet: self.selectedProduct.emitters,
                transformFunctions: emitterTransforms,
                paginator: self.productEmitterPaginator,
                filter: emitterFilter,
                sorter: new DataSorter(['name', 'function', 'elnot', 'platforms', 'userCountries']) //, 'reviewDate', 'dia', 'nsa'])
            });
            
            self.getFiles(self.selectedProduct.productId);
            self.getComments(self.selectedProduct.productId);
            
        }, 200);
        
    }
    
    closeProductManager() {
        super.dispose();
        this.localDispose();
        const route: string = `/${appConfig.BasePath}${appConfig.BasePath !== '' ? '/' : ''}product`;
        history.pushState({selector: 'product'}, 'product', route);
    }
    
    private localDispose() {
        this.comments = undefined;
        this.files = undefined;
        this.selectedProduct = undefined;
        this.productEditorControl?.dispose();
        this.productEditorControl = undefined;
        this.countries = undefined;
        this.platforms = undefined;
        this.militaryBranches = undefined;
        this.productEmitterRepeat.dispose();
        this.productEmitterRepeat = undefined;
        this.commentsRepeat.dispose();
        this.commentsRepeat = undefined;
        this.filesRepeat.dispose();
        this.filesRepeat = undefined;
        this.productEmitterPaginator = undefined;
        this.filePaginator = undefined;
    }
    
    
    /**************************************************************************************************************
     *  PRODUCT FILE METHODS
     **************************************************************************************************************/
     addFileToProduct() {
        const self = this;
        let dialog: AddFileDialog = new AddFileDialog();
        
        dialog.open()
        .completed((result: any) => {
            if (result) {
                const key: IDBValidKey = self.productEditor.SelectedProduct.productId;
                self.files.files.push(result);
                self.storageDao.save<IProductFiles>('files', self.files, key).completed((result: IDBValidKey) => {
                    self.filePaginator.setData(self.files.files);
                }).exception((error: any) => {
                    console.log('Add File Error: ', error); 
                });
            }
        })
        .cancelled((result: any) => {
            
        });
        
     }
     
     viewFile(selectedFile: IFile) {
        console.log('Viewing File: ', selectedFile);
         
        const dialog: ViewFileDialog = new ViewFileDialog(selectedFile);
         
        dialog.open()
        .cancelled((result: any) => {
            
        });
        
     }
    
     private getFiles(productId: number) {
         const self = this;
         
         if (self.storageDao.ready === true) {
             const key: IDBValidKey = productId;
             self.storageDao.getOne<IProductFiles>('files', key).completed((result: IProductFiles) => {
                 console.log('Get Files: ', result);
                 
                 if (result) {
                     self.files = result;
                 }
                 else {
                     this.files = {
                         productId: productId,
                         files: new Array<IFile>()
                     };
                 }
                 
                 self.filesRepeat.refresh(self.files.files);
             }).exception((error: any) => {
                 console.log('Get Files Error: ', error); 
             });
         }
         
     }
    
    
    /**************************************************************************************************************
     *  PRODUCT COMMENT METHODS
     **************************************************************************************************************/
    showAddComment() {
        const textInput: HTMLTextAreaElement = document.getElementById('comments') as HTMLTextAreaElement;
        const savePanel: HTMLDivElement = document.getElementById('saveCommentPanel') as HTMLDivElement;
        const addButton: HTMLButtonElement = document.getElementById('btnAddComment') as HTMLButtonElement;
        
        if (addButton.innerHTML === '+') {
            addButton.innerHTML = '-';
            textInput.style.display = '';
            savePanel.style.display = '';
        } else {
            addButton.innerHTML = '+';
            textInput.style.display = 'none';
            savePanel.style.display = 'none';
        }
        
        textInput.focus();
    }
    
    saveComment() {
        const self = this;
        
        const textInput: HTMLTextAreaElement = document.getElementById('comments') as HTMLTextAreaElement;
        const savePanel: HTMLDivElement = document.getElementById('saveCommentPanel') as HTMLDivElement;
 
        self.productEditor.saveComment(self.productId, textInput.value)
           .completed((result: IComment) => {
            self.comments.comments.push (result);
            self.commentsRepeat.refresh(self.comments.comments);
        }).exception((error: any) => {
            console.log('Save Comment Error: ', error); 
        });
    }
    
    closeComments() {
        const self = this;
        const textInput: HTMLTextAreaElement = document.getElementById('comments') as HTMLTextAreaElement;
        const savePanel: HTMLDivElement = document.getElementById('saveCommentPanel') as HTMLDivElement;
        const addButton: HTMLButtonElement = document.getElementById('btnAddComment') as HTMLButtonElement;
        
        addButton.innerHTML = '+';
        textInput.style.display = 'none';
        savePanel.style.display = 'none';
        
    }
    
    private getComments(productId: number) {
        const self = this;
        
        self.productEditor.getCommentsForProductId(productId)
           .completed((result: IComment[]) => {
            self.comments = {
                productId: productId,
                comments: result
            };
            self.commentsRepeat.refresh(self.comments.comments);
        }).exception((error: any) => {
            console.log('Get Comment Error: ', error); 
        });
    }
    
    
    /**************************************************************************************************************
     *  EDIT PRODUCT METHODS
     **************************************************************************************************************/
    saveProduct() {
        const self = this;
        
        this.productEditorControl.save().completed((product: Product) => {
            
        });
        
    }

    
    /**************************************************************************************************************
     *  PRODUCT EMITTER METHODS
     **************************************************************************************************************/
    addEmittersToProduct() {
        const route: string = `/${appConfig.BasePath}${appConfig.BasePath !== '' ? '/' : ''}elnot-selector?productId=${this.selectedProduct.productId}&origin=editor`
        
        super.dispose();
        this.localDispose();
        
        history.pushState({selector: 'elnot-selector'}, 'elnot-selector', route);
        
    }
    
    
    /**************************************************************************************************************
     *  MISC HELPER METHODS
     **************************************************************************************************************/
    sort(args: any[]) {
        const fieldName: string = args[0];
        const sortArgs: ResourceDictionary = new ResourceDictionary();
        sortArgs.add('ProductID', undefined);
        sortArgs.add('Service', undefined);
        sortArgs.add('Countries', this.displayCountries);
        sortArgs.add('ProductType', this.getProduct);
        sortArgs.add('CaseNumber', undefined);
        sortArgs.add('StatusCode', this.getStatus);
        sortArgs.add('Emitters', this.emitterLength)
        this.productEmitterRepeat.sort(fieldName, sortArgs.get(fieldName));
    }
    
    showHideFilter() {
        // console.log('Product Filter', this.showFilter);
        this.showFilter = (this.showFilter !== true && this.editingProduct !== true);
        // console.log('Product Filter', this.showFilter);
    }
    
    getShowProductEditor(): string {
        return (this.editingProduct ? '' : 'hidden');
    }
    
    disableEdit(p: Product): string {
        if (!p) { return ''; }
        return (p.statusCode === 'DLV' ? 'disabled' : '');
    }
    
    displayFilter(): string {
        const hidden: string = (this.showFilter ? '' : 'hidden');
        // console.log('Display Filter', hidden);
        return hidden;
    }
    
    
    emitterSort(args: any[]) {
        const fieldName: string = args[0];
        const sortArgs: ResourceDictionary = new ResourceDictionary();
        sortArgs.add('name', undefined);
        sortArgs.add('function', undefined);
        sortArgs.add('elnots', this.combinedArray);
        sortArgs.add('platforms', this.combinedArray);
        sortArgs.add('userCountries', this.combinedArray);
        this.productEmitterRepeat.sort(fieldName, sortArgs.get(fieldName));
    }
    
    showHideEmitterFilter() {
        this.showEmitterFilter = (this.showEmitterFilter !== true);
    }
    
    displayEmitterFilter() {
        const hidden: string = (this.showEmitterFilter ? '' : 'hidden');
        return hidden;
    }
    
    disableAddEmitter(): string {
        if (this.selectedProduct.productId === 0) { return 'disabled'; }
        return (this.selectedProduct.statusCode === 'DLV' ? 'disabled' : '');
    }
    
    /**************************************************************************************************************
     *  DATA TRANSFORMATION METHODS
     **************************************************************************************************************/
    emitterLength(emitters: ProductEmitter[]): string {
        return emitters.length.toString();
    }

    normalizedDate(date: string): string {
        return DateFormatProvider.toSpecialDateString(new Date(date));
    }

    getStatus(statusCode: string): string {
        switch (statusCode) {
            case 'DLV':
                return 'Delivered';
            case 'SMT':
                return 'Submitted';
            case 'PRT':
                return 'PRE TCM';
            case 'FMT':
                return 'Fulfillment';
            case 'POT':
                return 'POST TCM';
            default:
                return 'Open';
        }
    }

    getProduct(product: string): string {
        switch (product.toLowerCase()) {
            case 'indirect':
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

export { ProductEditorView };
