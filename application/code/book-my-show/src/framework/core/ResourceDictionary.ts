
interface KeyValuePair {
    Key: string;
    Value: any;
}

class ResourceDictionary {
    private items: KeyValuePair[];
    
    constructor() {
        this.items = new Array<KeyValuePair>();
    }
    
    add(key: string, item: any, autoUpdate: boolean = false): boolean {
        if (!this.containsKey(key)) {
            this.items.push({ Key: key, Value: item });
            return true;
        }
        else {
            if (autoUpdate) {
                return this.update(key, item);
            }
        }
        return false;
    }
    
    containsKey(key: string): boolean {
        for (const item of this.items) {
            if (item.Key === key) {
                return true;
            }
        }
        return false;
    }
    
    count(): number {
        return this.items.length;
    }
    
    delete(key: string): void {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].Key === key) {
                this.items.splice(i, 1);
                return;
            }
        }
    }
    
    get(key: string): any {
        for (const item of this.items) {
            if (item.Key === key) {
                return item.Value;
            }
        }
        return undefined;
    }
    
    item(index: number): any {
        if (index < this.items.length) {
            return this.items[index].Value;
        }
        return undefined;
    }
    
    itemArray<T>(): T[] {
        const items = [];
        for (const item of this.items) {
            items.push(item.Value);
        }
        return items;
    }
    
    update(key: string, item: any): boolean {
        for (const item of this.items) {
            if (item.Key === key) {
                item.Value = item;
                return true;
            }
        }
        return false;
    }
    
}

export { ResourceDictionary, KeyValuePair };
