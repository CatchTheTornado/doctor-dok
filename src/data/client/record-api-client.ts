import { ApiClient, ApiEncryptionConfig } from "./base-api-client";
import { FolderDTO, RecordDTO, RecordDTOEncSettings } from "../dto";
import { DatabaseContextType } from "@/contexts/db-context";

export type GetRecordsResponse = RecordDTO[];
export type PutRecordRequest = RecordDTO;

export type PutRecordResponseSuccess = {
  message: string;
  data: RecordDTO;
  status: 200;
};

export type DeleteRecordResponse = {
  message: string;
  status: 200;
};

export type PutRecordResponseError = {
  message: string;
  status: 400;
  issues?: any[];
};

export type PutRecordResponse = PutRecordResponseSuccess | PutRecordResponseError;


export class RecordApiClient extends ApiClient {
    constructor(baseUrl: string, dbContext?: DatabaseContextType | null, encryptionConfig?: ApiEncryptionConfig) {
      super(baseUrl, dbContext, encryptionConfig);
    }
  
    async get(folder: FolderDTO): Promise<GetRecordsResponse> {
      return this.request<GetRecordsResponse>('/api/record?folderId=' + folder?.id, 'GET', RecordDTOEncSettings) as Promise<GetRecordsResponse>;
    }
  
    async put(record: PutRecordRequest): Promise<PutRecordResponse> {
      return this.request<PutRecordResponse>('/api/record', 'PUT', RecordDTOEncSettings, record) as Promise<PutRecordResponse>;
    }

    async delete(record: RecordDTO): Promise<DeleteRecordResponse> {
      return this.request<DeleteRecordResponse>('/api/record/' + record.id, 'DELETE', { ecnryptedFields: [] }) as Promise<DeleteRecordResponse>;
    }    
}