import { Service } from '../../framework/decorators/Service';
import { AsyncTask } from '../../framework/core/AsyncTask';
import { KeyValuePair } from '../../framework/core/ResourceDictionary';
import { HttpRequest, HttpRequestConfig } from '../../framework/providers/HttpRequest';

import { LdapUser } from '../models/auth/LdapUser.Interface';
import { LoginResponse } from '../models/auth/LoginResponse.Interface';
import { MiscResponse } from '../models/auth/MiscResponse.Interface';

import { appConfig, endpoints } from '../config';

@Service()
class UserAuthService {
    private http: HttpRequest;
    
    constructor() {
        const reqConfig: HttpRequestConfig = { headers: new Array<KeyValuePair>(), BasePath: endpoints.get('AuthBasePath'), EnableCors: true };
        reqConfig.headers.push({Key: 'accept', Value: 'application/json'});
        reqConfig.headers.push({Key: 'content-type', Value: 'application/json'});
        
        if (appConfig.Token !== '') {
            reqConfig.headers.push({ Key: 'authorization', Value: `Bearer ${appConfig.Token}`});
        }
        this.http = new HttpRequest(reqConfig);
    }
  
    public getUser(): AsyncTask<LdapUser> {
        return this.http.get<LdapUser>('user');
    }
  
    logout(): AsyncTask<MiscResponse> {
        return this.http.put<MiscResponse>('logout', '');
    }
    
}
  
export { UserAuthService };