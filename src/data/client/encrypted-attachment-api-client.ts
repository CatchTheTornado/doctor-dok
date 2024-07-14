import { EncryptedAttachmentDTO } from "../dto";
import { ApiClient, ApiEncryptionConfig } from "./base-api-client";

export type PutEncryptedAttachmentRequest = FormData | EncryptedAttachmentDTO;

export type PutEncryptedAttachmentResponseSuccess = {
  message: string;
  data: EncryptedAttachmentDTO;
  status: 200;
};

export type PutEncryptedAttachmentResponseError = {
  message: string;
  status: 400;
  issues?: any[];
};

export type PutEncryptedAttachmentResponse = PutEncryptedAttachmentResponseSuccess | PutEncryptedAttachmentResponseError;

export class EncryptedAttachmentApiClient extends ApiClient {
    constructor(baseUrl: string, encryptionConfig?: ApiEncryptionConfig) {
      super(baseUrl, encryptionConfig);
    }

  
    async put(inputObject:PutEncryptedAttachmentRequest): Promise<PutEncryptedAttachmentResponse> {
      if (inputObject instanceof FormData) {
        return this.request<PutEncryptedAttachmentResponse>('/api/encrypted-attachment', 'PUT', null, null, inputObject as FormData) as Promise<PutEncryptedAttachmentResponse>;
      } else {
        return this.request<PutEncryptedAttachmentResponse>('/api/encrypted-attachment', 'PUT', null, inputObject as EncryptedAttachmentDTO) as Promise<PutEncryptedAttachmentResponse>;
      }
    }

    async get(attachment: EncryptedAttachmentDTO): Promise<ArrayBuffer> {
      return this.getArrayBuffer('/api/encrypted-attachment/' + attachment.storageKey);
    }
    
  }