### REST API Documentation for RecordApiClient

This documentation is based on the `RecordApiClient` class defined in `src/data/client/record-api-client.ts`.

#### GET `/api/record`

Fetches records for a specific folder.

- **Request Parameters**:
  - `folderId` (Query String): The ID of the folder to fetch records for.
- **Response**:
  - **Success** (`200 OK`):
    - `GetRecordsResponse`: An array of `RecordDTO` objects representing the records in the folder.

```typescript
async get(folder: FolderDTO): Promise<GetRecordsResponse> {
  return this.request<GetRecordsResponse>('/api/record?folderId=' + folder?.id, 'GET', RecordDTOEncSettings) as Promise<GetRecordsResponse>;
}
```

#### PUT `/api/record`

Updates a record.

- **Request Body**: 
  - `PutRecordRequest`: A `RecordDTO` object representing the record to be updated.
- **Response**:
  - **Success** (`200 OK`):
    - `PutRecordResponseSuccess`: Contains a message, the updated `RecordDTO` object, and a status code.
  - **Error** (`400 Bad Request`):
    - `PutRecordResponseError`: Contains an error message, status code, and optional issues.

```typescript
async put(record: PutRecordRequest): Promise<PutRecordResponse> {
  return this.request<PutRecordResponse>('/api/record', 'PUT', RecordDTOEncSettings, record) as Promise<PutRecordResponse>;
}
```

#### DELETE `/api/record/{id}`

Deletes a record.

- **Request Parameters**:
  - `id` (Path): The ID of the record to be deleted.
- **Response**:
  - **Success** (`200 OK`):
    - `DeleteRecordResponse`: Contains a message and a status code.

```typescript
async delete(record: RecordDTO): Promise<DeleteRecordResponse> {
  return this.request<DeleteRecordResponse>('/api/record/' + record.id, 'DELETE', { ecnryptedFields: [] }) as Promise<DeleteRecordResponse>;
}
```

### Data Structures

#### RecordDTO

Represents a record in the system.

```typescript
export interface RecordDTO {
  id: number;
  folderId: number;
  title: string;
  tags: string;
  description: string;
  type: string;
  json: string;
  text: string;
  extra: string;
  transcription: string;
  createdAt: string;
  updatedAt: string;
  eventDate: string;
  checksum: string;
  checksumLastParsed: string;
  attachments: string;
}
```

#### GetRecordsResponse

An array of `RecordDTO` objects.

```typescript
export type GetRecordsResponse = RecordDTO[];
```

#### PutRecordRequest

A `RecordDTO` object representing the record to be updated.

```typescript
export type PutRecordRequest = RecordDTO;
```

#### PutRecordResponseSuccess

Represents a successful response for updating a record.

```typescript
export type PutRecordResponseSuccess = {
  message: string;
  data: RecordDTO;
  status: 200;
};
```

#### PutRecordResponseError

Represents an error response for updating a record.

```typescript
export type PutRecordResponseError = {
  message: string;
  status: 400;
  issues?: any[];
};
```

#### PutRecordResponse

A union type of `PutRecordResponseSuccess` and `PutRecordResponseError`.

```typescript
export type PutRecordResponse = PutRecordResponseSuccess | PutRecordResponseError;
```

#### DeleteRecordResponse

Represents the response for deleting a record.

```typescript
export type DeleteRecordResponse = {
  message: string;
  status: 200;
};
```

For more details, see the [source code](https://github.com/CatchTheTornado/doctor-dok/blob/main/src/data/client/record-api-client.ts).