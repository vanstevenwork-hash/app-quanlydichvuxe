const Appointment = require('../models/Appointment');
const crypto = require('crypto');

// ============================================
// KHỞI TẠO URL THANH TOÁN (MOCK VNPAY)
// POST /api/payments/create-url
// ============================================
exports.createPaymentUrl = async (req, res) => {
  try {
    const { appointmentId, bankCode } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });

    if (appointment.status !== 'completed' && appointment.status !== 'confirmed') {
      return res.status(400).json({ message: 'Chỉ có thể thanh toán các lịch hẹn đã xác nhận hoặc hoàn thành' });
    }

    if (appointment.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Lịch hẹn này đã được thanh toán' });
    }

    // Cập nhật trạng thái thanh toán thành processing
    appointment.paymentStatus = 'processing';
    appointment.paymentMethod = 'vnpay'; // Giả lập chọn VNPay
    await appointment.save();

    // Giả lập mã hóa bảo mật (như VNPay yêu cầu hash VNP_SECURE_SECRET)
    // Ở đây ta tạo một chữ ký đơn giản để chống giả mạo
    const secret = process.env.JWT_SECRET || 'autofix_secret';
    const amount = appointment.totalPrice || 0;
    const rawSignature = `appId=${appointment._id}&amount=${amount}&secret=${secret}`;
    const secureHash = crypto.createHash('sha256').update(rawSignature).digest('hex');

    // Tạo URL giả lập hướng về trang MockGateway của frontend
    // Trong thực tế, URL này sẽ trỏ về https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const paymentUrl = `${frontendUrl}/payment/mock?appId=${appointment._id}&amount=${amount}&hash=${secureHash}`;

    res.json({ paymentUrl });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi tạo URL thanh toán', error: error.message });
  }
};

// ============================================
// CALLBACK NHẬN KẾT QUẢ TỪ CỔNG THANH TOÁN
// GET /api/payments/callback
// ============================================
exports.paymentCallback = async (req, res) => {
  try {
    const { appId, status, hash } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // 1. Tìm đơn hàng
    const appointment = await Appointment.findById(appId);
    if (!appointment) {
      return res.redirect(`${frontendUrl}/payment/result?status=failed&msg=not_found`);
    }

    // 2. Xác thực chữ ký (Checksum)
    const secret = process.env.JWT_SECRET || 'autofix_secret';
    const amount = appointment.totalPrice || 0;
    const rawSignature = `appId=${appId}&amount=${amount}&secret=${secret}`;
    const secureHash = crypto.createHash('sha256').update(rawSignature).digest('hex');

    if (hash !== secureHash) {
      return res.redirect(`${frontendUrl}/payment/result?status=failed&msg=invalid_signature`);
    }

    // 3. Cập nhật trạng thái
    if (status === '00') {
      // 00 là mã thành công chuẩn của VNPay
      appointment.paymentStatus = 'paid';
      appointment.paymentDate = new Date();
      await appointment.save();
      return res.redirect(`${frontendUrl}/payment/result?status=success&appId=${appId}`);
    } else {
      appointment.paymentStatus = 'failed';
      await appointment.save();
      return res.redirect(`${frontendUrl}/payment/result?status=failed&appId=${appId}`);
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/payment/result?status=failed&msg=server_error`);
  }
};
