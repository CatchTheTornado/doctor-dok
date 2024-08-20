import { ApiClient, ApiEncryptionConfig } from "./base-api-client";
import { PatientDTO, PatientRecordDTO, PatientRecordDTOEncSettings } from "../dto";
import { DatabaseContextType } from "@/contexts/db-context";

export type GetPatientRecordsResponse = PatientRecordDTO[];
export type PutPatientRecordRequest = PatientRecordDTO;

export type PutPatientRecordResponseSuccess = {
  message: string;
  data: PatientRecordDTO;
  status: 200;
};

export type DeletePatientRecordResponse = {
  message: string;
  status: 200;
};

export type PutPatientRecordResponseError = {
  message: string;
  status: 400;
  issues?: any[];
};

export type PutPatientRecordResponse = PutPatientRecordResponseSuccess | PutPatientRecordResponseError;


export class PatientRecordApiClient extends ApiClient {
    constructor(baseUrl: string, dbContext?: DatabaseContextType | null, encryptionConfig?: ApiEncryptionConfig) {
      super(baseUrl, dbContext, encryptionConfig);
    }
  
    async get(patient: PatientDTO): Promise<GetPatientRecordsResponse> {
      return this.request<GetPatientRecordsResponse>('/api/patient-record?patientId=' + patient?.id, 'GET', PatientRecordDTOEncSettings) as Promise<GetPatientRecordsResponse>;
    }
  
    async put(patientRecord: PutPatientRecordRequest): Promise<PutPatientRecordResponse> {
      return this.request<PutPatientRecordResponse>('/api/patient-record', 'PUT', PatientRecordDTOEncSettings, patientRecord) as Promise<PutPatientRecordResponse>;
    }

    async delete(patientRecord: PatientRecordDTO): Promise<DeletePatientRecordResponse> {
      return this.request<DeletePatientRecordResponse>('/api/patient-record/' + patientRecord.id, 'DELETE', { ecnryptedFields: [] }) as Promise<DeletePatientRecordResponse>;
    }    
}