import { DatabaseContextType } from "@/contexts/db-context";
import { StatDTO, AggregatedStatsDTO } from "../dto";
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


export type AggregatedStatsResponseSuccess = {
  message: string;
  data: AggregatedStatsDTO;
  status: 200;
};

export type AggregatedStatsResponseError = {
  message: string;
  status: 400;
  issues?: any[];
};


export type AggregateStatResponse = AggregateStatResponseSuccess | AggregateStatResponseError;
export type AggregatedStatsResponse = AggregatedStatsResponseSuccess | AggregatedStatsResponseError;

export class StatApiClient extends ApiClient {
    constructor(baseUrl: string, dbContext?: DatabaseContextType | null, encryptionConfig?: ApiEncryptionConfig) {
      super(baseUrl, dbContext, encryptionConfig);
    }
  
    async aggregated(): Promise<AggregatedStatsResponse> {
      return this.request<AggregatedStatsResponse>('/api/stats/aggregated', 'GET', { ecnryptedFields: [] }) as Promise<AggregatedStatsResponse>;
    }
  
    async aggregate(newItem: StatDTO): Promise<AggregateStatResponse> {
      return this.request<AggregateStatResponse>('/api/stats', 'PUT', { ecnryptedFields: [] }, newItem) as Promise<AggregateStatResponse>;
    }
   
  }