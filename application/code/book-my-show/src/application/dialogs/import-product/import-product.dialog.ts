import { Dialog } from '../../../framework/decorators/Dialog';
import { DialogBase } from '../../../framework/core/DialogBase';
import { UIBase } from '../../../framework/core/UIBase';
import { RepeatingDataView } from '../../../framework/core/RepeatingDataView';
import { DateFormatProvider } from '../../../framework/providers/DateFormatProvider';

import { Pikaday } from '../../../libs/pikaday/pikaday';
import { PikadayOptions } from '../../../libs/pikaday/options';

import { AuxDataService } from '../../services/aux-data.service';
import { ProductEditorService } from '../../services/product-editor.service';

import { Country } from '../../models/aux-data/Country.Interface'
import { Platform } from '../../models/aux-data/Platform.Interface'
import { MilitaryService } from '../../models/aux-data/Service.Interface'

import { Product } from '../../models/product/Product.Interface';
import { IComment, IProductComments } from '../../models/product/ProductComments.Interface'
import { ProductImport } from '../../models/product/ProductImport.Interface';
import { ProductEmitter } from '../../models/product/ProductEmitter.Interface';

import { PlatformControl, PlatformControlContainer } from '../../../application/models/product/Platform.Control';
import { ProductPlatform } from '../../models/product/ProductPlatform.Interface';
import { EwSystem } from '../../models/product/EwSystem.Interface';


@Dialog({
    selector: 'import-product',
    BasePath: 'js/application/dialogs/import-product',
    template: '',
    styles: 'import-product.dialog.css',
    headerTemplate: 'import-product.dialog-header.html',
    templates: [
        'import-product.dialog-view.html'
    ],
    footerTemplate: 'import-product.dialog-footer.html'
})
class ImportProductDialog extends DialogBase {
    
    private selectedCountryCode: String;
    private importCountries: Country[];
    private countries: Country[];
    private platforms: Platform[];
    private militaryBranches: MilitaryService[];
    
    private platformRepeat: RepeatingDataView;
    private serviceRepeat: RepeatingDataView;
    private countryRepeat: RepeatingDataView;
    private selectedCountriesRepeat: RepeatingDataView;

    selectedPlatforms = '';
    country = '';
    platform = '';
    requestDate = '';
    productType = '';
    caseNumber = '';
    service = '';
    comments = '';
  
    selectedFile = '';
    selectedFileData = '';
  
    private platformContainer: PlatformControlContainer;
    
    constructor(private auxService: AuxDataService, private productEditor: ProductEditorService) { super(); }
    
    preOpen() {
        const self = this;
        this.importCountries = new Array<Country>();
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
    
    postOpen() {
        const self = this;
        
        self.platformContainer = new PlatformControlContainer('platformContainer');
        
        setTimeout(() => {
            self.serviceRepeat = new RepeatingDataView('serviceRepeat', {
                scope: self as UIBase,
                dataSet: self.militaryBranches
            });
            self.platformRepeat = new RepeatingDataView('platformRepeat', {
                scope: self as UIBase,
                dataSet: self.platforms
            });
            self.countryRepeat = new RepeatingDataView('countryRepeat', {
                scope: self as UIBase,
                dataSet: self.countries
            });
            self.selectedCountriesRepeat = new RepeatingDataView('selectedCountriesRepeat', {
                scope: self as UIBase,
                dataSet: self.importCountries
            });
            
            const requestDate: HTMLInputElement = document.getElementById('requestDate') as HTMLInputElement;
            const pikadayOptions: PikadayOptions = {
                field: requestDate,
                format: 'YYYY-MM-DD',
                formatStrict: true,
                onSelect: (date: Date) => {
                    requestDate.value = DateFormatProvider.toString(date, 'YYYY-MM-DD');
                }
            };
            const pikaday: Pikaday = new Pikaday(pikadayOptions);
            
        }, 400);
        
        this.productEditor.SelectedProduct.countries = new Array<string>();
        
    }
    
    /*****************************************************************************************
     *  SELECT IMPORT FILE METHOD
     *****************************************************************************************/
    selectFile() {
        const self = this;
        const fileInput: HTMLInputElement = document.getElementById("fileInput") as HTMLInputElement;
        
        fileInput.onchange = (evt: Event) => {
            const input: HTMLInputElement = evt.target as HTMLInputElement;
            
            if (typeof FileReader !== undefined && input.files !== null && input.files !== undefined && input.files.length > 0) {
                this.selectedFile = input.files[0].name;
          
                const reader: FileReader = new FileReader();
                const blob: Blob = input.files[0];
          
                reader.onloadend = () => {
                  const base64data = reader.result.toString().split(',')[1];
                  this.selectedFileData = base64data;
                };
          
                reader.readAsDataURL(blob);
          
              } else {
                console.log('No file selected...');
              }
        };
        
        fileInput.click();
        
    }
    
    /*****************************************************************************************
     *  IMPORT & SAVE PRODUCT METHODS
     *****************************************************************************************/
    importFile() {
        const self = this;
        const importedProduct: ProductImport = {
            fmsCaseId: this.removeEscapeChars(this.caseNumber),
            service: this.removeEscapeChars(this.service),
            deliveredToCountries: this.selectedCountries(),
            platforms: new Array<ProductPlatform>(),
            requestDate: DateFormatProvider.toString(new Date(this.removeEscapeChars(this.requestDate)), 'YYYY-MM-DD'),
            productType: this.removeEscapeChars(this.productType),
            emittersCsvBase64: this.selectedFileData
        };
        
        for (const platform of this.platformContainer.get()) {
            importedProduct.platforms.push(platform);
        }
        
        this.productEditor.importProduct(importedProduct).completed((product: Product) => {
            if (self.comments !== null && self.comments !== undefined && self.comments.trim().length > 0) {
                self.productEditor.saveComment(product.productId, self.comments).completed((comment: IComment) => {
                    self.complete(product);
                }).exception((error: any) => {
                    console.log('Import Error Adding Comment: ', error);
                });
            } else {
                self.complete (product);
            }    
        }).exception((error: any) => {
            console.log('Import Error: ', error);
        });
        
    }
    
    /*****************************************************************************************
     *  COUNTRY & PLATFORM SELECTION METHODS
     *****************************************************************************************/
    addCountry(evt): void {
        const countryCode: string = this.selectedCountryCode.toString();
        const idx = this.productEditor.SelectedProduct.countries.indexOf(countryCode, 0);
        
        if (idx === -1) {
            
            for (const c of this.countries) {
                if (c.countryCode === countryCode) {
                this.importCountries.push({countryCode: c.countryCode, countryName: c.countryName});
                this.productEditor.SelectedProduct.countries.push(countryCode);
                break;
                }
            }
            
            this.selectedCountriesRepeat.refresh(this.importCountries);
            
        }
        
        this.countryRepeat.refresh(this.countries);
        this.selectedCountryCode = new String('');
    }
        
    removeCountry(cntry: Country): void {
        console.log('Remove Country', cntry);
        
        if (cntry === undefined || cntry === null) { return; }

        for (let i = 0; i < this.importCountries.length; i++) {
            if (this.importCountries[i].countryCode === cntry.countryCode) {
                const idx = this.productEditor.SelectedProduct.countries.indexOf(cntry.countryCode, 0);
                if (idx > -1) {
                    this.productEditor.SelectedProduct.countries.splice(idx, 1);
                }
                this.importCountries.splice(i, 1);
                this.selectedCountriesRepeat.refresh(this.importCountries);        
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
        
    selectedCountries(): string[] {
        let countries: string[] = [];

        for (let i = 0; i < this.importCountries.length; i++) {
            countries.push(this.importCountries[i].countryCode);
        }

        return countries;

    }

}

export { ImportProductDialog };