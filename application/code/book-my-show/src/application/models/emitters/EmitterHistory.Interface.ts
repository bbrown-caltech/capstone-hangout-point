
interface ProductDelivery {
    deliveryDate: string;
    deliverToCountries: string[];
    elnotInProduct: boolean;
    elnotDiaApprovalStatus: string;
    elnotNsaApprovalStatus: string;
}

interface EmitterHistory {
    elnot: string;
    products: ProductDelivery[];
}

export { EmitterHistory, ProductDelivery };
