
/**
 * Author: Brian Brown
 * Date: June 22nd, 2020
 * Description: Used to hold the ELNOT's selected
 *
 * Change Log:
 *
 * Date         Developer           Description
 * ---------    -----------------   -------------------------------------------------
 *
 */

interface EwirdbSystemInfo {
    systemId: string;
    elnots: string[];
    primaryDisplayName: string;
    responsibleAgencies: string[];
    productStatus: string;
    lastModifiedDate: string;
    userCountryCodes: string[];
}

interface Emitter {
    emitterId: number;
    elnot: string;
    name: string;
    function: string;
    cedUpdateDate: string;
    nowKnownAsElnots: string[];
    originCountryCodes: string[];
    primaryPlatformType: string;
    platformTypes: string[];
    previouslyKnownAsElnots: string[];
    secondaryNames: string[];
    status: string;
    userCountryCodes: string[];
    ewirdbSystems: EwirdbSystemInfo[];
}

export { Emitter };
