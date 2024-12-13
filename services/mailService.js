const nodemailer = require('nodemailer');
const config = require('../config/config')
const logger = require("../utils/winston")


// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email provider (e.g., Gmail, Outlook, etc.)
  auth: {
    user: config.EMAIL_USER, // Email address (use environment variable)
    pass: config.EMAIL_PASS, // Email password or app-specific password
  },
});

// Send email function
const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: config.EMAIL_USER, // Sender address
    to, // Recipient email
    subject, // Email subject
    text, // Plain text message
    html, // HTML message
  };

  // Send email
  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info("Email sent: ", info.response)
    return true;
  } catch (error) {
    logger.error(`Uncaught Exception: ${error.message}\n${error.stack}`);
  }
};

module.exports = sendEmail;;
