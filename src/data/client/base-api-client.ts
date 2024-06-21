import { DTOEncryptionFilter } from "@/lib/crypto";

export type ApiEncryptionConfig = {
    secretKey: string;
    useEncryption: boolean;
  };


export class ApiClient {
    private baseUrl: string;
    private encryptionFilter: DTOEncryptionFilter<any> | null = null;
  
    constructor(baseUrl: string, encryptionConfig?: ApiEncryptionConfig) {
      this.baseUrl = baseUrl;
      if (encryptionConfig?.useEncryption) {
        this.encryptionFilter = new DTOEncryptionFilter(encryptionConfig.secretKey);
      }
    }
  
    protected async request<T>(
      endpoint: string,
      method: 'GET' | 'POST' | 'PUT' | 'DELETE',
      body?: any
    ): Promise<T> {
      const headers = new Headers({
        'Content-Type': 'application/json',
      });
  
      if (body && this.encryptionFilter) {
        body = await this.encryptionFilter.encrypt(body);
      }
  
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      }
  
      const responseData = await response.json();
  
      return this.encryptionFilter ? this.encryptionFilter.decrypt(responseData) : responseData;
    }
  }