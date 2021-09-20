import { DataTypeArgs } from './Application';
import { ResourceDictionary } from './ResourceDictionary';
import { DateFormatProvider } from '../providers/DateFormatProvider';

interface DataViewFilterField {
    FieldName: string;
    InputControlID: string;
    DataType: DataTypeArgs;
    transformer?: (value: any) => any;
}

class FilterField implements DataViewFilterField {
    FieldName: string;
    InputControlID: string;
    DataType: DataTypeArgs;
    input: HTMLInputElement;
    transformer?: (value: any) => any;
    
    constructor(fieldName: string,
                inputControlID: string,
                dataType: DataTypeArgs) {
        this.FieldName = fieldName;
        this.InputControlID = inputControlID;
        this.DataType = dataType;
        this.input = document.getElementById(this.InputControlID) as HTMLInputElement;
    }
    
    FilterValue(): string {
        if (this.input) {
            return this.input.value;
        }
        return '';
    }
    
}

class DataViewFilter {
    private filterItems: ResourceDictionary;
    private predicate: (item: any) => boolean;
    
    constructor(predicate?: (item: any) => boolean) {
        this.predicate = predicate;
        this.filterItems = new ResourceDictionary();
    }
    
    Add(viewFilterFields: DataViewFilterField[]) {
        if (!viewFilterFields) { return; }
        
        for (const vff of viewFilterFields) {
            if (!vff.transformer) {
                vff.transformer = (value: any): any => {
                    return value;
                }
            }
            const field: FilterField = new FilterField(vff.FieldName, vff.InputControlID, vff.DataType);
            this.filterItems.add(field.FieldName, field, true);
        }
        
    }
    
    items(): FilterField[] {
        return this.filterItems.itemArray<FilterField>();
    }
    
    Filter(data: any[], field: FilterField): any[] {
        if (!data) { return []; }
        
        if (this.predicate) {
            return data.filter(this.predicate);
        }
        
        if (!field.transformer) {
            field.transformer = (value: any): any => {
                return value;
            }
        }
        
        const self = this;
        
        return data.filter((item: any) => {
            const compareDates = (d1: any, d2: any): boolean => {
                if (DateFormatProvider.dateValid(d1) && DateFormatProvider.dateValid(d2)) {
                    const dateOne: Date = new Date(d1);
                    const dateTwo: Date = new Date(d2);
                    return (dateOne >= dateTwo);
                }
                return true;
            }
            
            switch (field.DataType) {
                case DataTypeArgs.Int:
                    const intOne: number = (!isNaN(parseInt(field.transformer(item[field.FieldName]))) ? parseInt(field.transformer(item[field.FieldName])) : -1);
                    const intTwoAsString: string = field.FilterValue();
                    const intTwo: number = (!isNaN(parseInt(intTwoAsString)) ? parseInt(intTwoAsString) : -1);
                    const firstIntIsNumber: boolean = (!isNaN(parseInt(field.transformer(item[field.FieldName]))));
                    const secondIntIsNumber: boolean = (!isNaN(parseInt(intTwoAsString)));
                    
                    if (firstIntIsNumber)
                    {
                        if (secondIntIsNumber)
                        {
                            return (intOne >= intTwo);
                        }
                        else {
                            return true;
                        }
                    }
                    
                    break;
                case DataTypeArgs.Float:
                    const floatOne: number = (!isNaN(parseFloat(field.transformer(item[field.FieldName]))) ? parseFloat(field.transformer(item[field.FieldName])) : -1);
                    const floatTwoAsString: string = field.FilterValue();
                    const floatTwo: number = (!isNaN(parseFloat(floatTwoAsString)) ? parseFloat(floatTwoAsString) : -1);
                    const firstFloatIsNumber: boolean = (!isNaN(parseFloat(field.transformer(item[field.FieldName]))));
                    const secondFloatIsNumber: boolean = (!isNaN(parseFloat(floatTwoAsString)));

                    if (firstFloatIsNumber)
                    {
                        if (secondFloatIsNumber)
                        {
                            return (floatOne >= floatTwo);
                        }
                        else {
                            return true;
                        }
                    }

                    break;
                case DataTypeArgs.Date:
                    const dateMatchFound: boolean = compareDates(field.transformer(item[field.FieldName]), field.FilterValue());

                    if (dateMatchFound)
                    {
                        return true;
                    }

                    break;
                case DataTypeArgs.Time:
                    const timeMatchFound: boolean = compareDates("1/1/1900 " + field.transformer(item[field.FieldName]), "1/1/1900 " + field.FilterValue());

                    if (timeMatchFound)
                    {
                        return true;
                    }

                    break;
                case DataTypeArgs.DateTime:
                    const dateTimeMatchFound: boolean = compareDates(field.transformer(item[field.FieldName]), field.FilterValue());

                    if (dateTimeMatchFound)
                    {
                        return true;
                    }

                    break;
                default:    //  String
                    console.log(field.FieldName);
                    const stringOne: string = field.transformer(item[field.FieldName].toString()).toString().toLowerCase();
                    const stringTwo: string = field.FilterValue().toString().toLowerCase();
                    const rgx = new RegExp(`.*(${stringTwo}).*`);

                    if (stringOne.match(rgx))
                    {
                        return true;
                    }
                    

                    break;
            }
            
            
            return false;
            
        });
        
    }
    
}

export { DataViewFilter, FilterField, DataViewFilterField };
