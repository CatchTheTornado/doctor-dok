### REST API Documentation for KeyApiClient

This documentation is based on the `KeyApiClient` class defined in `src/data/client/key-api-client.ts`.

#### GET `/api/keys`

Fetches all keys.

- **Request Parameters**: None
- **Response**:
  - **Success** (`200 OK`):
    - Returns an array of `KeyDTO` objects representing the keys.

```typescript
async get(): Promise<KeyDTO[]> {
  return this.request<KeyDTO[]>('/api/keys', 'GET', { ecnryptedFields: [] }) as Promise<KeyDTO[]>;
}
```

#### PUT `/api/keys`

Updates a key.

- **Request Body**: 
  - `PutKeyRequest`: A `KeyDTO` object representing the key to be updated.
- **Response**:
  - **Success** (`200 OK`):
    - `PutKeyResponseSuccess`: Contains a message, the updated `KeyDTO` object, and a status code.
  - **Error** (`400 Bad Request`):
    - `PutKeyResponseError`: Contains an error message, status code, and optional issues.

```typescript
async put(key: PutKeyRequest): Promise<PutKeyResponse> {
  return this.request<PutKeyResponse>('/api/keys', 'PUT', { ecnryptedFields: [] }, key) as Promise<PutKeyResponse>;
}
```

#### DELETE `/api/keys/{keyLocatorHash}`

Deletes a key.

- **Request Parameters**:
  - `keyLocatorHash` (Path): The locator hash of the key to be deleted.
- **Response**:
  - **Success** (`200 OK`):
    - `PutKeyResponseSuccess`: Contains a message and a status code.
  - **Error** (`400 Bad Request`):
    - `PutKeyResponseError`: Contains an error message, status code, and optional issues.

```typescript
async delete(keyLocatorHash: string): Promise<PutKeyResponse> {
  return this.request<PutKeyResponse>('/api/keys/' + keyLocatorHash, 'DELETE', { ecnryptedFields: [] }) as Promise<PutKeyResponse>;
}
```

### Data Structures

#### KeyDTO

Represents a key in the system.

```typescript
export interface KeyDTO {
  id: number;
  name: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}
```

#### PutKeyRequest

A `KeyDTO` object representing the key to be updated.

```typescript
export type PutKeyRequest = KeyDTO;
```

#### PutKeyResponseSuccess

Represents a successful response for updating a key.

```typescript
export type PutKeyResponseSuccess = {
  message: string;
  data: KeyDTO;
  status: 200;
};
```

#### PutKeyResponseError

Represents an error response for updating a key.

```typescript
export type PutKeyResponseError = {
  message: string;
  status: 400;
  issues?: ZodIssue[];
};
```

#### PutKeyResponse

A union type of `PutKeyResponseSuccess` and `PutKeyResponseError`.

```typescript
export type PutKeyResponse = PutKeyResponseSuccess | PutKeyResponseError;
```

For more details, see the [source code](https://github.com/CatchTheTornado/doctor-dok/blob/main/src/data/client/key-api-client.ts).