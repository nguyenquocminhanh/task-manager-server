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
    return res.status(403).json({ message: 'Invalid access token' });
  }
}

const authenticateSocket = (socket, next) => {
  // Get the token from the socket headers or query parameters
  const token = socket.handshake.auth.token;

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
};


module.exports = { authenticateToken, authenticateSocket }
