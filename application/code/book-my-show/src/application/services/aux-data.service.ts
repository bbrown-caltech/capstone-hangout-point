import { Service } from '../../framework/decorators/Service';
import { AsyncTask } from '../../framework/core/AsyncTask';
import { KeyValuePair } from '../../framework/core/ResourceDictionary';
import { HttpRequest, HttpRequestConfig } from '../../framework/providers/HttpRequest';

import { Country } from '../models/aux-data/Country.Interface';
import { Platform } from '../models/aux-data/Platform.Interface';
import { MilitaryService } from '../models/aux-data/Service.Interface';
import { appConfig, endpoints } from '../config';

@Service()
class AuxDataService {
    private http: HttpRequest;
    
    constructor(http?: HttpRequest) {
        
        if (http !== undefined && http !== null && http.configFileValid()) {
            this.http = http;
        }
        else {
            const reqConfig: HttpRequestConfig = { headers: new Array<KeyValuePair>(), BasePath: endpoints.get('AuxDataBasePath'), EnableCors: true };
            reqConfig.headers.push({Key: 'accept', Value: 'application/json'});
            reqConfig.headers.push({Key: 'content-type', Value: 'application/json'});
            if (appConfig.Token !== '') {
            reqConfig.headers.push({ Key: 'authorization', Value: `Bearer ${appConfig.Token}`});
            }
            this.http = new HttpRequest(reqConfig);
        }
        
    }
  
    public getCountries(): AsyncTask<Country[]> {
        return this.http.get<Country[]>('countries');
    }
  
    public getPlatforms(): AsyncTask<Platform[]> {
        return this.http.get<Platform[]>('platforms');
    }
  
    public getServices(): AsyncTask<MilitaryService[]> {
        return this.http.get<MilitaryService[]>('services');
    }
  
}
  
export { AuxDataService };