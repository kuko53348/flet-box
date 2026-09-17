// sms.js - SMS module for FletBox
import twilio from 'twilio';

/**
 * # SMS MODULE
 * - Send SMS messages
 * - Verify phone numbers
 * - Generate and verify codes
 *
 * @example
 * import { sendSMS, verifyPhone, generateCode } from '@flet-box/sms';
 *
 * // Send SMS
 * await sendSMS('+123456789', 'Your code is 123456');
 *
 * // Verify phone
 * const isValid = await verifyPhone('+123456789', '123456');
 *
 * // Generate verification code
 * const code = generateCode();
 */

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '';

// In-memory store for verification codes (use Redis in production)
const verificationStore = new Map();

/**
 * Send an SMS message
 * @param {string} to - Phone number (E.164 format)
 * @param {string} message - Message content
 * @param {Object} options - Options
 * @param {string} options.from - Sender number (default: TWILIO_PHONE_NUMBER)
 * @returns {Promise<Object>} Message info
 */
export async function sendSMS(to, message, options = {}) {
  const from = options.from || TWILIO_PHONE_NUMBER;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.warn('⚠️ Twilio credentials not configured. SMS not sent.');
    return { to, message, status: 'simulated' };
  }

  try {
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    const result = await client.messages.create({
      body: message,
      from,
      to,
    });
    return { to, message, sid: result.sid, status: result.status };
  } catch (error) {
    console.error('SMS error:', error.message);
    throw error;
  }
}

/**
 * Generate a random verification code
 * @param {number} length - Code length (default: 6)
 * @returns {string} Verification code
 */
export function generateCode(length = 6) {
  const chars = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Send verification code via SMS
 * @param {string} phone - Phone number
 * @param {Object} options - Options
 * @param {number} options.codeLength - Code length (default: 6)
 * @param {number} options.expiryMinutes - Code expiry in minutes (default: 10)
 * @param {string} options.message - Custom message (optional)
 * @returns {Promise<string>} Sent code
 */
export async function sendVerificationCode(phone, options = {}) {
  const { codeLength = 6, expiryMinutes = 10, message } = options;

  const code = generateCode(codeLength);
  const expiry = Date.now() + expiryMinutes * 60 * 1000;

  verificationStore.set(phone, { code, expiry });

  const defaultMessage = `Your verification code is: ${code}. It expires in ${expiryMinutes} minutes.`;
  const finalMessage = message || defaultMessage;

  await sendSMS(phone, finalMessage);
  return code;
}

/**
 * Verify a phone number with code
 * @param {string} phone - Phone number
 * @param {string} code - Verification code
 * @returns {Promise<boolean>} True if valid
 */
export async function verifyPhone(phone, code) {
  const record = verificationStore.get(phone);
  if (!record) return false;

  if (Date.now() > record.expiry) {
    verificationStore.delete(phone);
    return false;
  }

  const isValid = record.code === code;
  if (isValid) {
    verificationStore.delete(phone);
  }
  return isValid;
}

/**
 * Send a bulk SMS
 * @param {string[]} numbers - Array of phone numbers
 * @param {string} message - Message content
 * @param {Object} options - Options
 * @returns {Promise<Array>} Results
 */
export async function sendBulkSMS(numbers, message, options = {}) {
  const results = [];
  for (const number of numbers) {
    try {
      const result = await sendSMS(number, message, options);
      results.push({ phone: number, success: true, result });
    } catch (error) {
      results.push({ phone: number, success: false, error: error.message });
    }
  }
  return results;
}

export default {
  sendSMS,
  generateCode,
  sendVerificationCode,
  verifyPhone,
  sendBulkSMS,
};
