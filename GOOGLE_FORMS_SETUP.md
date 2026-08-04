# Google Forms Integration Setup Guide

This guide provides step-by-step instructions for setting up Google Forms integration with the AjumaPlus CRM system.

## Prerequisites

- Personal Google account with access to Google Forms and Google Sheets
- Gmail account configured for email sending
- Backend server running on localhost:3001
- Ngrok installed and configured

## Phase 1: Gmail Setup

### 1.1 Enable Gmail API and Create App Password

1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification if not already enabled
3. Go to https://myaccount.google.com/apppasswords
4. Create a new app password with name "AjumaPlus CRM"
5. Copy the generated password (16 characters)

### 1.2 Configure Backend Environment Variables

Update `backend/.env` with your Gmail credentials:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_16_char_app_password
SMTP_FROM=noreply@ajumaplus.com
WEBHOOK_SECRET=your_secret_key_here
```

## Phase 2: Create Google Forms

### 2.1 ISP Registration Form

1. Go to https://forms.google.com
2. Click "Blank" to create a new form
3. Title: "AjumaPlus CRM - ISP Registration"
4. Description: "Register as a Service Provider on AjumaPlus CRM"

**Form Fields:**
- **Business Name** (Short answer) - Required
- **Email Address** (Short answer) - Required
- **Phone Number** (Short answer) - Required
- **Services Offered** (Paragraph) - List your services
- **Location** (Short answer) - City/Area in Ghana
- **Trade/Specialization** (Short answer) - Your main trade

5. Click "Send" and get the form URL
6. Copy the form URL for configuration

### 2.2 Customer Registration Form

1. Create new form
2. Title: "AjumaPlus CRM - Customer Registration"
3. Description: "Create a customer account on AjumaPlus CRM"

**Form Fields:**
- **Full Name** (Short answer) - Required
- **Email Address** (Short answer) - Required
- **Phone Number** (Short answer) - Required
- **Address** (Paragraph) - Your full address
- **Preferences** (Paragraph) - Any specific preferences

5. Click "Send" and get the form URL
6. Copy the form URL for configuration

### 2.3 Job Request Form

1. Create new form
2. Title: "AjumaPlus CRM - Service Request"
3. Description: "Submit a service request without logging in"

**Form Fields:**
- **Full Name** (Short answer) - Required
- **Email Address** (Short answer) - Required
- **Phone Number** (Short answer) - Required
- **Service Category** (Dropdown) - Required
  - Electrical Works
  - Plumbing
  - Carpentry
  - Painting
  - Cleaning
  - Air Conditioning
  - Masonry
  - Roofing
  - General Repairs
  - Other
- **Description** (Paragraph) - Required
- **Address** (Paragraph) - Required
- **Priority** (Dropdown) - Required
  - Normal
  - High
  - Emergency

5. Click "Send" and get the form URL
6. Copy the form URL for configuration

## Phase 3: Connect Forms to Google Sheets

### 3.1 Enable Spreadsheet Response

For each form:

1. Click "Responses" tab
2. Click "Create Spreadsheet" (green icon)
3. Choose "Create a new spreadsheet"
4. Name it appropriately (e.g., "ISP Registration Responses")
5. The spreadsheet will open in Google Sheets

### 3.2 Note Sheet Details

For each spreadsheet, note:
- Spreadsheet ID (from URL: /d/{SPREADSHEET_ID}/edit)
- Sheet name (usually "Form Responses 1")

## Phase 4: Create Google Apps Script

### 4.1 ISP Registration Webhook Script

1. Open the ISP Registration spreadsheet
2. Click "Extensions" → "Apps Script"
3. Delete any existing code
4. Paste the following code:

```javascript
function onFormSubmit(e) {
  const webhookUrl = 'YOUR_NGROK_URL/api/webhooks/google-forms/isp';
  const formResponse = e.namedValues;
  
  const payload = {
    business_name: formResponse['Business Name'][0],
    email: formResponse['Email Address'][0],
    phone: formResponse['Phone Number'][0],
    services: formResponse['Services Offered'][0],
    location: formResponse['Location'][0],
    trade: formResponse['Trade/Specialization'][0]
  };
  
  sendWebhook(webhookUrl, payload);
}

function sendWebhook(url, payload) {
  const options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload),
    'headers': {
      'x-webhook-signature': 'YOUR_WEBHOOK_SECRET'
    }
  };
  
  try {
    UrlFetchApp.fetch(url, options);
    Logger.log('Webhook sent successfully');
  } catch (error) {
    Logger.log('Webhook failed: ' + error.toString());
  }
}
```

5. Click "Save" (floppy disk icon)
6. Name the project "ISP Registration Webhook"
7. Click "Triggers" (clock icon)
8. Click "Add Trigger"
9. Configure:
   - Function: onFormSubmit
   - Event source: From spreadsheet
   - Event type: On form submit
10. Click "Save" and authorize the script

### 4.2 Customer Registration Webhook Script

1. Open the Customer Registration spreadsheet
2. Click "Extensions" → "Apps Script"
3. Paste the following code:

```javascript
function onFormSubmit(e) {
  const webhookUrl = 'YOUR_NGROK_URL/api/webhooks/google-forms/customer';
  const formResponse = e.namedValues;
  
  const payload = {
    full_name: formResponse['Full Name'][0],
    email: formResponse['Email Address'][0],
    phone: formResponse['Phone Number'][0],
    address: formResponse['Address'][0],
    preferences: formResponse['Preferences'][0]
  };
  
  sendWebhook(webhookUrl, payload);
}

function sendWebhook(url, payload) {
  const options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload),
    'headers': {
      'x-webhook-signature': 'YOUR_WEBHOOK_SECRET'
    }
  };
  
  try {
    UrlFetchApp.fetch(url, options);
    Logger.log('Webhook sent successfully');
  } catch (error) {
    Logger.log('Webhook failed: ' + error.toString());
  }
}
```

4. Save and add trigger as before

### 4.3 Job Request Webhook Script

1. Open the Job Request spreadsheet
2. Click "Extensions" → "Apps Script"
3. Paste the following code:

```javascript
function onFormSubmit(e) {
  const webhookUrl = 'YOUR_NGROK_URL/api/webhooks/google-forms/job';
  const formResponse = e.namedValues;
  
  const payload = {
    full_name: formResponse['Full Name'][0],
    email: formResponse['Email Address'][0],
    phone: formResponse['Phone Number'][0],
    category: formResponse['Service Category'][0],
    description: formResponse['Description'][0],
    address: formResponse['Address'][0],
    priority: formResponse['Priority'][0]
  };
  
  sendWebhook(webhookUrl, payload);
}

function sendWebhook(url, payload) {
  const options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload),
    'headers': {
      'x-webhook-signature': 'YOUR_WEBHOOK_SECRET'
    }
  };
  
  try {
    UrlFetchApp.fetch(url, options);
    Logger.log('Webhook sent successfully');
  } catch (error) {
    Logger.log('Webhook failed: ' + error.toString());
  }
}
```

4. Save and add trigger as before

## Phase 5: Configure Ngrok

### 5.1 Install Ngrok

1. Go to https://ngrok.com
2. Sign up for free account
3. Download ngrok for macOS
4. Install and authenticate:

```bash
brew install ngrok/ngrok/ngrok
ngrok authtoken YOUR_AUTH_TOKEN
```

### 5.2 Start Ngrok Tunnel

```bash
ngrok http 3001
```

### 5.3 Update Configuration

1. Copy the ngrok URL (e.g., https://abc123.ngrok.io)
2. Update all Google Apps Script files:
   - Replace `YOUR_NGROK_URL` with your ngrok URL
   - Replace `YOUR_WEBHOOK_SECRET` with your webhook secret from .env

## Phase 6: Update Frontend Configuration

Update `frontend/src/config/googleForms.ts` with your actual form URLs:

```typescript
export const GOOGLE_FORMS_CONFIG = {
  ispRegistration: 'https://forms.google.com/YOUR_ISP_FORM_ID',
  customerRegistration: 'https://forms.google.com/YOUR_CUSTOMER_FORM_ID',
  jobRequest: 'https://forms.google.com/YOUR_JOB_FORM_ID',
  // ... rest of config
};
```

## Phase 7: Testing

### 7.1 Test Email Service

Test email sending by temporarily adding a test endpoint:

```javascript
// In webhookController.js, add:
async testEmail(req, res) {
  const result = await authService.sendAccountCreationEmail(
    'test@example.com',
    'Test User',
    'TestPassword123!',
    'Customer'
  );
  res.json(result);
}
```

### 7.2 Test Webhook Endpoints

Test each webhook endpoint:

```bash
# Test ISP registration
curl -X POST http://localhost:3001/api/webhooks/google-forms/isp \
  -H "Content-Type: application/json" \
  -d '{"business_name":"Test ISP","email":"test@example.com","phone":"0241234567","services":"Plumbing","location":"Accra","trade":"Plumber"}'

# Test Customer registration
curl -X POST http://localhost:3001/api/webhooks/google-forms/customer \
  -H "Content-Type: application/json" \
  -d '{"full_name":"John Doe","email":"john@example.com","phone":"0241234567","address":"Accra","preferences":"None"}'

# Test Job request
curl -X POST http://localhost:3001/api/webhooks/google-forms/job \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Jane Doe","email":"jane@example.com","phone":"0241234567","category":"Plumbing","description":"Leaky faucet","address":"Accra","priority":"Normal"}'
```

### 7.3 Test Full Integration

1. Fill out each Google Form
2. Check that accounts are created in the database
3. Verify emails are received
4. Test login with auto-generated credentials

## Troubleshooting

### Email Not Sending
- Verify Gmail app password is correct
- Check firewall settings
- Verify SMTP settings in .env

### Webhook Not Triggering
- Check ngrok is running
- Verify Google Apps Script triggers are active
- Check webhook URL in scripts matches ngrok URL
- Check console logs in Google Apps Script

### Account Creation Fails
- Check database connection
- Verify user doesn't already exist
- Check webhook logs in backend
- Verify form field names match script expectations

### Form Field Mismatch
- Ensure Google Form field names exactly match the Apps Script field names
- Check for typos in field names
- Verify form field types match expectations

## Security Considerations

1. **Webhook Secret**: Use a strong, random webhook secret
2. **Password Generation**: The system generates secure random passwords
3. **Email Security**: Use Gmail app passwords, not regular passwords
4. **Rate Limiting**: Consider adding rate limiting to webhook endpoints
5. **Input Validation**: Ensure all webhook data is validated before processing

## Production Deployment

For production deployment:

1. **Use a fixed domain** instead of ngrok
2. **Implement proper authentication** for webhooks
3. **Add retry logic** for failed webhooks
4. **Monitor webhook delivery** and error rates
5. **Set up alerts** for webhook failures
6. **Consider using a service** like Zapier for reliability

## Maintenance

- **Monitor email delivery** rates
- **Check webhook logs** regularly
- **Update form fields** as business needs change
- **Review security settings** periodically
- **Test integration** after any changes