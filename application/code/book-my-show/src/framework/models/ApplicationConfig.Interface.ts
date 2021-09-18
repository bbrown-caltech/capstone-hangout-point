interface ApplicationConfig {
    Name: string;
    BasePath: string;
    EnableCors: boolean;
    Environment: string;
    Token: string;
    CurrentUser: any;
    totalPolicyDays: number;
}

export { ApplicationConfig };