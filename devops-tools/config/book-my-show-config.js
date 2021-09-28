import { ResourceDictionary } from '../framework/core/ResourceDictionary.js';
const appConfig = {
    Name: "Book My Show",
    BasePath: "",
    EnableCors: true,
    Environment: '',
    Token: '',
    CurrentUser: undefined
};
const endpoints = new ResourceDictionary();
endpoints.add('BookingBasePath', 'https://capstone.brianbrown.me/scheduling-manager');
export { appConfig, endpoints };
