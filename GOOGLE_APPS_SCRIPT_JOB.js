// ============================================================
//  GOOGLE APPS SCRIPT FOR JOB REQUEST FORM
//  Matches your existing Job Request Form fields
// ============================================================

function onFormSubmit(e) {
  const webhookUrl = 'https://unread-backlit-guru.ngrok-free.dev/api/webhooks/google-forms/job';
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
    Logger.log('Job webhook sent successfully for: ' + payload.email);
  } catch (error) {
    Logger.log('Job webhook failed for ' + payload.email + ': ' + error.toString());
  }
}