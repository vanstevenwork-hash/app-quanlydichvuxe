const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Xóa dữ liệu cũ
    await User.deleteMany({});
    await Service.deleteMany({});
    await Appointment.deleteMany({});
    console.log('Cleared old data');

    // ========== TẠO USERS ==========
    const admin = await User.create({
      name: 'Admin AutoFix', email: 'admin@autofix.com',
      password: '123456', phone: '0901234567', role: 'admin'
    });

    const technicians = await User.create([
      { name: 'Lê Hoàng', email: 'lehoang@autofix.com', password: '123456', phone: '0912345678', role: 'technician', specialization: 'Động cơ' },
      { name: 'Phạm Minh', email: 'phamminh@autofix.com', password: '123456', phone: '0923456789', role: 'technician', specialization: 'Điện - Điện lạnh' },
      { name: 'Nguyễn Tuấn', email: 'nguyentuan@autofix.com', password: '123456', phone: '0934567890', role: 'technician', specialization: 'Gầm - Hệ thống phanh' }
    ]);

    const customers = await User.create([
      { name: 'Trần Quang Huy', email: 'huy@gmail.com', password: '123456', phone: '0945678901', role: 'customer' },
      { name: 'Nguyễn Thị Lan', email: 'lan@gmail.com', password: '123456', phone: '0956789012', role: 'customer' },
      { name: 'Võ Đình Nam', email: 'nam@gmail.com', password: '123456', phone: '0967890123', role: 'customer' }
    ]);

    console.log('✅ Users created');

    // ========== TẠO DỊCH VỤ ==========
    const services = await Service.create([
      { name: 'Bảo Dưỡng Cấp 1 (5,000 km)', category: 'bao-duong', description: 'Kiểm tra tổng quát, thay dầu máy, lọc dầu, vệ sinh lọc gió động cơ và lọc gió điều hòa. Đảm bảo xe luôn vận hành êm ái.', price: 850000, duration: 60, image: '/image/service-photo-1.png' },
      { name: 'Bảo Dưỡng Cấp 2 (10,000 km)', category: 'bao-duong', description: 'Bảo dưỡng cấp 1 + thay lọc gió, kiểm tra hệ thống phanh, kiểm tra ắc quy và hệ thống điện.', price: 1500000, duration: 120, image: '/image/service-photo-2.png' },
      { name: 'Bảo Dưỡng Hệ Thống Phanh', category: 'bao-duong', description: 'Kiểm tra độ mòn má phanh, đĩa phanh, thay dầu phanh và vệ sinh toàn bộ hệ thống để đảm bảo an toàn.', price: 450000, duration: 90, image: '/image/service-photo-1.png' },
      { name: 'Sửa Chữa Động Cơ', category: 'sua-chua', description: 'Chẩn đoán và khắc phục sự cố động cơ chuyên sâu bằng thiết bị hiện đại.', price: 2000000, duration: 180, image: '/image/service-photo-2.png' },
      { name: 'Sửa Chữa Hộp Số', category: 'sua-chua', description: 'Kiểm tra, sửa chữa hộp số tự động và số sàn. Thay dầu hộp số chính hãng.', price: 3000000, duration: 240, image: '/image/service-photo-2.png' },
      { name: 'Sửa Chữa Hệ Thống Điều Hòa', category: 'sua-chua', description: 'Nạp gas, sửa chữa máy nén, kiểm tra rò rỉ hệ thống điều hòa ô tô.', price: 800000, duration: 120, image: '/image/service-photo-3.png' },
      { name: 'Chẩn Đoán Lỗi Máy Tính (OBD)', category: 'kiem-tra', description: 'Quét lỗi toàn bộ hệ thống điện tử trên xe bằng máy chẩn đoán chuyên dụng, xóa lỗi và tư vấn phương án sửa chữa.', price: 300000, duration: 45, image: '/image/service-photo-4.png' },
      { name: 'Kiểm Tra Tổng Quát', category: 'kiem-tra', description: 'Kiểm tra toàn diện 50+ hạng mục trên xe: động cơ, gầm, điện, phanh, lốp, đèn.', price: 200000, duration: 60, image: '/image/service-photo-4.png' },
      { name: 'Thay Lốp & Cân Bằng Động', category: 'thay-the', description: 'Thay lốp chính hãng, cân bằng động bằng máy kỹ thuật số laser 3D giúp xe vận hành ổn định.', price: 2500000, duration: 60, image: '/image/service-photo-1.png' },
      { name: 'Thay Ắc Quy', category: 'thay-the', description: 'Thay ắc quy chính hãng các loại: Varta, Bosch, GS. Bảo hành 12-18 tháng.', price: 1800000, duration: 30, image: '/image/service-photo-3.png' },
      { name: 'Thay Bộ Ly Hợp', category: 'thay-the', description: 'Thay bộ ly hợp (côn) cho xe số sàn, sử dụng phụ tùng chính hãng.', price: 4000000, duration: 300, image: '/image/service-photo-2.png' },
      { name: 'Sơn Dặm & Đánh Bóng', category: 'sua-chua', description: 'Sơn dặm vết trầy xước, phục hồi bề mặt sơn và đánh bóng toàn xe.', price: 1200000, duration: 180, image: '/image/service-photo-4.png' }
    ]);

    console.log('✅ Services created');

    // ========== TẠO LỊCH HẸN MẪU ==========
    const now = new Date();
    await Appointment.create([
      { customerId: customers[0]._id, serviceId: services[1]._id, technicianId: technicians[0]._id, appointmentDate: new Date(now.getFullYear(), now.getMonth(), 15), appointmentTime: '08:30', vehicleInfo: { make: 'Toyota', model: 'Camry', year: 2021, licensePlate: '51F-888.88' }, status: 'in-progress', totalPrice: services[1].price },
      { customerId: customers[0]._id, serviceId: services[11]._id, appointmentDate: new Date(now.getFullYear(), now.getMonth(), 18), appointmentTime: '14:00', vehicleInfo: { make: 'Toyota', model: 'Camry', year: 2021, licensePlate: '51F-888.88' }, notes: 'Gói đồng sơn cơ bản', status: 'pending', totalPrice: services[11].price },
      { customerId: customers[0]._id, serviceId: services[9]._id, technicianId: technicians[1]._id, appointmentDate: new Date(now.getFullYear(), now.getMonth() - 1, 5), appointmentTime: '10:00', vehicleInfo: { make: 'Toyota', model: 'Camry', year: 2021, licensePlate: '51F-888.88' }, status: 'completed', totalPrice: services[9].price },
      { customerId: customers[1]._id, serviceId: services[0]._id, technicianId: technicians[0]._id, appointmentDate: new Date(now.getFullYear(), now.getMonth(), 20), appointmentTime: '09:00', vehicleInfo: { make: 'Honda', model: 'Civic', year: 2022, licensePlate: '30A-123.45' }, status: 'confirmed', totalPrice: services[0].price },
      { customerId: customers[2]._id, serviceId: services[6]._id, appointmentDate: new Date(now.getFullYear(), now.getMonth(), 25), appointmentTime: '11:00', vehicleInfo: { make: 'Mazda', model: 'CX-5', year: 2023, licensePlate: '29B-567.89' }, status: 'pending', totalPrice: services[6].price },
      { customerId: customers[1]._id, serviceId: services[3]._id, technicianId: technicians[2]._id, appointmentDate: new Date(now.getFullYear(), now.getMonth() - 1, 10), appointmentTime: '08:00', vehicleInfo: { make: 'Honda', model: 'Civic', year: 2022, licensePlate: '30A-123.45' }, status: 'completed', totalPrice: services[3].price },
      { customerId: customers[0]._id, serviceId: services[7]._id, appointmentDate: new Date(now.getFullYear(), now.getMonth() - 2, 22), appointmentTime: '15:00', vehicleInfo: { make: 'Toyota', model: 'Camry', year: 2021, licensePlate: '51F-888.88' }, status: 'cancelled', totalPrice: services[7].price }
    ]);

    console.log('✅ Appointments created');
    console.log('\n===== SEED COMPLETE =====');
    console.log('Admin: admin@autofix.com / 123456');
    console.log('Technician: lehoang@autofix.com / 123456');
    console.log('Customer: huy@gmail.com / 123456');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
