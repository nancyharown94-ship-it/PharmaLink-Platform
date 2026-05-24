const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-passwordHash');
      
      // تأكيد إضافي: لو التوكن سليم بس اليوزر اتمسح من الداتا بيز مثلاً
      if (!req.user) {
        return res.status(401).json({ message: 'User not found, authorization denied' });
      }

      return next(); // الانتقال للكنترولر
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
  } catch (error) {
    return res.status(401).json({ message: error.message || 'Not authorized, token failed' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role (${req.user ? req.user.role : 'Unknown'}) is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorizeRoles
};