import { ProductEditorService } from '../../services/product-editor.service';
import { SelectedElnot } from './SelectedElnot.Interface';

import { Product } from '../product/Product.Interface';

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
export interface ElnotSelectionData {
    AvailableElnots: SelectedElnot[];
    SelectedElnots: SelectedElnot[];
    SelectedProduct: Product;
    Editor: ProductEditorService;
    DataSource: any;
    callback: (data: ElnotSelectionData) => void;
}
