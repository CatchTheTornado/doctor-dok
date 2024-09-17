import { ApiClient } from "@/data/client/base-api-client";
import { GetSaasResponse, GetSaaSResponseSuccess } from "../client/saas-api-client";


type UniversalApiResult = {
    status: number;
    data?: any;
    message?: string;
}

const qr = (databaseIdHash?: string|null, apiKey?: string|null) => {

    if (apiKey) {
        return '?apiKey=' + encodeURIComponent(apiKey);
    } else {
        if (databaseIdHash) {
            return `?databaseIdHash=${encodeURIComponent(databaseIdHash)}`
        }
    }

    return '';
}
export class PlatformApiClient extends ApiClient {
    apiKey: string;
    constructor(saasToken: string) {
        const saasPlatformUrl = process.env.SAAS_PLATFORM_URL || 'http://localhost:3001'
        super(saasPlatformUrl);
        this.apiKey = saasToken;
    }



    async account({ databaseIdHash, apiKey}:{
        databaseIdHash?: string|null;
        apiKey?: string|null;
    }): Promise<GetSaasResponse> {
        return this.request<GetSaasResponse>('/api/users/me' + qr(databaseIdHash, apiKey), 'GET') as Promise<GetSaasResponse>;
    }

    async storeTerm(databaseIdHash:string, term: {
        content: string;
        name: string;
        email: string;
        signedAt: string,
        code: string
    }): Promise<UniversalApiResult> {
        return this.request<UniversalApiResult>('/api/terms' + qr(databaseIdHash, this.apiKey), 'POST', { ecnryptedFields: [] }, term) as Promise<UniversalApiResult>;
    }

    async newDatabase(dbData: {
        databaseIdHash: string;
        createdAt: string;
    }): Promise<UniversalApiResult> {
        return this.request<UniversalApiResult>('/api/db/new?apiKey=' + encodeURIComponent(this.apiKey), 'POST', { ecnryptedFields: [] }, dbData) as Promise<UniversalApiResult>;
    }

}
