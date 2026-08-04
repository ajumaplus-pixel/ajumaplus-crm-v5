// ============================================================
//  GOOGLE APPS SCRIPT FOR CUSTOMER REGISTRATION FORM
//  Matches your existing Customer Registration Form fields
// ============================================================

function onFormSubmit(e) {
  const webhookUrl = 'https://unread-backlit-guru.ngrok-free.dev/api/webhooks/google-forms/customer';
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
  
  sendWebhook(webhookUrl, payload);
}

function sendWebhook(url, payload) {
  const options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload),
    'headers': {
      'x-webhook-signature': 'ajumaplus_webhook_secret_ghana_2024_secure'
    }
  };
  
  try {
    UrlFetchApp.fetch(url, options);
    Logger.log('Customer webhook sent successfully for: ' + payload.email);
  } catch (error) {
    Logger.log('Customer webhook failed for ' + payload.email + ': ' + error.toString());
  }
}