const nodemailer = require('nodemailer');

const hasEmailConfig = () => (
  process.env.EMAIL_HOST &&
  process.env.EMAIL_PORT &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS &&
  process.env.EMAIL_USER !== 'your_email@gmail.com' &&
  process.env.EMAIL_PASS !== 'your_app_password'
);

const createTransporter = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ============================================
// GỬI EMAIL XÁC NHẬN LỊCH HẸN
// ============================================
const sendAppointmentEmail = async (customerEmail, appointmentData) => {
  try {
    if (!hasEmailConfig()) {
      console.warn('⚠️ Email config chưa được cấu hình đúng, bỏ qua gửi email.');
      return false;
    }

    const { customerName, serviceName, date, time, vehicleInfo, status } = appointmentData;

    const statusText = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'in-progress': 'Đang sửa chữa',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy'
    };

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: customerEmail,
      subject: `AutoFix - Xác nhận lịch hẹn sửa chữa`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a2332; padding: 20px; text-align: center;">
            <h1 style="color: #fff; margin: 0;">🚗 AutoFix</h1>
            <p style="color: #ccc; margin: 5px 0 0;">Hệ thống đặt lịch sửa chữa ô tô</p>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #1a2332;">Xin chào ${customerName},</h2>
            <p>Lịch hẹn của bạn đã được ghi nhận với thông tin:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Dịch vụ</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${serviceName}</td></tr>
              <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Ngày hẹn</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${date}</td></tr>
              <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Giờ hẹn</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${time}</td></tr>
              <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Xe</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${vehicleInfo.make} ${vehicleInfo.model} ${vehicleInfo.year}</td></tr>
              <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Trạng thái</td>
                  <td style="padding: 10px; border: 1px solid #ddd; color: #e67e22; font-weight: bold;">${statusText[status]}</td></tr>
            </table>
            <p style="color: #666;">Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.</p>
          </div>
          <div style="background: #1a2332; padding: 15px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">© 2024 AutoFix Professional Car Service</p>
          </div>
        </div>
      `
    };

    const transporter = createTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Email error:', error.message);
    // Không throw error để không ảnh hưởng flow chính
    return false;
  }
};

module.exports = { sendAppointmentEmail };
