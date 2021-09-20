
/**
 * Author: Brian Brown
 * Date: June 22nd, 2020
 * Description: Used to hold Product Detail data
 *
 * Change Log:
 *
 * Date         Developer           Description
 * ---------    -----------------   -------------------------------------------------
 *
 */
interface ProductEmitter {
    name: string;
    function: string;
    elnot: string;
    platforms: string[];
    userCountries: string[];
    includeInProduct: boolean;
    excludeReason: string;
    owner: string;
    systemId: string;
    cedId: string;
}

export { ProductEmitter };
