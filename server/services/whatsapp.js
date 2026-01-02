import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send daily tracking reminder via WhatsApp
 */
export async function sendDailyReminder() {
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
