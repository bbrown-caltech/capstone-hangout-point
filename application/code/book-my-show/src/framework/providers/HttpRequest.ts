import { AsyncTask } from '../core/AsyncTask';
import { KeyValuePair } from '../core/ResourceDictionary';

interface HttpRequestConfig {
    headers: KeyValuePair[];
    BasePath: string;
    EnableCors: boolean;
    mockResults?: boolean;
    results?: any;
}

interface IHttpParams {
    set(key: string, value: string): void;
    toQueryParamString(): string;
}

class HttpParams implements IHttpParams {
    private params: KeyValuePair[];
    
    constructor() {
        this.params = new Array<KeyValuePair>();
    }
    
    set(key: string, value: string): void {
        this.params.push({ Key: key, Value: value});
    }
    
    toQueryParamString(): string {
        let queryParamString: string = '?';
        
        for (let i: number = 0; i < this.params.length; i++) {
            queryParamString += `${this.params[i].Key}=${encodeURIComponent(this.params[i].Value)}${(i < (this.params.length - 1) ? '&' : '')}`;
        }
        
        return queryParamString;
        
    }
    
}

interface IHttpRequest {
    loadFile(fileName: string): AsyncTask<string>;
    get<T>(endpoint: string): AsyncTask<T>;
    post<T>(endpoint: string, body: string): AsyncTask<T>;
    put<T>(endpoint: string, body: string): AsyncTask<T>;
    configFileValid(): boolean;
}

class HttpRequest implements IHttpRequest {
    
    constructor(public config: HttpRequestConfig) {}
    
    loadFile(fileName: string): AsyncTask<string> {
        const task: AsyncTask<string> = new AsyncTask<string>();
        const filePath: string = `${this.config.BasePath}/${fileName}`;
        let headers = {};
        
        if (this.config.EnableCors) {
            headers = this.corsHeaders('GET');
        }
        
        if (this.config.headers) {
            this.config.headers.forEach((pair: KeyValuePair, idx: number, ary: KeyValuePair[]) => {
               headers[pair.Key] = pair.Value; 
            });
        }
        
        fetch(filePath, {
            method: 'GET',
            headers: headers,
            mode: 'cors'
        }).then((response: Response) => {
            if (response.ok) {
                return response.text();
            }
            else {
                task.reject(response);
            }
        }).then((value: string) => {
            task.conclude(value);
        }).catch((err: any) => {
            task.reject(err);
        });

        return task;
    }

    get<T>(endpoint: string): AsyncTask<T> {
        const self = this;
        const task: AsyncTask<T> = new AsyncTask<T>();
        const finalEndpoint: string = `${this.config.BasePath}/${endpoint}`;
        let headers = {};
        
        if (this.config.EnableCors) {
            headers = this.corsHeaders('GET');
        }
        
        if (this.config.headers) {
            this.config.headers.forEach((pair: KeyValuePair, idx: number, ary: KeyValuePair[]) => {
               headers[pair.Key] = pair.Value; 
            });
        }
        
        fetch(finalEndpoint, {
            method: 'GET',
            headers: headers,
            mode: 'cors'
        }).then((response: Response) => {
            if (response.ok) {
                if (self.config.mockResults === true && self.config.results) {
                    return self.config.results;
                } else {
                    return response.json();
                }
            }
            else {
                task.reject(response);
            }
        }).then((value: any) => {
            
            try {
                task.conclude(value as T);
            } catch {
                console.error(value);
                task.reject('Parse exception occurred.');
            }
            
        }).catch((err: any) => {
            console.error('Rejected: ', err);
            task.reject(err);
        });

        return task;
    }
    
    post<T>(endpoint: string, body: string): AsyncTask<T> {
        const self = this;
        const task: AsyncTask<T> = new AsyncTask<T>();
        const finalEndpoint: string = `${this.config.BasePath}/${endpoint}`;
        let headers = {};
        
        if (this.config.EnableCors) {
            headers = this.corsHeaders('POST');
        }
        
        if (this.config.headers) {
            this.config.headers.forEach((pair: KeyValuePair, idx: number, ary: KeyValuePair[]) => {
               headers[pair.Key] = pair.Value; 
            });
        }
        
        fetch(finalEndpoint, {
            method: 'POST',
            headers: headers,
            mode: 'cors',
            body: body
        }).then((response: Response) => {
            if (response.ok) {
                if (self.config.mockResults === true && self.config.results) {
                    return self.config.results;
                } else {
                    return response.json();
                }
            }
            else {
                task.reject(response);
            }
        }).then((value: any) => {
            
            try {
                task.conclude(value as T);
            } catch {
                console.error(value);
                task.reject('Parse exception occurred.');
            }
            
        }).catch((err: any) => {
            task.reject(err);
        });

        return task;
    }
    
    put<T>(endpoint: string, body: string): AsyncTask<T> {
        const task: AsyncTask<T> = new AsyncTask<T>();
        const finalEndpoint: string = `${this.config.BasePath}/${endpoint}`;
        let headers = {};
        
        if (this.config.EnableCors) {
            headers = this.corsHeaders('PUT');
        }
        
        if (this.config.headers) {
            this.config.headers.forEach((pair: KeyValuePair, idx: number, ary: KeyValuePair[]) => {
               headers[pair.Key] = pair.Value; 
            });
        }
        
        fetch(finalEndpoint, {
            method: 'PUT',
            headers: headers,
            mode: 'cors',
            body: body
        }).then((response: Response) => {
            if (response.ok) {
                return response.json();
            }
            else {
                task.reject(response);
            }
        }).then((value: any) => {
            
            try {
                task.conclude(value as T);
            } catch {
                console.error(value);
                task.reject('Parse exception occurred.');
            }
            
        }).catch((err: any) => {
            task.reject(err);
        });

        return task;
    }

    configFileValid(): boolean {
        return (this.config !== undefined && this.config !== null);
    }

    private corsHeaders(method: string): any {
        return {
            'Access-Control-Request-Method': method,
            'Access-Control-Request-Headers': 'access-control-allow-methods,Access-Control-Allow-Methods,access-control-allow-headers,Access-Control-Allow-Headers,access-control-allow-origin,Access-Control-Allow-Origin,content-type,accept,datatoken,Authorization,authorization'
        }
    }

}

export { IHttpRequest, HttpRequest, HttpRequestConfig, IHttpParams, HttpParams };
