
interface EmitterReview {
    emitterId: number;
    approved: boolean;
    reviewDateTime: string;
}

interface AgencyReview {
    agency: string;
    approved: boolean;
    reviewDateTime: string;
    emitterReviews: EmitterReview[];
}

interface ProductReview {
    productId: number;
    approvingAgency: string;
    approved: boolean;
    reviewDateTime: string;
    coordinatingAgencyReviews: AgencyReview[];
}

export { EmitterReview, AgencyReview, ProductReview };