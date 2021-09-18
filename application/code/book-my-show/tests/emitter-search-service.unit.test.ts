import { expect } from 'chai';

import { sleep } from '../src/framework/core/AsyncTask';
import { KeyValuePair } from '../src/framework/core/ResourceDictionary';
import { HttpRequest, HttpRequestConfig } from '../src/framework/providers/HttpRequest';

import { EmitterSearchService } from '../src/application/services/emitter-search.service';
import { EmitterHistory } from '../src/application/models/emitters/EmitterSearchResult.Interface';

const reqConfig: HttpRequestConfig = { headers: new Array<KeyValuePair>(), BasePath: "http://bogusurl", EnableCors: true, mockResults: true };

reqConfig.headers.push({Key: 'accept', Value: 'application/json'});
reqConfig.headers.push({Key: 'content-type', Value: 'application/json'});

const http: HttpRequest = new HttpRequest(reqConfig);
const service: EmitterSearchService = new EmitterSearchService(http);

describe('EmitterSearchService', function() {
  this.timeout(5000);
  
  it('Search emitters', async () => {
    let finished: boolean = false;
    let finalResult: boolean = false;
    
    reqConfig.results = { elnots: [{elnot: 'A00001', products: []}] };
    
    service.getSearchEmitters(null)
      .completed((result: EmitterHistory[]) => {
        finalResult = (result !== undefined && result !== null && result.length > 0);
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
