
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

app.get('/', (req, res) => {
  res.send('Alto Backend is running. POST to /api/send-whatsapp');
});

app.listen(port, () => {
  console.log(`✅ Alto Backend listening at http://localhost:${port}`);
});
