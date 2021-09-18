
/**
 * Author: Brian Brown
 * Date: June 22nd, 2020
 * Description: Used to hold LDAP User Attributes
 *
 * Change Log:
 *
 * Date         Developer           Description
 * ---------    -----------------   -------------------------------------------------
 *
 */
interface LdapUser {
    DN: string;
    UID: string;
    Name: string;
    Email: string;
    Groups: string[];
}

export { LdapUser };