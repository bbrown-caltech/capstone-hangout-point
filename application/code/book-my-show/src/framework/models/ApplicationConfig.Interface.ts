interface ApplicationConfig {
    Name: string;
    BasePath: string;
    EnableCors: boolean;
    Environment: string;
    Token: string;
    CurrentUser: any;
}

export { ApplicationConfig };