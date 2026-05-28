require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('====== TEST SMTP EMAIL CONFIGURATION ======');
console.log('HOST:', process.env.EMAIL_HOST);
console.log('PORT:', process.env.EMAIL_PORT);
console.log('USER:', process.env.EMAIL_USER);
console.log('FROM:', process.env.EMAIL_FROM);

const testRecipient = process.argv[2] || process.env.EMAIL_TEST_TO || process.env.EMAIL_USER;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const mailOptions = {
  from: process.env.EMAIL_FROM,
  to: testRecipient,
  subject: 'AutoFix - Test SMTP Connection',
  text: 'Kết nối gửi thư tự động (SMTP) hoạt động. Đây là email test gửi tới người dùng.'
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('❌ Gửi thử nghiệm thất bại:', error.message);
    console.log('\n👉 Hướng dẫn khắc phục:');
    console.log('1. Vui lòng mở file backend/.env ra.');
    console.log('2. Đảm bảo điền đúng địa chỉ Gmail của bạn vào EMAIL_USER.');
    console.log('3. Tạo và điền "Mật khẩu ứng dụng" (App Password) của Google vào EMAIL_PASS, KHÔNG DÙNG mật khẩu Gmail cá nhân thường dùng.');
  } else {
    console.log('✅ Gửi thử nghiệm THÀNH CÔNG!');
    console.log('Thư phản hồi:', info.response);
    console.log(`📧 Hãy kiểm tra hòm thư (${testRecipient}) để xem email test.`);
  }
});
