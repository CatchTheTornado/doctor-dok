### REST API Documentation for ConfigApiClient

This documentation is based on the `ConfigApiClient` class defined in `src/data/client/config-api-client.ts`.

#### GET `/api/config`

Fetches all configurations.

- **Request Parameters**: None
- **Response**:
  - **Success** (`200 OK`):
    - Returns an array of `ConfigDTO` objects representing the configurations.

```typescript
async get(): Promise<ConfigDTO[]> {
  return this.request<ConfigDTO[]>('/api/config', 'GET', ConfigDTOEncSettings) as Promise<ConfigDTO[]>;
}
```

#### PUT `/api/config`

Updates a configuration.

- **Request Body**: 
  - `PutConfigRequest`: A `ConfigDTO` object representing the configuration to be updated.
- **Response**:
  - **Success** (`200 OK`):
    - `PutConfigResponseSuccess`: Contains a message, the updated `ConfigDTO` object, and a status code.
  - **Error** (`400 Bad Request`):
    - `PutConfigResponseError`: Contains an error message, status code, and optional issues.

```typescript
async put(config: PutConfigRequest): Promise<PutConfigResponse> {
  return this.request<PutConfigResponse>('/api/config', 'PUT', ConfigDTOEncSettings, config) as Promise<PutConfigResponse>;
}
```

### Data Structures

#### ConfigDTO

Represents a configuration in the system.

```typescript
export interface ConfigDTO {
  id: number;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}
```

#### PutConfigRequest

A `ConfigDTO` object representing the configuration to be updated.

```typescript
export type PutConfigRequest = ConfigDTO;
```

#### PutConfigResponseSuccess

Represents a successful response for updating a configuration.

```typescript
export type PutConfigResponseSuccess = {
  message: string;
  data: ConfigDTO;
  status: 200;
};
```

#### PutConfigResponseError

Represents an error response for updating a configuration.

```typescript
export type PutConfigResponseError = {
  message: string;
  status: 400;
  issues?: any[];
};
```

#### PutConfigResponse

A union type of `PutConfigResponseSuccess` and `PutConfigResponseError`.

```typescript
export type PutConfigResponse = PutConfigResponseSuccess | PutConfigResponseError;
```

For more details, see the [source code](https://github.com/CatchTheTornado/doctor-dok/blob/main/src/data/client/config-api-client.ts).