const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware xác thực JWT token
const auth = async (req, res, next) => {
  try {
    // Lấy token từ header Authorization: Bearer <token>
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Không có token, vui lòng đăng nhập' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm user từ token
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc tài khoản bị khóa' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

// Middleware phân quyền theo vai trò
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Vai trò "${req.user.role}" không có quyền truy cập`
      });
    }
    next();
  };
};

module.exports = { auth, authorize };
