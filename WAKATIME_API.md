# WakaTime API Implementation with Zod Validation

## Overview

This implementation provides WakaTime-compatible API endpoints with robust validation using Zod and drizzle-zod for type safety and runtime validation.

## Endpoints Created

### 1. POST `/api/wakatime/users/current/heartbeats`

- **Purpose**: Accept single heartbeat or array of heartbeats
- **Authentication**: Bearer token (API key)
- **Validation**: Zod schema validation for heartbeat data
- **Response**: 201 with processed heartbeat responses

### 2. POST `/api/wakatime/users/current/heartbeats.bulk`

- **Purpose**: Accept bulk heartbeats (array only)
- **Authentication**: Bearer token (API key)
- **Validation**: Zod schema validation for bulk heartbeat data
- **Response**: 201 with processed heartbeat responses

### 3. GET `/api/wakatime/users/current/statusbar/today`

- **Purpose**: Get today's activity summary for status bar
- **Authentication**: Bearer token (API key)
- **Response**: Activity data with time totals, current project, language, etc.

### 4. GET `/api/wakatime/users/current/summary`

- **Purpose**: Get activity summary for specified date range
- **Authentication**: Bearer token (API key)
- **Query Parameters**: start, end, range, project, branches, timeout, writes_only, timezone
- **Validation**: Zod schema validation for query parameters
- **Response**: Daily activity data with breakdowns by projects, languages, etc.

## Key Features

### Zod Validation Schemas

- **`wakatimeHeartbeatSchema`**: Validates individual heartbeat data
- **`bulkHeartbeatsRequestSchema`**: Validates array of heartbeats
- **`summaryQuerySchema`**: Validates summary endpoint query parameters
- **`statusbarQuerySchema`**: Validates statusbar endpoint query parameters

### API Response Utilities

- **`createValidationErrorResponse`**: Standardized validation error responses
- **`createAuthErrorResponse`**: Standardized authentication error responses
- **`createServerErrorResponse`**: Standardized server error responses
- **`createSuccessResponse`**: Standardized success responses

### API Key Validation

- **`validateApiKey`**: Validates API keys against the database
- Checks for enabled status and returns user ID

## Database Schema Integration

- Uses `wakatimePendingHeartbeats` table for storing incoming heartbeats
- Uses `wakatimeHeartbeats` table for aggregated heartbeat data
- Integrates with existing user authentication system

## Error Handling

- Comprehensive error handling with specific error messages
- Validation errors include detailed field-level error information
- Proper HTTP status codes for different error types

## Type Safety

- Full TypeScript support with generated types from Zod schemas
- Integration with Drizzle ORM for database operations
- Type-safe API responses and request handling

## Usage Example

```typescript
// Valid heartbeat data
const heartbeat = {
  time: 1642419600,
  entity: "/path/to/file.ts",
  type: "file",
  category: "coding",
  project: "my-project",
  language: "TypeScript",
  is_write: true,
};

// POST to /api/wakatime/users/current/heartbeats
// Headers: Authorization: Bearer your-api-key
// Body: heartbeat (single) or [heartbeat, heartbeat2] (array)
```

## Benefits

1. **Type Safety**: Compile-time and runtime type checking
2. **Validation**: Comprehensive input validation with clear error messages
3. **Consistency**: Standardized error handling and responses
4. **Maintainability**: Clean separation of concerns with utility functions
5. **Extensibility**: Easy to add new endpoints or modify existing ones
6. **Performance**: Efficient database operations with proper indexing support
