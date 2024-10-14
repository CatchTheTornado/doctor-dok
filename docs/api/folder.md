### REST API Documentation for FolderApiClient

This documentation is based on the `FolderApiClient` class defined in `src/data/client/folder-api-client.ts`.

#### GET `/api/folder`

Fetches all folders.

- **Request Parameters**: None
- **Response**:
  - **Success** (`200 OK`):
    - `GetFoldersResponse`: An array of `FolderDTO` objects representing the folders.

```typescript
async get(): Promise<GetFoldersResponse> {
  return this.request<GetFoldersResponse>('/api/folder', 'GET', FolderDTOEncSettings) as Promise<GetFoldersResponse>;
}
```

#### PUT `/api/folder`

Updates a folder.

- **Request Body**: 
  - `PutFolderRequest`: A `FolderDTO` object representing the folder to be updated.
- **Response**:
  - **Success** (`200 OK`):
    - `PutFolderResponseSuccess`: Contains a message, the updated `FolderDTO` object, and a status code.
  - **Error** (`400 Bad Request`):
    - `PutFolderResponseError`: Contains an error message, status code, and optional issues.

```typescript
async put(folder: PutFolderRequest): Promise<PutFolderResponse> {
  return this.request<PutFolderResponse>('/api/folder', 'PUT', FolderDTOEncSettings, folder) as Promise<PutFolderResponse>;
}
```

#### DELETE `/api/folder/{id}`

Deletes a folder.

- **Request Parameters**:
  - `id` (Path): The ID of the folder to be deleted.
- **Response**:
  - **Success** (`200 OK`):
    - `DeleteFolderResponse`: Contains a message and a status code.

```typescript
async delete(folder: FolderDTO): Promise<DeleteFolderResponse> {
  return this.request<DeleteFolderResponse>('/api/folder/' + folder.id, 'DELETE', { ecnryptedFields: [] }) as Promise<DeleteFolderResponse>;
}
```

### Data Structures

#### FolderDTO

Represents a folder in the system.

```typescript
export interface FolderDTO {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### GetFoldersResponse

An array of `FolderDTO` objects.

```typescript
export type GetFoldersResponse = FolderDTO[];
```

#### PutFolderRequest

A `FolderDTO` object representing the folder to be updated.

```typescript
export type PutFolderRequest = FolderDTO;
```

#### PutFolderResponseSuccess

Represents a successful response for updating a folder.

```typescript
export type PutFolderResponseSuccess = {
  message: string;
  data: FolderDTO;
  status: 200;
};
```

#### PutFolderResponseError

Represents an error response for updating a folder.

```typescript
export type PutFolderResponseError = {
  message: string;
  status: 400;
  issues?: any[];
};
```

#### PutFolderResponse

A union type of `PutFolderResponseSuccess` and `PutFolderResponseError`.

```typescript
export type PutFolderResponse = PutFolderResponseSuccess | PutFolderResponseError;
```

#### DeleteFolderResponse

Represents the response for deleting a folder.

```typescript
export type DeleteFolderResponse = {
  message: string;
  status: 200;
};
```

For more details, see the [source code](https://github.com/CatchTheTornado/doctor-dok/blob/main/src/data/client/folder-api-client.ts).