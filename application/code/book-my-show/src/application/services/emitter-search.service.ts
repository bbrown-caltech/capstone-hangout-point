import { Service } from '../../framework/decorators/Service';
import { AsyncTask } from '../../framework/core/AsyncTask';
import { KeyValuePair } from '../../framework/core/ResourceDictionary';
import { HttpRequest, HttpRequestConfig } from '../../framework/providers/HttpRequest';

import { EmitterSearchParameter } from '../models/emitters/EmitterSearchParameter.Interface';
import { EmitterSearchResult, EmitterHistory } from '../models/emitters/EmitterSearchResult.Interface';
import { appConfig, endpoints } from '../config';

@Service()
class EmitterSearchService {
    private http: HttpRequest;
    
    constructor(http?: HttpRequest) {
        
        if (http !== undefined && http !== null && http.configFileValid()) {
            this.http = http;
        } else {
            const reqConfig: HttpRequestConfig = { headers: new Array<KeyValuePair>(), BasePath: endpoints.get('SearchServiceBasePath'), EnableCors: true };
            reqConfig.headers.push({Key: 'accept', Value: 'application/json'});
            reqConfig.headers.push({Key: 'content-type', Value: 'application/json'});
            if (appConfig.Token !== '') {
            reqConfig.headers.push({ Key: 'authorization', Value: `Bearer ${appConfig.Token}`});
            }
            this.http = new HttpRequest(reqConfig);
        }
        
    }
  
    public getSearchEmitters(parameter: Partial<EmitterSearchParameter>): AsyncTask<EmitterHistory[]> {
        const task: AsyncTask<EmitterHistory[]> = new AsyncTask<EmitterHistory[]>();
        const dateString: string = (new Date()).getMilliseconds().toString();
        
        this.http.post<EmitterSearchResult>(`search/elnots?dateString=${dateString}`, JSON.stringify(parameter))
        .completed((result: EmitterSearchResult) => {
            task.conclude(result.elnots);
        }).exception((error: any) => {
           console.log('EmitterSearchService - getSearchEmitters: ', error); 
        });
        
        return task;
        
    }
  
}
  
export { EmitterSearchService };