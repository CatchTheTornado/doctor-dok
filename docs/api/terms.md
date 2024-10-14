### REST API Documentation for TermApiClient

This documentation is based on the `TermApiClient` class defined in `src/data/client/term-api-client.ts`.

#### GET `/api/terms`

Fetches all terms.

- **Request Parameters**: None
- **Response**:
  - **Success** (`200 OK`):
    - Returns an array of `TermDTO` objects representing the terms.

```typescript
async get(): Promise<TermDTO[]> {
  return this.request<TermDTO[]>('/api/terms', 'GET', { ecnryptedFields: [] }) as Promise<TermDTO[]>;
}
```

#### PUT `/api/terms`

Updates a term.

- **Request Body**: 
  - `PutTermRequest`: A `TermDTO` object representing the term to be updated.
- **Response**:
  - **Success** (`200 OK`):
    - `PutTermResponseSuccess`: Contains a message, the updated `TermDTO` object, and a status code.
  - **Error** (`400 Bad Request`):
    - `PutTermResponseError`: Contains an error message, status code, and optional issues.

```typescript
async put(Term: PutTermRequest): Promise<PutTermResponse> {
  return this.request<PutTermResponse>('/api/terms', 'PUT', { ecnryptedFields: [] }, Term) as Promise<PutTermResponse>;
}
```

#### DELETE `/api/terms/{key}`

Deletes a term.

- **Request Parameters**:
  - `key` (Path): The identifier of the term to be deleted.
- **Response**:
  - **Success** (`200 OK`):
    - `PutTermResponseSuccess`: Contains a message and a status code.
  - **Error** (`400 Bad Request`):
    - `PutTermResponseError`: Contains an error message, status code, and optional issues.

```typescript
async delete(key: string): Promise<PutTermResponse> {
  return this.request<PutTermResponse>('/api/terms/' + key, 'DELETE', { ecnryptedFields: [] }) as Promise<PutTermResponse>;
}
```

### Data Structures

#### TermDTO

Represents a term in the system.

```typescript
export interface TermDTO {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
```

#### PutTermRequest

A `TermDTO` object representing the term to be updated.

```typescript
export type PutTermRequest = TermDTO;
```

#### PutTermResponseSuccess

Represents a successful response for updating a term.

```typescript
export type PutTermResponseSuccess = {
  message: string;
  data: TermDTO;
  status: 200;
};
```

#### PutTermResponseError

Represents an error response for updating a term.

```typescript
export type PutTermResponseError = {
  message: string;
  status: 400;
  issues?: ZodIssue[];
};
```

#### PutTermResponse

A union type of `PutTermResponseSuccess` and `PutTermResponseError`.

```typescript
export type PutTermResponse = PutTermResponseSuccess | PutTermResponseError;
```

For more details, see the [source code](https://github.com/CatchTheTornado/doctor-dok/blob/main/src/data/client/term-api-client.ts).