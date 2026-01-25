
// Simple Express Server for Alto Backend
// Run with: node server.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Twilio Client
// NOTE: You must set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in a .env file
const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

app.post('/api/send-whatsapp', async (req, res) => {
  const { to, summary, events, tasks } = req.body;

  if (!to || !summary) {
    return res.status(400).json({ error: 'Missing "to" phone number or "summary"' });
  }

  try {
    console.log(`Preparing WhatsApp message for ${to}...`);

    // Construct a formatted message
    let messageBody = `☀️ *Briefing Alto*\n\n"${summary}"\n`;

    if (events && events.length > 0) {
        messageBody += `\n📅 *Agenda :*`;
        events.forEach(e => {
            messageBody += `\n• ${e.time !== 'All day' ? e.time : 'Journée'} : ${e.title}`;
        });
    }

    if (tasks && tasks.length > 0) {
        messageBody += `\n\n✅ *Tâches :*`;
        tasks.forEach(t => {
            const priorityIcon = t.priority === 'high' ? '🔴' : '⚪';
            messageBody += `\n• ${priorityIcon} ${t.title}`;
        });
    }

    messageBody += `\n\n_Bonne journée !_`;

    // Send via Twilio
    const message = await client.messages.create({
      body: messageBody,
      from: 'whatsapp:+14155238886', // Twilio Sandbox Number
      to: `whatsapp:${to}`
    });

    console.log(`Message sent successfully! SID: ${message.sid}`);
    res.json({ success: true, sid: message.sid });

  } catch (error) {
    console.error('Twilio Error:', error);
    res.status(500).json({ error: error.message, details: 'Ensure your Twilio Sandbox is configured and the user has joined.' });
  }
});

// Send invitation email endpoint
app.post('/api/send-invite', async (req, res) => {
  const { email, inviteLink, familyId } = req.body;

  if (!email || !inviteLink) {
    return res.status(400).json({ error: 'Missing email or inviteLink' });
  }

  // Check if Resend API key is configured
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.log('RESEND_API_KEY not configured. Skipping email send.');
    console.log(`Would send invitation to: ${email}`);
    console.log(`Invite link: ${inviteLink}`);
    return res.json({ success: true, simulated: true });
  }

  try {
    // Using fetch to call Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Alto <noreply@alto.app>',
        to: [email],
        subject: 'Invitation a rejoindre votre famille sur Alto',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 60px; height: 60px; background: #1a365d; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px;">A</div>
              <h1 style="color: #1a365d; margin-top: 15px;">Alto</h1>
            </div>

            <h2 style="color: #1a365d;">Vous etes invite(e) a rejoindre une famille sur Alto</h2>

            <p style="color: #4a5568; line-height: 1.6;">
              Un membre de votre famille vous a invite a rejoindre Alto, l'assistant familial intelligent qui simplifie la gestion du quotidien.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteLink}" style="display: inline-block; background: #68a57c; color: white; padding: 15px 30px; border-radius: 12px; text-decoration: none; font-weight: bold;">
                Accepter l'invitation
              </a>
            </div>

            <p style="color: #718096; font-size: 14px;">
              Ce lien expire dans 7 jours. Si vous n'avez pas demande cette invitation, vous pouvez ignorer cet email.
            </p>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

            <p style="color: #a0aec0; font-size: 12px; text-align: center;">
              Alto - L'assistant familial intelligent
            </p>
          </div>
        `
      })
    });

    if (response.ok) {
      console.log(`Invitation email sent to: ${email}`);
      res.json({ success: true });
    } else {
      const error = await response.json();
      console.error('Resend Error:', error);
      res.status(500).json({ error: 'Failed to send email', details: error });
    }
  } catch (error) {
    console.error('Email Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Alto Backend is running. POST to /api/send-whatsapp or /api/send-invite');
});

app.listen(port, () => {
  console.log(`✅ Alto Backend listening at http://localhost:${port}`);
});
