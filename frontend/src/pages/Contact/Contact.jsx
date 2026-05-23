import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-page">
      <div className="contact-banner">
        <h1>Liên hệ với chúng tôi</h1>
        <p>Đội ngũ AutoFix luôn sẵn sàng hỗ trợ bạn</p>
      </div>

      <div className="container contact-content">
        <div className="contact-grid">
          <div className="contact-info">
            <div className="info-card"><FaMapMarkerAlt className="info-icon" /><div><h4>Địa chỉ</h4><p>123 Nguyễn Văn Linh, Quận 7, TP.HCM</p></div></div>
            <div className="info-card"><FaPhone className="info-icon" /><div><h4>Hotline</h4><p>0901 234 567</p></div></div>
            <div className="info-card"><FaEnvelope className="info-icon" /><div><h4>Email</h4><p>support@autofix.com</p></div></div>
            <div className="info-card"><FaClock className="info-icon" /><div><h4>Giờ làm việc</h4><p>T2 - T7: 7:30 - 17:30</p></div></div>
          </div>

          <div className="contact-form-card">
            <h3>Gửi tin nhắn</h3>
            <form>
              <input type="text" placeholder="Họ và tên" required />
              <input type="email" placeholder="Email" required />
              <input type="tel" placeholder="Số điện thoại" />
              <textarea placeholder="Nội dung tin nhắn..." rows={5} required></textarea>
              <button type="submit">Gửi tin nhắn</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
