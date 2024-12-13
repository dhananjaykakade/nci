const { body, validationResult } = require('express-validator');

const validateUserInput = async (req) => {
  // Input validations based on the Prisma model
  await Promise.all([
    // String validations
    body('Name').isString().notEmpty().withMessage('Full name is required.').run(req),
    body('Email').isEmail().withMessage('Valid email is required.').run(req),
    body('Mobile').isString().notEmpty().withMessage('Mobile is required.').run(req),
    body('College').isString().notEmpty().withMessage('College name is required.').run(req),
    body('Section').isString().notEmpty().withMessage('Section is required.').run(req),
    body('Day1').isString().notEmpty().withMessage('Day1 is required.').run(req),
    body('Day2').isString().notEmpty().withMessage('Day2 is required.').run(req),
    body('Amount').isString().notEmpty().withMessage('Amount is required.').run(req),
    body('Country').isString().notEmpty().withMessage('Country is required.').run(req),
    body('State').isString().notEmpty().withMessage('State is required.').run(req),
  ]);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new Error(JSON.stringify(errors.array()));
  }
};

module.exports = { validateUserInput };
