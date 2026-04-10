const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next({ statusCode: 401, message: 'Authorization token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next({ statusCode: 401, message: 'Invalid token payload' });
    }

    req.user = user;
    next();
  } catch (error) {
    next({ statusCode: 401, message: 'Token verification failed' });
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next({ statusCode: 403, message: 'Forbidden: insufficient permissions' });
  }
  next();
};

module.exports = {
  protect,
  authorizeRoles
};
