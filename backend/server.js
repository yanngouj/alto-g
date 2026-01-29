
// Simple Express Server for Alto Backend
// Run with: node server.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Supabase Client (using service key for backend operations)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

let supabase = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
  console.log('Supabase client initialized');
} else {
  console.warn('Supabase credentials not configured. Waitlist will run in demo mode.');
}

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory rate limiter for waitlist endpoint
const waitlistRateLimit = new Map(); // ip -> { count, resetAt }
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 5; // max 5 submissions per window

function waitlistRateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const entry = waitlistRateLimit.get(ip);

  if (!entry || now > entry.resetAt) {
    waitlistRateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({
      error: 'Trop de demandes. Veuillez reessayer dans quelques minutes.'
    });
  }

  entry.count++;
  return next();
}

// Clean up expired rate limit entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of waitlistRateLimit) {
    if (now > entry.resetAt) waitlistRateLimit.delete(ip);
  }
}, 30 * 60 * 1000);

// Twilio Client
// NOTE: You must set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in a .env file
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = new twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  console.log('Twilio client initialized');
} else {
  console.warn('Twilio credentials not configured. WhatsApp will run in demo mode.');
}

app.post('/api/send-whatsapp', async (req, res) => {
  const { to, summary, events, tasks } = req.body;

  if (!to || !summary) {
    return res.status(400).json({ error: 'Missing "to" phone number or "summary"' });
  }

  if (!twilioClient) {
    console.log('Twilio not configured. Simulating WhatsApp send.');
    return res.json({ success: true, simulated: true });
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
    const message = await twilioClient.messages.create({
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
        from: 'Alto <onboarding@resend.dev>',
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

// Waitlist submission endpoint
app.post('/api/waitlist', waitlistRateLimiter, async (req, res) => {
  const {
    firstName,
    email,
    city,
    hasChildren,
    familyType,
    schoolLevels,
    mainPainPoint,
    currentFeeling,
    idealUsage,
    techStack,
    desiredVersion,
    aiLevel
  } = req.body;

  if (!email || !firstName || hasChildren === null || hasChildren === undefined) {
    return res.status(400).json({ error: 'Missing required fields: email, firstName, hasChildren' });
  }

  let waitlistEntry = null;

  // 1. Save to Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('waitlist_entries')
        .insert({
          email,
          first_name: firstName,
          city: city || null,
          has_children: hasChildren,
          family_type: familyType || null,
          school_levels: schoolLevels || [],
          main_pain_point: mainPainPoint || null,
          current_feeling: currentFeeling || null,
          ideal_usage: idealUsage || null,
          tech_stack: techStack || [],
          desired_version: desiredVersion || [],
          ai_level: aiLevel || null,
          email_sent: false
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase Error:', error);
        // Continue anyway to send email
      } else {
        waitlistEntry = data;
        console.log(`Waitlist entry saved for: ${email}`);
      }
    } catch (err) {
      console.error('Database Error:', err);
    }
  } else {
    console.log('Demo mode: Would save waitlist entry for', email);
  }

  // 2. Send confirmation email via Resend
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.log('RESEND_API_KEY not configured. Skipping email send.');
    console.log(`Would send waitlist confirmation to: ${email}`);
    return res.json({ success: true, simulated: true, id: waitlistEntry?.id });
  }

  try {
    // Build the email content
    const schoolLevelsText = schoolLevels?.length > 0 ? schoolLevels.join(', ') : 'Non renseigne';
    const techStackText = techStack?.length > 0 ? techStack.join(', ') : 'Non renseigne';
    const desiredVersionText = desiredVersion?.length > 0 ? desiredVersion.join(', ') : 'Non renseigne';

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: white; border-radius: 24px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background: #1a365d; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px;">A</div>
            <h1 style="color: #1a365d; margin-top: 15px; margin-bottom: 5px;">Bienvenue sur Alto !</h1>
          </div>

          <p style="color: #4a5568; line-height: 1.6; font-size: 16px;">
            Bonjour <strong>${firstName}</strong>,
          </p>

          <p style="color: #4a5568; line-height: 1.6; font-size: 16px;">
            Merci de rejoindre la liste d'attente d'Alto ! Nous sommes ravis de vous compter parmi les familles qui veulent simplifier leur quotidien.
          </p>

          <div style="background: #f7fafc; border-radius: 16px; padding: 24px; margin: 24px 0;">
            <h3 style="color: #1a365d; margin-top: 0; margin-bottom: 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Recapitulatif de vos informations</h3>

            ${hasChildren ? `
            <div style="margin-bottom: 12px;">
              <span style="color: #718096; font-size: 13px;">Situation familiale :</span>
              <span style="color: #2d3748; font-weight: 500; margin-left: 8px;">${familyType || 'Non renseigne'}</span>
            </div>
            <div style="margin-bottom: 12px;">
              <span style="color: #718096; font-size: 13px;">Niveaux scolaires :</span>
              <span style="color: #2d3748; font-weight: 500; margin-left: 8px;">${schoolLevelsText}</span>
            </div>
            ` : `
            <div style="margin-bottom: 12px;">
              <span style="color: #718096; font-size: 13px;">Enfants :</span>
              <span style="color: #2d3748; font-weight: 500; margin-left: 8px;">Pas encore</span>
            </div>
            `}

            <div style="margin-bottom: 12px;">
              <span style="color: #718096; font-size: 13px;">Principale difficulte :</span>
              <span style="color: #2d3748; font-weight: 500; margin-left: 8px;">${mainPainPoint || 'Non renseigne'}</span>
            </div>

            <div style="margin-bottom: 12px;">
              <span style="color: #718096; font-size: 13px;">Ressenti actuel :</span>
              <span style="color: #2d3748; font-weight: 500; margin-left: 8px;">${currentFeeling || 'Non renseigne'}</span>
            </div>

            ${idealUsage ? `
            <div style="margin-bottom: 12px;">
              <span style="color: #718096; font-size: 13px;">Usage ideal :</span>
              <span style="color: #2d3748; font-weight: 500; margin-left: 8px;">${idealUsage}</span>
            </div>
            ` : ''}

            <div style="margin-bottom: 12px;">
              <span style="color: #718096; font-size: 13px;">Outils utilises :</span>
              <span style="color: #2d3748; font-weight: 500; margin-left: 8px;">${techStackText}</span>
            </div>

            <div style="margin-bottom: 0;">
              <span style="color: #718096; font-size: 13px;">Format souhaite :</span>
              <span style="color: #2d3748; font-weight: 500; margin-left: 8px;">${desiredVersionText}</span>
            </div>
          </div>

          <p style="color: #4a5568; line-height: 1.6; font-size: 16px; text-align: center; margin: 24px 0;">
            <strong>Vous recevrez votre acces tres bientot !</strong>
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL || 'https://alto.app'}/auth" style="display: inline-block; background: #68a57c; color: white; padding: 15px 30px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Acceder a Alto
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

          <p style="color: #a0aec0; font-size: 12px; text-align: center; margin: 0;">
            Alto - L'assistant familial intelligent<br>
            <a href="${process.env.APP_URL || 'https://alto.app'}" style="color: #68a57c;">alto.app</a>
          </p>
        </div>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Alto <onboarding@resend.dev>',
        to: [email],
        subject: `Bienvenue sur la liste d'attente Alto, ${firstName} !`,
        html: emailHtml
      })
    });

    if (response.ok) {
      console.log(`Waitlist confirmation email sent to: ${email}`);

      // Update email_sent status in Supabase
      if (supabase && waitlistEntry?.id) {
        await supabase
          .from('waitlist_entries')
          .update({ email_sent: true })
          .eq('id', waitlistEntry.id);
      }

      res.json({ success: true, id: waitlistEntry?.id });
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
  res.send('Alto Backend is running. POST to /api/send-whatsapp, /api/send-invite, or /api/waitlist');
});

app.listen(port, () => {
  console.log(`✅ Alto Backend listening at http://localhost:${port}`);
});
