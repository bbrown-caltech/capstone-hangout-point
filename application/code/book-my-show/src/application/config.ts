import { ApplicationConfig } from '../framework/models/ApplicationConfig.Interface';
import { ResourceDictionary } from '../framework/core/ResourceDictionary';

const appConfig: ApplicationConfig = {
    Name: "Book My Show",
    BasePath: "",
    EnableCors: true,
    Environment: '',
    Token: '',
    CurrentUser: undefined
};

const endpoints: ResourceDictionary = new ResourceDictionary();

endpoints.add('BookingBasePath', 'http://localhost:3000');


export { appConfig, endpoints };
