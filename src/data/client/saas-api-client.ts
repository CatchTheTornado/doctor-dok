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
      super(baseUrl, dbContext, encryptionConfig);
    }
  
    async get(saasToken: string): Promise<GetSaasResponse> {
      return this.request<GetSaasResponse>('/api/saas?saasToken=' + encodeURIComponent(saasToken), 'GET', { ecnryptedFields: [] }) as Promise<GetSaasResponse>;
    }
  }