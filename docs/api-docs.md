# Tilawah Tracker API Documentation

## Overview

The Tilawah Tracker API is a RESTful API for managing Qur'an reading progress in groups. It supports coordinators managing participants, weekly periods, and juz assignments, as well as public read-only access via tokens.

## Authentication

All API endpoints require authentication via NextAuth.js with Google OAuth, except for public endpoints.

### For Browser/App

- Sessions are automatically managed via `next-auth.session-token` cookie
- Log in via Google OAuth at `/api/auth/signin`

### For API Testing (Postman/cURL)

Since the API uses Google SSO, you'll need to authenticate using session cookies:

#### Method 1: Using Session Cookie (Recommended)

1. Log in to your app in the browser at `http://localhost:3000`
2. Open Browser DevTools → Application → Cookies
3. Find the `next-auth.session-token` cookie and copy its value
4. Include this cookie in your API requests:

**Postman:**

- Add header: `Cookie: next-auth.session-token=<paste-token-here>`

**cURL:**

```bash
curl -H "Cookie: next-auth.session-token=YOUR_TOKEN_HERE" \
     http://localhost:3000/api/v1/groups
```

#### Method 2: Using OAuth 2.0 Flow

Configure OAuth 2.0 in your testing tool with:

- Auth URL: `http://localhost:3000/api/auth/signin/google`
- Token URL: `http://localhost:3000/api/auth/callback/google`
- Client ID & Secret: Your Google OAuth credentials

**Note:** The session cookie method is simpler for testing - just login once and copy the token!

## Response Format

All responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
	"success": false,
	"error": {
		"code": "ERROR_CODE",
		"message": "Error description"
	}
}
```

## Endpoints

### Groups

#### GET /api/v1/groups

List all groups for the authenticated coordinator.

**Response:**

```json
{
	"success": true,
	"data": [
		{
			"id": "string",
			"name": "string",
			"publicToken": "string",
			"participantCount": 0,
			"periodCount": 0,
			"hasActivePeriod": false,
			"joinedAt": "2024-01-01T00:00:00.000Z",
			"createdAt": "2024-01-01T00:00:00.000Z"
		}
	]
}
```

#### POST /api/v1/groups

Create a new group.

**Request:**

```json
{
	"name": "Group Name"
}
```

**Response:**

```json
{
	"success": true,
	"data": {
		"id": "string",
		"name": "string",
		"publicToken": "string",
		"createdAt": "2024-01-01T00:00:00.000Z"
	}
}
```

#### GET /api/v1/groups/{id}

Get group details.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "publicToken": "string",
    "participantCount": 0,
    "periodCount": 0,
    "latestPeriod": null,
    "coordinators": [...],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PATCH /api/v1/groups/{id}

Update group name.

**Request:**

```json
{
	"name": "New Group Name"
}
```

#### DELETE /api/v1/groups/{id}

Delete a group (cascades to all related data).

### Participants

#### GET /api/v1/groups/{groupId}/participants

List participants for a group.

**Query Params:**

- `includeInactive`: boolean (default: false)

**Response:**

```json
{
	"success": true,
	"data": [
		{
			"id": "string",
			"groupId": "string",
			"name": "string",
			"whatsappNumber": "+1234567890",
			"isActive": true,
			"createdAt": "2024-01-01T00:00:00.000Z",
			"updatedAt": "2024-01-01T00:00:00.000Z"
		}
	]
}
```

#### POST /api/v1/groups/{groupId}/participants

Add a new participant.

**Request:**

```json
{
	"name": "Participant Name",
	"whatsappNumber": "+1234567890"
}
```

#### GET /api/v1/participants/{id}

Get participant details.

#### PATCH /api/v1/participants/{id}

Update participant details.

**Request:**

```json
{
	"name": "New Name",
	"whatsappNumber": "+0987654321",
	"isActive": true
}
```

#### DELETE /api/v1/participants/{id}

Deactivate participant (soft delete).

### Periods

#### GET /api/v1/groups/{groupId}/periods

List periods for a group.

**Query Params:**

- `limit`: number (default: 20)
- `includeArchived`: boolean (default: false)

**Response:**

```json
{
	"success": true,
	"data": [
		{
			"id": "string",
			"groupId": "string",
			"periodNumber": 1,
			"startDate": "2024-01-01T00:00:00.000Z",
			"endDate": "2024-01-07T00:00:00.000Z",
			"status": "active",
			"isArchived": false,
			"participantCount": 5,
			"statusCounts": {
				"finished": 2,
				"not_finished": 2,
				"missed": 1
			}
		}
	]
}
```

#### POST /api/v1/groups/{groupId}/periods

Create a new period.

**Request:**

```json
{
	"startDate": "2024-01-01T00:00:00.000Z"
}
```

#### GET /api/v1/periods/{id}

Get period details with participant progress.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "groupId": "string",
    "groupName": "string",
    "periodNumber": 1,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-07T00:00:00.000Z",
    "status": "active",
    "isArchived": false,
    "lockedAt": null,
    "participantPeriods": [...],
    "byJuz": { ... },
    "stats": {
      "total": 5,
      "finished": 2,
      "not_finished": 2,
      "missed": 1
    }
  }
}
```

#### POST /api/v1/periods/{id}/lock

Lock a period (changes "not_finished" to "missed").

### Progress

#### PATCH /api/v1/progress/{participantPeriodId}

Update progress status.

**Request:**

```json
{
	"status": "finished"
}
```

**Valid statuses:** `not_finished`, `finished`, `missed`

#### PATCH /api/v1/progress/{participantPeriodId}/juz

Update juz assignment.

**Request:**

```json
{
	"juzNumber": 5
}
```

### Public Access

#### GET /api/v1/public/{token}

Get public group overview.

**Response:**

```json
{
  "success": true,
  "data": {
    "group": { ... },
    "activePeriod": { ... },
    "periods": [...]
  }
}
```

#### GET /api/v1/public/{token}/periods/{periodId}

Get public period details.

## Validation

- Group names: 1-255 characters
- Participant names: 1-255 characters
- WhatsApp numbers: Basic validation, cleaned format
- Periods: Must start on Sunday
- Juz numbers: 1-30

## Error Codes

- `BAD_REQUEST`: Invalid input
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Access denied
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Input validation failed
