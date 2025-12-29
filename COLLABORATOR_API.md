# Collaborator API Documentation

## Overview

Collaborator functionality allows users to share notes with other registered users. Email notifications are sent via RabbitMQ message queue when users are added or removed as collaborators.

## Setup

### Prerequisites

1. **RabbitMQ Server** running on localhost:5672

### Install Dependencies

```bash
npm install
```

### Setup RabbitMQ

**Option A: Using Docker (Recommended)**

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

Access RabbitMQ Management UI: http://localhost:15672

- Username: `guest`
- Password: `guest`

**Option B: Install Locally**

- **Windows**: Download from https://www.rabbitmq.com/download.html
- **Mac**: `brew install rabbitmq && brew services start rabbitmq`
- **Linux**: `sudo apt-get install rabbitmq-server && sudo systemctl start rabbitmq-server`

### Start the Application

**Terminal 1 - API Server:**

```bash
npm run dev
```

**Terminal 2 - Email Worker:**

```bash
npm run worker
```

## Collaborator API Endpoints

### 1. Add Collaborator to Note

**POST** `/notes/:id/collaborators`

Add a registered user as a collaborator to your note. Sends email invitation via RabbitMQ.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "collaborator@example.com"
}
```

**Response (200):**

```json
{
  "message": "Collaborator added successfully",
  "note": {
    "_id": "note_id",
    "title": "My Note",
    "content": "Note content",
    "userId": "owner_id",
    "collaborators": [
      {
        "_id": "collaborator_id",
        "username": "John Doe",
        "email": "collaborator@example.com"
      }
    ],
    "labels": [],
    "isPinned": false,
    "isArchived": false,
    "isTrashed": false
  }
}
```

**Email Notification Sent:**

```
To: collaborator@example.com
Subject: You've been invited to collaborate on "My Note"
Body: [Owner Name] ([owner@email.com]) has invited you to collaborate...
```

**Error Responses:**

- `400` - Email required / User is already a collaborator / Cannot add yourself
- `404` - Note not found / User with email not found

---

### 2. Remove Collaborator from Note

**DELETE** `/notes/:id/collaborators`

Remove a collaborator from your note. Sends email notification via RabbitMQ.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "collaborator@example.com"
}
```

**Response (200):**

```json
{
  "message": "Collaborator removed successfully",
  "note": {
    "_id": "note_id",
    "title": "My Note",
    "collaborators": []
  }
}
```

**Email Notification Sent:**

```
To: collaborator@example.com
Subject: You've been removed from "My Note"
Body: [Owner Name] has removed you from the collaborative note...
```

**Error Responses:**

- `400` - Email required / User is not a collaborator
- `404` - Note not found / User with email not found

---

### 3. Get Notes Shared With Me

**GET** `/notes/shared`

Get all notes where the current user is a collaborator (cached).

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
[
  {
    "_id": "note_id",
    "title": "Shared Note",
    "content": "Collaborative content",
    "userId": {
      "_id": "owner_id",
      "username": "Note Owner",
      "email": "owner@example.com"
    },
    "collaborators": [
      {
        "_id": "my_id",
        "username": "My Name",
        "email": "me@example.com"
      }
    ],
    "labels": [],
    "isPinned": false,
    "isArchived": false,
    "isTrashed": false,
    "createdAt": "2025-12-29T00:00:00.000Z",
    "updatedAt": "2025-12-29T00:00:00.000Z"
  }
]
```

**Note:** Results are cached for 1 hour, limited to 20 notes.

---

### 4. Get Collaborators of a Note

**GET** `/notes/:id/collaborators`

Get all collaborators of a specific note. Available to note owner and collaborators.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "noteId": "note_id",
  "title": "My Note",
  "owner": {
    "_id": "owner_id",
    "username": "Note Owner",
    "email": "owner@example.com"
  },
  "collaborators": [
    {
      "_id": "collaborator_id",
      "username": "John Doe",
      "email": "john@example.com"
    },
    {
      "_id": "collaborator_id_2",
      "username": "Jane Smith",
      "email": "jane@example.com"
    }
  ]
}
```

**Error Responses:**

- `404` - Note not found or you don't have permission

---

## RabbitMQ Integration

### Message Queue Flow

1. **User adds/removes collaborator** → API endpoint called
2. **API publishes message** → RabbitMQ queue `email_notifications`
3. **Email worker consumes message** → Processes from queue
4. **Email sent** → Console output (mock) or real email service
5. **Message acknowledged** → Removed from queue

### Email Message Format

```json
{
  "to": "user@example.com",
  "subject": "Email subject",
  "body": "Email body content",
  "noteId": "note_id",
  "sharedBy": "owner@example.com",
  "timestamp": "2025-12-29T12:00:00.000Z"
}
```

### Queue Details

- **Queue Name:** `email_notifications`
- **Durable:** Yes (survives RabbitMQ restarts)
- **Persistent Messages:** Yes (survives RabbitMQ restarts)
- **Auto-acknowledge:** No (manual acknowledgment after processing)

---

## Complete Workflow Example

### Scenario: Share a note with a colleague

**Step 1:** Owner creates a note

```bash
POST /addNotes
{
  "title": "Project Plan",
  "content": "Q1 2025 roadmap"
}
```

**Step 2:** Owner adds collaborator

```bash
POST /notes/{note_id}/collaborators
{
  "email": "colleague@company.com"
}
```

**Step 3:** Email worker processes notification

```
📧 ============ EMAIL NOTIFICATION ============
To: colleague@company.com
Subject: You've been invited to collaborate on "Project Plan"
Body: [Owner] has invited you to collaborate...
============================================
```

**Step 4:** Collaborator checks shared notes

```bash
GET /notes/shared
```

**Step 5:** Collaborator views note details

```bash
GET /notes/{note_id}/collaborators
```

---

## Testing the APIs

### Test with cURL

**1. Add Collaborator:**

```bash
curl -X POST http://localhost:3000/notes/NOTE_ID/collaborators \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "collaborator@example.com"}'
```

**2. Get Shared Notes:**

```bash
curl -X GET http://localhost:3000/notes/shared \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**3. Get Collaborators:**

```bash
curl -X GET http://localhost:3000/notes/NOTE_ID/collaborators \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**4. Remove Collaborator:**

```bash
curl -X DELETE http://localhost:3000/notes/NOTE_ID/collaborators \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "collaborator@example.com"}'
```

---

## Monitoring RabbitMQ

### View Queue Status

Access RabbitMQ Management UI:

- URL: http://localhost:15672
- Username: `guest`
- Password: `guest`

### Check Queue Metrics

- **Messages Ready:** Pending messages
- **Messages Unacknowledged:** Being processed
- **Publish Rate:** Messages/second being added
- **Delivery Rate:** Messages/second being processed

---

## Error Handling

### RabbitMQ Down

- API continues to work
- Email notifications fail silently
- Check console logs for errors
- Messages not queued when RabbitMQ is unavailable

### Email Worker Down

- Messages accumulate in queue
- When worker restarts, processes all pending messages
- No data loss (messages are persistent)

---

## Cache Invalidation

Cache is automatically cleared when:

- Collaborator is added (owner and collaborator caches cleared)
- Collaborator is removed (owner and collaborator caches cleared)
- Note is modified in any way

Pattern: `notes:{userId}:*` - clears all note-related caches for user

---

## Security Considerations

1. **Authorization:** Only note owner can add/remove collaborators
2. **User Validation:** Collaborator must be a registered user
3. **Self-Addition Prevention:** Users cannot add themselves
4. **Duplicate Prevention:** Same user cannot be added twice
5. **Permission Checks:** Both owner and collaborators can view collaborators list

---

## Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────┐
│   API Server    │
│  (notes.services)│
└────┬───────┬────┘
     │       │
     │       └─────────────┐
     │                     ▼
     │              ┌──────────────┐
     │              │   RabbitMQ   │
     │              │    Queue     │
     │              └──────┬───────┘
     │                     │
     ▼                     ▼
┌──────────┐      ┌───────────────┐
│ MongoDB  │      │ Email Worker  │
│ Database │      │ (Consumer)    │
└──────────┘      └───────┬───────┘
                          │
                          ▼
                   ┌─────────────┐
                   │Email Service│
                   │  (Mock/Real)│
                   └─────────────┘
```

---

## Production Considerations

### Replace Mock Email Service

Replace [src/service/email.service.js](src/service/email.service.js) with real email service:

**Using Nodemailer:**

```javascript
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (emailData) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: emailData.to,
    subject: emailData.subject,
    text: emailData.body,
  });
};
```

**Using SendGrid:**

```javascript
import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (emailData) => {
  await sgMail.send({
    to: emailData.to,
    from: process.env.SENDGRID_FROM,
    subject: emailData.subject,
    text: emailData.body,
  });
};
```

---

## Troubleshooting

### RabbitMQ Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5672
```

**Solution:** Start RabbitMQ server

### Worker Not Processing Messages

**Check:**

1. Is worker running? (`npm run worker`)
2. Check RabbitMQ management UI for queue status
3. Check worker console for errors

### Collaborator Not Receiving Emails

**Verify:**

1. User exists in database
2. Email is correct in request
3. Worker is processing messages (check worker console)
4. Mock email service shows output

---

**End of Collaborator API Documentation**
