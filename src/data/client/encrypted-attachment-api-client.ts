import { DatabaseContextType } from "@/contexts/db-context";
import { EncryptedAttachmentDTO } from "../dto";
import { ApiClient, ApiEncryptionConfig } from "./base-api-client";

export type PutEncryptedAttachmentRequest = FormData | EncryptedAttachmentDTO;

export type PutEncryptedAttachmentResponseSuccess = {
  message: string;
  data: EncryptedAttachmentDTO;
  status: 200;
};

export type DeleteEncryptedAttachmentResponse = {
  message: string;
  status: 200;
};

export type PutEncryptedAttachmentResponseError = {
  message: string;
  status: 400;
  issues?: any[];
};

export type PutEncryptedAttachmentResponse = PutEncryptedAttachmentResponseSuccess | PutEncryptedAttachmentResponseError;

export class EncryptedAttachmentApiClient extends ApiClient {
    constructor(baseUrl: string, dbContext?: DatabaseContextType | null, encryptionConfig?: ApiEncryptionConfig) {
      super(baseUrl, dbContext, encryptionConfig);
    }

  
    async put(inputObject:PutEncryptedAttachmentRequest): Promise<PutEncryptedAttachmentResponse> {
      if (inputObject instanceof FormData) {
        return this.request<PutEncryptedAttachmentResponse>('/api/encrypted-attachment', 'PUT', { ecnryptedFields: [] }, null, inputObject as FormData) as Promise<PutEncryptedAttachmentResponse>;
      } else {
        return this.request<PutEncryptedAttachmentResponse>('/api/encrypted-attachment', 'PUT', { ecnryptedFields: [] }, inputObject as EncryptedAttachmentDTO) as Promise<PutEncryptedAttachmentResponse>;
      }
    }

    async get(attachment: EncryptedAttachmentDTO): Promise<ArrayBuffer | undefined | null> {
      return this.getArrayBuffer('/api/encrypted-attachment/' + attachment.storageKey);
    }

    async delete(attachment: EncryptedAttachmentDTO): Promise<DeleteEncryptedAttachmentResponse> {
      return this.request<DeleteEncryptedAttachmentResponse>('/api/encrypted-attachment/' + attachment.storageKey, 'DELETE', { ecnryptedFields: [] }) as Promise<DeleteEncryptedAttachmentResponse>;
    }
    
  }