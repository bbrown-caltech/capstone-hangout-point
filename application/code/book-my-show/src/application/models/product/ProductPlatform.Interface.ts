import { EwSystem } from './EwSystem.Interface';

/**
 * Author: Brian Brown
 * Date: June 22nd, 2020
 * Description: Used to hold Product Platform data
 *
 * Change Log:
 *
 * Date         Developer           Description
 * ---------    -----------------   -------------------------------------------------
 *
 */
interface ProductPlatform {
    name: string;
    ewSystems: EwSystem[];
}

export { ProductPlatform };
