### REST API Documentation for DbApiClient

This documentation is based on the `DbApiClient` class defined in `src/data/client/db-api-client.ts`.

This is an implementation of [Application Security Archirecture](https://github.com/CatchTheTornado/doctor-dok/issues/65)

#### POST `/api/db/create`

Creates a new database.

- **Request Body**: 
  - `DatabaseCreateRequestDTO`: Data required to create a new database.
- **Response**:
  - **Success** (`200 OK`):
    - `CreateDbResponse`: Contains a message, the database ID hash, and a status code. Optional issues.

```typescript
async create(createRequest: DatabaseCreateRequestDTO): Promise<CreateDbResponse> {
  return this.request<CreateDbResponse>('/api/db/create', 'POST', { ecnryptedFields: [] }, createRequest) as Promise<CreateDbResponse>;
}
```

#### POST `/api/db/challenge`

Authorizes a challenge for database access.

- **Request Body**:
  - `DatabaseAuthorizeChallengeRequestDTO`: Data required to authorize a challenge.
- **Response**:
  - **Success** (`200 OK`):
    - `AuthorizeDbChallengeResponse`: Contains a message, optional key hash parameters, and a status code. Optional issues.

```typescript
async authorizeChallenge(authorizeChallengeRequest: DatabaseAuthorizeChallengeRequestDTO): Promise<AuthorizeDbChallengeResponse> {
  return this.request<AuthorizeDbChallengeResponse>('/api/db/challenge?databaseIdHash=' + encodeURIComponent(authorizeChallengeRequest.databaseIdHash), 'POST', { ecnryptedFields: [] }, authorizeChallengeRequest) as Promise<AuthorizeDbChallengeResponse>;
}
```

#### POST `/api/db/authorize`

Authorizes access to the database.

- **Request Body**:
  - `DatabaseAuthorizeRequestDTO`: Data required to authorize access.
- **Response**:
  - **Success** (`200 OK`):
    - `AuthorizeDbResponse`: Contains a message, encrypted master key, access token, refresh token, ACL, optional SaaS context, and a status code. Optional issues.

```typescript
async authorize(authorizeRequest: DatabaseAuthorizeRequestDTO): Promise<AuthorizeDbResponse> {
  return this.request<AuthorizeDbResponse>('/api/db/authorize?databaseIdHash=' + encodeURIComponent(authorizeRequest.databaseIdHash), 'POST', { ecnryptedFields: [] }, authorizeRequest) as Promise<AuthorizeDbResponse>;
}
```

#### POST `/api/db/refresh`

Refreshes the database access token.

- **Request Body**:
  - `DatabaseRefreshRequestDTO`: Data required to refresh the access token.
- **Response**:
  - **Success** (`200 OK`):
    - `RefreshDbResponse`: Contains a message, new access token, refresh token, and a status code. Optional issues.

```typescript
async refresh(refreshRequest: DatabaseRefreshRequestDTO): Promise<RefreshDbResponse> {
  return this.request<AuthorizeDbResponse>('/api/db/refresh', 'POST', { ecnryptedFields: [] }, refreshRequest) as Promise<AuthorizeDbResponse>;
}
```

### Data Structures

#### DatabaseCreateRequestDTO

Represents the data required to create a new database.

```typescript
export interface DatabaseCreateRequestDTO {
  databaseName: string;
  encryptionKey: string;
}
```

#### DatabaseAuthorizeChallengeRequestDTO

Represents the data required to authorize a challenge for database access.

```typescript
export interface DatabaseAuthorizeChallengeRequestDTO {
  databaseIdHash: string;
}
```

#### DatabaseAuthorizeRequestDTO

Represents the data required to authorize access to the database.

```typescript
export interface DatabaseAuthorizeRequestDTO {
  databaseIdHash: string;
  keyHashParams: KeyHashParamsDTO;
}
```

#### DatabaseRefreshRequestDTO

Represents the data required to refresh the database access token.

```typescript
export interface DatabaseRefreshRequestDTO {
  refreshToken: string;
}
```

#### KeyHashParamsDTO

Represents key hash parameters.

```typescript
export interface KeyHashParamsDTO {
  key: string;
  salt: string;
}
```

#### KeyACLDTO

Represents the Access Control List (ACL) for a key.

```typescript
export interface KeyACLDTO {
  role: string;
  features: string[];
}
```

#### SaaSDTO

Represents the SaaS context.

```typescript
export interface SaaSDTO {
  currentQuota: {
    allowedDatabases: number;
    allowedUSDBudget: number;
    allowedTokenBudget: number;
  };
  currentUsage: {
    usedDatabases: number;
    usedUSDBudget: number;
    usedTokenBudget: number;
  };
  email?: string;
  userId?: string;
  saasToken: string;
}
```

#### CreateDbResponse

Represents the response for creating a new database.

```typescript
export type CreateDbResponse = {
  message: string;
  data: {
    databaseIdHash: string;
  };
  status: number;
  issues?: any[];
};
```

#### AuthorizeDbChallengeResponse

Represents the response for authorizing a challenge.

```typescript
export type AuthorizeDbChallengeResponse = {
  message: string;
  data?: KeyHashParamsDTO;
  status: number;
  issues?: any[];
};
```

#### AuthorizeDbResponse

Represents the response for authorizing database access.

```typescript
export type AuthorizeDbResponse = {
  message: string;
  data: {
    encryptedMasterKey: string;
    accessToken: string;
    refreshToken: string;
    acl: KeyACLDTO | null;
    saasContext?: SaaSDTO | null;
  };
  status: number;
  issues?: any[];
};
```

#### RefreshDbResponse

Represents the response for refreshing the database access token.

```typescript
export type RefreshDbResponse = {
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
  status: number;
  issues?: any[];
};
```

For more details, see the [source code](https://github.com/CatchTheTornado/doctor-dok/blob/main/src/data/client/db-api-client.ts).

