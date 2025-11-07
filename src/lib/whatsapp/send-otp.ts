// WhatsApp Business API - Send OTP via WhatsApp
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';
const WHATSAPP_TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME || 'otp_verification';

interface WhatsAppOTPResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send OTP via WhatsApp Business API
 * Uses simple text message (works only within 24h session window)
 * For production, use sendWhatsAppOTPWithTemplate instead
 * @param phoneNumber - Phone number in E.164 format (+919876543210)
 * @param otp - 6-digit OTP code
 * @returns Promise with success status and message ID
 */
export async function sendWhatsAppOTP(
  phoneNumber: string,
  otp: string
): Promise<WhatsAppOTPResponse> {
  try {
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      throw new Error('WhatsApp API credentials not configured');
    }

    // Format phone number (remove + for WhatsApp API)
    const formattedPhone = phoneNumber.replace('+', '');

    // WhatsApp Cloud API endpoint
    const apiUrl = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    // IMPORTANT: Text messages only work within 24h session window
    // For first-time messages, you MUST use an approved template
    // If this fails with error 131026, switch to template-based approach
    const payload = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: `Your YESCA verification code is: *${otp}*\n\nThis code expires in 5 minutes.\n\nDo not share this code with anyone.\n\n- YESCA Team`,
      },
    };

    // Send request to WhatsApp API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API Error:', data);
      
      // Error 131026 = need to use template for user-initiated messages
      if (data.error?.code === 131026) {
        console.log('⚠️ Template required. Falling back to template method...');
        // Automatically try template-based approach
        return sendWhatsAppOTPWithTemplate(phoneNumber, otp);
      }
      
      throw new Error(data.error?.message || 'Failed to send WhatsApp message');
    }

    console.log('✅ WhatsApp OTP sent successfully:', data.messages?.[0]?.id);

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error) {
    console.error('Error sending WhatsApp OTP:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send OTP using WhatsApp Template (if you have an approved template)
 * This is more reliable but requires template approval from Meta
 */
export async function sendWhatsAppOTPWithTemplate(
  phoneNumber: string,
  otp: string,
  templateName: string = WHATSAPP_TEMPLATE_NAME
): Promise<WhatsAppOTPResponse> {
  try {
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      throw new Error('WhatsApp API credentials not configured');
    }

    const formattedPhone = phoneNumber.replace('+', '');
    const apiUrl = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    // Authentication template with Zero-tap auto-fill
    // Template: "{{1}} is your verification code. For your security, do not share this code. Expires in 5 minutes."
    // This template uses the OTP_AUTOFILL type for auto-fill capability
    const payload = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: 'en',
        },
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: otp, // This fills the {{1}} placeholder (OTP code)
              },
            ],
          },
          {
            type: 'button',
            sub_type: 'url',
            index: '0',
            parameters: [
              {
                type: 'text',
                text: otp, // OTP for auto-fill button parameter
              },
            ],
          },
        ],
      },
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp Template API Error:', data);
      throw new Error(data.error?.message || 'Failed to send template message');
    }

    console.log('✅ WhatsApp Template OTP sent:', data.messages?.[0]?.id);

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error) {
    console.error('Error sending WhatsApp template OTP:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
