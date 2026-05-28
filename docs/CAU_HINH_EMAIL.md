# 📧 Hướng Dẫn Cấu Hình Email Tự Động (SMTP Gmail)

Tài liệu này hướng dẫn cách thiết lập Gmail để hệ thống AutoFix có thể tự động gửi email thông báo (đặt lịch, cập nhật trạng thái...) tới khách hàng thông qua Nodemailer.

---

## 1. Tìm hiểu các biến môi trường (.env)
Trong thư mục `backend`, mở file `.env`. Bạn sẽ thấy cấu hình liên quan đến email như sau:
```env
# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=AutoFix <noreply@autofix.com>
```

## 2. Các bước thiết lập Gmail

### Bước 1: Chuẩn bị tài khoản Gmail
- Bạn cần có một tài khoản Gmail (có thể dùng email cá nhân hoặc tạo email riêng cho xưởng, VD: `autofix.vietnam@gmail.com`).
- Điền email này vào biến: `EMAIL_USER=autofix.vietnam@gmail.com`

### Bước 2: Bật Xác minh 2 bước (2-Step Verification)
Vì lý do bảo mật, Google không cho phép đăng nhập email trực tiếp bằng mật khẩu thông thường vào code. Bạn phải bật bảo mật 2 lớp:
1. Truy cập vào trang quản lý tài khoản Google: [https://myaccount.google.com/](https://myaccount.google.com/)
2. Chuyển sang tab **Bảo mật (Security)**.
3. Kéo xuống phần "Cách bạn đăng nhập vào Google", chọn **Xác minh 2 bước (2-Step Verification)** và làm theo hướng dẫn để bật (sẽ cần số điện thoại xác nhận).

### Bước 3: Tạo Mật khẩu ứng dụng (App Password)
1. Vẫn ở trang **Bảo mật (Security)**, tìm kiếm từ khóa **Mật khẩu ứng dụng (App Passwords)**.
2. Đặt tên ứng dụng là `AutoFix Web` (hoặc tên tùy ý) rồi bấm **Tạo**.
3. Google sẽ cấp cho bạn một dải mật khẩu gồm **16 chữ cái** (VD: `abcd efgh ijkl mnop`).
4. Copy đoạn mã 16 chữ này (lưu ý xóa các khoảng trắng, ví dụ thành `abcdefghijklmnop`).
5. Dán đoạn mã này vào biến: `EMAIL_PASS=abcdefghijklmnop`

---

## 3. Hoàn tất cấu hình
Sau khi làm xong, file `.env` của bạn sẽ trông như sau (ví dụ):

```env
# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=autofix.vietnam@gmail.com
EMAIL_PASS=abcdefghijklmnop
EMAIL_FROM=AutoFix <autofix.vietnam@gmail.com>
```
*(Lưu ý: Bạn nhớ đổi phần chữ bên trong cặp dấu `< >` ở dòng `EMAIL_FROM` thành email thực tế của bạn để khách hàng thấy thư đến từ đúng địa chỉ).*

## 4. Kiểm tra kết nối
Để chắc chắn hệ thống gửi mail hoạt động tốt, hãy mở Terminal, di chuyển vào thư mục `backend` và chạy lệnh test có sẵn:
```bash
node test-email.js
```
Nếu Terminal báo kết nối thành công, website của bạn đã sẵn sàng tự động gửi email cho khách hàng!
