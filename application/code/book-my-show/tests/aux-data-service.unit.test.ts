import { expect } from 'chai';

import { sleep } from '../src/framework/core/AsyncTask';
import { KeyValuePair } from '../src/framework/core/ResourceDictionary';
import { HttpRequest, HttpRequestConfig } from '../src/framework/providers/HttpRequest';

import { AuxDataService } from '../src/application/services/aux-data.service';
import { Country } from '../src/application/models/aux-data/Country.Interface';
import { Platform } from '../src/application/models/aux-data/Platform.Interface';
import { MilitaryService } from '../src/application/models/aux-data/Service.Interface';

const reqConfig: HttpRequestConfig = { headers: new Array<KeyValuePair>(), BasePath: "http://bogusurl", EnableCors: true, mockResults: true };

reqConfig.headers.push({Key: 'accept', Value: 'application/json'});
reqConfig.headers.push({Key: 'content-type', Value: 'application/json'});

const http: HttpRequest = new HttpRequest(reqConfig);
const service: AuxDataService = new AuxDataService(http);

describe('AuxDataService', function() {
  this.timeout(5000);
  
  /**
   * Used to test the auxiliary data service getCountries method
   */
  it('Get country objects', async () => {
    let finished: boolean = false;
    let finalResult: boolean = false;
    
    reqConfig.results = [ {countryCode: 'US', countryName: 'United States'}];
    
    service.getCountries()
      .completed((result: Country[]) => {
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
  
  /**
   * Used to test the auxiliary data service getPlatforms method
   */
  it('Get platform objects', async () => {
    let finished: boolean = false;
    let finalResult: boolean = false;
    
    reqConfig.results = [ {platformName: 'Truck'}];
    
    service.getPlatforms()
      .completed((result: Platform[]) => {
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
  
  /**
   * Used to test the auxiliary data service getServices method
   */
  it('Get service objects', async () => {
    let finished: boolean = false;
    let finalResult: boolean = false;
    
    reqConfig.results = [ {serviceName: 'Air Force'}];
    
    service.getServices()
      .completed((result: MilitaryService[]) => {
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
  
})
