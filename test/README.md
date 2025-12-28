# Fundoo App - Test Suite

This test suite uses **Mocha** and **Chai** for comprehensive API testing.

## Test Files

### 1. **auth.test.js** - Authentication Tests

Tests for user authentication endpoints:

- ✅ User signup
- ✅ User signin
- ✅ User profile retrieval
- ✅ Duplicate email validation
- ✅ Invalid credentials handling
- ✅ Token-based authentication

### 2. **notes.test.js** - Notes API Tests

Tests for notes CRUD operations:

- ✅ Create notes (with and without labels)
- ✅ Get all notes
- ✅ Update notes
- ✅ Delete notes
- ✅ Authorization checks
- ✅ Label integration

### 3. **labels.test.js** - Labels Utility Tests

Unit tests for label handling:

- ✅ Label creation
- ✅ Label normalization (trim & lowercase)
- ✅ Label reuse (no duplicates)
- ✅ User-specific labels
- ✅ Empty/invalid input handling

### 4. **resetPassword.test.js** - Password Reset Tests

Tests for password reset functionality:

- ✅ Reset password with valid credentials
- ✅ Password hashing verification
- ✅ Invalid current password handling
- ✅ Authentication requirement

## Installation

```bash
npm install
```

This installs all dependencies including:

- `mocha` - Test framework
- `chai` - Assertion library
- `chai-http` - HTTP integration testing
- `sinon` - Mocking and stubbing

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test Files

```bash
# Auth tests only
npm run test:auth

# Notes tests only
npm run test:notes

# Labels tests only
npm run test:labels

# Reset password tests only
npm run test:reset
```

### Watch Mode (Auto-rerun on changes)

```bash
npm run test:watch
```

## Test Configuration

- **Mocha config**: `.mocharc.json`
- **Test setup**: `test/setup.js`
- **Timeout**: 5000ms (configurable in .mocharc.json)

## Environment Variables

Create a `.env` file with:

```
MONGODB_TEST_URI=mongodb://localhost:27017/fundoo_test
JWT_SECRET=your_jwt_secret_key
```

## Test Coverage

| Module         | Coverage    |
| -------------- | ----------- |
| Authentication | ✅ Complete |
| Notes CRUD     | ✅ Complete |
| Labels         | ✅ Complete |
| Password Reset | ✅ Complete |

## Example Test Output

```
Authentication API Tests
  POST /signup
    ✓ should register a new user successfully
    ✓ should not register a user with existing email
    ✓ should not register a user with missing fields
  POST /signin
    ✓ should sign in with valid credentials
    ✓ should not sign in with invalid email
    ✓ should not sign in with invalid password

Notes API Tests
  POST /addNotes
    ✓ should create a new note successfully
    ✓ should create a note with labels
    ✓ should not create a note without authentication
```

## Writing New Tests

Follow this pattern:

```javascript
import { expect } from "chai";
import chai from "chai";
import chaiHttp from "chai-http";
import app from "../src/app.js";

chai.use(chaiHttp);

describe("Your Test Suite", () => {
  it("should do something", (done) => {
    chai
      .request(app)
      .get("/your-endpoint")
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});
```

## Troubleshooting

### Database Connection Issues

Ensure MongoDB is running locally or update `MONGODB_TEST_URI` in your `.env`

### Import Errors

Make sure all files use `.js` extensions in import statements

### Timeout Errors

Increase timeout in `.mocharc.json` or specific test:

```javascript
this.timeout(10000); // 10 seconds
```

## Best Practices

1. ✅ Clear database before each test
2. ✅ Use proper async/await or done callbacks
3. ✅ Test both success and failure cases
4. ✅ Verify authentication where required
5. ✅ Check response status and body structure
6. ✅ Clean up after tests
