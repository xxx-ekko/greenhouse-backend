const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from the request header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if no token is found
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied.' });
  }

  // Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user from the payload to the request object
    req.user = decoded.user;
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid.' });
  }
};