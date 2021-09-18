
import { AuxDataService } from '../../services/aux-data.service';
import { ProductEditorService } from '../../services/product-editor.service';
import { Product } from './Product.Interface';

export interface ProductCreationData {
    PageSize: number;
    ItemsToShow: Product[];
    ProductData: Product[];
    Editor: ProductEditorService;
    DataService: AuxDataService;
}
