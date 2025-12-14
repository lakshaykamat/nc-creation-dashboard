# API Reference

This document provides detailed documentation for all API endpoints in the NC Dashboard application.

## Table of Contents

- [Authentication](#authentication)
- [Article Management](#article-management)
- [Allocation Management](#allocation-management)
- [Article Allocations](#article-allocations)
- [Portal Data](#portal-data)
- [Teams Management](#teams-management)
- [Email Management](#email-management)
- [Other Endpoints](#other-endpoints)

## Base URL

All API endpoints are prefixed with `/api`.

## Authentication

All API endpoints (except `/api/login`) require authentication. The API supports two authentication methods:

1. **Cookie-based authentication (Web)**: Session-based authentication via HTTP-only cookies. The session is established through the login endpoint.
2. **API Key authentication (Mobile)**: Header-based authentication using `X-API-KEY` header for mobile applications.

### Authentication Flow

The API checks authentication in the following order:
1. First, checks for valid session cookies (web clients)
2. If no valid cookie is found, checks for `X-API-KEY` header (mobile clients)

### API Key Setup

For mobile applications, include the API key in the request header:
```
X-API-KEY: <NEXT_PUBLIC_NC_API_KEY>
```

The API key value should match the `NEXT_PUBLIC_NC_API_KEY` environment variable.

### POST /api/login

Authenticates a user and establishes a session.

**Request Body:**
```typescript
{
  role: string      // User role (e.g., "admin", "editor")
  password: string  // User password
}
```

**Response (200 OK):**
```typescript
{
  success: true
  role: string      // Authenticated user role
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request format
- `401 Unauthorized`: Invalid credentials

**Cookies Set:**
- `auth-token`: Encrypted authentication token
- `auth-role`: User role

---

### POST /api/logout

Logs out the current user by clearing session cookies.

**Request Body:** None

**Response (200 OK):**
```typescript
{
  success: true
}
```

---

### GET /api/auth/me

Retrieves the current authenticated user's role. Supports both cookie-based and API key authentication.

**Request Headers (Optional for API key auth):**
```
X-API-KEY: <NEXT_PUBLIC_NC_API_KEY>
```

**Response (200 OK):**
```typescript
{
  role: string | null        // Current user role (cookie auth), or null
  authenticated?: boolean    // true if authenticated via API key
}
```

**Notes:**
- For cookie-based authentication, returns the user's role
- For API key authentication, returns `{ role: null, authenticated: true }`

---

## Article Management

### POST /api/articles/parse

Parses article data from an array of formatted strings.

**Request Body:**
```typescript
{
  newArticlesWithPages: string[]  // Array of strings like "ARTICLE_ID [PAGES]"
}
```

**Example:**
```json
{
  "newArticlesWithPages": [
    "CDC101217 [24]",
    "EA147928 [29]",
    "SIGPRO110443 [19]"
  ]
}
```

**Response (200 OK):**
```typescript
{
  parsedArticles: Array<{
    articleId: string
    pages: number
  }>
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request format (missing or invalid `newArticlesWithPages`)
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error during parsing

---

### POST /api/articles/parse-pasted

Parses article data from pasted text (e.g., from Excel or email).

**Request Body:**
```typescript
{
  pastedText: string  // Raw text containing article information
}
```

**Example:**
```json
{
  "pastedText": "CDC101217 TEX 24 12-12-2025 21:48\nEA147928 DOCX 29 11/12/2025 11:07 PM"
}
```

**Response (200 OK):**
```typescript
{
  entries: Array<{
    articleId: string
    pages: number
  }>
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request format (missing or invalid `pastedText`)
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error during parsing

**Notes:**
- Automatically detects article IDs and page numbers from various formats
- Handles date patterns to identify page numbers accurately
- Supports formats like: `ARTICLE_ID SOURCE PAGES DATE TIME`

---

## Allocation Management

### POST /api/allocations/compute

Computes article distribution to team members based on allocation method.

**Request Body:**
```typescript
{
  priorityFields: Array<{
    name: string
    priority: number
    allocation: number
  }>
  parsedArticles: Array<{
    articleId: string
    pages: number
  }>
  ddnArticles?: string[]      // Optional: Array of DDN article IDs
  allocationMethod: string    // e.g., "allocate by priority"
  month: string
  date: string
}
```

**Response (200 OK):**
```typescript
{
  allocatedArticles: Array<{
    articleId: string
    name: string
    month: string
    date: string
    pages: number
    // ... other article properties
  }>
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid required fields
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error during computation

---

### POST /api/allocations/preview

Computes preview/display articles including allocated, unallocated, and display overrides.

**Request Body:**
```typescript
{
  priorityFields: Array<{
    name: string
    priority: number
    allocation: number
  }>
  parsedArticles: Array<{
    articleId: string
    pages: number
  }>
  ddnArticles?: string[]
  allocationMethod: string
  month: string
  date: string
  articleDisplayOverrides?: Record<string, {
    month?: string
    date?: string
    name?: string
  }>
}
```

**Response (200 OK):**
```typescript
{
  allocatedArticles: Array<AllocatedArticle>
  unallocatedArticles: Array<AllocatedArticle>
  displayArticles: Array<AllocatedArticle>  // Combined with overrides applied
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid required fields
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error during computation

---

### POST /api/allocations/validate

Validates allocation data including DDN articles and over-allocation checks.

**Request Body:**
```typescript
{
  priorityFields: Array<{
    name: string
    priority: number
    allocation: number
  }>
  totalArticles: number
  ddnArticles?: string[]
  availableArticleIds?: string[]
  ddnText?: string  // Optional: DDN text for validation
}
```

**Response (200 OK):**
```typescript
{
  isOverAllocated: boolean
  remainingArticles: number
  allocatedArticleCount: number
  ddnValidationError: string | null
  errors: string[]  // Array of validation error messages
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid required fields
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error during validation

---

### POST /api/allocations

Submits the final allocation to the external webhook (N8N).

**Request Body:**
```typescript
{
  allocatedArticles: Array<AllocatedArticle>
  // ... other allocation data
}
```

**Response (200 OK):**
```typescript
{
  success: true
  message?: string
}
```

**Error Responses:**
- `400 Bad Request`: Invalid allocation data
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error or webhook failure

**Notes:**
- Transforms allocation data into the required webhook format
- Forwards data to external N8N webhook endpoint

---

## Article Allocations

### GET /api/articles/allocations

Fetches article allocation data from external source or sample data.

**Query Parameters:**
- `recent` (optional): If present, fetches recent allocations only

**Response (200 OK):**
```typescript
{
  // Array of article allocation records
  data: Array<{
    Month: string
    Date: string
    "Article number": string
    Pages: number
    Completed: string
    "Done by": string
    Time: string
  }>
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error or external API failure

**Notes:**
- Falls back to sample data if external API is unavailable
- Uses `NEXT_PUBLIC_USE_SAMPLE_DATA` environment variable to force sample data

---

### GET /api/articles/recently-allocated

Fetches recently allocated articles (last two days).

**Response (200 OK):**
```typescript
Array<{
  // Article allocation records from last two days
  Month: string
  Date: string
  "Article number": string
  Pages: number
  Completed: string
  "Done by": string
  Time: string
}>
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error or external API failure

**Notes:**
- Used to determine which articles are already allocated
- Returns article allocation data from the last two days
- Fetched from external N8N webhook endpoint

---

### GET /api/sheet

Fetches all sheet data from MongoDB, sorted by date (latest first).

**Response (200 OK):**
```typescript
{
  success: true
  data: Array<{
    _id: string
    Month: string
    Date: string
    "Article number": string
    Pages: number
    Completed: string
    "Done by": string
    Time: string
  }>
  count: number
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Database error

---

### GET /api/backup

Fetches all backup data from MongoDB sheet collection.

**Response (200 OK):**
```typescript
{
  success: true
  data: Array<{
    _id: string
    Month: string
    Date: string
    "Article number": string
    Pages: number
    Completed: string
    "Done by": string
    Time: string
  }>
  count: number
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Database error

---

## Portal Data

### GET /api/portal

Fetches and processes portal workflow data, combining it with recently allocated articles data to determine allocation status.

**Response (200 OK):**
```typescript
{
  data: Array<{
    // Portal workflow row data with allocation status
    // Structure depends on portal HTML structure
  }>
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Portal fetch or processing error

**Notes:**
- Fetches HTML from portal workflow URL
- Extracts row data using table parsing
- Combines with recently allocated articles data to mark allocation status
- Processes data in parallel for performance

---

## Teams Management

### GET /api/teams

Fetches all team members from the database.

**Response (200 OK):**
```typescript
{
  success: true
  data: Array<{
    _id: string
    name: string
    priority: number
    allocation: number
    // ... other team member properties
  }>
  count: number
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Database error

---

### POST /api/teams

Creates a new team member.

**Request Body:**
```typescript
{
  name: string
  priority: number
  allocation: number
  // ... other team member properties
}
```

**Response (200 OK):**
```typescript
{
  success: true
  data: {
    _id: string
    name: string
    priority: number
    allocation: number
    // ... other team member properties
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid or missing required fields
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Database error

---

### PUT /api/teams/[id]

Updates an existing team member.

**Path Parameters:**
- `id`: Team member MongoDB ObjectId

**Request Body:**
```typescript
{
  name?: string
  priority?: number
  allocation?: number
  // ... other team member properties (all optional)
}
```

**Response (200 OK):**
```typescript
{
  success: true
  data: {
    _id: string
    name: string
    priority: number
    allocation: number
    // ... updated team member properties
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid data or invalid ObjectId
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Team member not found
- `500 Internal Server Error`: Database error

---

### DELETE /api/teams/[id]

Deletes a team member.

**Path Parameters:**
- `id`: Team member MongoDB ObjectId

**Response (200 OK):**
```typescript
{
  success: true
  message: "Team member deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid ObjectId
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Team member not found
- `500 Internal Server Error`: Database error

---

## Email Management

### GET /api/emails

Fetches emails from external webhook (N8N).

**Response (200 OK):**
```typescript
Array<{
  id: string
  subject: string
  from: EmailAddressGroup
  to: EmailAddressGroup
  html?: string
  text?: string
  date: Date
  // ... other email properties
}>
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: External API error or missing API key

**Notes:**
- Requires `NEXT_PUBLIC_NC_API_KEY` environment variable for external API authentication
- Fetches from N8N webhook endpoint

---

## Other Endpoints

### GET /api/manifest

Returns PWA manifest configuration.

**Response (200 OK):**
```typescript
{
  name: string
  short_name: string
  icons: Array<{...}>
  theme_color: string
  background_color: string
  display: string
  start_url: string
}
```

---

### GET /api/articles

Placeholder endpoint (returns 404).

**Response (404 Not Found):**
```typescript
{
  error: "Not Found"
  message: "This endpoint is not available. Use /api/articles/parse or /api/articles/parse-pasted instead."
}
```

---

### GET /api/portal/data

Deprecated endpoint (returns 404).

**Response (404 Not Found):**
```typescript
{
  error: "Not Found"
  message: "This endpoint has been moved. Use /api/portal instead."
}
```

---

## Error Format

All error responses follow a consistent format:

```typescript
{
  error: string          // Error type or message
  message?: string       // Detailed error message (optional)
  code?: number | string // Error code (optional)
}
```

## Authentication

All endpoints (except `/api/login`) require authentication. The API supports dual authentication:

**1. Cookie-based Authentication (Web):**
- Session is established via `/api/login` and maintained through HTTP-only cookies
- Client-side requests must include: `credentials: "include"`
- Session Cookies:
  - `auth-token`: Encrypted authentication token
  - `auth-role`: User role

**2. API Key Authentication (Mobile):**
- Include `X-API-KEY` header with value matching `NEXT_PUBLIC_NC_API_KEY`
- Example:
```javascript
headers: {
  "X-API-KEY": process.env.NEXT_PUBLIC_NC_API_KEY
}
```

**Authentication Priority:**
1. Cookie authentication is checked first
2. If no valid cookie, API key authentication is checked
3. If neither is valid, request is rejected with 401 Unauthorized

## Rate Limiting

Currently, there are no rate limits imposed on API endpoints. However, requests are logged for monitoring and debugging purposes.

## Logging

All API requests are logged with:
- Request context (method, URL, headers)
- Response status and duration
- External API calls (if applicable)
- Error details (if applicable)

Logs are accessible through the application's logging system.

## External Dependencies

Several endpoints depend on external services:

- **N8N Webhooks**: Used for email fetching, article allocation data, and allocation submission
- **Portal Workflow URL**: Used for portal data fetching
- **MongoDB**: Used for teams, sheet, and backup data storage

Environment variables required:
- `NEXT_PUBLIC_NC_API_KEY`: API key for N8N webhook authentication
- `PORTAL_WORKFLOW_URL`: Portal workflow HTML page URL
- `MONGODB_URI`: MongoDB connection string

