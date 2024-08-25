import { DatabaseContextType } from "@/contexts/db-context";
import { StatDTO } from "../dto";
import { ApiClient, ApiEncryptionConfig } from "./base-api-client";

export type AggregateStatRequest = StatDTO;

export type AggregateStatResponseSuccess = {
  message: string;
  data: StatDTO;
  status: 200;
};

export type AggregateStatResponseError = {
  message: string;
  status: 400;
  issues?: any[];
};

export type AggregateStatResponse = AggregateStatResponseSuccess | AggregateStatResponseError;

export class StatApiClient extends ApiClient {
    constructor(baseUrl: string, dbContext?: DatabaseContextType | null, encryptionConfig?: ApiEncryptionConfig) {
      super(baseUrl, dbContext, encryptionConfig);
    }
  
    async get(): Promise<StatDTO[]> {
      return this.request<StatDTO[]>('/api/stats', 'GET', { ecnryptedFields: [] }) as Promise<StatDTO[]>;
    }
  
    async aggregate(newItem: StatDTO): Promise<AggregateStatResponse> {
      return this.request<AggregateStatResponse>('/api/stats', 'PUT', { ecnryptedFields: [] }, newItem) as Promise<AggregateStatResponse>;
    }
   
  }