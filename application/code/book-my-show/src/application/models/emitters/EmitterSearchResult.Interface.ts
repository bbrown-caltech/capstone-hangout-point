import { DateFormatProvider } from '../../../framework/providers/DateFormatProvider';

/**
 * Author: Brian Brown
 * Date: April 11th, 2021
 * Description: Used to hold ELNOT's delivered on a product
 *
 * Change Log:
 *
 * Date         Developer           Description
 * ---------    -----------------   -------------------------------------------------
 *
 */
interface ProductDelivery {
    deliveryDate: string;
    deliverToCountries: string[];
    elnotInProduct: boolean;
    elnotDiaApprovalStatus: string;
    elnotNsaApprovalStatus: string;
}

/**
 * Author: Brian Brown
 * Date: April 11th, 2021
 * Description: Used to hold the Emitter history
 *
 * Change Log:
 *
 * Date         Developer           Description
 * ---------    -----------------   -------------------------------------------------
 *
 */
interface EmitterHistory {
    elnot: string;
    products: ProductDelivery[];
}

/**
 * Author: Brian Brown
 * Date: April 11th, 2021
 * Description: Used to hold the latest Emitter history
 *
 * Change Log:
 *
 * Date         Developer           Description
 * ---------    -----------------   -------------------------------------------------
 *
 */
interface ElnotRecentHistory {
    elnot: string;
    deliveryDate: string;
    countries: string[];
    elnotInProduct: string;
    dia: string;
    nsa: string;
}

/**
 * Author: Brian Brown
 * Date: April 11th, 2021
 * Description: Used to hold denormalized ELNOT approval history
 *
 * Change Log:
 *
 * Date         Developer           Description
 * ---------    -----------------   -------------------------------------------------
 *
 */
interface ElnotApprovalHistory {
    elnot: string;
    deliveryDate: string;
    countries: string;
    elnotInProduct: string;
    dia: string;
    nsa: string;
}

/**
 * Author: Brian Brown
 * Date: April 11th, 2021
 * Description: Used to hold the Emitter search results
 *
 * Change Log:
 *
 * Date         Developer           Description
 * ---------    -----------------   -------------------------------------------------
 *
 */
 interface EmitterSearchResult {
    elnots: EmitterHistory[];
}

class HistoryCondenser {
    
    public static condense(history: EmitterHistory[]): ElnotRecentHistory[] {
        const recentHistory: ElnotRecentHistory[] = new Array<ElnotRecentHistory>();
        
        if (history) {
            
            for (const entry of history) {
                let firstPass: boolean = true;
                let latestProduct: ProductDelivery;
                
                for (const p of entry.products) {
                    latestProduct = HistoryCondenser.compareProductDeliveries(firstPass, latestProduct, p);
                }
                
                recentHistory.push(HistoryCondenser.getRecentHistoryPlaceholder(entry, latestProduct));
                
            }
        }
        
        return recentHistory;
        
    }
    
    public static denormalizedHistory(entry: EmitterHistory): ElnotApprovalHistory[] {
        const history: ElnotApprovalHistory[] = new Array<ElnotApprovalHistory>();
        const approvalMsg = (msg: string): string => {
            if (!msg || msg.toUpperCase() === 'NOT_REVIEWED') {
                return 'NA';
            }
            
            return (msg.toUpperCase() === 'APPROVED' ? 'Yes' : 'No');
            
        };
        const countryList = (countries: string[]): string => {
            if (!countries) {
                return '';
            }
            
            let value: string = '';
            
            for (const c of countries) {
                value += (value === '' ? c : ', ' + c);
            }
            
            return value;
            
        };
        
        if (entry) {
            
            for (const p of entry.products) {
                history.push({
                    elnot: entry.elnot,
                    deliveryDate: DateFormatProvider.toString(new Date(p.deliveryDate), 'YYYYMMDD'),
                    countries: countryList(p.deliverToCountries),
                    elnotInProduct: (p.elnotInProduct === true ? 'Yes' : 'No'),
                    dia: approvalMsg(p.elnotDiaApprovalStatus),
                    nsa: approvalMsg(p.elnotNsaApprovalStatus)
                })
            }
            
        }
        
        return history;
        
    }
    
    private static getRecentHistoryPlaceholder(entry: EmitterHistory, latestProduct: ProductDelivery): ElnotRecentHistory {
        return {
            elnot: entry?.elnot,
            countries: latestProduct?.deliverToCountries,
            deliveryDate: latestProduct?.deliveryDate,
            elnotInProduct: (latestProduct?.elnotInProduct === true ? 'Yes' : 'No'),
            dia: latestProduct?.elnotDiaApprovalStatus,
            nsa: latestProduct?.elnotNsaApprovalStatus
        };
    }
    
    private static compareProductDeliveries(firstPass: boolean, latestProduct: ProductDelivery, currentProduct: ProductDelivery): ProductDelivery {
        if (firstPass) { return currentProduct; }
        
        if (latestProduct && currentProduct) {
            if (new Date(currentProduct.deliveryDate) > new Date(latestProduct.deliveryDate)) {
                return currentProduct;
            }
            
            return latestProduct;
            
        }
        
        console.error('currentProduct is undefined');
        
        return undefined;
        
    }
    
}

export { ElnotApprovalHistory, ElnotRecentHistory, EmitterHistory, EmitterSearchResult, HistoryCondenser, ProductDelivery };
