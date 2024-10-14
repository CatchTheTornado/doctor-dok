### REST API Documentation for StatApiClient

This documentation is based on the `StatApiClient` class defined in `src/data/client/stat-api-client.ts`.

#### GET `/api/stats/aggregated`

Fetches aggregated statistics.

- **Request Parameters**: None
- **Response**:
  - **Success** (`200 OK`):
    - `AggregatedStatsResponseSuccess`: Contains a message, aggregated stats data (`AggregatedStatsDTO`), and a status code.
  - **Error** (`400 Bad Request`):
    - `AggregatedStatsResponseError`: Contains an error message, status code, and optional issues.

```typescript
async aggregated(): Promise<AggregatedStatsResponse> {
  return this.request<AggregatedStatsResponse>('/api/stats/aggregated', 'GET', { ecnryptedFields: [] }) as Promise<AggregatedStatsResponse>;
}
```

#### PUT `/api/stats`

Aggregates a new statistic.

- **Request Body**: 
  - `AggregateStatRequest`: A `StatDTO` object representing the statistic to be aggregated.
- **Response**:
  - **Success** (`200 OK`):
    - `AggregateStatResponseSuccess`: Contains a message, the aggregated stat data (`StatDTO`), and a status code.
  - **Error** (`400 Bad Request`):
    - `AggregateStatResponseError`: Contains an error message, status code, and optional issues.

```typescript
async aggregate(newItem: StatDTO): Promise<AggregateStatResponse> {
  return this.request<AggregateStatResponse>('/api/stats', 'PUT', { ecnryptedFields: [] }, newItem) as Promise<AggregateStatResponse>;
}
```

### Data Structures

#### StatDTO

Represents a statistic in the system.

```typescript
export interface StatDTO {
  id: string;
  value: number;
  timestamp: string;
}
```

#### AggregatedStatsDTO

Represents aggregated statistics data in the system.

```typescript
export interface AggregatedStatsDTO {
  total: number;
  average: number;
  count: number;
}
```

#### AggregateStatRequest

A `StatDTO` object representing the statistic to be aggregated.

```typescript
export type AggregateStatRequest = StatDTO;
```

#### AggregateStatResponseSuccess

Represents a successful response for aggregating a statistic.

```typescript
export type AggregateStatResponseSuccess = {
  message: string;
  data: StatDTO;
  status: 200;
};
```

#### AggregateStatResponseError

Represents an error response for aggregating a statistic.

```typescript
export type AggregateStatResponseError = {
  message: string;
  status: 400;
  issues?: any[];
};
```

#### AggregateStatResponse

A union type of `AggregateStatResponseSuccess` and `AggregateStatResponseError`.

```typescript
export type AggregateStatResponse = AggregateStatResponseSuccess | AggregateStatResponseError;
```

#### AggregatedStatsResponseSuccess

Represents a successful response for fetching aggregated statistics.

```typescript
export type AggregatedStatsResponseSuccess = {
  message: string;
  data: AggregatedStatsDTO;
  status: 200;
};
```

#### AggregatedStatsResponseError

Represents an error response for fetching aggregated statistics.

```typescript
export type AggregatedStatsResponseError = {
  message: string;
  status: 400;
  issues?: any[];
};
```

#### AggregatedStatsResponse

A union type of `AggregatedStatsResponseSuccess` and `AggregatedStatsResponseError`.

```typescript
export type AggregatedStatsResponse = AggregatedStatsResponseSuccess | AggregatedStatsResponseError;
```

For more details, see the [source code](https://github.com/CatchTheTornado/doctor-dok/blob/main/src/data/client/stat-api-client.ts).