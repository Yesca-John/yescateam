// PhonePe Payment Gateway Configuration and Utilities
import crypto from 'crypto';

// Validate required environment variables
if (!process.env.PHONEPE_MERCHANT_ID) {
  throw new Error('PHONEPE_MERCHANT_ID is not configured');
}
if (!process.env.PHONEPE_SALT_KEY) {
  throw new Error('PHONEPE_SALT_KEY is not configured');
}
if (!process.env.PHONEPE_SALT_INDEX) {
  throw new Error('PHONEPE_SALT_INDEX is not configured');
}
if (!process.env.PHONEPE_BASE_URL) {
  throw new Error('PHONEPE_BASE_URL is not configured');
}
if (!process.env.NEXT_PUBLIC_URL) {
  throw new Error('NEXT_PUBLIC_URL is not configured');
}

export const PHONEPE_CONFIG = {
  MERCHANT_ID: process.env.PHONEPE_MERCHANT_ID,
  SALT_KEY: process.env.PHONEPE_SALT_KEY,
  SALT_INDEX: process.env.PHONEPE_SALT_INDEX,
  API_BASE_URL: process.env.PHONEPE_BASE_URL,
  REDIRECT_URL_BASE: process.env.NEXT_PUBLIC_URL + '/api/payment/callback',
  DONATE_REDIRECT_URL_BASE: process.env.NEXT_PUBLIC_URL + '/api/payment/donate/callback',
};

/**
 * Generate X-VERIFY header for PhonePe API authentication
 */
function generateXVerifyHeader(payload: string): string {
  const sha256Hash = crypto
    .createHash('sha256')
    .update(payload + '/pg/v1/pay' + PHONEPE_CONFIG.SALT_KEY)
    .digest('hex');
  
  return `${sha256Hash}###${PHONEPE_CONFIG.SALT_INDEX}`;
}

/**
 * Generate X-VERIFY header for status check
 */
function generateStatusXVerifyHeader(merchantTransactionId: string): string {
  const endpoint = `/pg/v1/status/${PHONEPE_CONFIG.MERCHANT_ID}/${merchantTransactionId}`;
  const sha256Hash = crypto
    .createHash('sha256')
    .update(endpoint + PHONEPE_CONFIG.SALT_KEY)
    .digest('hex');
  
  return `${sha256Hash}###${PHONEPE_CONFIG.SALT_INDEX}`;
}

/**
 * Create PhonePe payment order
 */
export async function createPhonePeOrder(orderData: {
  merchantOrderId: string;
  amount: number; // in paisa (1 rupee = 100 paise)
  mobileNumber?: string;
}) {
  const orderUrl = `${PHONEPE_CONFIG.API_BASE_URL}/pg/v1/pay`;
  
  // Include merchantOrderId in redirect URL for reliable recovery
  const redirectUrl = `${PHONEPE_CONFIG.REDIRECT_URL_BASE}?from=phonepe&merchantOrderId=${orderData.merchantOrderId}`;
  const callbackUrl = `${PHONEPE_CONFIG.REDIRECT_URL_BASE}`;
  
  const payload = {
    merchantId: PHONEPE_CONFIG.MERCHANT_ID,
    merchantTransactionId: orderData.merchantOrderId,
    merchantUserId: `MUID${Date.now()}`,
    amount: orderData.amount,
    redirectUrl: redirectUrl,
    redirectMode: 'POST',
    callbackUrl: callbackUrl,
    mobileNumber: orderData.mobileNumber || '',
    paymentInstrument: {
      type: 'PAY_PAGE',
    },
  };

  // Base64 encode the payload
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  
  // Generate X-VERIFY header
  const xVerify = generateXVerifyHeader(base64Payload);

  console.log('PhonePe Payment Request:', {
    merchantId: PHONEPE_CONFIG.MERCHANT_ID,
    merchantTransactionId: orderData.merchantOrderId,
    amount: orderData.amount,
  });

  const response = await fetch(orderUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': xVerify,
    },
    body: JSON.stringify({
      request: base64Payload,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('PhonePe API Error:', error);
    throw new Error(`Failed to create PhonePe order: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  
  return {
    success: result.success,
    code: result.code,
    message: result.message,
    merchantTransactionId: orderData.merchantOrderId,
    redirectUrl: result.data?.instrumentResponse?.redirectInfo?.url,
  };
}

/**
 * Create PhonePe payment order for donations (separate callback URL)
 */
export async function createPhonePeDonationOrder(orderData: {
  merchantOrderId: string;
  amount: number; // in paisa (1 rupee = 100 paise)
  mobileNumber?: string;
}) {
  const orderUrl = `${PHONEPE_CONFIG.API_BASE_URL}/pg/v1/pay`;
  
  // Use dedicated donation callback URL
  const redirectUrl = `${PHONEPE_CONFIG.DONATE_REDIRECT_URL_BASE}?from=phonepe&merchantOrderId=${orderData.merchantOrderId}`;
  const callbackUrl = `${PHONEPE_CONFIG.DONATE_REDIRECT_URL_BASE}`;
  
  const payload = {
    merchantId: PHONEPE_CONFIG.MERCHANT_ID,
    merchantTransactionId: orderData.merchantOrderId,
    merchantUserId: `MUID${Date.now()}`,
    amount: orderData.amount,
    redirectUrl: redirectUrl,
    redirectMode: 'POST',
    callbackUrl: callbackUrl,
    mobileNumber: orderData.mobileNumber || '',
    paymentInstrument: {
      type: 'PAY_PAGE',
    },
  };

  // Base64 encode the payload
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  
  // Generate X-VERIFY header
  const xVerify = generateXVerifyHeader(base64Payload);

  console.log('Creating PhonePe donation order with redirect URL:', redirectUrl);

  const response = await fetch(orderUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': xVerify,
    },
    body: JSON.stringify({
      request: base64Payload,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('PhonePe Donation API Error:', error);
    throw new Error(`Failed to create PhonePe donation order: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  
  return {
    success: result.success,
    code: result.code,
    message: result.message,
    merchantTransactionId: orderData.merchantOrderId,
    redirectUrl: result.data?.instrumentResponse?.redirectInfo?.url,
  };
}

/**
 * Check payment status from PhonePe
 */
export async function checkPhonePeOrderStatus(merchantTransactionId: string) {
  const statusUrl = `${PHONEPE_CONFIG.API_BASE_URL}/pg/v1/status/${PHONEPE_CONFIG.MERCHANT_ID}/${merchantTransactionId}`;
  
  // Generate X-VERIFY header for status check
  const xVerify = generateStatusXVerifyHeader(merchantTransactionId);

  const response = await fetch(statusUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': xVerify,
      'X-MERCHANT-ID': PHONEPE_CONFIG.MERCHANT_ID,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to check order status: ${JSON.stringify(error)}`);
  }

  return await response.json();
}

/**
 * Generate unique transaction ID
 */
export function generateTransactionId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `YC26_${timestamp}_${random}`;
}
