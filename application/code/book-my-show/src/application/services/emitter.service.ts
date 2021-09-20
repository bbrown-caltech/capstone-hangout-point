import { Service } from '../../framework/decorators/Service';
import { AsyncTask } from '../../framework/core/AsyncTask';
import { KeyValuePair } from '../../framework/core/ResourceDictionary';
import { HttpRequest, HttpRequestConfig } from '../../framework/providers/HttpRequest';

import { Emitter } from '../models/emitters/Emitter.Interface';
import { appConfig, endpoints } from '../config';

@Service()
class EmitterService {
    private http: HttpRequest;
    
    constructor() {
        const reqConfig: HttpRequestConfig = { headers: new Array<KeyValuePair>(), BasePath: endpoints.get('EmitterServiceBasePath'), EnableCors: true };
        reqConfig.headers.push({Key: 'accept', Value: 'application/json'});
        reqConfig.headers.push({Key: 'content-type', Value: 'application/json'});
        if (appConfig.Token !== '') {
           reqConfig.headers.push({ Key: 'authorization', Value: `Bearer ${appConfig.Token}`});
        }
        this.http = new HttpRequest(reqConfig);
    }
  
    public getEmitters(): AsyncTask<Emitter[]> {
        return this.http.get<Emitter[]>('emitters');
    }
  
}
  
export { EmitterService };