const Appointment = require('../models/Appointment');
const crypto = require('crypto');
const moment = require('moment');
const qs = require('qs');

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj){
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

// ============================================
// KHỞI TẠO URL THANH TOÁN (VNPAY REAL)
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
    appointment.paymentMethod = 'vnpay'; 
    await appointment.save();

    // Các tham số cấu hình VNPay
    const tmnCode = process.env.VNP_TMN_CODE || 'UP292I8A';
    const secretKey = process.env.VNP_HASH_SECRET || '6XEMFCS5OTER1JLAVHKWAZD9B78383KR';
    let vnpUrl = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const returnUrl = process.env.VNP_RETURN_URL || 'http://localhost:5173/payment/result'; // Đẩy thẳng về kết quả frontend (hoặc đẩy qua backend rồi redirect)

    // Chúng ta sẽ đẩy returnUrl về API backend để backend xử lý checksum, sau đó redirect sang frontend
    const backendReturnUrl = (process.env.BACKEND_URL || 'http://localhost:5005') + '/api/payments/callback';

    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress || '127.0.0.1';
    
    // Đảm bảo amount là số nguyên (nhân 100 theo chuẩn VNPay)
    const amount = (appointment.totalPrice || 0) * 100;

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = appointment._id.toString();
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang ' + appointment._id;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount;
    vnp_Params['vnp_ReturnUrl'] = backendReturnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if(bankCode && bankCode !== '') {
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
    
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

    res.json({ paymentUrl: vnpUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi tạo URL thanh toán', error: error.message });
  }
};

// ============================================
// CALLBACK NHẬN KẾT QUẢ TỪ CỔNG THANH TOÁN (VNP_RETURN_URL)
// GET /api/payments/callback
// ============================================
exports.paymentCallback = async (req, res) => {
  try {
    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];
    const appId = vnp_Params['vnp_TxnRef'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    const secretKey = process.env.VNP_HASH_SECRET || '6XEMFCS5OTER1JLAVHKWAZD9B78383KR';
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");     

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // 1. Tìm đơn hàng
    const appointment = await Appointment.findById(appId);
    if (!appointment) {
      return res.redirect(`${frontendUrl}/payment/result?status=failed&msg=not_found`);
    }

    if(secureHash === signed){
      // Chữ ký hợp lệ
      if (vnp_Params['vnp_ResponseCode'] === '00') {
        // Thanh toán thành công
        appointment.paymentStatus = 'paid';
        appointment.paymentDate = new Date();
        await appointment.save();
        return res.redirect(`${frontendUrl}/payment/result?status=success&appId=${appId}`);
      } else {
        // Giao dịch không thành công
        appointment.paymentStatus = 'failed';
        await appointment.save();
        return res.redirect(`${frontendUrl}/payment/result?status=failed&appId=${appId}&msg=vnpay_error_${vnp_Params['vnp_ResponseCode']}`);
      }
    } else {
      // Chữ ký không hợp lệ (Bị can thiệp dữ liệu)
      return res.redirect(`${frontendUrl}/payment/result?status=failed&appId=${appId}&msg=invalid_signature`);
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/payment/result?status=failed&msg=server_error`);
  }
};
