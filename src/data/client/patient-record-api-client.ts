import { ApiClient, ApiEncryptionConfig } from "./base-api-client";
import { PatientRecordDTO, PatientRecordDTOEncSettings } from "../dto";

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
    constructor(baseUrl: string, encryptionConfig?: ApiEncryptionConfig) {
      super(baseUrl, encryptionConfig);
    }
  
    async get(): Promise<GetPatientRecordsResponse> {
      return this.request<GetPatientRecordsResponse>('/api/patient-record', 'GET', PatientRecordDTOEncSettings) as Promise<GetPatientRecordsResponse>;
    }
  
    async put(patientRecord: PutPatientRecordRequest): Promise<PutPatientRecordResponse> {
      return this.request<PutPatientRecordResponse>('/api/patient-record', 'PUT', PatientRecordDTOEncSettings, patientRecord) as Promise<PutPatientRecordResponse>;
    }

    async delete(patientRecord: PatientRecordDTO): Promise<DeletePatientRecordResponse> {
      return this.request<DeletePatientRecordResponse>('/api/patient-record/' + patientRecord.id, 'DELETE') as Promise<DeletePatientRecordResponse>;
    }    
}