export interface ApiResponse<T> {
    data: T;
}

export interface ApiListResponse<T> {
    data: T[];
    total: number;
}

export interface FreelanceService {
    id: string;
    title: string;
    content: string;
    price: number;
    currency: string;
    parentServiceId: string | null;
    additionalServices?: FreelanceService[];
}

export interface CreateFreelanceServiceBody {
    title: string;
    content: string;
    price: number;
    currency: string;
    parentServiceId?: string;
}

// Same fields as create but all optional, parentServiceId is sent when the service has one
export type UpdateFreelanceServiceBody = Partial<CreateFreelanceServiceBody>;

export interface GetFreelanceServicesParams {
    limit: number;
    // Page number, the first page is 1
    from: number;

    // Optional query
    q?: null | string;
}

export interface Statistics {
    title: string;
    currency: string;
    highestPriceInService: string;
    lowestPriceInService: string;
    avgPriceInService: string;
    totalServicesCount: string;
}

export interface GetStatisticsParams {
    limit: number;
    from: number;
    title: string | null;
}
