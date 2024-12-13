// queue.js
const Queue = require('bull');
const redis = require('./redisClient');  // Import your existing Redis connection
const {  uploadQR } = require('../config/cloudinary');
const sendEmail = require('../services/mailService')
const prisma = require('..//utils/prismaClient');

// Set up the Bull queue with the existing Redis connection
const emailQueue = new Queue('emailQueue', {
  redis: {
    host: redis.options.host,
    port: redis.options.port,
    password: redis.options.password,
  },
});

emailQueue.process(async (job) => {
    const { email, user, qrBase64 } = job.data;
  
    // Check if qrBase64 exists and is a valid string
    if (!qrBase64 || typeof qrBase64 !== 'string') {
      console.error('Invalid qrBase64:', qrBase64);
      return; // Early exit if qrBase64 is invalid
    }
  
    try {
      // Convert base64 string back to buffer
      const qrBuffer = Buffer.from(qrBase64, 'base64');
  
      // Upload QR code to Cloudinary
      const uploadResult = await uploadQR(qrBuffer);
  
      // Prepare email content
      const mailOptions = {
        from: `"Your Application Name" <no-reply@yourapp.com>`,
        to: email,
        subject: 'Registration Confirmation',
        html: `
          <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif;">
            <h1 style="background: #4caf50; color: white; padding: 15px 0; text-align: center;">Your Application Name</h1>
            <p>Hi ${user.Name},</p>
            <p>Thank you for registering! Here are your registration details:</p>
            <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;">
              <p><strong>Email:</strong> ${user.Email}</p>
              <p><strong>Phone Number:</strong> ${user.Mobile}</p>
              <p><strong>College Name:</strong> ${user.College}</p>
              <p><strong>Events Registered:</strong> ${user.Day1}, ${user.Day2}</p>
              <p><strong>Payment:</strong> ₹${user.Amount}</p>
            </div>
            <p>Join our WhatsApp group for updates:</p>
            <a href="${user.whatsappLink}" style="display: block; width: max-content; margin: 20px auto; padding: 10px 20px; background: #4caf50; color: white; text-decoration: none; border-radius: 5px;">Join WhatsApp Group</a>
            <p>Bring this email or scan the barcode below at the entry:</p>
            <div style="text-align: center;">
              <img src="${uploadResult.secure_url}" alt="QR Code" style="max-width: 200px; width: 100%;"/>
            </div>
          </div>
        `,
      };
  
      // Send email
      await sendEmail(email, mailOptions.subject, mailOptions.subject, mailOptions.html);
      await prisma.user.update({
        where: { Email: email },
        data: {
          Status: true, // Assuming the field is named 'status' and it's a boolean
        },
      });
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error processing email job:', error);
    }
  });

module.exports = emailQueue;
