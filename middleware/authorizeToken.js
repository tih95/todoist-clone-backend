const jwt = require('jsonwebtoken');
const config = require('../config');

const getTokenFromAuth = request => {
  const authType = request.get('authorization');
  if (authType && authType.toLowerCase().startsWith('bearer ')) {
    return authType.substring(7);
  }

  return null;
}

const authorizeToken = (req, res, next) => {
  const tokenFromHeader = getTokenFromAuth(req);
  const decodedToken = jwt.verify(tokenFromHeader, config.JWT_SECRET);
  if (!tokenFromHeader || !decodedToken.id) {
    res.status(403).json({ errMsg: 'missing or invalid token' })
  }
  try {
    req.user = decodedToken;
    next();
  }
  catch(e) {
    res.status(403).json({ errMsg: 'Unauthorized access' })
  }
}

module.exports = authorizeToken;