import { DatabaseContextType } from "@/contexts/db-context";
import { SaaSContextType } from "@/contexts/saas-context";
import { FolderDTO, FolderDTOEncSettings } from "../dto";
import { ApiClient, ApiEncryptionConfig } from "./base-api-client";

export type GetFoldersResponse = FolderDTO[];

export type PutFolderRequest = FolderDTO;

export type PutFolderResponseSuccess = {
  message: string;
  data: FolderDTO;
  status: 200;
};

export type PutFolderResponseError = {
  message: string;
  status: 400;
  issues?: any[];
};

export type DeleteFolderResponse = {
  message: string;
  status: 200;
};

export type PutFolderResponse = PutFolderResponseSuccess | PutFolderResponseError;

export class FolderApiClient extends ApiClient {
    constructor(baseUrl: string, dbContext?: DatabaseContextType | null, saasContext?: SaaSContextType | null, encryptionConfig?: ApiEncryptionConfig) {
      super(baseUrl, dbContext, saasContext, encryptionConfig);
    }
  
    async get(): Promise<GetFoldersResponse> {
      return this.request<GetFoldersResponse>('/api/folder', 'GET', FolderDTOEncSettings) as Promise<GetFoldersResponse>;
    }
  
    async put(folder: PutFolderRequest): Promise<PutFolderResponse> {
      return this.request<PutFolderResponse>('/api/folder', 'PUT', FolderDTOEncSettings, folder) as Promise<PutFolderResponse>;
    }

    async delete(folder: FolderDTO): Promise<DeleteFolderResponse> {
      return this.request<DeleteFolderResponse>('/api/folder/' + folder.id, 'DELETE', { ecnryptedFields: [] }) as Promise<DeleteFolderResponse>;
    }      
  }