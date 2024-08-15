import { DatabaseContextType } from "@/contexts/db-context";
import { PatientDTO, PatientDTOEncSettings } from "../dto";
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

export type DeletePatientResponse = {
  message: string;
  status: 200;
};

export type PutPatientResponse = PutPatientResponseSuccess | PutPatientResponseError;

export class PatientApiClient extends ApiClient {
    constructor(baseUrl: string, dbContext?: DatabaseContextType | null, encryptionConfig?: ApiEncryptionConfig) {
      super(baseUrl, dbContext, encryptionConfig);
    }
  
    async get(): Promise<GetPatientsResponse> {
      return this.request<GetPatientsResponse>('/api/patient', 'GET', PatientDTOEncSettings) as Promise<GetPatientsResponse>;
    }
  
    async put(patient: PutPatientRequest): Promise<PutPatientResponse> {
      return this.request<PutPatientResponse>('/api/patient', 'PUT', PatientDTOEncSettings, patient) as Promise<PutPatientResponse>;
    }

    async delete(patient: PatientDTO): Promise<DeletePatientResponse> {
      return this.request<DeletePatientResponse>('/api/patient/' + patient.id, 'DELETE') as Promise<DeletePatientResponse>;
    }      
  }