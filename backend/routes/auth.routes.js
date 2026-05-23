const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth } = require('../middlewares/auth');
const authController = require('../controllers/auth.controller');

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Họ tên không được để trống'),
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu ít nhất 6 ký tự'),
  body('phone').matches(/^(0[3|5|7|8|9])+([0-9]{8})$/).withMessage('Số điện thoại không hợp lệ')
];

const loginValidation = [
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').notEmpty().withMessage('Mật khẩu không được để trống')
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/me', auth, authController.getMe);
router.put('/change-password', auth, authController.changePassword);

module.exports = router;
