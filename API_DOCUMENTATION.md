# FundooNotes API Documentation

## Overview

This document describes the backend API endpoints for the FundooNotes application with support for Archive, Trash, Pin, Label, and Redis caching for improved performance.

## Features

- ✅ Create, Read, Update, Delete Notes
- ✅ Archive Notes
- ✅ Trash/Restore Notes
- ✅ Pin/Unpin Notes
- ✅ Label Management
- ✅ Redis Caching (first 20 notes per category)
- ✅ User Authentication with JWT

## Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis Server

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
MONGODB_URI=mongodb://localhost:27017/fundoo
JWT_SECRET=your_jwt_secret_key_here
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
PORT=3000
```

### Running Redis

```bash
# Install Redis (Windows using Memurai or WSL)
# Or use Docker:
docker run -d -p 6379:6379 redis:latest
```

### Start the Server

```bash
npm run dev
```

## API Endpoints

### Authentication

#### 1. Sign Up

**POST** `/signup`

Request Body:

```json
{
  "username": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "message": "User registered successfully",
  "newUser": {
    "_id": "user_id",
    "username": "John Doe",
    "email": "john@example.com"
  }
}
```

#### 2. Sign In

**POST** `/signin`

Request Body:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "token": "jwt_token_here"
}
```

#### 3. Get Profile

**GET** `/profile`

Headers:

```
Authorization: Bearer <token>
```

Response:

```json
{
  "_id": "user_id",
  "username": "John Doe",
  "email": "john@example.com"
}
```

#### 4. Reset Password

**PUT** `/resetPassword`

Headers:

```
Authorization: Bearer <token>
```

Request Body:

```json
{
  "oldPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

---

### Notes Management

#### 5. Add Note

**POST** `/addNotes`

Headers:

```
Authorization: Bearer <token>
```

Request Body:

```json
{
  "title": "My Note",
  "content": "Note content here",
  "labels": ["Work", "Important"],
  "isPinned": false,
  "isArchived": false
}
```

Response:

```json
{
  "message": "Note added successfully",
  "newNote": {
    "_id": "note_id",
    "title": "My Note",
    "content": "Note content here",
    "userId": "user_id",
    "labels": ["label_id_1", "label_id_2"],
    "isPinned": false,
    "isArchived": false,
    "isTrashed": false,
    "createdAt": "2025-12-28T00:00:00.000Z",
    "updatedAt": "2025-12-28T00:00:00.000Z"
  }
}
```

#### 6. Get All Notes (Cached)

**GET** `/getNotes`

Headers:

```
Authorization: Bearer <token>
```

Response:

```json
[
  {
    "_id": "note_id",
    "title": "My Note",
    "content": "Note content here",
    "userId": "user_id",
    "labels": [
      {
        "_id": "label_id",
        "name": "Work"
      }
    ],
    "isPinned": false,
    "isArchived": false,
    "isTrashed": false,
    "createdAt": "2025-12-28T00:00:00.000Z",
    "updatedAt": "2025-12-28T00:00:00.000Z"
  }
]
```

**Note:** Returns first 20 notes, sorted by pinned status and update time. Results are cached for 1 hour.

#### 7. Get Archived Notes (Cached)

**GET** `/notes/archived`

Headers:

```
Authorization: Bearer <token>
```

Response: Same format as Get All Notes, but filtered for archived notes only.

#### 8. Get Trashed Notes (Cached)

**GET** `/notes/trashed`

Headers:

```
Authorization: Bearer <token>
```

Response: Same format as Get All Notes, but filtered for trashed notes only.

#### 9. Get Pinned Notes (Cached)

**GET** `/notes/pinned`

Headers:

```
Authorization: Bearer <token>
```

Response: Same format as Get All Notes, but filtered for pinned notes only.

#### 10. Get Notes by Label (Cached)

**GET** `/notes/label/:labelId`

Headers:

```
Authorization: Bearer <token>
```

Response: Same format as Get All Notes, but filtered by the specified label.

#### 11. Update Note

**PUT** `/updateNotes/:id`

Headers:

```
Authorization: Bearer <token>
```

Request Body:

```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "labels": ["Updated Label"]
}
```

Response:

```json
{
  "message": "Note updated successfully",
  "note": {
    "_id": "note_id",
    "title": "Updated Title",
    "content": "Updated content",
    "labels": ["label_id"],
    "updatedAt": "2025-12-28T00:00:00.000Z"
  }
}
```

#### 12. Archive/Unarchive Note

**PUT** `/notes/:id/archive`

Headers:

```
Authorization: Bearer <token>
```

Response:

```json
{
  "message": "Note archived successfully",
  "note": {
    "_id": "note_id",
    "isArchived": true,
    "updatedAt": "2025-12-28T00:00:00.000Z"
  }
}
```

**Note:** Toggles the archive status. If already archived, it will unarchive.

#### 13. Trash/Restore Note

**PUT** `/notes/:id/trash`

Headers:

```
Authorization: Bearer <token>
```

Response:

```json
{
  "message": "Note moved to trash successfully",
  "note": {
    "_id": "note_id",
    "isTrashed": true,
    "updatedAt": "2025-12-28T00:00:00.000Z"
  }
}
```

**Note:** Toggles the trash status. If already trashed, it will restore.

#### 14. Pin/Unpin Note

**PUT** `/notes/:id/pin`

Headers:

```
Authorization: Bearer <token>
```

Response:

```json
{
  "message": "Note pinned successfully",
  "note": {
    "_id": "note_id",
    "isPinned": true,
    "updatedAt": "2025-12-28T00:00:00.000Z"
  }
}
```

**Note:** Toggles the pin status. If already pinned, it will unpin.

#### 15. Delete Note Permanently

**DELETE** `/deleteNote/:id`

Headers:

```
Authorization: Bearer <token>
```

Response:

```json
{
  "message": "Note deleted successfully"
}
```

---

## Caching Strategy

The application uses Redis for caching to improve performance:

- **Cache Keys Pattern:** `notes:{userId}:{category}`

  - `notes:{userId}:all` - All active notes
  - `notes:{userId}:archived` - Archived notes
  - `notes:{userId}:trashed` - Trashed notes
  - `notes:{userId}:pinned` - Pinned notes
  - `notes:{userId}:label:{labelId}` - Notes by label

- **Cache TTL:** 1 hour (3600 seconds)
- **Cache Limit:** First 20 notes per category
- **Cache Invalidation:** Automatic on create, update, archive, trash, pin, or delete operations

## Data Model

### Note Schema

```javascript
{
  title: String (required),
  content: String (required),
  userId: ObjectId (required),
  labels: [ObjectId],
  isArchived: Boolean (default: false),
  isTrashed: Boolean (default: false),
  isPinned: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Label Schema

```javascript
{
  name: String (required, unique),
  userId: ObjectId (required),
  createdAt: Date
}
```

## Error Handling

All endpoints use async error handling and return appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `401` - Unauthorized
- `500` - Internal Server Error

## Testing

Run tests:

```bash
npm test                  # Run all tests
npm run test:auth        # Auth tests only
npm run test:notes       # Notes tests only
npm run test:labels      # Labels tests only
```

## Notes

1. All note endpoints require authentication via JWT token
2. Cache is automatically invalidated when notes are modified
3. Trashed notes are excluded from regular note listings
4. Pinned notes appear first in listings
5. Labels are automatically created if they don't exist when adding/updating notes
