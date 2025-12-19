
# Alto Backend (WhatsApp Integration)

This simple Node.js server handles the delivery of WhatsApp messages using the Twilio API.

## Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Create a free account at [Twilio](https://www.twilio.com/)
   - Get your `Account SID` and `Auth Token` from the console.
   - Paste them into `.env`.

3. **Run the Server**
   ```bash
   node server.js
   ```
   The server will start on `http://localhost:3001`.

## How to Test

1. Go to your Twilio Console > Messaging > Try it out > Send a WhatsApp message.
2. Follow the instructions to join the Sandbox (usually sending a code like `join something-something` to the Twilio number).
3. In the Alto App (frontend), configure the WhatsApp integration with your phone number (format: `+33612345678`).
4. Click "Send to WhatsApp" in the Inbox Scanner.

The frontend is configured to try `localhost:3001` first. If the backend is not running, it falls back to a simulation mode.
