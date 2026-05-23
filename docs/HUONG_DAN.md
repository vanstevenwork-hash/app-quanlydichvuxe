# 🚗 Cẩm Nang Hướng Dẫn Dự Án AutoFix

Tài liệu này cung cấp toàn bộ thông tin chi tiết về kiến trúc hệ thống, cấu trúc cơ sở dữ liệu MongoDB, các chức năng cốt lõi và hướng dẫn vận hành toàn diện cho hệ thống đặt lịch sửa chữa xe ô tô trực tuyến **AutoFix**.

---

## 📂 1. Cấu Trúc Thư Mục Hệ Thống

Dự án được phân chia theo mô hình Full-stack hiện đại:
```
app-quanlydichvuxe/
├── backend/                    # NodeJS + Express + MongoDB (MVC Pattern)
│   ├── config/db.js            # Cấu hình kết nối cơ sở dữ liệu MongoDB
│   ├── models/                 # Lược đồ dữ liệu Mongoose (User, Service, Appointment)
│   ├── controllers/            # Khối xử lý nghiệp vụ (Auth, Service, Appointment, User, Stats)
│   ├── routes/                 # Điểm cuối API định tuyến (API Endpoints)
│   ├── middlewares/            # Bảo mật, xác thực Token JWT & Phân quyền thành viên
│   ├── services/               # Dịch vụ gửi thư điện tử tự động (Nodemailer)
│   ├── seed/                   # Script khởi tạo nhanh dữ liệu mẫu kiểm thử
│   ├── .env                    # File biến môi trường bảo mật của máy chủ
│   └── server.js               # Entry point khởi chạy máy chủ Express (Port 5005)
├── frontend/                   # ReactJS + TailwindCSS (Vite)
│   ├── index.html              # Trang gốc tích hợp cấu hình theme AutoPro
│   ├── src/
│   │   ├── api/index.js        # Cấu hình Axios tích hợp JWT Interceptor kết nối Backend
│   │   ├── context/AuthContext.jsx # Quản lý trạng thái đăng nhập toàn cục
│   │   ├── layouts/            # Khung giao diện ClientLayout và AdminLayout
│   │   └── pages/              # 11 trang giao diện (Home, Services, Booking, Profile, Admin...)
└── docs/
    └── HUONG_DAN.md            # Tài liệu cẩm nang hướng dẫn sử dụng (File này)
```

---

## 💾 2. Cơ Sở Dữ Liệu MongoDB & Các Schemas

Hệ thống sử dụng cơ sở dữ liệu NoSQL **MongoDB** với 3 Collections chính. Các Schema (lược đồ dữ liệu) được thiết kế ràng buộc chặt chẽ tại thư mục `backend/models/`:

### A. Collection `users` (Quản lý Tài khoản & Phân quyền)
Lưu trữ thông tin của Khách hàng, Cố vấn kỹ thuật và Quản trị viên.
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Được băm bảo mật bằng bcryptjs
  phone: { type: String, required: true },
  role: { type: String, enum: ['customer', 'technician', 'admin'], default: 'customer' },
  specialization: { type: String }, // Riêng dành cho Kỹ thuật viên (vd: Điện, Động cơ, Đồng sơn...)
  createdAt: { type: Date, default: Date.now }
}
```

### B. Collection `services` (Danh mục Dịch vụ sửa chữa)
Lưu trữ thông tin chi tiết về giá cả, thời gian thực hiện của từng hạng mục bảo dưỡng xe.
```javascript
{
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true }, // Thời gian hoàn thành tính theo phút (vd: 60)
  category: { type: String, enum: ['bao-duong', 'sua-chua', 'kiem-tra', 'thay-the'], required: true },
  createdAt: { type: Date, default: Date.now }
}
```

### C. Collection `appointments` (Quản lý Phiếu đặt lịch & Tiến độ)
Trọng tâm của hệ thống, liên kết Khách hàng, Dịch vụ và Kỹ thuật viên phụ trách.
```javascript
{
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  technicianId: { type: Schema.Types.ObjectId, ref: 'User' }, // Sẽ được Admin phân công
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true },
  vehicleInfo: {
    make: { type: String, required: true },          // Hãng xe (vd: Toyota)
    model: { type: String, required: true },         // Dòng xe (vd: Camry)
    year: { type: Number, required: true },          // Năm sản xuất (vd: 2022)
    licensePlate: { type: String }                   // Biển số xe (vd: 29H-123.45)
  },
  notes: { type: String },
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now }
}
```

---

## 🎯 3. Phân Hệ Chức Năng Nghiệp Vụ

### 👤 A. Phân hệ Khách hàng (Customer)
1. **Đăng ký & Đăng nhập**: Xác thực mã bảo mật JWT, tự động lưu phiên làm việc.
2. **Xem danh mục dịch vụ (`/services`)**: Tìm kiếm dịch vụ gõ phím nhanh, lọc theo phân mục chính, phân trang dữ liệu linh hoạt.
3. **Đặt lịch thông minh (`/booking`)**: 
   * Quy trình 4 bước trực quan: Chọn dịch vụ $\rightarrow$ Chọn ngày giờ $\rightarrow$ Điền thông tin xe $\rightarrow$ Thêm ghi chú.
   * Khung tổng kết hóa đơn (Sticky Summary Panel) tính toán chi phí thực tế ngay lập tức.
   * Modal hiển thị mã lịch đặt dạng đặc biệt dạng `#AFX-XXXX`.
4. **Lịch sử sửa chữa (`/profile`)**:
   * Quản lý thông tin tài khoản cá nhân.
   * Danh sách lịch sử dạng **Thẻ nâng cao (Grid Cards)** trực quan, có bộ lọc phân loại nhanh trạng thái.
   * Cho phép hủy lịch hẹn trực tiếp nếu xe chưa được đưa vào sửa chữa.

### 🔧 B. Phân hệ Kỹ thuật viên (Technician)
1. **Lịch làm việc cá nhân**: Giao diện gọn gàng hiển thị danh sách các xe được Admin phân công sửa chữa.
2. **Cập nhật tiến độ**: Cho phép bấm nút chuyển nhanh trạng thái xe từ lúc nhận xe (`Confirmed`) sang đang làm (`In-Progress`) và hoàn tất giao xe (`Completed`).

### 👑 C. Phân hệ Quản trị viên (Admin CMS)
1. **Dashboard Phân tích số liệu (`/admin`)**:
   * Hệ thống thẻ đo lường KPI: Tổng số lượng khách hàng, số lượt sửa chữa, xe đang xử lý tại xưởng, và doanh thu ước tính.
   * Biểu đồ cột **ChartJS** so sánh lượng xe sửa theo từng tháng trong năm.
   * Biểu đồ tròn **ChartJS** thể hiện cấu trúc trạng thái xe trong xưởng trực quan.
2. **Quản lý dịch vụ**: Thực hiện đầy đủ nghiệp vụ CRUD (Thêm, Xóa, Sửa, Xem) các dịch vụ kèm hộp thoại Modal nổi.
3. **Quản lý lịch hẹn**: Xem toàn bộ danh sách xe đặt lịch trên hệ thống, thực hiện gán Kỹ thuật viên phụ trách sửa chữa cho từng xe.
4. **Quản lý Kỹ thuật viên & Khách hàng**: Theo dõi danh sách nhân sự, phân loại chuyên môn kỹ thuật.

---

## 📬 4. Cấu Hình Gửi Mail SMTP Tự Động (Nodemailer)

Hệ thống tích hợp thư viện **Nodemailer** để tự động gửi thông báo chi tiết bằng định dạng HTML chuyên nghiệp khi có sự thay đổi trạng thái lịch hẹn.

### Các bước cấu hình hoạt động:
1. Mở tính năng **Xác minh 2 bước** trên tài khoản Gmail cá nhân.
2. Truy cập vào mục **Mật khẩu ứng dụng** trong cài đặt bảo mật Google, tạo mã bảo mật 16 chữ số dành riêng cho ứng dụng.
3. Mở file `backend/.env` ra và chỉnh sửa thông tin kết nối SMTP:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=email_cua_ban@gmail.com
   EMAIL_PASS=mat_khau_ung_dung_16_chu_so
   EMAIL_FROM=AutoFix <noreply@autopro.com>
   ```
4. Chạy lệnh test SMTP siêu tốc:
   ```bash
   cd backend
   node test-email.js
   ```
   Nếu hệ thống báo thành công, tài khoản Gmail của bạn đã chính thức được cấu hình thành trạm phát email thông báo tự động cho website!

---

## 🚀 5. Hướng Dẫn Khởi Chạy Hệ Thống

### Bước 1: Khởi tạo Dữ liệu mẫu (Seeding)
Hãy đảm bảo bạn đã mở ứng dụng MongoDB (vd: MongoDB Compass). Sau đó mở Terminal và chạy lệnh nạp dữ liệu:
```bash
cd backend
npm run seed
```
*Script sẽ tự động dọn dẹp dữ liệu cũ, khởi tạo danh sách 3 tài khoản kiểm thử chính cùng 12 dịch vụ sửa chữa và 7 lịch hẹn mẫu.*

### Bước 2: Chạy Backend Server
```bash
cd backend
npm run dev
```
*Express Server sẽ chạy trên cổng **`http://localhost:5005`**.*

### Bước 3: Chạy Frontend App
```bash
cd frontend
npm run dev
```
*Vite App sẽ được khởi chạy. Bạn mở trình duyệt ra và truy cập vào địa chỉ: **`http://localhost:5173`**.*

---

## 🔑 6. Danh Sách Tài Khoản Kiểm Thử Sẵn Có

| Phân quyền thành viên | Địa chỉ Email đăng nhập | Mật khẩu truy cập |
| :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@autofix.com` | `123456` |
| **Kỹ thuật viên (Technician)** | `lehoang@autofix.com` | `123456` |
| **Khách hàng mẫu (Customer)** | `huy@gmail.com` | `123456` |

---
Chúc bạn vận hành và phát triển hệ thống **AutoFix** đạt kết quả tốt nhất!
