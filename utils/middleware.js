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

module.exports = authenticateToken
