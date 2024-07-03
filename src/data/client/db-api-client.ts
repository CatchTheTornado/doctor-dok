import { ApiClient, ApiEncryptionConfig } from "./base-api-client";

export type DeleteDbResponseSuccess = {
  message: string;
  status: 200;
};

export type DeleteDbResponseError = {
  message: string;
  status: 400;
  issues?: any[];
};

export type DeleteDbResponse = DeleteDbResponseSuccess | DeleteDbResponseError;

export class DbApiClient extends ApiClient {
    constructor(baseUrl: string, encryptionConfig?: ApiEncryptionConfig) {
      super(baseUrl, encryptionConfig);
    }
  
    async delete(): Promise<DeleteDbResponse> {
      return this.request<DeleteDbResponse>('/api/db', 'DELETE', { ecnryptedFields: [] }) as Promise<DeleteDbResponse>;
    }
  }