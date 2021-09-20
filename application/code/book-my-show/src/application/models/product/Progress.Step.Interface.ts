
/**
 * Author: Brian Brown
 * Date: March 3rd, 2021
 * Description: Used to hold Progress metadata
 *
 * Change Log:
 *
 * Date         Developer           Description
 * ---------    -----------------   -------------------------------------------------
 *
 */
 interface Step {
    name: string;
    sequenceId: number;
    completed: boolean;
    col: HTMLDivElement;
    image: SVGPathElement;
}

export { Step }
