import { BindingElement } from '@Framework/models/BindingElement.Interface';
import { IBoundField } from '../UI/BoundField';
import { BoundFieldFactory } from '../UI/BoundFieldFactory';

abstract class UIBase {
    
    protected monitorInterval: number[];
    
    protected bindings: IBoundField[];
    
    constructor() {
        this.bindings = new Array<IBoundField>();
        this.monitorInterval = new Array<number>();
    }
    
    protected dispose() {
        if (this.monitorInterval) {
            while (this.monitorInterval.length > 0) {
                const id: number[] = this.monitorInterval.splice(0, 1);
                clearInterval(id[0]);
            }
            this.monitorInterval = undefined;
        }
    }
    
    protected watchProperty(binding: BindingElement) {
        const self = this;
        let keyDown: boolean = false;
        let oldValue: string = '';
        
        binding.Element.addEventListener('keydown', (evt: Event) => {
            keyDown = true;
        });
        
        binding.Element.addEventListener('keyup', (evt: Event) => {
            keyDown = false;
        });
        
        this.monitorInterval = new Array<number>();
        this.monitorInterval.push(setInterval((b: BindingElement) =>
        {
            const el: Element = b.Element;
            const prop: string = b.Model;
            let value: string = el.innerHTML;
            const obj = self.getObject(prop);

            if (obj) {

                if (prop.indexOf(".") > -1) {
                    let parts = prop.split(".");

                    switch (parts.length) {
                        case 2:
                            value = self.getDynamicValue(obj[parts[1]], el.innerHTML);
                            break;
                        case 3:
                            value = self.getDynamicValue(obj[parts[2]], el.innerHTML);
                            break;
                        case 4:
                            value = self.getDynamicValue(obj[parts[3]], el.innerHTML);
                            break;
                        case 5:
                            value = self.getDynamicValue(obj[parts[4]], el.innerHTML);
                            break;
                    }

                } else {
                    value = self.getDynamicValue(self[prop], el.innerHTML);
                }

            }

            // if (transformFunction && typeof this[transformFunction] === "function") {
            //     value = this[transformFunction](value, prop);
            // }

            if (!keyDown && (value !== oldValue)) {
                el.innerHTML = self.removeEscapeChars(value);
                oldValue = self.removeEscapeChars(value);
            }
            

        }, 200, binding));

    }

    protected bindInputFields(view: HTMLElement) {
        const boundFields: Array<Element> = Array.from(view.querySelectorAll('[binding]'));
        
        if (boundFields) {
            for (const field of boundFields) {
                const element: HTMLElement = field as HTMLElement;
                const binding: IBoundField = BoundFieldFactory.CreateBoundField(this, element);
                this.bindings.push(binding);
            }
        }
        
    }
    
    private getDynamicValue(model: any, defaultValue: string): string {

        if (model !== undefined)
        {
            return model;
        }
        else
        {
            return defaultValue;
        }

    }

    private getObject(model: string): Object {
        var obj: Object;

        if (model.indexOf(".") > -1)
        {
            var parts = model.split(".");

            switch (parts.length)
            {
                case 2:
                    if (!this[parts[0]])
                    {
                        this[parts[0]] = new Object();
                    }

                    obj = this[parts[0]];

                    break;
                case 3:
                    if (!this[parts[0]])
                    {
                        this[parts[0]] = new Object();
                    }

                    if (!this[parts[0]][parts[1]])
                    {
                        this[parts[0]][parts[1]] = new Object();
                    }

                    obj = this[parts[0]][parts[1]];

                    break;
                case 4:
                    if (!this[parts[0]])
                    {
                        this[parts[0]] = new Object();
                    }

                    if (!this[parts[0]][parts[1]])
                    {
                        this[parts[0]][parts[1]] = new Object();
                    }

                    if (!this[parts[0]][parts[1]][parts[2]])
                    {
                        this[parts[0]][parts[1]][parts[2]] = new Object();
                    }

                    obj = this[parts[0]][parts[1]][parts[2]];

                    break;
                case 5:
                    if (!this[parts[0]])
                    {
                        this[parts[0]] = new Object();
                    }

                    if (!this[parts[0]][parts[1]])
                    {
                        this[parts[0]][parts[1]] = new Object();
                    }

                    if (!this[parts[0]][parts[1]][parts[2]])
                    {
                        this[parts[0]][parts[1]][parts[2]] = new Object();
                    }

                    if (!this[parts[0]][parts[1]][parts[2]][parts[3]])
                    {
                        this[parts[0]][parts[1]][parts[2]][parts[3]] = new Object();
                    }

                    obj = this[parts[0]][parts[1]][parts[2]][parts[3]];

                    break;
            }

        }
        else
        {

            obj = this;

        }

        return obj;

    }

    private getModelValue(model: string): any {
        var value: any;

        if (model.indexOf(".") > -1)
        {
            var parts = model.split(".");

            switch (parts.length)
            {
                case 2:
                    this[parts[0]] = this.ensureObjectExists(this[parts[0]]);
                    this[parts[0]][parts[1]] = (this[parts[0]][parts[1]] ? this[parts[0]][parts[1]] : "");
                    value = this[parts[0]][parts[1]];
                    break;
                case 3:
                    this[parts[0]] = this.ensureObjectExists(this[parts[0]]);
                    this[parts[0]][parts[1]] = this.ensureObjectExists(this[parts[0]][parts[1]]);
                    this[parts[0]][parts[1]][parts[2]] = (this[parts[0]][parts[1]][parts[2]] ? this[parts[0]][parts[1]][parts[2]] : "");
                    value = this[parts[0]][parts[1]][parts[2]];
                    break;
                case 4:
                    this[parts[0]] = this.ensureObjectExists(this[parts[0]]);
                    this[parts[0]][parts[1]] = this.ensureObjectExists(this[parts[0]][parts[1]]);
                    this[parts[0]][parts[1]][parts[2]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]] = (this[parts[0]][parts[1]][parts[2]][parts[3]] ? this[parts[0]][parts[1]][parts[2]][parts[3]] : "");
                    value = this[parts[0]][parts[1]][parts[2]][parts[3]];
                    break;
                case 5:
                    this[parts[0]] = this.ensureObjectExists(this[parts[0]]);
                    this[parts[0]][parts[1]] = this.ensureObjectExists(this[parts[0]][parts[1]]);
                    this[parts[0]][parts[1]][parts[2]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = (this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] ? this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] : "");
                    value = this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]];
                    break;
                case 6:
                    this[parts[0]] = this.ensureObjectExists(this[parts[0]]);
                    this[parts[0]][parts[1]] = this.ensureObjectExists(this[parts[0]][parts[1]]);
                    this[parts[0]][parts[1]][parts[2]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = (this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] ? this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] : "");
                    value = this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]];
                    break;
                case 7:
                    this[parts[0]] = this.ensureObjectExists(this[parts[0]]);
                    this[parts[0]][parts[1]] = this.ensureObjectExists(this[parts[0]][parts[1]]);
                    this[parts[0]][parts[1]][parts[2]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] = (this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] ? this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] : "");
                    value = this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]];
                    break;
                case 8:
                    this[parts[0]] = this.ensureObjectExists(this[parts[0]]);
                    this[parts[0]][parts[1]] = this.ensureObjectExists(this[parts[0]][parts[1]]);
                    this[parts[0]][parts[1]][parts[2]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]] = (this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]] ? this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]] : "");
                    value = this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]];
                    break;
                case 9:
                    this[parts[0]] = this.ensureObjectExists(this[parts[0]]);
                    this[parts[0]][parts[1]] = this.ensureObjectExists(this[parts[0]][parts[1]]);
                    this[parts[0]][parts[1]][parts[2]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]] = (this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]] ? this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]] : "");
                    value = this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]];
                    break;
                case 10:
                    this[parts[0]] = this.ensureObjectExists(this[parts[0]]);
                    this[parts[0]][parts[1]] = this.ensureObjectExists(this[parts[0]][parts[1]]);
                    this[parts[0]][parts[1]][parts[2]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]][parts[9]] = (this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]][parts[9]] ? this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]][parts[9]] : "");
                    value = this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]][parts[9]];
                    break;
                default:

            }
        }
        else
        {
            this[model] = (this[model] ? this[model] : "");
            value = this[model];
        }

        return value;

    }

    private setModelValue(model: string, value: string): string {

        if (model.indexOf(".") > -1)
        {
            var parts = model.split(".");

            switch (parts.length)
            {
                case 2:
                    this[parts[0]] = this.ensureObjectExists(this[parts[0]]);
                    this[parts[0]][parts[1]] = value;
                    break;
                case 3:
                    this[parts[0]] = this.ensureObjectExists(this[parts[0]]);
                    this[parts[0]][parts[1]] = this.ensureObjectExists(this[parts[0]][parts[1]]);
                    this[parts[0]][parts[1]][parts[2]] = value;
                    break;
                case 4:
                    this[parts[0]] = this.ensureObjectExists(this[parts[0]]);
                    this[parts[0]][parts[1]] = this.ensureObjectExists(this[parts[0]][parts[1]]);
                    this[parts[0]][parts[1]][parts[2]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]] = value;
                    break;
                case 5:
                    this[parts[0]] = this.ensureObjectExists(this[parts[0]]);
                    this[parts[0]][parts[1]] = this.ensureObjectExists(this[parts[0]][parts[1]]);
                    this[parts[0]][parts[1]][parts[2]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = value;
                    break;
                case 6:
                    this[parts[0]] = this.ensureObjectExists(this[parts[0]]);
                    this[parts[0]][parts[1]] = this.ensureObjectExists(this[parts[0]][parts[1]]);
                    this[parts[0]][parts[1]][parts[2]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = value;
                    break;
                case 7:
                    this[parts[0]] = this.ensureObjectExists(this[parts[0]]);
                    this[parts[0]][parts[1]] = this.ensureObjectExists(this[parts[0]][parts[1]]);
                    this[parts[0]][parts[1]][parts[2]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] = value;
                    break;
                case 8:
                    this[parts[0]] = this.ensureObjectExists(this[parts[0]]);
                    this[parts[0]][parts[1]] = this.ensureObjectExists(this[parts[0]][parts[1]]);
                    this[parts[0]][parts[1]][parts[2]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]] = value;
                    break;
                case 9:
                    this[parts[0]] = this.ensureObjectExists(this[parts[0]]);
                    this[parts[0]][parts[1]] = this.ensureObjectExists(this[parts[0]][parts[1]]);
                    this[parts[0]][parts[1]][parts[2]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]] = value;
                    break;
                case 10:
                    this[parts[0]] = this.ensureObjectExists(this[parts[0]]);
                    this[parts[0]][parts[1]] = this.ensureObjectExists(this[parts[0]][parts[1]]);
                    this[parts[0]][parts[1]][parts[2]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]] = this.ensureObjectExists(this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]]);
                    this[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]][parts[9]] = value;
                    break;
                default:

            }
        }
        else
        {
            this[model] = (this[model] ? this[model] : "");
            value = this[model];
        }

        return value;

    }

    private ensureObjectExists(obj: Object): Object {

        if (obj)
        {
            return obj;
        }
        else
        {
            return new Object();
        }

    }

    protected removeEscapeChars(text: string): string {
        try
        {
            return decodeURIComponent(text);
        }
        catch (e)
        {
            return text;
        }
    };
    
}

export { UIBase };