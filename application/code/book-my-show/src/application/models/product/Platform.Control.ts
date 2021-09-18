import { KeyValuePair, ResourceDictionary } from '../../../framework/core/ResourceDictionary';

import { ProductPlatform } from './ProductPlatform.Interface';
import { EwSystem } from './EwSystem.Interface';

class PlatformControl {
    public container: HTMLDivElement;
    public platform: ProductPlatform;
    
    private parent: PlatformControlContainer;
    
    private ewSysCol: HTMLDivElement;
    
    private inputSystemName: HTMLInputElement;
    private inputSystemDocType: HTMLSelectElement;
    private inputSystemDocNo: HTMLInputElement;
    private inputSystemLOA: HTMLInputElement;
    
    private constructor(platform: ProductPlatform, parent: PlatformControlContainer) {
        this.platform = platform;
        this.parent = parent;
    }
    
    public static createPlatform(platform: ProductPlatform, parent: PlatformControlContainer): PlatformControl {
        const platformCtl: PlatformControl = new PlatformControl(platform, parent);
        
        platformCtl.createControl();
        
        return platformCtl;
        
    }
    
    private reset(): void {
        this.inputSystemName.value = '';
        this.inputSystemDocNo.value = '';
        this.inputSystemLOA.value = '';
        this.inputSystemDocType.selectedIndex = 0;
        this.inputSystemName.focus();
    }
    
    private createControl(): void {
        this.container = this.createDivControl(['platform-item']);
        
        const mainRow: HTMLDivElement = this.createDivControl(['div-row']);
        
        this.ewSysCol = this.createDivControl(['div-col-08']);
        
        mainRow.appendChild(this.createDivControl(['div-col-02', 'platform-name'], this.platform.name));
        mainRow.appendChild(this.ewSysCol);
        
        this.ewSysCol.appendChild(this.createHeaderRow());
        this.ewSysCol.appendChild(this.createControlRow());
        
        for (const system of this.platform.ewSystems) {
            this.ewSysCol.appendChild(this.createEwSystemRow(system));
        }
        
        this.container.appendChild(mainRow);
        
    }
    
    private createHeaderRow(): HTMLDivElement {
        const self = this;
        const row: HTMLDivElement = this.createDivControl(['div-row', 'header']);
        
        row.appendChild(this.createDivControl(['div-col-0225'], 'Name'));
        row.appendChild(this.createDivControl(['div-col-0225'], 'Doc Type'));
        row.appendChild(this.createDivControl(['div-col-0225'], 'Document #'));
        row.appendChild(this.createDivControl(['div-col-0225'], 'LOA'));
        
        
        const btnCol: HTMLDivElement = this.createDivControl(['div-col-01']);
        
        btnCol.appendChild(this.createButtonControl('<i class="fas fa-times"></i>', 'Remove Platform',
                                                    ['btn', 'btn-critical', 'btn-xs', 'float-right'],
                                                    (evt: MouseEvent) => {
                                                        const remove = confirm('Are you sure you want to remove the select platform?');
                                                        
                                                        if (remove) {
                                                            self.parent.removePlatform(self.platform);
                                                        }
                                                        
                                                    }));
        
        row.appendChild(btnCol);
        
        return row;
        
    }
    
    private createControlRow(): HTMLDivElement {
        const self = this;
        const row: HTMLDivElement = this.createDivControl(['div-row', 'header']);
        const col01: HTMLDivElement = this.createDivControl(['div-col-0225']);
        const col02: HTMLDivElement = this.createDivControl(['div-col-0225']);
        const col03: HTMLDivElement = this.createDivControl(['div-col-0225']);
        const col04: HTMLDivElement = this.createDivControl(['div-col-0225']);
        const col05: HTMLDivElement = this.createDivControl(['div-col-01', 'padding-top-5']);
        const docTypeOptions: KeyValuePair[] = [
            { Key: 'none', Value: 'None' },
            { Key: 'certificationLetter', Value: 'Certification Letter' },
            { Key: 'waiver', Value: 'Waiver' }
        ];
        
        this.inputSystemName = this.createInputControl(['platform-item-frm-ctl-elemt']);
        this.inputSystemDocType = this.createSelectControl(['platform-item-frm-ctl-elemt'], docTypeOptions);
        this.inputSystemDocNo = this.createInputControl(['platform-item-frm-ctl-elemt']);
        this.inputSystemLOA = this.createInputControl(['platform-item-frm-ctl-elemt']);
        
        col01.appendChild(this.inputSystemName);
        col02.appendChild(this.inputSystemDocType);
        col03.appendChild(this.inputSystemDocNo);
        col04.appendChild(this.inputSystemLOA);
        
        col05.appendChild(this.createButtonControl('<i class="far fa-plus-square"></i>', 'Add EW System',
                                                    ['btn', 'btn-af-blue', 'btn-xs'],
                                                    //  TODO: Add Validation
                                                    (evt: MouseEvent) => {
                                                        const system: EwSystem = {
                                                            name: self.inputSystemName.value,
                                                            docType: self.inputSystemDocType.value,
                                                            doc: self.inputSystemDocNo.value,
                                                            loa: self.inputSystemLOA.value
                                                        };
                                                        let found: boolean = false;
                                                        
                                                        for (const sys of self.platform.ewSystems) {
                                                            if (sys.name === system.name) {
                                                                found = true;
                                                                console.log('EW System found...');
                                                                break;
                                                            }
                                                        }
                                                        
                                                        if (!found) {
                                                            self.ewSysCol.appendChild(self.createEwSystemRow(system));
                                                            self.platform.ewSystems.push(system);
                                                            self.reset();
                                                        } else {
                                                            alert(`EW System ${system.name} already exists on the platform!\n\nPlease remove and then try again.`);
                                                        }
                                                        
                                                    }));
        
        row.appendChild(col01);
        row.appendChild(col02);
        row.appendChild(col03);
        row.appendChild(col04);
        row.appendChild(col05);
        
        return row;
        
    }
    
    private createEwSystemRow(system: EwSystem): HTMLDivElement {
        const self = this;
        const ensureValidValue = (value: string): string => {
            if (!value || value === '') {
                return '&nbsp;';
            }
            return value;
        };
        const dict: ResourceDictionary = new ResourceDictionary();
        const docTypeOptions: KeyValuePair[] = [
            { Key: 'none', Value: 'None' },
            { Key: 'certificationLetter', Value: 'Certification Letter' },
            { Key: 'waiver', Value: 'Waiver' }
        ];
        const row: HTMLDivElement = this.createDivControl(['div-row', 'header']);
        
        for (let i = 0; i < docTypeOptions.length; i++) {
            dict.add(docTypeOptions[i].Key, docTypeOptions[i].Value);
        }        
        
        row.appendChild(this.createDivControl(['div-col-0225'], ensureValidValue(system.name)));
        row.appendChild(this.createDivControl(['div-col-0225'], ensureValidValue(dict.get(system.docType))));
        row.appendChild(this.createDivControl(['div-col-0225'], ensureValidValue(system.doc)));
        row.appendChild(this.createDivControl(['div-col-0225'], ensureValidValue(system.loa)));
        
        const btnCol: HTMLDivElement = this.createDivControl(['div-col-01']);
        
        btnCol.appendChild(this.createButtonControl('<i class="far fa-trash-alt"></i>', 'Remove EW System',
                                                    ['btn', 'btn-critical', 'btn-xs'],
                                                    //  TODO: Add Validation
                                                    (evt: MouseEvent) => {
                                                        const remove = confirm('Are you sure you want to remove the select system?');
                                                        
                                                        if (remove) {
                                                            let found: boolean = false;
                                                            
                                                            console.log('Current EW Systems: ', self.platform.ewSystems);
                                                            console.log('EW System to Remove: ', system);
                                                            
                                                            for (let i = 0; i < self.platform.ewSystems.length; i++) {
                                                                if (self.platform.ewSystems[i].name === ensureValidValue(system.name)) {
                                                                    self.platform.ewSystems.splice(i, 1);
                                                                    found = true;
                                                                    console.log('EW System found...');
                                                                    break;
                                                                }
                                                            }
                                                            
                                                            if (found) {
                                                                const parent: Node = row.parentNode;
                                                                parent.removeChild(row);
                                                            }
                                                            
                                                        }
                                                        
                                                    }));
        
        row.appendChild(btnCol);
        
        return row;
        
    }
    
    private createDivControl(classList: string[], html: string = undefined): HTMLDivElement {
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
    
    private createInputControl(classList: string[]): HTMLInputElement {
        const input: HTMLInputElement = document.createElement('input');
        
        input.type = 'text';
        
        if (classList) {
            for (const c of classList) {
                input.classList.add(c);
            }
        }
        
        return input;
        
    }
    
    private createSelectControl(classList: string[], options: KeyValuePair[]): HTMLSelectElement {
        const select: HTMLSelectElement = document.createElement('select');
        
        select.style.height = '24px';
        
        if (classList) {
            for (const c of classList) {
                select.classList.add(c);
            }
        }
        
        if (options) {
            for (const kvp of options) {
                const opt: HTMLOptionElement = document.createElement('option');
                opt.value = kvp.Key;
                opt.text = kvp.Value;
                select.options.add(opt);
            }
        }
        
        return select;
        
    }
    
    private createButtonControl(html: string, title: string, classList: string[],
                                handler: (evt: MouseEvent) => void,
                                ewSystemName: string = ''): HTMLButtonElement {
        const button: HTMLButtonElement = document.createElement('button');
        
        button.title = title;
        button.innerHTML = html;
        button.onclick = handler;
        
        if (ewSystemName !== '') {
            button.setAttribute('system-name', ewSystemName);
        }
        
        if (classList) {
            for (const c of classList) {
                button.classList.add(c);
            }
        }
        
        return button;
        
    }
    
}

class PlatformControlContainer {
    private parent: HTMLElement;
    private platforms: PlatformControl[];
    
    constructor(selector: string | HTMLElement) {
        this.parent = (selector instanceof HTMLElement ? selector : document.getElementById(selector));
        this.platforms = new Array<PlatformControl>();
        while (this.parent.children.length > 0) {
            this.parent.removeChild(this.parent.children.item(0));
        }
    }
    
    add(platform: ProductPlatform): void {
        if (!platform) { return; }
        let found: boolean = false;
        
        for (const p of this.platforms) {
            if (p.platform.name === platform.name) {
                found = true;
                break;
            }
        }
        
        if (!found) {
            const platformCtl: PlatformControl = PlatformControl.createPlatform(platform, this);
            this.parent.appendChild(platformCtl.container);
            this.platforms.push(platformCtl);
        }
        
    }
    
    get(): ProductPlatform[] {
        const platforms: ProductPlatform[] = new Array<ProductPlatform>();
        for (const platform of this.platforms) {
            platforms.push(platform.platform);
        }
        return platforms;
    }
    
    removePlatform(platform: ProductPlatform) {
        if (!platform) { return; }
        
        for (let i = 0; i < this.platforms.length; i++) {
            if (this.platforms[i].platform.name === platform.name) {
                const parent: Node = this.platforms[i].container.parentNode;
                parent.removeChild(this.platforms[i].container);
                this.platforms.splice(i, 1);
                break;
            }
        }
        
    }
    
}

export { PlatformControlContainer, PlatformControl };
