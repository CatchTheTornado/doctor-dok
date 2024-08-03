import { DTOEncryptionFilter, EncryptionUtils } from "@/lib/crypto";
import { DTOEncryptionSettings } from "../dto";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { DatabaseContextType } from "@/contexts/db-context";

export type ApiEncryptionConfig = {
  secretKey?: string;
  useEncryption: boolean;
};


export class ApiClient {
  private baseUrl: string;
  private encryptionFilter: DTOEncryptionFilter<any> | null = null;
  private encryptionConfig?: ApiEncryptionConfig | null = null;
  private encryptionUtils: EncryptionUtils | null = null;
  private dbContext?: DatabaseContextType | null = null;

  constructor(baseUrl: string, databaseContext?: DatabaseContextType | null, encryptionConfig?: ApiEncryptionConfig) {
    this.baseUrl = baseUrl;
    this.dbContext = databaseContext;
    if (encryptionConfig?.useEncryption) {
      this.encryptionFilter = new DTOEncryptionFilter(encryptionConfig.secretKey as string);
    }
    this.encryptionUtils = new EncryptionUtils(encryptionConfig?.secretKey as string);
    this.encryptionConfig = encryptionConfig;
  }

  protected async getArrayBuffer(
    endpoint: string
  ): Promise<ArrayBuffer> {
    const headers: Record<string, string> = {};

    const config: AxiosRequestConfig = {
      method: 'GET',
      url: `${this.baseUrl}${endpoint}`,
      headers,
      responseType: 'blob',
    };

    try {
      const response: AxiosResponse<ArrayBuffer> = await axios(config);

      if (response.status >= 400) {
        throw new Error(response.statusText || 'Request failed');
      }
      return (this.encryptionConfig?.useEncryption) ? this.encryptionUtils?.decryptArrayBuffer(response.data) : response.data;
      
    } catch (error) {
      throw new Error('Request failed');
    }
  }

  protected async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    encryptionSettings?: DTOEncryptionSettings,
    body?: any,
    formData?: FormData
  ): Promise<T | T[]> {
    const headers: Record<string, string> = {};

    if (this.dbContext?.accessToken) {
      headers['Authorization'] = `Bearer ${this.dbContext?.accessToken}`;
    }

    if(this.dbContext?.databaseHashId) {
      headers['Database-Id-Hash'] = this.dbContext?.databaseHashId;
    }

    if (formData) {
      if (this.encryptionFilter) {
        throw new Error('Encryption is not supported for FormData');
      }

      // Set Content-Type header to 'multipart/form-data'
      headers['Content-Type'] = 'multipart/form-data';
    } else {
      // Set Content-Type header to 'application/json'
      headers['Content-Type'] = 'application/json';

      // Encrypt body if encryptionFilter is available
      if (body && this.encryptionFilter) {
        body = await this.encryptionFilter.encrypt(body, encryptionSettings);
      }
    }

    const config: AxiosRequestConfig = {
      method,
      url: `${this.baseUrl}${endpoint}`,
      headers,
      data: formData ? formData : body ? JSON.stringify(body) : undefined,
    };

    try {
      const response: AxiosResponse = await axios(config);

      if (response.status >= 400) {
        const errorData = response.data;
        throw new Error(errorData.message || 'Request failed');
      }

      const responseData = response.data;

      if (this.encryptionFilter) {
        if (responseData instanceof Array) {
          const decryptedData = await Promise.all(responseData.map(async (data) => await this.encryptionFilter.decrypt(data, encryptionSettings)));
          return decryptedData as T[];
        } else {
          const decryptedData = await this.encryptionFilter.decrypt(responseData, encryptionSettings);
          return decryptedData as T;
        }
      } else {
        return responseData;
      }
    } catch (error) {
      throw new Error('Request failed');
    }
  }
}