const { PrismaClient } = require('@prisma/client');

// Instantiate Prisma Client
const prisma = new PrismaClient();

module.exports = prisma;
