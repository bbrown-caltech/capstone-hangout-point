
import { ProductEmitter } from './ProductEmitter.Interface';
import { ProductPlatform } from './ProductPlatform.Interface';

/**
 * Author: Brian Brown
 * Date: June 22nd, 2020
 * Description: Used to hold imported Product data
 *
 * Change Log:
 *
 * Date         Developer           Description
 * ---------    -----------------   -------------------------------------------------
 *
 */
interface ProductImport {
    fmsCaseId: string;
    service: string;
    deliveredToCountries: string[];
    platforms: ProductPlatform[];
    requestDate: string;
    productType: string;
    emittersCsvBase64: string;
}

export { ProductImport };
