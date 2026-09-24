import type { AxiosResponse } from "axios";
import { api } from "./base";
import type {
    ApiListResponse,
    ApiResponse,
    CreateFreelanceServiceBody,
    FreelanceService,
    GetFreelanceServicesParams,
    GetStatisticsParams,
    Statistics,
    UpdateFreelanceServiceBody,
} from "./types";

// Assumes the API answers { data: [...], total: 42 }, adjust here if yours differs
export async function getFreelanceServices(params: GetFreelanceServicesParams) {
    if (params.q === undefined || params.q === null) {
        delete params.q;
    }

    const response = await api.get<ApiListResponse<FreelanceService>>(
        "/services",
        {
            params,
        },
    );
    return { services: response.data.data, total: response.data.total };
}

export async function createFreelanceService(body: CreateFreelanceServiceBody) {
    const response = await api.post<ApiResponse<FreelanceService>>(
        "/services",
        body,
    );
    return response.data.data;
}

export async function updateFreelanceService(
    id: string,
    body: UpdateFreelanceServiceBody,
) {
    const response = await api.patch<ApiResponse<FreelanceService>>(
        `/services/${id}`,
        body,
    );
    return response.data.data;
}

export async function getStatistics({
    limit = 10,
    from = 1,
    title = null,
}: GetStatisticsParams) {
    let response = await api.get<ApiListResponse<Statistics>>(
        `/services/statistics/${title}`,
        {
            params: { limit, from },
        },
    );

    return { statistics: response.data.data, total: response.data.total };
}

export async function getBestStatistics() {
    const response = await api.get<ApiResponse<Statistics[]>>(
        `/services/statistics/best`,
    );

    return response.data.data;
}

// Returns the message sent by the API ("Service deleted successfully")
export async function deleteFreelanceService(id: string) {
    const response = await api.delete<{ message: string }>(`/services/${id}`);
    return response.data.message;
}
