const jwt = require('jsonwebtoken');
const config = require('../config/config');


const JWT_SECRET = config.JWT_SECRET || 'your-jwt-secret';
const protectRoute = (roles = []) => {
    return (req, res, next) => {
      // Get the token from the Authorization header
      const token = req.header('Authorization')?.replace('Bearer ', '');
  
      if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
      }
  
      try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
  
        // Check if the user's role matches one of the required roles
        if (roles.length && !roles.includes(decoded.role)) {
          return res.status(403).json({ message: 'Forbidden. You do not have access to this resource.' });
        }
  
        // Attach the user to the request object for use in the route handler
        req.user = decoded;
        next(); // Proceed to the next middleware or route handler
      } catch (err) {
        return res.status(400).json({ message: 'Invalid token.' });
      }
    };
  };
  
  module.exports = protectRoute;
