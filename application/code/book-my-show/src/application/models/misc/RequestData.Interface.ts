
/**
 * Author: Brian Brown
 * Date: June 22nd, 2020
 * Description: Used to hold the data needed for a request
 *
 * Change Log:
 *
 * Date         Developer           Description
 * ---------    -----------------   -------------------------------------------------
 *
 */
export interface RequestData {
    ID: string;
    ELNOT: string;
    EmitterName: string;
    EmitterFunction: string;
    UserCountry: string;
    Owner: string;
    NSAApproved: boolean;
    DIAAprroved: boolean;
    SourceID: string;
}
