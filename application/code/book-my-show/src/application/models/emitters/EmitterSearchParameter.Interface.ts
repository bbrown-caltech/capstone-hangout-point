
/**
 * Author: Brian Brown
 * Date: June 22nd, 2020
 * Description: Used to hold the Emitter Search Parameter data for policy searches
 *
 * Change Log:
 *
 * Date         Developer           Description
 * ---------    -----------------   -------------------------------------------------
 *
 */
interface EmitterSearchParameter {
    onlyApprovedByPolicy: boolean;
    onlyApprovedSince: string;
    onlyInAOR: boolean;
    deliverToCountries: string[];
    includeProductHistory: boolean;
}

export { EmitterSearchParameter };
