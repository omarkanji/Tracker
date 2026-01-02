import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// Only initialize Twilio if credentials are provided
let client = null;
const hasTwilioCredentials = process.env.TWILIO_ACCOUNT_SID &&
                              process.env.TWILIO_AUTH_TOKEN &&
                              process.env.TWILIO_ACCOUNT_SID !== 'placeholder';

if (hasTwilioCredentials) {
  try {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('✅ Twilio WhatsApp client initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Twilio:', error.message);
  }
} else {
  console.log('⚠️  Twilio credentials not configured - WhatsApp notifications disabled');
}

/**
 * Send daily tracking reminder via WhatsApp
 */
export async function sendDailyReminder() {
  if (!client) {
    console.log('Skipping WhatsApp reminder - Twilio not configured');
    return null;
  }

  const trackingUrl = `${process.env.BASE_URL}/track`;

  const message = `🌙 Good evening! Time for your daily check-in.

Click here to log today's activities:
${trackingUrl}

Track your progress and keep the streak alive! 💪`;

  try {
    const sentMessage = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: process.env.WHATSAPP_TO,
      body: message
    });

    console.log(`WhatsApp reminder sent: ${sentMessage.sid}`);
    return sentMessage;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

/**
 * Send custom WhatsApp message
 */
export async function sendWhatsAppMessage(to, message) {
  try {
    const sentMessage = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${to}`,
      body: message
    });

    return sentMessage;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

/**
 * Send streak celebration message
 */
export async function sendStreakCelebration(streakDays) {
  if (!client) {
    return null;
  }

  const milestones = [7, 14, 30, 60, 100, 365];

  if (milestones.includes(streakDays)) {
    const message = `🎉 AMAZING! You've hit a ${streakDays}-day streak!

Keep crushing your goals! 🚀`;

    await sendWhatsAppMessage(
      process.env.WHATSAPP_TO.replace('whatsapp:', ''),
      message
    );
  }
}
