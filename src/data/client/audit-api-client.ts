import { DatabaseContextType } from "@/contexts/db-context";
import { AuditDTO, ConfigDTO, ConfigDTOEncSettings, KeyDTO } from "../dto";
import { ApiClient, ApiEncryptionConfig } from "./base-api-client";
import { ZodIssue } from "zod";

export type PutAuditRequest = AuditDTO;

export type PutAuditResponseSuccess = {
  message: string;
  data: AuditDTO;
  status: 200;
};

export type PutAuditResponseError = {
  message: string;
  status: 400;
  issues?: ZodIssue[];
};

export type PutAuditResponse = PutAuditResponseSuccess | PutAuditResponseError;

export class AuditApiClient extends ApiClient {
    constructor(baseUrl: string, dbContext?: DatabaseContextType | null, encryptionConfig?: ApiEncryptionConfig) {
      super(baseUrl, dbContext, encryptionConfig);
    }
  
    async get(): Promise<AuditDTO[]> {
      return this.request<AuditDTO[]>('/api/audit', 'GET', { ecnryptedFields: ['encryptedDiff'] }) as Promise<AuditDTO[]>;
    }
  
    async put(key: PutAuditRequest): Promise<PutAuditResponse> {
      return this.request<PutAuditResponse>('/api/audit', 'PUT', { ecnryptedFields: ['encryptedDiff'] }, key) as Promise<PutAuditResponse>;
    }
}