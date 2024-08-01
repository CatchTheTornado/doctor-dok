import { DatabaseAuthorizeChallengeRequestDTO, DatabaseAuthorizeRequestDTO, DatabaseCreateRequestDTO } from "../dto";
import { ApiClient, ApiEncryptionConfig } from "./base-api-client";

export type CreateDbResponseSuccess = {
  message: string;
  data: {
    databaseIdHash: string;
  }
  status: 200;
};

export type CreateDbResponseError = {
  message: string;
  status: 400;
  issues?: any[];
};

export type CreateDbResponse = CreateDbResponseSuccess | CreateDbResponseError;
export type AuthorizeDbChallengeResponse = AuthorizeDbChallengeResponseSuccess | AuthorizeDbChallengeResponseError;
export type AuthorizeDbChallengeResponseSuccess = {
  message: string;
  data: {
    challengeId: string;
  }
  status: 200;
};

export type AuthorizeDbChallengeResponseError = {
  message: string;
  status: 400;
  issues?: any[];
};

export type AuthorizeDbResponseSuccess = {
  message: string;
  data: {
    accessToken: string;
  }
  status: 200;
};

export type AuthorizeDbResponseError = {
  message: string;
  status: 400;
  issues?: any[];
};

export type AuthorizeDbResponse = AuthorizeDbResponseSuccess | AuthorizeDbResponseError;

export class DbApiClient extends ApiClient {
    constructor(baseUrl: string, encryptionConfig?: ApiEncryptionConfig) {
      super(baseUrl, encryptionConfig);
    }
  
    async create(createRequest:DatabaseCreateRequestDTO): Promise<CreateDbResponse> {
      return this.request<CreateDbResponse>('/api/db/create', 'POST', { ecnryptedFields: [] }, ) as Promise<CreateDbResponse>;
    }
  
    async authorizeChallenge(authorizeChallengeRequest: DatabaseAuthorizeChallengeRequestDTO): Promise<AuthorizeDbChallengeResponse> {
       return this.request<AuthorizeDbChallengeResponse>('/api/db/challenge', 'POST', { ecnryptedFields: [] }, authorizeChallengeRequest) as Promise<AuthorizeDbChallengeResponse>;
    }

    async authorize(authorizeRequest: DatabaseAuthorizeRequestDTO): Promise<AuthorizeDbResponse> {
      return this.request<AuthorizeDbChallengeResponse>('/api/db/authorize', 'POST', { ecnryptedFields: [] }, authorizeRequest) as Promise<AuthorizeDbResponse>;
   }

  }