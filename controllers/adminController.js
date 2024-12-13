const CustomResponse = require('../utils/customResponse');
const { validationResult } = require('express-validator');
const Users = require('../data/Users')
const { generateToken } = require('../utils/jwt');
const prisma = require('../utils/prismaClient');
const sendEmail = require('../services/mailService')
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const {  uploadQR } = require('../config/cloudinary');
const emailQueue = require('../utils/queue');



exports.adminLogin = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return CustomResponse({
        res,
        statusCode: 400,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }
  
    const { username, password } = req.body;
  
    // Find the user
    const user = Users.find((u) => u.username === username && u.role === 'admin');
    if (!user || user.password !== password) {
      return CustomResponse({
        res,
        statusCode: 401,
        message: 'Invalid credentials',
      });
    }
  
    // Generate JWT
    const token = generateToken({ id: user.id, role: user.role });
    const User ={
      id: user.id,
      name: user.name,
      Email: user.Email,
      role: user.role,
      token,
    }
    return CustomResponse({
      res,
      statusCode: 200,
      message: 'Login successful',
      payload: { User },
    });
  };


exports.adminTest = (req,res) => {
    const { id } = req.user;
    if (!id) {
      return CustomResponse({
        res,
        statusCode: 401,
        message: 'Unauthorized',
      });
    }
    return CustomResponse({
        res,
        statusCode: 200,
        message: 'Admin Test',
        payload: { id },
      });

}

exports.getEventCounts = async (req, res) => {
    try {
      // Group by Day1 events
      const day1Counts = await prisma.user.groupBy({
        by: ['Day1'],
        _count: {
          Day1: true,
        },
      });
  
      // Group by Day2 events
      const day2Counts = await prisma.user.groupBy({
        by: ['Day2'],
        _count: {
          Day2: true,
        },
      });
  
      // Format the results
      const response = {
        Day1: day1Counts.map((event) => ({
          event: event.Day1,
          participants: event._count.Day1,
        })),
        Day2: day2Counts.map((event) => ({
          event: event.Day2,
          participants: event._count.Day2,
        })),
      };
  
      // Send the response
      return res.status(200).json({
        message: 'Event participant counts retrieved successfully',
        data: response,
      });
    } catch (error) {
      console.error('Error fetching event counts:', error.message);
      return res.status(500).json({
        message: 'Failed to retrieve event participant counts',
        error: error.message,
      });
    }
  };


exports.getAmount = async(req, res ) =>{
    try {
        // calculate total amount
        
        const totalAmount = await prisma.user.aggregate({
            _sum: {
              Amount: true, // Ensure the field matches the model
            },
          });
        // return the total amount
        return CustomResponse({
            res,
            statusCode: 200,
            message: 'Total amount',
            payload: { totalAmount: totalAmount._sum.Amount || 0 }, // Handle null in case no data exists
          });
        
    } catch (error) {
        return CustomResponse({
            res,
            statusCode: 500,
            message: 'cannot get amount',
            payload: {},
            errors: [error.message],
          });
    }
}

exports.getTotalUserCount = async (req,res) => {
  try {
    // calculate total user count
    const totalUserCount = await prisma.user.count();
    // return the total user count
    return CustomResponse({
        res,
        statusCode: 200,
        message: 'Total user count',
        payload: { totalUserCount }, // Handle null in case no data exists
      });
    
  } catch (error) {
    return CustomResponse({
        res,
        statusCode: 500,
        message: 'cannot get count for user',
        payload: {},
        errors: [error.message],
      });
  }
}

exports.getAllUsers=async(req,res)=>{
    try {
        // get all users
        const users = await prisma.user.findMany();
        // return the users
        return CustomResponse({
            res,
            statusCode: 200,
            message: 'All users',
            payload: { users }, // Handle null in case no data exists
          });
        
    } catch (error) {
        return CustomResponse({
            res,
            statusCode: 500,
            message: 'cannot get users',
            payload: {},
            errors: [error.message],
          });
    }
}




exports.sendConfirmationEmail = async (req, res) => {
    const { email, Name, Token, Mobile, College, Day1, Day2, Amount } = req.body;
  
    try {
      // Check if all required data is present
      if (!email || !Name || !Token || !Mobile || !College || !Day1 || !Day2 || !Amount) {
        return CustomResponse({
          res,
          statusCode: 400,
          message: 'Missing required user data.',
          payload: {},
        });
      }
  
      const whatsappLink = 'https://chat.whatsapp.com/YourGroupLink';
  
      // Generate QR code directly into a buffer (no need to save to disk)
      const qrData = `
        Full Name: ${Name}
        Email: ${email}
        Phone: ${Mobile}
        College: ${College}
        Events: ${Day1}, ${Day2}
        Payment: ₹${Amount}
        Token: ${Token}
      `;
  
      const qrBuffer = await QRCode.toBuffer(qrData, { type: 'png' });
  
      // Ensure qrBuffer is a valid Buffer
      if (!Buffer.isBuffer(qrBuffer)) {
        return CustomResponse({
          res,
          statusCode: 500,
          message: 'Failed to generate QR code buffer.',
          payload: {},
        });
      }
  
      // Convert buffer to base64 string if you want to transmit as a string (optional)
      const qrBase64 = qrBuffer.toString('base64'); 
  
      const user = {
        Name,
        Email: email,
        Mobile,
        College,
        Day1,
        Day2,
        Amount,
        Token,
        whatsappLink,
      };
  
      // Add the email job to the queue with base64 encoded buffer
      await emailQueue.add({
        email,
        user,
        qrBase64, // Send base64 encoded string instead of raw buffer
      });
  
      CustomResponse({
        res,
        statusCode: 200,
        message: 'Confirmation email will be sent shortly.',
      });
    } catch (error) {
      console.error('Error sending confirmation email:', error); // Log the error
  
      CustomResponse({
        res,
        statusCode: 500,
        message: 'Error sending confirmation email.',
        errors: [error.message],
      });
    }
  };
  