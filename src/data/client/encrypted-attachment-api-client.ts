import { EncryptedAttachmentDTO } from "../dto";
import { ApiClient, ApiEncryptionConfig } from "./base-api-client";

export type PutEncryptedAttachmentRequest = FormData;

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
  
    // async get(): Promise<GetPatientsResponse> {
    //   return this.request<GetPatientsResponse>('/api/patient', 'GET', PatientDTOEncSettings) as Promise<GetPatientsResponse>;
    // }
  
    async put(formData:PutEncryptedAttachmentRequest): Promise<PutEncryptedAttachmentResponse> {
      return this.request<PutEncryptedAttachmentResponse>('/api/encrypted-attachment', 'PUT', null, null, formData) as Promise<PutEncryptedAttachmentResponse>;
    }
  }