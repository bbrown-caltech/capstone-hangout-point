import { ApplicationConfig } from '../framework/models/ApplicationConfig.Interface';
import { ResourceDictionary } from '../framework/core/ResourceDictionary';

const appConfig: ApplicationConfig = {
    Name: "FMS Intelligence Support Tool",
    BasePath: "fist-dev",
    EnableCors: true,
    Environment: '',
    Token: '',
    CurrentUser: undefined,
    totalPolicyDays: 365
};

const endpoints: ResourceDictionary = new ResourceDictionary();

endpoints.add('LoginPath', '/login/');
endpoints.add('AuthBasePath', 'https://localhost/auth/v0.1');
endpoints.add('AuxDataBasePath', 'https://localhost/aux-data/v0.1');
endpoints.add('ProductEditBasePath', 'https://localhost/product/v0.1');
endpoints.add('ProductReviewBasePath', 'https://localhost/review/v0.1');
endpoints.add('EmitterServiceBasePath', 'https://localhost/emitter/v0.1');
endpoints.add('ImportServiceBasePath', 'https://localhost/import/v0.1/product');
endpoints.add('SearchServiceBasePath', 'https://localhost/search/v0.1');


export { appConfig, endpoints };