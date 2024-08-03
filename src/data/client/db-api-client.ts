import { DatabaseAuthorizeChallengeRequestDTO, DatabaseAuthorizeRequestDTO, DatabaseCreateRequestDTO, KeyHashParamsDTO } from "../dto";
import { ApiClient, ApiEncryptionConfig } from "./base-api-client";

export type CreateDbResponse = {
  message: string;
  data: {
    databaseIdHash: string;
  }
  status: number;
  issues?: any[];
};
export type AuthorizeDbChallengeResponse = {
  message: string;
  data?: KeyHashParamsDTO,
  status: number;
  issues?: any[];
};

export type AuthorizeDbResponse = {
  message: string;
  data: {
    encryptedMasterKey: string;
    accessToken: string;
    refreshToken: string;
  }
  status: number;
  issues?: any[];
};

export class DbApiClient extends ApiClient {
    constructor(baseUrl: string, encryptionConfig?: ApiEncryptionConfig) {
      super(baseUrl, encryptionConfig);
    }
  
    async create(createRequest:DatabaseCreateRequestDTO): Promise<CreateDbResponse> {
      return this.request<CreateDbResponse>('/api/db/create', 'POST', { ecnryptedFields: [] }, createRequest) as Promise<CreateDbResponse>;
    }
  
    async authorizeChallenge(authorizeChallengeRequest: DatabaseAuthorizeChallengeRequestDTO): Promise<AuthorizeDbChallengeResponse> {
       return this.request<AuthorizeDbChallengeResponse>('/api/db/challenge', 'POST', { ecnryptedFields: [] }, authorizeChallengeRequest) as Promise<AuthorizeDbChallengeResponse>;
    }

    async authorize(authorizeRequest: DatabaseAuthorizeRequestDTO): Promise<AuthorizeDbChallengeResponse> {
      return this.request<AuthorizeDbChallengeResponse>('/api/db/authorize', 'POST', { ecnryptedFields: [] }, authorizeRequest) as Promise<AuthorizeDbChallengeResponse>;
   }

  }