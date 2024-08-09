import { DatabaseContextType } from "@/contexts/db-context";
import { ConfigDTO, ConfigDTOEncSettings, KeyDTO } from "../dto";
import { ApiClient, ApiEncryptionConfig } from "./base-api-client";

export type PutKeyRequest = KeyDTO;

export type PutKeyResponseSuccess = {
  message: string;
  data: KeyDTO;
  status: 200;
};

export type PutKeyResponseError = {
  message: string;
  status: 400;
  issues?: any[];
};

export type PutKeyResponse = PutKeyResponseSuccess | PutKeyResponseError;

export class KeyApiClient extends ApiClient {
    constructor(baseUrl: string, dbContext?: DatabaseContextType | null, encryptionConfig?: ApiEncryptionConfig) {
      super(baseUrl, dbContext, encryptionConfig);
    }
  
    async get(): Promise<KeyDTO[]> {
      return this.request<KeyDTO[]>('/api/keys', 'GET', { ecnryptedFields: [] }) as Promise<KeyDTO[]>;
    }
  
    async put(key: PutKeyRequest): Promise<PutKeyResponse> {
      return this.request<PutKeyResponse>('/api/keys', 'PUT', { ecnryptedFields: [] }, key) as Promise<PutKeyResponse>;
    }
    
    async delete(keyLocatorHash: string): Promise<PutKeyResponse> {
      return this.request<PutKeyResponse>('/api/keys/' + keyLocatorHash, 'DELETE', { ecnryptedFields: [] }) as Promise<PutKeyResponse>;
    }    
  }