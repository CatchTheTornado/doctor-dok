import { ApiClient } from "@/data/client/base-api-client";
import { GetSaaSResponseSuccess } from "../client/saas-api-client";

export class PlatformApiClient extends ApiClient {
    apiKey: string;
    constructor(saasToken: string) {
        const saasPlatformUrl = process.env.SAAS_PLATFORM_URL || 'http://localhost:3001'
        super(saasPlatformUrl);
        this.apiKey = saasToken;
    }

    async account(): Promise<GetSaaSResponseSuccess> {
        return this.request<GetSaaSResponseSuccess>('/api/users/me?apiKey=' + encodeURIComponent(this.apiKey), 'GET') as Promise<GetSaaSResponseSuccess>;
    }

}
