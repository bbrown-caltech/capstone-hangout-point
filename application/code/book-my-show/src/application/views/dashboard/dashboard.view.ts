import { View } from '../../../framework/decorators/View';
import { combinePartials } from '../../../framework/core/Application';
import { DateFormatProvider } from '../../../framework/providers/DateFormatProvider';
import { ViewModel } from '../../../framework/core/ViewModel';
import { RepeatingDataView } from '../../../framework/core/RepeatingDataView';
import { ResourceDictionary } from '../../../framework/core/ResourceDictionary';
import { DashboardConfig } from './dashboard.config';
import { DonutChart, DonutChartConfig, DonutChartGraphSegment } from '../../../framework/UI/Analytics/DonutChart';

import { appConfig } from '../../config';
import { ProductEditorService } from '../../services/product-editor.service';
import { Product } from '../../models/product/Product.Interface';

@View({
    selector: 'dashboard',
    BasePath: 'js/application/views/dashboard',
    template: 'dashboard.view.html',
    styles: 'dashboard.view.css'
})
class Dashboard extends ViewModel {
    private products: Product[];
    
    donutLegend: RepeatingDataView;
    recentProducts: RepeatingDataView;
    
  doughnutChartLabels: string[] = ['Open (OPN)', 'Submitted (SMT)', 'PRE TCM (PRT)',
  'POST TCM (POT)', 'Fulfillment (FMT)', 'Delivered (DLV)'];
doughnutChartData: any[] = [{
data: [0, 0, 0, 0, 0, 0],
label: 'Product Status Data'
}];

    constructor(private productEditor: ProductEditorService) { super(); }
    
    preInit(): void {
        const self = this;
        this.productEditor.getProducts()
        .completed((result: Product[]) => {
            self.products = result;
        }).exception((error: any) => {
           console.log('Dashboard Pre-Init: Get Products', error); 
        });
    }
    
    postInit(): void {
        const self = this;
        
        setTimeout(() => {
            const chartConfig: DonutChartConfig = self.getDonutChartData();
            const chart: DonutChart = new DonutChart();
            chart.display(chartConfig);
            
            self.donutLegend = new RepeatingDataView('donutLegend', {
                scope: self,
                dataSet: chartConfig.ItemData,
                transformFunctions: undefined,
                paginator: undefined,
                filter: undefined,
                sorter: undefined
            });
            
            const transforms: ResourceDictionary = new ResourceDictionary();
            transforms.add('RequestDate', self.normalizedDate);
            transforms.add('StatusCode', self.getStatus);
            self.recentProducts = new RepeatingDataView('recentProducts', {
                scope: self,
                dataSet: this.products,
                transformFunctions: transforms,
                paginator: undefined,
                filter: undefined,
                sorter: undefined
            });
            
        }, 400);
        
        
    }
    
    loadProducts() {
        const route: string = `/${appConfig.BasePath}${appConfig.BasePath !== '' ? '/' : ''}product`
        history.pushState({selector: 'product'}, 'product', route);
    }
    
    navigateToProductEditor() {
        const route: string = `/${appConfig.BasePath}${appConfig.BasePath !== '' ? '/' : ''}product`
        history.pushState({selector: 'product'}, 'product', route);
    }
    
    private getDonutChartData(): DonutChartConfig {
        const chartConfig: DonutChartConfig = {
            GraphControlID: 'donutGraph',
            LegendControlID: 'donutGraph',
            TotalItems: 0,
            ItemData: [
                { Label: 'Open', Total: 0, Color: '#b51919', Class: 'OPN' },
                { Label: 'Submitted', Total: 0, Color: '#10a129', Class: 'SMT' },
                { Label: 'PRE TCM', Total: 0, Color: '#de8733', Class: 'PRT' },
                { Label: 'POST TCM', Total: 0, Color: '#666', Class: 'POT' },
                { Label: 'Fulfillment', Total: 0, Color: '#0e26b2', Class: 'FMT' },
                { Label: 'Delivered', Total: 0, Color: '#8bf39d', Class: 'DLV' }
            ]
        };
        
        if (this.products) {
            chartConfig.TotalItems = this.products.length;
            for (const p of this.products) {
                if (p.statusCode === 'OPN') { chartConfig.ItemData[0].Total++; }
                if (p.statusCode === 'SMT') { chartConfig.ItemData[1].Total++; }
                if (p.statusCode === 'PRT') { chartConfig.ItemData[2].Total++; }
                if (p.statusCode === 'POT') { chartConfig.ItemData[3].Total++; }
                if (p.statusCode === 'FMT') { chartConfig.ItemData[4].Total++; }
                if (p.statusCode === 'DLV') { chartConfig.ItemData[5].Total++; }
            }
        }
        return chartConfig;
    }
    
    
    /**************************************************************************************************************
     *  DATA TRANSFORMATION METHODS
     **************************************************************************************************************/
    normalizedDate(date: string): string {
        return DateFormatProvider.toShortDateString(new Date(date));
    }

    getStatus(statusCode: string): string {
        switch (statusCode) {
            case 'DLV':
                return 'Delivered';
            case 'SMT':
                return 'Submitted';
            case 'PRT':
                return 'PRE TCM';
            case 'FMT':
                return 'Fulfillment';
            case 'POT':
                return 'POST TCM';
            default:
                return 'Open';
        }
    }

}

combinePartials(Dashboard, [DashboardConfig]);


export { Dashboard };
