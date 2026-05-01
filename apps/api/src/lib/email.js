const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ Email credentials missing in .env. Email service disabled.');
    return null;
  }
  
  try {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } catch (err) {
    console.error('Failed to create email transporter:', err);
    return null;
  }
};

const transporter = createTransporter();

async function sendVerificationEmail(to, name, code) {
  if (!transporter) {
    console.warn('Email service not configured. OTP:', code);
    return;
  }

  const mailOptions = {
    from: `"TeamHub" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify your TeamHub account',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px;">
        <h2 style="color: #1e293b;">Welcome to TeamHub, ${name}!</h2>
        <p style="color: #64748b; font-size: 16px;">Please use the following verification code to complete your registration:</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${code}</span>
        </div>
        <p style="color: #94a3b8; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}


module.exports = { sendVerificationEmail };
