import { Service } from '../../framework/decorators/Service';
import { AsyncTask } from '../../framework/core/AsyncTask';
import { KeyValuePair } from '../../framework/core/ResourceDictionary';
import { HttpRequest, HttpRequestConfig } from '../../framework/providers/HttpRequest';

import { ProductReview } from '../models/product/ProductReview.Interface';
import { EmitterHistory } from '../models/emitters/EmitterHistory.Interface';

import { appConfig, endpoints } from '../config';
@Service()
class ProductReviewService {
    private http: HttpRequest;
    
    constructor() {
        const reqConfig: HttpRequestConfig = { headers: new Array<KeyValuePair>(), BasePath: endpoints.get('ProductReviewBasePath'), EnableCors: true };
        reqConfig.headers.push({Key: 'accept', Value: 'application/json'});
        reqConfig.headers.push({Key: 'content-type', Value: 'application/json'});
        if (appConfig.Token !== '') {
            reqConfig.headers.push({ Key: 'authorization', Value: `Bearer ${appConfig.Token}`});
        }
        this.http = new HttpRequest(reqConfig);
    }
  
    public getProductReview(productID: number): AsyncTask<ProductReview> {
        return this.http.get<ProductReview>(`productreviews/${productID}`);
    }
  
}
  
export { ProductReviewService };