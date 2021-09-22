import { Service } from '../../framework/decorators/Service';
import { AsyncTask } from '../../framework/core/AsyncTask';
import { KeyValuePair } from '../../framework/core/ResourceDictionary';
import { IHttpRequest, HttpRequest, HttpRequestConfig } from '../../framework/providers/HttpRequest';

import { Booking } from '../models/Booking.Interface';
import { appConfig, endpoints } from '../config';

@Service()
class BookingService {
    private http: IHttpRequest;
    
    constructor(http?: IHttpRequest) {
        const configFileValid: boolean = (typeof http['configFileValid'] === 'function' && http.configFileValid());
        if (http !== undefined && http !== null && configFileValid) {
            this.http = http;
        }
        else {
            const reqConfig: HttpRequestConfig = { headers: new Array<KeyValuePair>(), BasePath: endpoints.get('BookingBasePath'), EnableCors: true };
            reqConfig.headers.push({Key: 'accept', Value: 'application/json'});
            reqConfig.headers.push({Key: 'content-type', Value: 'application/json'});
            if (appConfig.Token !== '') {
                reqConfig.headers.push({ Key: 'authorization', Value: `Bearer ${appConfig.Token}`});
            }
            this.http = new HttpRequest(reqConfig);
        }
        
    }
  
    public getBookings(): AsyncTask<Booking[]> {
        return this.http.get<Booking[]>('schedule');
    }
  
    public saveBooking(booking: Booking): AsyncTask<Booking> {
        
        if (booking._id !== '') {
          return this.http.put<Booking>(`schedule/${booking._id}`, JSON.stringify(booking));
        } else {
          return this.http.post<Booking>('schedule', JSON.stringify(booking));
        }
    }
    
}
  
export { BookingService };