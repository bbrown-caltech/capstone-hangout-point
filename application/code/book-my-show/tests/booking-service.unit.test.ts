import { expect } from 'chai';

import { sleep } from '../src/framework/core/AsyncTask';
import { KeyValuePair } from '../src/framework/core/ResourceDictionary';
import { HttpRequestConfig } from '../src/framework/providers/HttpRequest';

import { BookingService } from '../src/application/services/booking.service';
import { Booking } from '../src/application/models/Booking.Interface';

import { HttpRequest } from '../src/testing/HttpRequest.tests';

const reqConfig: HttpRequestConfig = { headers: new Array<KeyValuePair>(), BasePath: "http://bogusurl", EnableCors: true, mockResults: true };

reqConfig.headers.push({Key: 'accept', Value: 'application/json'});
reqConfig.headers.push({Key: 'content-type', Value: 'application/json'});

const http: HttpRequest = new HttpRequest(reqConfig);
const service: BookingService = new BookingService(http);

describe('BookingService', function() {
  this.timeout(5000);
  
  /**
   * Used to test the Booking data service getBookings method
   */
  it('Get booking objects', async () => {
    let finished: boolean = false;
    let finalResult: boolean = false;
    
    reqConfig.results = [ {
      _id: '451234568',
      customerName: 'Tommy Tuesday',
      showName: 'Snow White',
      showDate: new Date(),
      totalTickets: 2
    }];
    
    service.getBookings()
      .completed((result: Booking[]) => {
        finalResult = (result && result.length > 0);
        finished = true;
    }).exception((error: any) => {
      finished = true;
    });
    
    while (finished === false) {
      await sleep(100);
    }
    
    expect(finalResult).be.true;
    
  });

});