
import { ProductEmitter } from './ProductEmitter.Interface';
import { ProductPlatform } from './ProductPlatform.Interface';

/**
 * Author: Brian Brown
 * Date: June 22nd, 2020
 * Description: Used to hold Product data
 *
 * Change Log:
 *
 * Date         Developer           Description
 * ---------    -----------------   -------------------------------------------------
 *
 */


interface WritableProduct {
    service: string;
    countries: string[];
    platforms: ProductPlatform[];
    requestDate: string;
    productType: string;
    caseNumber: string;
    statusCode: string;
    emitters: ProductEmitter[];
}

interface Product extends WritableProduct {
    productId: number;
    createdBy: string;
    dateCreated: string;
    updatedBy: string;
    dateUpdated: string;
}

export { WritableProduct, Product };
