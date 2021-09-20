import { ResourceDictionary } from './ResourceDictionary';

enum SortDirectionArgs {
    Unosrted = 0,
    Ascending = 1,
    Descending = 2
}

interface DataSortField {
    FieldName: string;
    SortDirection: SortDirectionArgs;
}

class DataSorter {
    private sortFields: ResourceDictionary;
    
    constructor(fieldNames: string[]) {
        this.sortFields = new ResourceDictionary();
        
        if (fieldNames) {
            for (const fn of fieldNames) {
                const sortField: DataSortField = { FieldName: fn, SortDirection: SortDirectionArgs.Unosrted };
                this.sortFields.add(fn, sortField);
            }
        }
        
    }
    
    sort(data: any[], fieldName: string, transformer?: (value: any) => any) {
        if (!this.sortFields.containsKey(fieldName)) { return data; }
        
        const self = this;
        const sortField: DataSortField = self.sortFields.get(fieldName) as DataSortField;
        
        if (!transformer) {
            transformer = (value: any): any => {
                return value;
            }
        }
        
        if (sortField.SortDirection !== SortDirectionArgs.Ascending) {
            sortField.SortDirection = SortDirectionArgs.Ascending;
            data.sort((a, b) => 
                (transformer(a[fieldName]) > transformer(b[fieldName])) ? 1 : ((transformer(b[fieldName]) > transformer(a[fieldName])) ? -1 : 0)
            );
        } else {
            sortField.SortDirection = SortDirectionArgs.Descending;
            data.sort((a, b) =>
                (transformer(a[fieldName]) < transformer(b[fieldName])) ? 1 : ((transformer(b[fieldName]) < transformer(a[fieldName])) ? -1 : 0)
            );
        }
        
        self.sortFields.update(fieldName, sortField);
        
    }
    
}

export { DataSorter, DataSortField, SortDirectionArgs };