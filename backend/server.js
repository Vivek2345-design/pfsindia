// server.js
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const axios = require('axios'); // Import axios

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Configure for your domain in production

// --- NODEMAILER TRANSPORTER (for contact/coaching forms) ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// --- ENDPOINT 1: SEND EMAIL (for contact/coaching forms) ---
app.post('/send-form', (req, res) => {
  const { subject, body, fromEmail, fromName } = req.body;
  const mailOptions = {
    from: '"Perfect Fitness Solutions" <support@coachravinder.com>',
    to: 'support@coachravinder.com',
    replyTo: fromEmail,
    subject: subject,
    html: body,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ message: 'Failed to send email.' });
    }
    res.status(200).json({ message: 'Form submitted successfully!' });
  });
});

// --- ENDPOINT 2: SUBSCRIBE TO NEWSLETTER ---
app.post('/subscribe-newsletter', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  const BREVO_API_URL = 'https://api.brevo.com/v3/contacts';
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const BREVO_LIST_ID = parseInt(process.env.BREVO_LIST_ID);

  const contactData = {
    email: email,
    listIds: [BREVO_LIST_ID],
    updateEnabled: true // This will update the contact if they already exist
  };

  try {
    await axios.post(BREVO_API_URL, contactData, {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
    });
    res.status(200).json({ message: 'Subscription successful!' });
  } catch (error) {
    console.error('Brevo API Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to subscribe. Please try again.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});