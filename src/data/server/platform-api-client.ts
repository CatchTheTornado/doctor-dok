import { ApiClient } from "@/data/client/base-api-client";
import { GetSaasResponse, GetSaaSResponseSuccess } from "../client/saas-api-client";

export class PlatformApiClient extends ApiClient {
    apiKey: string;
    constructor(saasToken: string) {
        const saasPlatformUrl = process.env.SAAS_PLATFORM_URL || 'http://localhost:3001'
        super(saasPlatformUrl);
        this.apiKey = saasToken;
    }

    async account(): Promise<GetSaasResponse> {
        return this.request<GetSaasResponse>('/api/users/me?apiKey=' + encodeURIComponent(this.apiKey), 'GET') as Promise<GetSaasResponse>;
    }

}
