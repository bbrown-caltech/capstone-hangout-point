import { KeyValuePair } from '../../framework/core/ResourceDictionary';
import { DateFormatProvider } from '../../framework/providers/DateFormatProvider';

import { Pikaday } from '../../libs/pikaday/pikaday';
import { PikadayOptions } from '../../libs/pikaday/options';

import { Product } from '../models/product/Product.Interface';

import { Country} from '../models/aux-data/Country.Interface';
import { EwSystem } from '../models/product/EwSystem.Interface';
import { MilitaryService } from '../models/aux-data/Service.Interface';
import { Platform } from '../models/aux-data/Platform.Interface';
import { ProductPlatform } from '../models/product/ProductPlatform.Interface';
import { PlatformControlContainer } from '../models/product/Platform.Control';

import { ProductEditorService } from '../services/product-editor.service';
import { AsyncTask } from '../../framework/core/AsyncTask';

import { appConfig } from '../config';

class UIElementCreator {
    
    public static createButton(html: string, title: string, classList: string[],
                               handler: (evt: MouseEvent) => void): HTMLButtonElement {
        const button: HTMLButtonElement = document.createElement('button');
        
        button.title = title;
        button.innerHTML = html;
        button.onclick = handler;
        
        if (classList) {
            for (const c of classList) {
                button.classList.add(c);
            }
        }
        
        return button;
        
    }
    
    public static createDiv(classList: string[], html: string = undefined): HTMLDivElement {
        const div: HTMLDivElement = document.createElement('div');
        
        if (html) {
            div.innerHTML = html;
        }
        
        if (classList) {
            for (const c of classList) {
                div.classList.add(c);
            }
        }
        
        return div;
        
    }
    
    public static createInput(classList: string[]): HTMLInputElement {
        const input: HTMLInputElement = document.createElement('input');
        
        input.type = 'text';
        
        if (classList) {
            for (const c of classList) {
                input.classList.add(c);
            }
        }
        
        return input;
        
    }
    
    public static createLabel(html: string): HTMLLabelElement {
        const label: HTMLLabelElement = document.createElement('label');
        label.innerHTML = html;
        return label;
    }
    
    public static createSelect(classList: string[], options?: KeyValuePair[]): HTMLSelectElement {
        const select: HTMLSelectElement = document.createElement('select');
        
        if (classList) {
            for (const c of classList) {
                select.classList.add(c);
            }
        }
        
        UIElementCreator.bindSelect(select, options);
        
        return select;
        
    }
    
    public static bindSelect(select: HTMLSelectElement, options: KeyValuePair[]): HTMLSelectElement {
        
        if (select && options) {
            while (select.options.length > 0) {
                select.options.remove(0);
            }
            
            for (const kvp of options) {
                const opt: HTMLOptionElement = document.createElement('option');
                opt.value = kvp.Key;
                opt.text = kvp.Value;
                select.options.add(opt);
            }
        }
        
        return select;
        
    }
    
    public static createTextArea(classList: string[]): HTMLTextAreaElement {
        const input: HTMLTextAreaElement = document.createElement('textarea');
        
        input.rows = 7;
        
        if (classList) {
            for (const c of classList) {
                input.classList.add(c);
            }
        }
        
        return input;
        
    }
    
    public static createRow(cols: HTMLDivElement[]): HTMLDivElement {
        const row: HTMLDivElement = UIElementCreator.createDiv(['div-row']);
        
        if (cols) {
            for (const c of cols) {
                row.appendChild(c);
            }
        }
        
        return row;
    }
    
    public static createCol(colWidth: string, ctls: HTMLElement[], html?: string): HTMLDivElement {
        const col: HTMLDivElement = UIElementCreator.createDiv([`div-col-${colWidth}`]);
        
        if (html) {
            col.innerHTML = html;
        }
        
        if (ctls) {
            for (const c of ctls) {
                col.appendChild(c);
            }
        }
        
        return col;
    }
    
}

class ProductEditor {
    public container: HTMLDivElement;
    
    private serviceSelect: HTMLSelectElement;
    private requestDateInput: HTMLInputElement;
    private productTypeSelect: HTMLSelectElement;
    private caseNumberInput: HTMLInputElement;
    private countrySelect: HTMLSelectElement;
    private selectedCountriesContainer: HTMLDivElement;
    private platformSelect: HTMLSelectElement;
    private platformItemContainer: HTMLDivElement;
    // private commentsRow: HTMLDivElement;
    // private commentsInput: HTMLTextAreaElement;
    
    private platformContainer: PlatformControlContainer;
    
    private selectedCountries: Country[]
    
    constructor(private controlWidth: number,
                private selectedProduct: Product,
                private countries: Country[],
                private platforms: Platform[],
                private militaryBranches: MilitaryService[],
                private productEditorService: ProductEditorService) {
        this.selectedCountries = new Array<Country>();
    }

    init() {
        const self = this;
        
        self.createControls();
        
        self.container = document.createElement('div');
        self.container.style.width = `${self.controlWidth}px`;
        
        self.container.appendChild(self.createServiceRow());
        self.container.appendChild(self.createCountryRow());
        self.container.appendChild(self.createPlatformRow());
        // self.container.appendChild(self.createCommentsRow());
        
        self.platformContainer = new PlatformControlContainer(self.platformItemContainer);
        
        if (self.selectedProduct && self.selectedProduct.productId > 0) {
            self.serviceSelect.value = self.selectedProduct.service;
            self.requestDateInput.value = DateFormatProvider.toString(
                new Date(self.selectedProduct.requestDate), 'YYYY-MM-DD');
            self.productTypeSelect.value = self.selectedProduct.productType;
            self.caseNumberInput.value = self.selectedProduct.caseNumber;
            
            for (const c of self.selectedProduct.countries) {
                self.addCountry(c);
            }
            
            for (const p of self.selectedProduct.platforms) {
                self.platformContainer.add(p);
            }
            
            // self.commentsInput.value = self.selectedProduct.comments;
            // self.commentsRow.style.display = 'none';
        }
        
    }
    
    dispose() {
        this.container = undefined;
        this.serviceSelect = undefined;
        this.requestDateInput = undefined;
        this.productTypeSelect = undefined;
        this.caseNumberInput = undefined;
        this.countrySelect = undefined;
        this.selectedCountriesContainer = undefined;
        this.platformSelect = undefined;
        this.platformItemContainer = undefined;
        // this.commentsInput = undefined;
        // this.commentsRow = undefined;
    }
    
    save(): AsyncTask<Product> {
        const self = this;
        
        if (self.selectedProduct && self.productEditorService) {
            self.selectedProduct.service = self.serviceSelect.value;
            self.selectedProduct.requestDate = self.requestDateInput.value;
            self.selectedProduct.productType = self.productTypeSelect.value;
            self.selectedProduct.caseNumber = self.caseNumberInput.value;
            self.selectedProduct.countries = new Array<string>();
            self.selectedProduct.createdBy = (self.selectedProduct.productId === 0 ? 
                                              appConfig.CurrentUser.UID : 
                                              self.selectedProduct.createdBy);
            self.selectedProduct.dateCreated = (self.selectedProduct.productId === 0 ? 
                                                DateFormatProvider.toDateTimeString(new Date()) : 
                                                self.selectedProduct.dateCreated);
            self.selectedProduct.createdBy = appConfig.CurrentUser.UID;
            self.selectedProduct.dateUpdated = DateFormatProvider.toDateTimeString(new Date());
            
            for (const c of self.selectedCountries) {
                self.selectedProduct.countries.push(c.countryCode);
            }
            
            self.selectedProduct.platforms = new Array<ProductPlatform>();
            for (const platform of this.platformContainer.get()) {
                self.selectedProduct.platforms.push(platform);
            }
            
            return self.productEditorService.saveProduct(self.selectedProduct);
        } else {
            const task: AsyncTask<Product> = new AsyncTask<Product>();
            
            setTimeout(() => {
                task.reject('Selected Product or Product Editor Service Invlid.');
            }, 1000);
            
            return task;
        }
        
    }
    
    
    /******************************************************************************************************
    *   UI ELEMENT EVENT METHODS 
    ******************************************************************************************************/
    private addCountry(countryCode: string) {
        let country: Country = undefined;
        let countryIndex: number = -1;
        
        for (let i = 0; i < this.countries.length; i++) {
            if (this.countries[i].countryCode === countryCode) {
                countryIndex = i;
                country = this.countries[i];
                this.countries.splice(i, 1);
                this.selectedCountries.push(country);
                break;
            }
        }
        
        if (country) {
            const countryControl: HTMLDivElement = this.createSelectedCountry(country);
            countryControl.setAttribute('country-index', countryIndex.toString());
            this.selectedCountriesContainer.appendChild(countryControl);
            this.bindCountries();
        }
        
    }
    
    private removeCountry(countryCode: string, countryIndex: number) {
        let country: Country = undefined;
        
        for (let i = 0; i < this.selectedCountries.length; i++) {
            if (this.selectedCountries[i].countryCode === countryCode) {
                country = this.selectedCountries[i];
                this.selectedCountries.splice(i, 1);
                this.countries.splice(countryIndex, 0, country);
                break;
            }
        }
        
        if (country) {
            this.bindCountries();
        }
        
    }
    
    private addPlatform(platformName: string) {
        this.platformContainer.add({
            name: platformName,
            ewSystems: new Array<EwSystem>()
        });
    }
    
    
    /******************************************************************************************************
    *   UI CREATION METHODS 
    ******************************************************************************************************/
    private createControls() {
        
        this.serviceSelect = UIElementCreator.createSelect(['frm-select-ctl']);
        this.bindMilitaryBranches();
        
        this.createCalendar();
        
        const productTypes: KeyValuePair[] = new Array<KeyValuePair>();
        productTypes.push({ Key: '', Value: ''})
        productTypes.push({ Key: 'indirect', Value: 'Indirect'})
        productTypes.push({ Key: 'direct', Value: 'Direct'});
        this.productTypeSelect = UIElementCreator.createSelect(['frm-select-ctl'], productTypes);
        
        this.caseNumberInput = UIElementCreator.createInput(['frm-ctl-elemt']);
        
        this.countrySelect = UIElementCreator.createSelect(['frm-select-ctl']);
        this.bindCountries();
        this.selectedCountriesContainer = UIElementCreator.createDiv(['multi-data-selection-container']);
        
        this.platformSelect = UIElementCreator.createSelect(['frm-select-ctl']);
        this.bindPlatforms();
        this.platformItemContainer = UIElementCreator.createDiv(['platform-item-container']);
        
        // this.commentsInput = UIElementCreator.createTextArea([]);
        
    }
    
    private createServiceRow(): HTMLDivElement {
        const cols: HTMLDivElement[] = new Array<HTMLDivElement>();
        
        cols.push(UIElementCreator.createCol('025', [
            UIElementCreator.createLabel('Service'),
            this.serviceSelect
        ]));
        
        cols.push(UIElementCreator.createCol('half', [], '&nbsp;'));
        
        cols.push(UIElementCreator.createCol('02', [
            UIElementCreator.createLabel('Request Date'),
            this.requestDateInput
        ]));
        
        cols.push(UIElementCreator.createCol('half', [], '&nbsp;'));
        
        cols.push(UIElementCreator.createCol('02', [
            UIElementCreator.createLabel('Product Type'),
            this.productTypeSelect
        ]));
        
        cols.push(UIElementCreator.createCol('half', [], '&nbsp;'));
        
        cols.push(UIElementCreator.createCol('02', [
            UIElementCreator.createLabel('Case Number'),
            this.caseNumberInput
        ]));
        
       return UIElementCreator.createRow(cols);
       
    }
    
    private createCountryRow(): HTMLDivElement {
        const self = this;
        const cols: HTMLDivElement[] = new Array<HTMLDivElement>();
        const addButtonCol: HTMLDivElement = UIElementCreator.createCol('01', [
            UIElementCreator.createButton('Add', 'Add Country',
                                          ['btn', 'btn-af-blue', 'btn-small', 'btn-ctl-height'],
                                          (evt: MouseEvent) => {
                                            const countryCode: string = self.countrySelect.value;
                                            if (countryCode && countryCode !== '') {
                                                self.addCountry(countryCode);
                                            }
                                          })
        ]);
        const countryContainerCol: HTMLDivElement = UIElementCreator.createCol('10', [this.selectedCountriesContainer]);
        
        cols.push(UIElementCreator.createCol('0375', [
            UIElementCreator.createLabel('Country'),
            this.countrySelect
        ]));
        
        addButtonCol.classList.add('padding-top-25');
        cols.push(addButtonCol);
        
        countryContainerCol.classList.add('margin-right-10');
        cols.push(countryContainerCol);
        
       return UIElementCreator.createRow(cols);
       
    }
    
    private createPlatformRow(): HTMLDivElement {
        const self = this;
        const cols: HTMLDivElement[] = new Array<HTMLDivElement>();
        const addButtonCol: HTMLDivElement = UIElementCreator.createCol('01', [
            UIElementCreator.createButton('Add', 'Add Platform',
                                          ['btn', 'btn-af-blue', 'btn-small', 'btn-ctl-height'],
                                          (evt: MouseEvent) => {
                                            const platformName: string = self.platformSelect.value;
                                            if (platformName && platformName !== '') {
                                                self.addPlatform(platformName);
                                            }
                                          })
        ]);
        
        cols.push(UIElementCreator.createCol('0375', [
            UIElementCreator.createLabel('Platform'),
            this.platformSelect
        ]));
        
        addButtonCol.classList.add('padding-top-25');
        cols.push(addButtonCol);
        
        cols.push(UIElementCreator.createCol('10', [
            this.platformItemContainer
        ]));
        
       return UIElementCreator.createRow(cols);
       
    }
    
    // private createCommentsRow(): HTMLDivElement {
    //     const cols: HTMLDivElement[] = new Array<HTMLDivElement>();
    //     const commentsCol: HTMLDivElement = UIElementCreator.createCol('10', [
    //         UIElementCreator.createLabel('Comments'),
    //         this.commentsInput
    //     ]);
        
    //     commentsCol.classList.add('margin-right-10');
    //     cols.push(commentsCol);
        
    //     this.commentsRow = UIElementCreator.createRow(cols);
        
    //     return this.commentsRow;
       
    // }
    
    private createCalendar() {
        this.requestDateInput = UIElementCreator.createInput(['frm-ctl-elemt']);
        const pikadayOptions: PikadayOptions = {
            field: this.requestDateInput,
            defaultDate: new Date(),
            setDefaultDate: false,
            format: 'YYYY-MM-DD',
            formatStrict: true,
            onSelect: (date: Date) => {
                this.requestDateInput.value = DateFormatProvider.toString(date, 'YYYY-MM-DD');
            }
        };
        const pikaday: Pikaday = new Pikaday(pikadayOptions);
        this.requestDateInput.value = DateFormatProvider.toString(new Date(), 'YYYY-MM-DD');
    }
    
    private createSelectedCountry(country: Country): HTMLDivElement {
        const self = this;
        const countryContainer: HTMLDivElement = UIElementCreator.createDiv(['multi-data-selection-item'])
        const label: HTMLSpanElement = document.createElement('span');
        const link: HTMLAnchorElement = document.createElement('a');
        
        label.innerHTML = country.countryName;
        link.innerHTML = 'X';
        link.setAttribute('countryCode', country.countryCode);
        link.onclick = (ev: MouseEvent) => {
            const countryIndex: number = parseInt(countryContainer.getAttribute('country-index'));
            self.removeCountry(country.countryCode, countryIndex);
            self.selectedCountriesContainer.removeChild(countryContainer);
        }
        
        countryContainer.appendChild(label);
        countryContainer.appendChild(link);
        
        return countryContainer;
       
    }
    
    
    /******************************************************************************************************
    *   UI UPDATE METHODS 
    ******************************************************************************************************/
    private bindCountries() {
        
        if (this.countries && this.countrySelect) {
            const kvp: KeyValuePair[] = new Array<KeyValuePair>();
            
            kvp.push({ Key: '', Value: ''});
            
            for (const c of this.countries) {
                kvp.push({ Key: c.countryCode, Value: c.countryName});
            }
            
            UIElementCreator.bindSelect(this.countrySelect, kvp);
        }
        
    }
    
    private bindMilitaryBranches() {
        
        if (this.militaryBranches && this.serviceSelect) {
            const kvp: KeyValuePair[] = new Array<KeyValuePair>();
            
            kvp.push({ Key: '', Value: ''});
            
            for (const m of this.militaryBranches) {
                kvp.push({ Key: m.serviceName, Value: m.serviceName});
            }
            
            UIElementCreator.bindSelect(this.serviceSelect, kvp);
        }
        
    }
    
    private bindPlatforms() {
        
        if (this.platforms && this.platformSelect) {
            const kvp: KeyValuePair[] = new Array<KeyValuePair>();
            
            kvp.push({ Key: '', Value: ''});
            
            for (const p of this.platforms) {
                kvp.push({ Key: p.platformName, Value: p.platformName});
            }
            
            UIElementCreator.bindSelect(this.platformSelect, kvp);
        }
        
    }
    
}

export { ProductEditor };