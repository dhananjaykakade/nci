const Redis = require('ioredis');
const logger = require("./winston")

// Use the IP address you got from 'hostname -I'
const redis = new Redis({
  host: 'localhost', // Replace with the IP address from 'hostname -I'
  port: 6379,           // Default Redis port
  password: '',         // Optional if you have a password set for Redis
});

redis.on('connect', () => {
  logger.info('Connected to Redis');
});

redis.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

module.exports = redis;
