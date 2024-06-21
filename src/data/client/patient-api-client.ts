import { PatientDTO } from "../dto";
import { ApiClient, ApiEncryptionConfig } from "./base-api-client";

export type GetPatientsResponse = PatientDTO[];

export type PutPatientRequest = PatientDTO;

export type PutPatientResponseSuccess = {
  message: string;
  data: PatientDTO;
  status: 200;
};

export type PutPatientResponseError = {
  message: string;
  status: 400;
  issues?: any[];
};

export type PutPatientResponse = PutPatientResponseSuccess | PutPatientResponseError;

export class PatientApiClient extends ApiClient {
    constructor(baseUrl: string, encryptionConfig?: ApiEncryptionConfig) {
      super(baseUrl, encryptionConfig);
    }
  
    async get(): Promise<GetPatientsResponse> {
      return this.request<GetPatientsResponse>('/api/patient', 'GET');
    }
  
    async put(patient: PutPatientRequest): Promise<PutPatientResponse> {
      return this.request<PutPatientResponse>('/api/patient', 'PUT', patient);
    }
  }