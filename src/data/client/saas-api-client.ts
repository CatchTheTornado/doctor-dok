import { DatabaseContextType } from "@/contexts/db-context";
import { SaaSDTO, TermDTO } from "../dto";
import { ApiClient, ApiEncryptionConfig } from "./base-api-client";
import { ZodIssue } from "zod";

export type GetSaaSResponseSuccess = {
  message: string;
  data: SaaSDTO;
  status: 200;
};

export type GetSaaSResponseError = {
  message: string;
  status: 400;
  issues?: ZodIssue[];
};

export type GetSaasResponse = GetSaaSResponseSuccess | GetSaaSResponseError;

export class SaasApiClient extends ApiClient {
    constructor(baseUrl: string, dbContext?: DatabaseContextType | null, encryptionConfig?: ApiEncryptionConfig) {
      super(baseUrl, dbContext, null, encryptionConfig);
    }
  
    async get(saasToken: string, useCache:boolean = true): Promise<GetSaasResponse> { // under the hood the request passes databaseIdHash from dbContext as soon as it gets it
      return this.request<GetSaasResponse>('/api/saas?saasToken=' + encodeURIComponent(saasToken) + '&useCache=' + (useCache ? 'true' : 'false'), 'GET', { ecnryptedFields: [] }) as Promise<GetSaasResponse>;
    }
  }