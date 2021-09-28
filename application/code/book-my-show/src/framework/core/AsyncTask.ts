
const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}
  
class AsyncTask<T> {
    private onCompleted: (result: T) => void;
    private onCancelled: (result: any) => void;
    private onException: (ex: any) => void;
    
    constructor() {}
    
    completed(completed: (result: T) => void): AsyncTask<T> {
        this.onCompleted = completed;
        return this;
    }
    
    cancelled(cancelled: (result: any) => void): AsyncTask<T> {
        this.onCancelled = cancelled;
        return this;
    }
    
    exception(exception: (error: any) => void): AsyncTask<T> {
        this.onException = exception;
        return this;
    }
    
    conclude(result: T): void {
        if (this.onCompleted) {
            this.onCompleted(result);
        }
    }
    
    cancel(result: any): void {
        if (this.onCancelled) {
            this.onCancelled(result);
        }
    }
    
    reject(error: any): void {
        if (this.onException) {
            this.onException(error);
        }
    }
    
}

export { AsyncTask, sleep };
