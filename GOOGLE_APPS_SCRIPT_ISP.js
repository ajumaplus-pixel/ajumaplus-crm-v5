// ============================================================
//  GOOGLE APPS SCRIPT FOR ISP REGISTRATION FORM
//  Matches your existing ISP Registration Form fields
// ============================================================

function onFormSubmit(e) {
  const webhookUrl = 'https://unread-backlit-guru.ngrok-free.dev/api/webhooks/google-forms/isp';
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
    Logger.log('ISP webhook sent successfully for: ' + payload.email);
  } catch (error) {
    Logger.log('ISP webhook failed for ' + payload.email + ': ' + error.toString());
  }
}