import { LdapUser } from './LdapUser.Interface';

/**
 * Author: Brian Brown
 * Date: June 22nd, 2020
 * Description: Used to hold login response
 *
 * Change Log:
 *
 * Date         Developer           Description
 * ---------    -----------------   -------------------------------------------------
 *
 */
interface LoginResponse {
    Successful: boolean;
    User: LdapUser;
    Token: string;
}

export { LoginResponse };