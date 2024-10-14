### REST API Documentation for EncryptedAttachmentApiClient

This documentation is based on the `EncryptedAttachmentApiClient` class defined in `src/data/client/encrypted-attachment-api-client.ts`.

#### PUT `/api/encrypted-attachment`

Uploads or updates an encrypted attachment.

- **Request Body**: 
  - `PutEncryptedAttachmentRequest`: Can be either `FormData` or `EncryptedAttachmentDTO`.
- **Response**:
  - **Success** (`200 OK`):
    - `PutEncryptedAttachmentResponseSuccess`: Contains a message, the updated `EncryptedAttachmentDTO` object, and a status code.
  - **Error** (`400 Bad Request`):
    - `PutEncryptedAttachmentResponseError`: Contains an error message, status code, and optional issues.

```typescript
async put(inputObject:PutEncryptedAttachmentRequest): Promise<PutEncryptedAttachmentResponse> {
  if (inputObject instanceof FormData) {
    return this.request<PutEncryptedAttachmentResponse>('/api/encrypted-attachment', 'PUT', { ecnryptedFields: [] }, null, inputObject as FormData) as Promise<PutEncryptedAttachmentResponse>;
  } else {
    return this.request<PutEncryptedAttachmentResponse>('/api/encrypted-attachment', 'PUT', { ecnryptedFields: ['displayName'] }, inputObject as EncryptedAttachmentDTO) as Promise<PutEncryptedAttachmentResponse>;
  }
}
```

#### GET `/api/encrypted-attachment/{storageKey}`

Fetches an encrypted attachment.

- **Request Parameters**:
  - `storageKey` (Path): The storage key of the encrypted attachment to fetch.
- **Response**:
  - **Success** (`200 OK`):
    - Returns the attachment as an `ArrayBuffer`.

```typescript
async get(attachment: EncryptedAttachmentDTO): Promise<ArrayBuffer | undefined | null> {
  return this.getArrayBuffer('/api/encrypted-attachment/' + attachment.storageKey);
}
```

#### DELETE `/api/encrypted-attachment/{storageKey}`

Deletes an encrypted attachment.

- **Request Parameters**:
  - `storageKey` (Path): The storage key of the encrypted attachment to be deleted.
- **Response**:
  - **Success** (`200 OK`):
    - `DeleteEncryptedAttachmentResponse`: Contains a message and a status code.

```typescript
async delete(attachment: EncryptedAttachmentDTO): Promise<DeleteEncryptedAttachmentResponse> {
  return this.request<DeleteEncryptedAttachmentResponse>('/api/encrypted-attachment/' + attachment.storageKey, 'DELETE', { ecnryptedFields: [] }) as Promise<DeleteEncryptedAttachmentResponse>;
}
```

### Data Structures

#### EncryptedAttachmentDTO

Represents an encrypted attachment in the system.

```typescript
export interface EncryptedAttachmentDTO {
  storageKey: string;
  displayName?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

#### PutEncryptedAttachmentRequest

Can be either `FormData` or `EncryptedAttachmentDTO`.

```typescript
export type PutEncryptedAttachmentRequest = FormData | EncryptedAttachmentDTO;
```

#### PutEncryptedAttachmentResponseSuccess

Represents a successful response for uploading or updating an encrypted attachment.

```typescript
export type PutEncryptedAttachmentResponseSuccess = {
  message: string;
  data: EncryptedAttachmentDTO;
  status: 200;
};
```

#### PutEncryptedAttachmentResponseError

Represents an error response for uploading or updating an encrypted attachment.

```typescript
export type PutEncryptedAttachmentResponseError = {
  message: string;
  status: 400;
  issues?: any[];
};
```

#### PutEncryptedAttachmentResponse

A union type of `PutEncryptedAttachmentResponseSuccess` and `PutEncryptedAttachmentResponseError`.

```typescript
export type PutEncryptedAttachmentResponse = PutEncryptedAttachmentResponseSuccess | PutEncryptedAttachmentResponseError;
```

#### DeleteEncryptedAttachmentResponse

Represents the response for deleting an encrypted attachment.

```typescript
export type DeleteEncryptedAttachmentResponse = {
  message: string;
  status: 200;
};
```

For more details, see the [source code](https://github.com/CatchTheTornado/doctor-dok/blob/main/src/data/client/encrypted-attachment-api-client.ts).