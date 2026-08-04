// ============================================================
//  PROFESSIONAL UNIFIED GOOGLE APPS SCRIPT FOR AJUMAPLUS CRM
//  Handles ISP Registration, Customer Registration, and Job Request
//  Configuration-based approach for production readiness
// ============================================================

// ============================================================
//  CONFIGURATION - Update these values for your setup
// ============================================================

const CONFIG = {
  // Backend Configuration
  WEBHOOK_BASE_URL: 'https://unread-backlit-guru.ngrok-free.dev/api/webhooks/google-forms',
  WEBHOOK_SECRET: 'ajumaplus_webhook_secret_ghana_2024_secure',
  
  // Sheet Tab Names (must match your Google Sheet tabs exactly)
  TAB_NAMES: {
    ISP: 'ISP Registrations',
    CUSTOMER: 'Customer Registrations',
    JOB: 'Job Requests'
  },
  
  // Feature Flags
  ENABLE_LOGGING: true,
  ENABLE_ERROR_NOTIFICATIONS: false
};

// ============================================================
//  WEBHOOK ENDPOINTS
// ============================================================

const WEBHOOK_ENDPOINTS = {
  ISP: CONFIG.WEBHOOK_BASE_URL + '/isp',
  CUSTOMER: CONFIG.WEBHOOK_BASE_URL + '/customer',
  JOB: CONFIG.WEBHOOK_BASE_URL + '/job'
};

// ============================================================
//  MAIN FORM SUBMISSION HANDLER
// ============================================================

function onFormSubmit(e) {
  try {
    // Check if this is a real form submission or a test
    if (!e || !e.source) {
      if (CONFIG.ENABLE_LOGGING) {
        Logger.log('Test run detected - skipping form submission logic');
      }
      return;
    }
    
    const sheet = e.source.getActiveSheet();
    const sheetName = sheet.getName();
    
    if (CONFIG.ENABLE_LOGGING) {
      Logger.log('Form submission received from sheet: ' + sheetName);
    }
    
    // Route to appropriate handler based on sheet name
    if (sheetName === CONFIG.TAB_NAMES.ISP) {
      handleISPRegistration(e);
    } else if (sheetName === CONFIG.TAB_NAMES.CUSTOMER) {
      handleCustomerRegistration(e);
    } else if (sheetName === CONFIG.TAB_NAMES.JOB) {
      handleJobRequest(e);
    } else {
      Logger.log('Unknown sheet: ' + sheetName + '. Expected one of: ' + 
                  JSON.stringify(Object.values(CONFIG.TAB_NAMES)));
    }
  } catch (error) {
    Logger.log('Error in onFormSubmit: ' + error.toString());
    if (CONFIG.ENABLE_ERROR_NOTIFICATIONS) {
      sendErrorNotification('Form Submission Error', error.toString());
    }
  }
}

// ============================================================
//  FORM-SPECIFIC HANDLERS
// ============================================================

function handleISPRegistration(e) {
  const formResponse = e.namedValues;
  
  const payload = {
    full_name: formResponse['Full Name'][0],
    trade_profession: formResponse['Trade/Profession'][0],
    phone: formResponse['Phone'][0],
    whatsapp: formResponse['WhatsApp'][0],
    email: formResponse['Email'][0],
    ghana_card_id: formResponse['Ghana Card ID'][0],
    location: formResponse['Location'][0],
    skills: formResponse['Skills'][0],
    certification: formResponse['Certification'][0],
    available_hours: formResponse['Available Hours'][0],
    payment_details: formResponse['Payment Details'][0]
  };
  
  sendWebhook(WEBHOOK_ENDPOINTS.ISP, payload, 'ISP Registration');
}

function handleCustomerRegistration(e) {
  const formResponse = e.namedValues;
  
  const payload = {
    full_name: formResponse['Full Name'][0],
    phone: formResponse['Phone'][0],
    whatsapp: formResponse['WhatsApp'][0],
    email: formResponse['Email'][0],
    address: formResponse['Address'][0],
    ghana_post_gps: formResponse['GhanaPost GPS'][0],
    customer_type: formResponse['Customer Type'][0],
    referral_source: formResponse['Referral Source'][0]
  };
  
  sendWebhook(WEBHOOK_ENDPOINTS.CUSTOMER, payload, 'Customer Registration');
}

function handleJobRequest(e) {
  const formResponse = e.namedValues;
  
  const payload = {
    customer_name: formResponse['Customer Name'][0],
    phone: formResponse['Phone'][0],
    email: formResponse['Email'][0],
    service_category: formResponse['Service Category'][0],
    description: formResponse['Description'][0],
    priority: formResponse['Priority'][0],
    preferred_date: formResponse['Preferred Date'][0]
  };
  
  sendWebhook(WEBHOOK_ENDPOINTS.JOB, payload, 'Job Request');
}

// ============================================================
//  WEBHOOK SENDING FUNCTION
// ============================================================

function sendWebhook(url, payload, formType) {
  const options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload),
    'headers': {
      'x-webhook-signature': CONFIG.WEBHOOK_SECRET,
      'x-form-type': formType,
      'Content-Type': 'application/json'
    },
    'muteHttpExceptions': true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    
    if (CONFIG.ENABLE_LOGGING) {
      Logger.log(formType + ' webhook sent successfully for: ' + payload.email || payload.customer_name);
      Logger.log('Response code: ' + responseCode);
    }
    
    // Log response body for debugging
    const responseText = response.getContentText();
    if (responseCode !== 200 && responseCode !== 201) {
      Logger.log('Response body: ' + responseText);
    }
    
    return responseCode;
  } catch (error) {
    Logger.log(formType + ' webhook failed for ' + (payload.email || payload.customer_name) + ': ' + error.toString());
    return null;
  }
}

// ============================================================
//  ERROR NOTIFICATION (Optional - For Production)
// ============================================================

function sendErrorNotification(subject, errorMessage) {
  // Implement email notification for errors in production
  // This would require Gmail API setup in Google Cloud Project
  Logger.log('ERROR NOTIFICATION: ' + subject + ' - ' + errorMessage);
}

// ============================================================
//  TESTING FUNCTIONS
// ============================================================

function testISPWebhook() {
  const testPayload = {
    full_name: 'Test ISP User',
    trade_profession: 'Electrician',
    phone: '0241234567',
    whatsapp: '0241234567',
    email: 'testisp@example.com',
    ghana_card_id: 'GHA-123456789-0',
    location: 'Accra',
    skills: 'Electrical wiring, repairs',
    certification: 'Technical Certificate',
    available_hours: '9am-5pm weekdays',
    payment_details: 'Mobile money accepted'
  };
  
  sendWebhook(WEBHOOK_ENDPOINTS.ISP, testPayload, 'ISP Registration (Test)');
}

function testCustomerWebhook() {
  const testPayload = {
    full_name: 'Test Customer',
    phone: '0249876543',
    whatsapp: '0249876543',
    email: 'testcustomer@example.com',
    address: 'Kumasi, Ghana',
    ghana_post_gps: 'AK-039-5021',
    customer_type: 'Individual',
    referral_source: 'Friend'
  };
  
  sendWebhook(WEBHOOK_ENDPOINTS.CUSTOMER, testPayload, 'Customer Registration (Test)');
}

function testJobWebhook() {
  const testPayload = {
    customer_name: 'Test Job User',
    phone: '0245556666',
    email: 'testjob@example.com',
    service_category: 'Plumbing',
    description: 'Leaking pipe in kitchen',
    priority: 'High',
    preferred_date: '2024-08-10'
  };
  
  sendWebhook(WEBHOOK_ENDPOINTS.JOB, testPayload, 'Job Request (Test)');
}

function testAllWebhooks() {
  Logger.log('=== Starting comprehensive webhook tests ===');
  Logger.log('Base URL: ' + CONFIG.WEBHOOK_BASE_URL);
  Logger.log('Testing ISP Registration...');
  testISPWebhook();
  Logger.log('Testing Customer Registration...');
  testCustomerWebhook();
  Logger.log('Testing Job Request...');
  testJobWebhook();
  Logger.log('=== All webhook tests completed ===');
}

function verifyConfiguration() {
  Logger.log('=== Configuration Verification ===');
  Logger.log('Webhook Base URL: ' + CONFIG.WEBHOOK_BASE_URL);
  Logger.log('Expected Tab Names:');
  Logger.log('  - ISP: ' + CONFIG.TAB_NAMES.ISP);
  Logger.log('  - Customer: ' + CONFIG.TAB_NAMES.CUSTOMER);
  Logger.log('  - Job: ' + CONFIG.TAB_NAMES.JOB);
  Logger.log('Logging Enabled: ' + CONFIG.ENABLE_LOGGING);
  Logger.log('Error Notifications: ' + CONFIG.ENABLE_ERROR_NOTIFICATIONS);
  Logger.log('=== Configuration verified ===');
}