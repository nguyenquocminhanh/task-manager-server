const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token not found' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;  // {userID, iat, exp}
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      // Token has expired
      // Return an appropriate response to the client
      // For example, you can send a 401 Unauthorized status code
      return res.status(401).json({ error: 'Token expired' });
    }
    // Other JWT verification errors
    // Return an appropriate response or handle them as needed
    return res.status(500).json({ error: 'JWT verification error' });
  }
}

const authenticateSocket = (socket, next) => {
  try {
    // Get the token from the socket headers or query parameters
    const token = socket.handshake.auth.token;

    // verify the JWT token
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const userId = user.userId;
    // Attach the userId to the socket object
    if (userId) {
      socket.userId = userId;
      // Call the next middleware or allow the socket connection
      next();
    } else {
      next(new Error('Authentication failed'));
    }
  } catch (error) {
    // Handle the authentication error
    next(error); // Pass the error to the next middleware/error handler
  }
};

module.exports = { authenticateToken, authenticateSocket }
