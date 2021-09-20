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

import { Product } from '../../models/product/Product.Interface';
import { ProductEmitter } from '../../models/product/ProductEmitter.Interface';
import { ProductReview } from '../../models/product/ProductReview.Interface';
import { IProductComments, IComment } from '../../models/product/ProductComments.Interface';
import { IProductFiles, IFile } from '../../models/product/ProductFiles.Interface';
import { PlatformControl, PlatformControlContainer } from '../../../application/models/product/Platform.Control';
import { ProgressControl } from '../../models/product/Progress.Control';
import { ProductPlatform } from '../../models/product/ProductPlatform.Interface';
import { EwSystem } from '../../models/product/EwSystem.Interface';

import { AddElnotsDialog } from '../../dialogs/add-elnots/add-elnots.dialog';
import { AddFileDialog } from '../../dialogs/add-file/add-file.dialog';
import { AddProductDialog } from '../../dialogs/add-product/add-product.dialog';
import { ImportProductDialog } from '../../dialogs/import-product/import-product.dialog';
import { ViewFileDialog } from '../../dialogs/view-file/view-file.dialog';
import { appConfig } from '../../config';

@View({
    selector: 'product',
    BasePath: 'js/application/views/product',
    template: 'product.view.html',
    styles: 'product.view.css'
})
class ProductView extends ViewModel {
    private showFilter = false;
    private editingProduct = false;
    private showEmitterFilter = false;
    
    private storageDao: LocalStorageDao;
    private comments: IProductComments;
    private files: IProductFiles;
    
    private products: Product[];
    private emitters: ProductEmitter[];
    private progress: ProgressControl;
    
    private selectedCountryCode: string;
    private editCountries: Country[];
    private countries: Country[];
    private platforms: Platform[];
    private militaryBranches: MilitaryService[];
    
    selectedPlatforms = '';
    platform = '';
    
    private productRepeater: RepeatingDataView;
    private productEmitterList: RepeatingDataView;
    private platformRepeat: RepeatingDataView;
    private serviceRepeat: RepeatingDataView;
    private countryRepeat: RepeatingDataView;
    private selectedCountriesRepeat: RepeatingDataView;
    private commentsRepeat: RepeatingDataView;
    private filesRepeat: RepeatingDataView;
    
    private productPaginator: Paginator;
    private emitterPaginator: Paginator;
    private filePaginator: Paginator;
    
    private platformContainer: PlatformControlContainer;
    
    constructor(private auxService: AuxDataService,
                private productEditor: ProductEditorService,
                private reviewService: ProductReviewService) { super(); }
    
    preInit(): void {
        const self = this;
        
        this.storageDao = new LocalStorageDao('fist');
        this.storageDao.Tables.push({ TableName: 'files', PrimaryFieldName: 'productId', PrimaryIndexName: 'files_productId_Index'});
        this.storageDao.initDb();
        
        this.editCountries = new Array<Country>();
        this.emitters = new Array<ProductEmitter>();
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
        this.productEditor.getProducts()
        .completed((result: Product[]) => {
            self.products = result;
        }).exception((error: any) => {
           console.log('Dashboard Pre-Init: Get Products', error); 
        });
        
    }
    
    postInit(): void {
        const self = this;
        
        setTimeout(() => {
            const productsGridPanel: HTMLDivElement = document.getElementById("productsGridPanel") as HTMLDivElement;
            const productCommentsPanel: HTMLDivElement = document.getElementById("productCommentsPanel") as HTMLDivElement;
            
            productsGridPanel.style.width = 'calc(100% - 15px)';
            productCommentsPanel.style.width = 'calc(30% - 18px)';
            productCommentsPanel.style.display = 'none';
            
            // console.log('Product Post-Init', self.countries);
            const transforms: ResourceDictionary = new ResourceDictionary();
            transforms.add('countries', self.displayCountries);
            transforms.add('requestDate', self.normalizedDate);
            transforms.add('productType', self.getProduct);
            transforms.add('statusCode', self.getStatus);
            transforms.add('emitters', self.emitterLength);
            
            self.productPaginator = new Paginator('paginator');
            self.productPaginator.setPageSize(20);
            
            const filter: DataViewFilter = new DataViewFilter();
            
            filter.Add([
                { FieldName: 'productId', InputControlID: 'productIdFilter', DataType: DataTypeArgs.String },
                { FieldName: 'service', InputControlID: 'serviceFilter', DataType: DataTypeArgs.String },
                { FieldName: 'countries', InputControlID: 'countriesFilter', DataType: DataTypeArgs.String, transformer: self.displayCountries },
                { FieldName: 'productType', InputControlID: 'productTypeFilter', DataType: DataTypeArgs.String, transformer: self.getProduct },
                { FieldName: 'caseNumber', InputControlID: 'caseNoFilter', DataType: DataTypeArgs.String },
                { FieldName: 'statusCode', InputControlID: 'statusFilter', DataType: DataTypeArgs.String, transformer: self.getStatus },
                { FieldName: 'emitters', InputControlID: 'emittersFilter', DataType: DataTypeArgs.Int, transformer: self.emitterLength }
            ])
            self.productRepeater = new RepeatingDataView('productList', {
                scope: self as UIBase,
                dataSet: self.products,
                transformFunctions: transforms,
                paginator: self.productPaginator,
                filter: filter,
                sorter: new DataSorter(['productId', 'service', 'countries', 'productType', 'caseNumber', 'statusCode', 'emitters'])
            });
            
            // const emitterTransforms: ResourceDictionary = new ResourceDictionary();
            // emitterTransforms.add('userCountries', self.combinedArray);
            // emitterTransforms.add('platforms', self.combinedArray);
            // emitterTransforms.add('elnots', self.combinedArray);
            
            // self.emitterPaginator = new Paginator('emitterPaginator');
            // self.emitterPaginator.setPageSize(5);
            
            // const emitterFilter: DataViewFilter = new DataViewFilter();
            
            // emitterFilter.Add([
            //     { FieldName: 'name', InputControlID: 'emitterNameFilter', DataType: DataTypeArgs.String },
            //     { FieldName: 'function', InputControlID: 'functionFilter', DataType: DataTypeArgs.String },
            //     { FieldName: 'elnots', InputControlID: 'elnotsFilter', DataType: DataTypeArgs.String, transformer: self.combinedArray },
            //     { FieldName: 'platforms', InputControlID: 'platformsFilter', DataType: DataTypeArgs.String, transformer: self.combinedArray },
            //     { FieldName: 'userCountries', InputControlID: 'userCountriesFilter', DataType: DataTypeArgs.String, transformer: self.combinedArray }
            // ])
            // self.productEmitterList = new RepeatingDataView('productEmitterList', {
            //     scope: self as UIBase,
            //     dataSet: self.emitters,
            //     transformFunctions: emitterTransforms,
            //     paginator: self.emitterPaginator,
            //     filter: emitterFilter,
            //     sorter: new DataSorter(['name', 'function', 'elnots', 'platforms', 'userCountries'])
            // });
            
            
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
            
            // self.serviceRepeat = new RepeatingDataView('serviceRepeat', {
            //     scope: self as UIBase,
            //     dataSet: self.militaryBranches,
            //     transformFunctions: undefined,
            //     paginator: undefined,
            //     filter: undefined,
            //     sorter: undefined
            // });
            // self.countryRepeat = new RepeatingDataView('countryRepeat', {
            //     scope: self as UIBase,
            //     dataSet: self.countries,
            //     transformFunctions: undefined,
            //     paginator: undefined,
            //     filter: undefined,
            //     sorter: undefined
            // });
            // self.selectedCountriesRepeat = new RepeatingDataView('selectedCountriesRepeat', {
            //     scope: self as UIBase,
            //     dataSet: self.editCountries,
            //     transformFunctions: undefined,
            //     paginator: undefined,
            //     filter: undefined,
            //     sorter: undefined
            // });
            
            // self.platformRepeat = new RepeatingDataView('platformRepeat', {
            //     scope: self as UIBase,
            //     dataSet: self.platforms
            // });
            
        }, 200);
        
    }
    
    dispose() {
        super.dispose();
        this.productRepeater?.dispose();
        this.productEmitterList?.dispose();
        this.platformRepeat?.dispose();
        this.serviceRepeat?.dispose();
        this.countryRepeat?.dispose();
        this.selectedCountriesRepeat?.dispose();
        this.commentsRepeat?.dispose();
        this.filesRepeat?.dispose();
    }
    
    /**************************************************************************************************************
     *  ADD PRODUCT METHODS
     **************************************************************************************************************/
    addProductsMenu() {
        const btn: HTMLButtonElement = document.getElementById('btnAddProducts') as HTMLButtonElement;
        const menu: Menu = new Menu([
            {
                Scope: this,
                CommandType: MenuItemCommandTypeArgs.Method,
                Command: 'addProduct',
                MenuIcon: '<i class="far fa-plus-square"></i>',
                LabelText: 'Add Product',
                ApplySeparator: false,
                Arguments: []
            },
            {
                Scope: this,
                CommandType: MenuItemCommandTypeArgs.Method,
                Command: 'importProduct',
                MenuIcon: '<i class="fas fa-file-import"></i>',
                LabelText: 'Import Product',
                ApplySeparator: false,
                Arguments: []
            }
        ]);
        Menu.showMenu(btn, menu);
    }
    
    addProduct() {
        const self = this;
        let dialog: AddProductDialog = new AddProductDialog(this.auxService, this.productEditor, new EmitterService(), new EmitterSearchService());
        this.productEditor.SelectedProduct = this.productEditor.createProductPlaceholder();
        
        dialog.open()
        .completed((result: any) => {
            self.products.push(result);
            
            // if (self.storageDao.ready === true) {
            //     const key: IDBValidKey = result.productId;
            //     const comments: IProductComments = {
            //         productId: result.productId,
            //         comments: new Array<IComment>()
            //     };
            //     comments.comments.push({
            //         commentDate: DateFormatProvider.toDateTimeString(new Date()),
            //         enteredBy: appConfig.CurrentUser.Name,
            //         text: (result as Product).comments
            //     });
            //     self.storageDao.save<IProductComments>('comments', comments, key).completed((result: IDBValidKey) => {
            //         console.log('Add Comment Success: ', result); 
            //     }).exception((error: any) => {
            //         console.log('Add Comment Error: ', error); 
            //     });
            // }
            
            dialog.disposeDialog();
            setTimeout(() => {
                dialog = null;
            }, 1000);
        })
        .cancelled((result: any) => {
            self.productEditor.getProducts()
            .completed((result: Product[]) => {
                self.products = result;
                self.productPaginator.setData(self.products);
            }).exception((error: any) => {
                console.log('Add Product Cancel - Get Products: ', error); 
            });
            dialog.disposeDialog();
            setTimeout(() => {
                dialog = null;
            }, 1000);
        });
        
    }
    
    importProduct() {
        const self = this;
        let dialog: ImportProductDialog = new ImportProductDialog(this.auxService, this.productEditor);
        
        dialog.open()
        .completed((result: any) => {
            if (result) {
                self.productEditor.getProductById(result.productId)
                .completed((result: Product) => {
                    self.products.push(result);
                }).exception((error: any) => {
                    console.log('Product Import - Get New Product:', error); 
                });
            }
            setTimeout(() => {
                dialog = null;
            }, 1000);
        })
        .cancelled((result: any) => {
            
            setTimeout(() => {
                dialog = null;
            }, 1000);
        });
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
        // console.log('Viewing File: ', selectedFile);
         
        const dialog: ViewFileDialog = new ViewFileDialog(selectedFile);
         
        dialog.open()
        .cancelled((result: any) => {
            
        });
        
     }
    
     private getFiles(productId: number) {
         const self = this;
         const productsGridPanel: HTMLDivElement = document.getElementById("productsGridPanel") as HTMLDivElement;
         const productCommentsPanel: HTMLDivElement = document.getElementById("productCommentsPanel") as HTMLDivElement;
         
        if (productsGridPanel) {
            productsGridPanel.style.width = 'calc(70% - 15px)';
        }
        
        if (productCommentsPanel) {
            productCommentsPanel.style.display = 'inline-block';
        }
        
         if (self.storageDao.ready === true) {
             const key: IDBValidKey = productId;
             self.storageDao.getOne<IProductFiles>('files', key).completed((result: IProductFiles) => {
                //  console.log('Get Files: ', result);
                 
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
        
        const productId: number = self.productEditor.SelectedProduct.productId;
        const textInput: HTMLTextAreaElement = document.getElementById('comments') as HTMLTextAreaElement;
        const savePanel: HTMLDivElement = document.getElementById('saveCommentPanel') as HTMLDivElement;
 
        self.productEditor.saveComment(productId, textInput.value)
           .completed((result: IComment) => {
            self.comments.comments.push (result);
            self.commentsRepeat.refresh(self.comments.comments);
        }).exception((error: any) => {
            console.log('Save Comment Error: ', error); 
        });
    }
    
    closeComments() {
        const self = this;
        const productsGridPanel: HTMLDivElement = document.getElementById("productsGridPanel") as HTMLDivElement;
        const productCommentsPanel: HTMLDivElement = document.getElementById("productCommentsPanel") as HTMLDivElement;
        const textInput: HTMLTextAreaElement = document.getElementById('comments') as HTMLTextAreaElement;
        const savePanel: HTMLDivElement = document.getElementById('saveCommentPanel') as HTMLDivElement;
        const addButton: HTMLButtonElement = document.getElementById('btnAddComment') as HTMLButtonElement;
        
        if (productCommentsPanel) {
            productCommentsPanel.style.display = 'none';
        }
        
        if (productsGridPanel) {
            productsGridPanel.style.width = 'calc(100% - 15px)';
        }
        
        addButton.innerHTML = '+';
        textInput.style.display = 'none';
        savePanel.style.display = 'none';
        
    }
    
    private getComments(productId: number) {
        const self = this;
        const productsGridPanel: HTMLDivElement = document.getElementById("productsGridPanel") as HTMLDivElement;
        const productCommentsPanel: HTMLDivElement = document.getElementById("productCommentsPanel") as HTMLDivElement;
        
        if (productsGridPanel) {
            productsGridPanel.style.width = 'calc(70% - 15px)';
        }
        
        if (productCommentsPanel) {
            productCommentsPanel.style.display = 'inline-block';
        }
        
        this.productEditor.getCommentsForProductId(productId)
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
     *  COPY & VIEW PRODUCT METHODS
     **************************************************************************************************************/
    showProductMenu(p, e) {
        const clickElement: HTMLElement = (e.target.nodeName === 'I' ? e.target.parentElement : e.target);
        const menu: Menu = new Menu([
            {
                Scope: this,
                CommandType: MenuItemCommandTypeArgs.Method,
                Command: 'copyProduct',
                MenuIcon: '<i class="far fa-copy"></i>',
                LabelText: 'Copy Product',
                ApplySeparator: false,
                Arguments: [p, e]
            }
            // ,
            // {
            //     Scope: this,
            //     CommandType: MenuItemCommandTypeArgs.Method,
            //     Command: 'viewProduct',
            //     MenuIcon: '<i class="fas fa-search-plus"></i>',
            //     LabelText: 'View Product',
            //     ApplySeparator: false,
            //     Arguments: [p, e]
            // }
        ]);
        Menu.showMenu(clickElement, menu);
    }
    
    copyProduct(args) {
        const self = this;
        const highlightedRows: HTMLTableRowElement = document.getElementsByClassName('selected-row')[0] as HTMLTableRowElement;
        
        if (highlightedRows) {
            highlightedRows.classList.remove('selected-row');
        }
        
        let dialog: AddProductDialog = new AddProductDialog(this.auxService, this.productEditor, new EmitterService(), new EmitterSearchService());
        this.productEditor.SelectedProduct = this.productEditor.cloneProduct(args[0]);
        this.productEditor.SelectedProduct.productId = -1;
        
        dialog.open()
        .completed((result: any) => {
            self.products.push(result);
            setTimeout(() => {
                dialog = null;
            }, 1000);
        })
        .cancelled((result: any) => {
            
            setTimeout(() => {
                dialog = null;
            }, 1000);
        });
        
    }
    
    viewProduct(args) {
        console.log('View Product: ', args);
    }
    
    /**************************************************************************************************************
     *  EDIT PRODUCT METHODS
     **************************************************************************************************************/
    editProduct(product: Product, evt: MouseEvent) {
        this.closeComments();
        this.dispose();
        
        setTimeout(() => {
            const route: string = `/${appConfig.BasePath}${appConfig.BasePath !== '' ? '/' : ''}product-editor?productId=${product.productId}`;
            history.pushState({selector: 'product-editor'}, 'product-editor', route);
        }, 500);
        
    }
        
    saveProduct() {
        const self = this;
        
        self.productEditor.SelectedProduct.platforms = new Array<ProductPlatform>();
        for (const platform of this.platformContainer.get()) {
            self.productEditor.SelectedProduct.platforms.push(platform);
        }
        
        this.productEditor.saveProduct(self.productEditor.SelectedProduct).completed((product: Product) => {
            // console.log(product);

            for (let i = 0; i < self.products.length; i++) {
                if (self.products[i].productId === product.productId) {
                    self.products[i].service = product.service;
                    self.products[i].countries = product.countries;
                    self.products[i].requestDate = product.requestDate;
                    self.products[i].productType = product.productType;
                    self.products[i].caseNumber = product.caseNumber;
                    self.products[i].statusCode = product.statusCode;
                    self.products[i].updatedBy = product.updatedBy;
                    self.products[i].dateUpdated = product.dateUpdated;
                    break;
                }
            }

            self.showFilter = false;
            self.editingProduct = false;
                
            while(self.editCountries.length > 0) {
                self.editCountries.pop();
            }
            
            self.productEditor.SelectedProduct = self.productEditor.createProductPlaceholder();

        });

    }

    addCountry(evt): void {
        const countryCode: string = this.selectedCountryCode.toString();
        
        for (const c of this.countries) {
          if (c.countryCode === countryCode) {
            this.editCountries.push({countryCode: c.countryCode, countryName: c.countryName});
            this.productEditor.SelectedProduct.countries.push(countryCode);
            break;
          }
        }
        
        this.selectedCountriesRepeat.refresh(this.editCountries);
        
        const select: HTMLSelectElement = document.getElementById('selectedCountry') as HTMLSelectElement;
        select.selectedIndex = -1;
        this.selectedCountryCode = '';
    }
        
    removeCountry(cntry: Country): void {
        // console.log('Remove Country', cntry);
        
        if (cntry === undefined || cntry === null) { return; }

        for (let i = 0; i < this.editCountries.length; i++) {
            if (this.editCountries[i].countryCode === cntry.countryCode) {
                this.editCountries.splice(i, 1);
                this.selectedCountriesRepeat.refresh(this.editCountries);
                break;
            }
        }

        for (let i = 0; i < this.productEditor.SelectedProduct.countries.length; i++) {
            if (this.productEditor.SelectedProduct.countries[i] === cntry.countryCode) {
                this.productEditor.SelectedProduct.countries.splice(i, 1);
                break;
            }
        }

    }

    addPlatform() {
        const pForm: string = this.removeEscapeChars(this.platform.toString());
        this.platformContainer.add({
            name: pForm,
            ewSystems: new Array<EwSystem>()
        });
    }

    cancelProductEdit() {
        this.showFilter = false;
        this.editingProduct = false;
        
        while(this.editCountries.length > 0) {
            this.editCountries.pop();
        }
        
        this.productEditor.SelectedProduct = this.productEditor.createProductPlaceholder();
    }
    
    
    /**************************************************************************************************************
     *  PRODUCT EMITTER METHODS
     **************************************************************************************************************/
    addEmittersToProduct() {
        const self = this;
        let dialog: AddElnotsDialog = new AddElnotsDialog(this.productEditor, new EmitterService(), new EmitterSearchService());
        
        
        dialog.open()
        .completed((result: any) => {
            const product: Product = result;
            
            setTimeout(() => {
                const containerPanels: HTMLCollection = document.getElementsByClassName('elnot-information-panel');
                const dataExists: boolean = self.emitters.length > 0;
                
                if (containerPanels) {
                    for (let i = 0; i < containerPanels.length; i++) {
                        const parent: Node = containerPanels[i].parentNode;
                        parent.removeChild(containerPanels[i]);
                    }
                }
                
                while (self.emitters.length > 0) {
                    self.emitters.splice(0, 1);
                }
                
                for (const emitter of product.emitters) {
                    self.emitters.push(emitter);
                }
                
                for (const p of self.products) {
                    if (p.productId === product.productId) {
                        while (p.emitters.length > 0) {
                            p.emitters.splice(0,1);
                        }
                        
                        for (const e of product.emitters) {
                            p.emitters.push(e);
                        }
                    }
                }
                
                self.productPaginator.refresh(self.products);
                
                if (dataExists) {
                    self.emitterPaginator.setData(self.emitters);
                } else {
                    setTimeout(() => {
                        const selectedRow: HTMLTableRowElement = document.getElementsByClassName(`product-${product.productId}`)[0] as HTMLTableRowElement;
                        selectedRow.classList.add('selected-row');
                        self.emitterPaginator.refresh(self.emitters);
                    }, 500);
                }
                
                
            }, 500);
            
        })
        .cancelled((result: any) => {
            
            setTimeout(() => {
                
                dialog = null;
            }, 500);
        });
        
    }
    
    /**************************************************************************************************************
     *  PRODUCT REVIEW METHODS
     **************************************************************************************************************/
    displayProductReview(product: Product, ev: MouseEvent) {
        const self = this;
        
        const highlightedRows: HTMLTableRowElement = document.getElementsByClassName('selected-row')[0] as HTMLTableRowElement;
        const selectedRows: HTMLTableRowElement = document.getElementsByClassName(`product-${product.productId}`)[0] as HTMLTableRowElement;
        
        if (highlightedRows) {
            highlightedRows.classList.remove('selected-row');
        }
        
        if (selectedRows) {
            selectedRows.classList.add('selected-row');
        }
        
        self.productEditor.SelectedProduct = self.productEditor.cloneProduct(product);
        self.getComments(product.productId);
        self.getFiles(product.productId);
        
        return;
        
        // console.log('Review Emitters: ', self.emitters);
        while (self.emitters.length > 0) {
            self.emitters.splice(0, 1);
        }
        
        for (const emitter of self.productEditor.SelectedProduct.emitters) {
            self.emitters.push(emitter);
        }
        
        self.emitterPaginator.setData(self.emitters);
        
        
        const body: HTMLDivElement = document.createElement('div');
        const closeButton: HTMLButtonElement = document.createElement('button');
        
        
        closeButton.classList.add('btn');
        closeButton.classList.add('btn-critical');
        closeButton.classList.add('btn-xs');
        closeButton.innerHTML = 'X';
        closeButton.style.cssFloat = 'right';
        
        closeButton.onclick = (evt: MouseEvent) => {
            const parent: Node = body.parentNode;
            parent.removeChild(body);
        };
                
        body.classList.add('review-body');
        
        const productReviewPanel: HTMLElement = document.getElementById('productReview');
        if (productReviewPanel.children.length > 0) {
            productReviewPanel.removeChild(productReviewPanel.children.item(0));
        }
        
        //  TODO: Develop More Elegant Solution
        this.reviewService.getProductReview(product.productId)
        .completed((result: ProductReview) => {
            console.log('Displaying Review: ', result);
            
            if (result) {
                const mainRow: HTMLDivElement = document.createElement('div');
                mainRow.classList.add('div-row');
                
                const mainRowCol1: HTMLDivElement = document.createElement('div');
                const mainRowCol2: HTMLDivElement = document.createElement('div');
                
                mainRowCol1.classList.add('div-col-085');
                mainRowCol2.classList.add('div-col-01');
                
                const approvalDate: string = (result.approved ? DateFormatProvider.toString(new Date(result.reviewDateTime), 'YYYY-MM-DD') : '');
                let mainColHtml: string  = `<strong>Product ID:</strong> ${result.productId}<br /><br />`;
                mainColHtml += `<strong>Approving Agency:</strong> ${result.approvingAgency}<br />`;
                mainColHtml += `<strong>Approved:</strong> ${(result.approved ? 'Yes' : 'No')}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;
                mainColHtml += `<strong>Approval Date:</strong> ${approvalDate}<br /><br />`;
                mainColHtml += '<strong>Coordinating Agency Reviews:</strong>';
                mainRowCol1.innerHTML = mainColHtml;
                
                mainRowCol2.appendChild(closeButton);
                
                mainRow.appendChild(mainRowCol1);
                mainRow.appendChild(mainRowCol2);
                
                body.appendChild(mainRow);
                
                for (const agency of result.coordinatingAgencyReviews) {
                    const agencyMainRow: HTMLDivElement = document.createElement('div');
                    const agencyMainCol: HTMLDivElement = document.createElement('div');
                    
                    agencyMainRow.classList.add('div-row');
                    agencyMainRow.classList.add('agency-row');
                    agencyMainCol.classList.add('div-col-10');
                    
                    const agencyRow: HTMLDivElement = document.createElement('div');
                    const agencyCol1: HTMLDivElement = document.createElement('div');
                    const agencyCol2: HTMLDivElement = document.createElement('div');
                    const agencyCol3: HTMLDivElement = document.createElement('div');
                    const agencyCol4: HTMLDivElement = document.createElement('div');
                    const agencyCol5: HTMLDivElement = document.createElement('div');
                    
                    agencyRow.classList.add('div-row');
                    agencyCol1.classList.add('div-col-03');
                    agencyCol2.classList.add('div-col-03');
                    agencyCol3.classList.add('div-col-035');
                    agencyCol4.classList.add('div-col-10');
                    agencyCol5.classList.add('div-col-10');
                    
                    
                    const agencyApprovalDate: string = (agency.approved ? DateFormatProvider.toString(new Date(agency.reviewDateTime), 'YYYY-MM-DD') : '');
                    agencyCol1.innerHTML = `&nbsp;&nbsp;&nbsp;<strong>Agency:</strong> ${agency.agency}`;
                    agencyCol2.innerHTML = `&nbsp;&nbsp;&nbsp;<strong>Approved:</strong> ${(agency.approved ? 'Yes' : 'No')}`;
                    agencyCol3.innerHTML = `&nbsp;&nbsp;&nbsp;<strong>Review Date:</strong> ${agencyApprovalDate}`;
                    agencyCol4.innerHTML = '&nbsp;&nbsp;&nbsp;<strong>Reviews:</strong>';
                    
                    const agencyReviewRow: HTMLDivElement = document.createElement('div');
                    agencyReviewRow.classList.add('div-row');
                    
                    agencyCol5.appendChild(agencyReviewRow);
                    
                    agencyRow.appendChild(agencyCol1);
                    agencyRow.appendChild(agencyCol2);
                    agencyRow.appendChild(agencyCol3);
                    agencyRow.appendChild(agencyCol4);
                    agencyRow.appendChild(agencyCol5);
                    
                    
                    for (const review of agency.emitterReviews) {
                        const agencyReviewSubCols: HTMLDivElement[] = [
                            document.createElement('div'),
                            document.createElement('div')
                        ];
                        
                        for (const subCol of agencyReviewSubCols) {
                            subCol.classList.add('div-col-045');
                            agencyReviewRow.appendChild(subCol);
                        }
                        
                        agencyReviewSubCols[0].innerHTML = `&nbsp;&nbsp;&nbsp;&nbsp;<strong>Emitter ID:</strong> ${review.emitterId}`;
                        agencyReviewSubCols[1].innerHTML = `&nbsp;&nbsp;&nbsp;&nbsp;<strong>Approved:</strong> ${(review.approved ? 'Yes' : 'No')}`;
                        
                    }
                    
                    agencyMainCol.appendChild(agencyRow);
                    agencyMainRow.appendChild(agencyMainCol);
                    
                    body.appendChild(agencyMainRow);
                    
                }
                
                document.getElementById('productReview').appendChild(body);
            } else {
                const mainRow: HTMLDivElement = document.createElement('div');
                mainRow.classList.add('div-row');
                
                const mainRowCol1: HTMLDivElement = document.createElement('div');
                const mainRowCol2: HTMLDivElement = document.createElement('div');
                
                mainRowCol1.classList.add('div-col-085');
                mainRowCol2.classList.add('div-col-01');
                
                mainRowCol1.style.textAlign = 'center';
                mainRowCol1.style.fontSize = '120%';
                mainRowCol1.style.color = '#555';
                mainRowCol1.innerHTML = 'Review Data Not Available';
                
                mainRowCol2.appendChild(closeButton);
                
                mainRow.appendChild(mainRowCol1);
                mainRow.appendChild(mainRowCol2);
                
                body.appendChild(mainRow);
                
                document.getElementById('productReview').appendChild(body);
            }
            
        }).exception((error: any) => {
            // const mainRow: HTMLDivElement = document.createElement('div');
            // mainRow.classList.add('div-row');
            
            // const mainRowCol1: HTMLDivElement = document.createElement('div');
            // const mainRowCol2: HTMLDivElement = document.createElement('div');
            
            // mainRowCol1.classList.add('div-col-085');
            // mainRowCol2.classList.add('div-col-01');
            
            // mainRowCol1.style.textAlign = 'center';
            // mainRowCol1.style.fontSize = '120%';
            // mainRowCol1.style.color = '#555';
            // mainRowCol1.innerHTML = 'Review Data Not Available2';
            
            // mainRowCol2.appendChild(closeButton);
            
            // mainRow.appendChild(mainRowCol1);
            // mainRow.appendChild(mainRowCol2);
            
            // body.appendChild(mainRow);
            
            // document.getElementById('productReview').appendChild(body);
        });
        
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
        this.productRepeater.sort(fieldName, sortArgs.get(fieldName));
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
        this.productEmitterList.sort(fieldName, sortArgs.get(fieldName));
    }
    
    showHideEmitterFilter() {
        this.showEmitterFilter = (this.showEmitterFilter !== true);
    }
    
    displayEmitterFilter() {
        const hidden: string = (this.showEmitterFilter ? '' : 'hidden');
        return hidden;
    }
    
    disableAddEmitter(): string {
        if (this.productEditor.SelectedProduct.productId === 0) { return 'disabled'; }
        return (this.productEditor.SelectedProduct.statusCode === 'DLV' ? 'disabled' : '');
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

export { ProductView };
