# Email Setup Guide - Nodemailer with Gmail

## Overview

The application now uses Nodemailer to send real email notifications when collaborators are added or removed from notes.

## Gmail Setup (Recommended for Testing)

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security**
3. Enable **2-Step Verification** if not already enabled

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select app: **Mail**
3. Select device: **Other (Custom name)**
4. Enter name: **FundooNotes**
5. Click **Generate**
6. Copy the 16-character app password (remove spaces)

### Step 3: Configure Environment Variables

Add to your `.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=FundooNotes <your-email@gmail.com>
```

**Example:**

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=john.doe@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=FundooNotes <john.doe@gmail.com>
```

---

## Other Email Providers

### Outlook/Hotmail

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=FundooNotes <your-email@outlook.com>
```

### Yahoo Mail

```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=FundooNotes <your-email@yahoo.com>
```

### Custom SMTP Server

```env
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=FundooNotes <noreply@yourdomain.com>
```

---

## Installation

```bash
npm install
```

This will install nodemailer along with other dependencies.

---

## Testing Email Functionality

### 1. Start the Application

**Terminal 1 - API Server:**

```bash
npm run dev
```

**Terminal 2 - Email Worker:**

```bash
npm run worker
```

### 2. Add a Collaborator

```bash
curl -X POST http://localhost:3000/notes/NOTE_ID/collaborators \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "collaborator@example.com"}'
```

### 3. Check Email

The collaborator should receive an email at their registered email address.

---

## Email Templates

### Collaborator Invitation Email

**Subject:** You've been invited to collaborate on "Note Title"

**Body:**

```
Hello,

[Owner Name] ([owner@email.com]) has invited you to collaborate on a note titled "Note Title".

You can now view and edit this note in your FundooNotes dashboard.

Note ID: 67890abc123def456

Best regards,
FundooNotes Team
```

### Collaborator Removal Email

**Subject:** You've been removed from "Note Title"

**Body:**

```
Hello,

[Owner Name] ([owner@email.com]) has removed you from the collaborative note titled "Note Title".

You will no longer have access to this note.

Note ID: 67890abc123def456

Best regards,
FundooNotes Team
```

---

## Fallback Mode

If email credentials are **not configured**, the application will:

1. ✅ Continue to work normally
2. 📝 Log email content to console (mock mode)
3. ⚠️ Display warning that email was not sent
4. ✅ Process all other functionality normally

**Console Output (Mock Mode):**

```
📧 ============ EMAIL NOTIFICATION (MOCK) ============
To: collaborator@example.com
Subject: You've been invited to collaborate on "Project Plan"
Body:
John Doe (john@example.com) has invited you to collaborate...
=================================================

⚠️  EMAIL_USER and EMAIL_PASSWORD not configured. Email not sent.
```

---

## Troubleshooting

### Error: Invalid login credentials

**Solution:**

- Use App Password, not your regular Gmail password
- Remove spaces from the app password in .env file

### Error: self signed certificate

**Solution:** Add to email service:

```javascript
const transporter = nodemailer.createTransport({
  // ... other config
  tls: {
    rejectUnauthorized: false,
  },
});
```

### Error: Connection timeout

**Solution:**

- Check firewall settings
- Verify EMAIL_HOST and EMAIL_PORT are correct
- Try port 465 with secure: true

### Emails go to spam folder

**Solutions:**

- Use a verified domain email
- Set up SPF and DKIM records
- Use a professional email service (SendGrid, AWS SES)

### Gmail blocks sign-in

**Solution:**

- Enable "Less secure app access" (not recommended)
- Use App Passwords (recommended)
- Whitelist your IP address

---

## Production Recommendations

For production use, consider dedicated email services:

### SendGrid

```bash
npm install @sendgrid/mail
```

### AWS SES (Simple Email Service)

```bash
npm install @aws-sdk/client-ses
```

### Mailgun

```bash
npm install mailgun-js
```

These services provide:

- ✅ Better deliverability
- ✅ Email analytics
- ✅ Higher sending limits
- ✅ Template management
- ✅ Bounce handling

---

## Email Limits

### Gmail

- **Free accounts:** ~500 emails/day
- **Google Workspace:** ~2,000 emails/day

### Outlook

- ~300 emails/day

### Yahoo

- ~500 emails/day

For higher volumes, use a dedicated email service.

---

## Security Best Practices

1. ✅ Never commit `.env` file to git
2. ✅ Use app passwords, not account passwords
3. ✅ Rotate passwords regularly
4. ✅ Use environment-specific credentials
5. ✅ Monitor email sending activity
6. ✅ Implement rate limiting

---

## Verification

### Test Email Configuration

Create a test script:

```javascript
// test-email.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const testEmail = async () => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: "your-test-email@example.com",
    subject: "Test Email from FundooNotes",
    text: "If you receive this, email is configured correctly!",
  });

  console.log("Email sent:", info.messageId);
};

testEmail().catch(console.error);
```

Run: `node test-email.js`

---

## Complete .env Example

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/fundoo

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost:5672

# Email Configuration (Nodemailer with Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=fundoonotes@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=FundooNotes <fundoonotes@gmail.com>

# Server Configuration
PORT=3000
```

---

**You're all set! 🎉**

Emails will now be sent when collaborators are added or removed from notes.
