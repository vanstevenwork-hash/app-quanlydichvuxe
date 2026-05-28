const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const paymentController = require('../controllers/payment.controller');

// Khởi tạo URL thanh toán (Yêu cầu đăng nhập)
router.post('/create-url', auth, paymentController.createPaymentUrl);

// Nhận kết quả từ cổng thanh toán (Không yêu cầu đăng nhập vì Server Cổng thanh toán sẽ gọi vào đây hoặc qua redirect)
router.get('/callback', paymentController.paymentCallback);

module.exports = router;
