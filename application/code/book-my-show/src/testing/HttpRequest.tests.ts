import { IHttpRequest, HttpRequestConfig } from '../framework/providers/HttpRequest';
import { AsyncTask } from '../framework/core/AsyncTask';

class HttpRequest implements IHttpRequest {
    
    constructor(public config: HttpRequestConfig) {}
    
    loadFile(fileName: string): AsyncTask<string> {
        const self = this;
        const task: AsyncTask<string> = new AsyncTask<string>();
        
        setTimeout(() => {
            if (self.config.mockResults === true && self.config.results) {
                task.conclude(self.config.results as string);
            } else {
                task.reject('Invalid mock request parameters.');
            }
        }, 500);
        
        return task;
    }

    get<T>(endpoint: string): AsyncTask<T> {
        const self = this;
        const task: AsyncTask<T> = new AsyncTask<T>();
        
        setTimeout(() => {
            if (self.config.mockResults === true && self.config.results) {
                task.conclude(self.config.results as T);
            } else {
                task.reject('Invalid mock request parameters.');
            }
        }, 500);
        
        return task;
    }
    
    post<T>(endpoint: string, body: string): AsyncTask<T> {
        const self = this;
        const task: AsyncTask<T> = new AsyncTask<T>();
        
        setTimeout(() => {
            if (self.config.mockResults === true && self.config.results) {
                task.conclude(self.config.results as T);
            } else {
                task.reject('Invalid mock request parameters.');
            }
        }, 500);
        
        return task;
    }
    
    put<T>(endpoint: string, body: string): AsyncTask<T> {
        const self = this;
        const task: AsyncTask<T> = new AsyncTask<T>();
        
        setTimeout(() => {
            if (self.config.mockResults === true && self.config.results) {
                task.conclude(self.config.results as T);
            } else {
                task.reject('Invalid mock request parameters.');
            }
        }, 500);
        
        return task;
    }

    configFileValid(): boolean {
        return (this.config !== undefined && this.config !== null);
    }

}

export { HttpRequest };