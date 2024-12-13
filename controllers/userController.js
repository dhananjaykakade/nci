const { NotFoundError, ApiError } = require('../utils/customError');
const CustomResponse = require("../utils/customResponse");
const {uploadImage} = require('../config/cloudinary');
const logger = require('../utils/winston');
const { validateUserInput } = require('../services/validationService');
const { checkIfUserExists, createUser } = require('../services/userService');
const studentEventSchema  = require('../validator/validate')
const { z } = require('zod');
const getIstTime = require('../utils/getIstIme')
const fs = require('fs');
const redis = require('../utils/redisClient');



function cleanupFile(filePath) {
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}




exports.getUserDetails = async (req, res) => {
  try {
    // Simulate fetching data from a database or service
    const user = {
      id: 1,
      name: 'John Doe',
      Email: 'johndoe@example.com',
      role: 'Admin',
    };

    // Use the customResponse utility to send the response
    CustomResponse({
      res,
      statusCode: 200,
      message: 'User details fetched successfully',
      payload: user,
    });
  } catch (error) {
    // Send an error response
    CustomResponse({
      res,
      statusCode: 500,
      message: 'Failed to fetch user details',
      errors: [error.message],
    });
  }
};




exports.Register = async (req, res, next) => {
  let filePath;

  try {
        // Handle file upload
        if (!req.file || !req.file.path) throw new Error('File upload is required.');
        filePath = req.file.path;
    // Validate and parse request body
    const validatedData = await studentEventSchema.parseAsync(req.body);

    // Check if user already exists in Redis
    const cachedUser = await redis.get(`user:${validatedData.Email}`);
    if (cachedUser) {

      if (req.file && req.file.path) await cleanupFile(filePath);
      return CustomResponse({
        res,
        statusCode: 409,
        message: 'User already exists (cached)',
        payload: validatedData.Email,
      });
      
    }

    // Check if user exists in the database
    const existingUser = await checkIfUserExists(validatedData.Email);
    if (existingUser) {
      
      if (req.file && req.file.path) await cleanupFile(req.file.path);

      // Cache the user for 1 hour
      await redis.set(
        `user:${validatedData.Email}`,
        JSON.stringify(existingUser),
        'EX',
        3600 // 1 hour in seconds
      );

      return CustomResponse({
        res,
        statusCode: 409,
        message: 'User already exists',
        payload: existingUser.Email,
      });
    }



    const [uploadResult] = await Promise.all([
      uploadImage(filePath),
    ]);

    cleanupFile(filePath); // Clean up temporary file

    // Prepare and store user data
    const userData = {
      ...validatedData,
      Date: getIstTime(), // Use IST timestamp
      Image: uploadResult.secure_url,
    };

    const newUser = await createUser(userData);

    // Cache the new user
    await redis.set(
      `user:${newUser.Email}`,
      JSON.stringify(newUser),
      'EX',
      3600 // 1 hour in seconds
    );

    // Send success response
    return CustomResponse({
      res,
      statusCode: 201,
      message: 'User registered successfully',
      payload: newUser,
    });

  } catch (error) {
    if (filePath) cleanupFile(filePath); // Ensure cleanup

    if (error instanceof z.ZodError) {
      return CustomResponse({
        res,
        statusCode: 400,
        message: 'Validation failed',
        payload: {},
        errors: error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    logger.error('Error during registration:', error.message);
    return CustomResponse({
      res,
      statusCode: 500,
      message: 'Registration failed',
      payload: {},
      errors: [error.message],
    });
  }
};

