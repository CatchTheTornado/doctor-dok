import { PatientDTO } from "../dto";
import { ApiClient, ApiEncryptionConfig } from "./base-api-client";

type GetPatientsResponse = PatientDTO[];

type PutPatientRequest = PatientDTO;

type PutPatientResponseSuccess = {
  message: string;
  data: PatientDTO;
  status: 200;
};

type PutPatientResponseError = {
  message: string;
  status: 400;
  issues?: any[];
};

type PutPatientResponse = PutPatientResponseSuccess | PutPatientResponseError;

class PatientApiClient extends ApiClient {
    constructor(baseUrl: string, encryptionConfig?: ApiEncryptionConfig) {
      super(baseUrl, encryptionConfig);
    }
  
    async get(): Promise<GetPatientsResponse> {
      return this.request<GetPatientsResponse>('/api/patients', 'GET');
    }
  
    async put(patient: PutPatientRequest): Promise<PutPatientResponse> {
      return this.request<PutPatientResponse>('/api/patients', 'PUT', patient);
    }
  }