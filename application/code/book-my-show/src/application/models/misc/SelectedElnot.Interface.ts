
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
export interface SelectedElnot {
    emitterId: number;
    name: string;
    function: string;
    elnot: string;
    Selected: boolean;
    policyApplied: boolean;
    policyClasses: string[];
}
