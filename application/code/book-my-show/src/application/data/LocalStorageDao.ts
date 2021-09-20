import { AsyncTask } from '../../framework/core/AsyncTask';

class TableInfo {
    public TableName: string;
    public PrimaryFieldName: string;
    public PrimaryIndexName: string;
}

class LocalStorageDao {
    private indexDb: IDBFactory;
    private db: IDBDatabase;
    private dbName: string;
    
    public Tables: TableInfo[];
    public ready: boolean;
    
    constructor(name: string) {
        this.ready = false;
        this.dbName = name;
        this.indexDb = window.indexedDB;
        this.Tables = new Array<TableInfo>();
    }
    
    initDb() {
        const self = this;
        const openReq: IDBOpenDBRequest = this.indexDb.open(this.dbName);
        openReq.onupgradeneeded = (ev: IDBVersionChangeEvent) => {
            self.db = (ev.target as IDBOpenDBRequest).result;
            for (const ti of self.Tables) {
                const params: IDBObjectStoreParameters = {
                    keyPath: ti.PrimaryFieldName
                };
                const table: IDBObjectStore = self.db.createObjectStore(ti.TableName, params);
                table.createIndex(ti.PrimaryIndexName, ti.PrimaryFieldName);
            }
            self.ready = true;
        };
        openReq.onerror = (ev: Event) => {
            console.log('Database Error: ', (ev.target as IDBOpenDBRequest).error);
        };
        openReq.onsuccess = (ev: Event) => {
            self.db = (ev.target as IDBOpenDBRequest).result;
            self.ready = true;
        }
    }
    
    getOne<T>(tableName: string, id: any): AsyncTask<T> {
        const task: AsyncTask<T> = new AsyncTask<T>();
        const transaction: IDBTransaction = this.db.transaction(tableName, 'readonly');
        const table: IDBObjectStore = transaction.objectStore(tableName);
        const request: IDBRequest<T> = table.get(id);
        
        request.onsuccess = (ev: Event) => {
            task.conclude(request.result);
        }
        
        request.onerror = (ev: Event) => {
            task.reject(request.error);
        }
        
        return task;
        
    }
    
    getMany<T>(tableName: string, criteria: IDBKeyRange): AsyncTask<T[]> {
        const task: AsyncTask<T[]> = new AsyncTask<T[]>();
        const transaction: IDBTransaction = this.db.transaction(tableName, 'readonly');
        const table: IDBObjectStore = transaction.objectStore(tableName);
        const request: IDBRequest<T[]> = table.getAll(criteria);
        
        request.onsuccess = (ev: Event) => {
            task.conclude(request.result);
        }
        
        request.onerror = (ev: Event) => {
            task.reject(request.error);
        }
        
        return task;
        
    }
    
    save<T>(tableName: string, obj: T, key?: IDBValidKey): AsyncTask<IDBValidKey> {
        const task: AsyncTask<IDBValidKey> = new AsyncTask<IDBValidKey>();
        const transaction: IDBTransaction = this.db.transaction(tableName, 'readwrite');
        const table: IDBObjectStore = transaction.objectStore(tableName);
        const request: IDBRequest<IDBValidKey> = table.put(obj);
        
        request.onsuccess = (ev: Event) => {
            task.conclude(request.result);
        }
        
        request.onerror = (ev: Event) => {
            task.reject(request.error);
        }
        
        return task;
        
    }
    
}

export { LocalStorageDao, TableInfo }