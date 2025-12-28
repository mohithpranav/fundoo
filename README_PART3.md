# FundooNotes Backend - Quick Start Guide

## 🚀 What's New in Part III

This implementation adds the following features:

- ✅ **Archive Notes** - Archive/unarchive notes
- ✅ **Trash Notes** - Move notes to trash and restore them
- ✅ **Pin Notes** - Pin/unpin important notes
- ✅ **Filter by Label** - Get notes filtered by specific labels
- ✅ **Redis Caching** - Cached first 20 notes for each category (all, archived, trashed, pinned, by label)

## 📋 Prerequisites

Before running the application, ensure you have:

1. **Node.js** (v14 or higher)
2. **MongoDB** (running locally or remote)
3. **Redis Server** (for caching)

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Redis

**Option A: Using Docker (Recommended)**

```bash
docker run -d -p 6379:6379 --name redis-fundoo redis:latest
```

**Option B: Install Locally**

- **Windows**: Use [Memurai](https://www.memurai.com/) or WSL with Redis
- **Mac**: `brew install redis && brew services start redis`
- **Linux**: `sudo apt-get install redis-server && sudo systemctl start redis`

**Verify Redis is Running:**

```bash
redis-cli ping
# Should return: PONG
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configurations:

```env
MONGODB_URI=mongodb://localhost:27017/fundoo
JWT_SECRET=your_super_secret_jwt_key_here
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
PORT=3000
```

### 4. Start the Server

```bash
npm run dev
```

You should see:

```
Redis Client Connected
Server running on port 3000
```

## 📚 API Endpoints

### Notes Categories

- `GET /getNotes` - Get all active notes (cached, 20 items)
- `GET /notes/archived` - Get archived notes (cached, 20 items)
- `GET /notes/trashed` - Get trashed notes (cached, 20 items)
- `GET /notes/pinned` - Get pinned notes (cached, 20 items)
- `GET /notes/label/:labelId` - Get notes by label (cached, 20 items)

### Note Actions

- `POST /addNotes` - Create a new note
- `PUT /updateNotes/:id` - Update note content/labels
- `PUT /notes/:id/archive` - Archive/unarchive note
- `PUT /notes/:id/trash` - Trash/restore note
- `PUT /notes/:id/pin` - Pin/unpin note
- `DELETE /deleteNote/:id` - Permanently delete note

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API documentation.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:auth
npm run test:notes
npm run test:labels
```

## 📁 Project Structure

```
fundoo/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── notesController.js      # New: All note operations with caching
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── notes.model.js          # Updated: Added isArchived, isTrashed, isPinned
│   │   └── label.model.js
│   ├── routes/
│   │   └── userRoutes.js           # Updated: New routes for archive, trash, pin, label
│   ├── service/
│   │   ├── notes.services.js
│   │   └── resetPassword.js
│   ├── utils/
│   │   ├── async-handler.js
│   │   ├── handlaLabels.js
│   │   └── cache.js                # New: Redis caching service
│   ├── app.js
│   └── server.js
├── test/
├── .env.example
├── API_DOCUMENTATION.md
└── package.json
```

## 💡 Key Features Explained

### 1. Caching Strategy

- First 20 notes per category are cached in Redis
- Cache expires after 1 hour
- Cache is automatically invalidated on any note modification
- Cache keys follow pattern: `notes:{userId}:{category}`

### 2. Note States

- **Active**: Regular notes (not archived, not trashed)
- **Archived**: Notes marked as archived (excluded from main view)
- **Trashed**: Notes in trash (excluded from all views except trash)
- **Pinned**: Important notes (appear first in listings)

### 3. Label Management

- Labels are automatically created if they don't exist
- Multiple labels can be assigned to a note
- Filter notes by specific label ID

## 🐛 Troubleshooting

### Redis Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution:** Ensure Redis server is running. Check with `redis-cli ping`

### Cache Not Working

The application will work without Redis, but you'll see errors in console. Caching will be silently skipped.

### MongoDB Connection Error

**Solution:** Verify MongoDB is running and connection string in `.env` is correct

## 🔄 Migration from Previous Version

If you have existing notes in your database, they will automatically work with the new schema. The new fields (`isArchived`, `isTrashed`, `isPinned`) have default values of `false`.

## 📝 Example Usage

### Create a Pinned Note with Labels

```bash
curl -X POST http://localhost:3000/addNotes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Important Meeting",
    "content": "Discuss Q4 goals",
    "labels": ["Work", "Important"],
    "isPinned": true
  }'
```

### Archive a Note

```bash
curl -X PUT http://localhost:3000/notes/NOTE_ID/archive \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Archived Notes

```bash
curl -X GET http://localhost:3000/notes/archived \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📞 Support

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

**Happy Coding! 🎉**
