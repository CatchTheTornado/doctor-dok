### REST API Documentation for AuditApiClient

This documentation is based on the `AuditApiClient` class defined in `src/data/client/audit-api-client.ts`.

#### GET `/api/audit`

Fetches audit records with pagination.

- **Request Parameters**:
  - `limit` (Query String): The maximum number of records to fetch. Defaults to 10 if not provided or invalid.
  - `offset` (Query String): The offset for pagination. Defaults to 0 if not provided or invalid.
- **Response**:
  - **Success** (`200 OK`):
    - Returns an array of `AuditDTO` objects representing the audit records.

```typescript
async get(limit: number, offset: number): Promise<AuditDTO[]> {
  if (limit <= 0) limit = 10;
  if (offset < 0) offset = 0;
  return this.request<AuditDTO[]>('/api/audit?limit=' + limit + '&offset=' + offset, 'GET', { ecnryptedFields: ['encryptedDiff'] }) as Promise<AuditDTO[]>;
}
```

#### PUT `/api/audit`

Adds a new audit record.

- **Request Body**: 
  - `PutAuditRequest`: An `AuditDTO` object representing the audit record to be added.
- **Response**:
  - **Success** (`200 OK`):
    - `PutAuditResponseSuccess`: Contains a message, the added `AuditDTO` object, and a status code.
  - **Error** (`400 Bad Request`):
    - `PutAuditResponseError`: Contains an error message, status code, and optional issues.

```typescript
async put(key: PutAuditRequest): Promise<PutAuditResponse> {
  return this.request<PutAuditResponse>('/api/audit', 'PUT', { ecnryptedFields: ['encryptedDiff'] }, key) as Promise<PutAuditResponse>;
}
```

### Data Structures

#### AuditDTO

Represents an audit record in the system.

```typescript
export interface AuditDTO {
  id: number;
  action: string;
  userId: string;
  timestamp: string;
  encryptedDiff: string;
}
```

#### PutAuditRequest

An `AuditDTO` object representing the audit record to be added.

```typescript
export type PutAuditRequest = AuditDTO;
```

#### PutAuditResponseSuccess

Represents a successful response for adding an audit record.

```typescript
export type PutAuditResponseSuccess = {
  message: string;
  data: AuditDTO;
  status: 200;
};
```

#### PutAuditResponseError

Represents an error response for adding an audit record.

```typescript
export type PutAuditResponseError = {
  message: string;
  status: 400;
  issues?: ZodIssue[];
};
```

#### PutAuditResponse

A union type of `PutAuditResponseSuccess` and `PutAuditResponseError`.

```typescript
export type PutAuditResponse = PutAuditResponseSuccess | PutAuditResponseError;
```

For more details, see the [source code](https://github.com/CatchTheTornado/doctor-dok/blob/main/src/data/client/audit-api-client.ts).