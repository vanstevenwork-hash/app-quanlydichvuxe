const mongoose = require('mongoose');

// Schema lịch hẹn sửa chữa
const appointmentSchema = new mongoose.Schema({
  // Khách hàng đặt lịch
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Thiếu thông tin khách hàng']
  },
  // Dịch vụ được chọn
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Vui lòng chọn dịch vụ']
  },
  // Kỹ thuật viên được phân công
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Ngày hẹn
  appointmentDate: {
    type: Date,
    required: [true, 'Vui lòng chọn ngày hẹn']
  },
  // Giờ hẹn (VD: "08:00", "09:30")
  appointmentTime: {
    type: String,
    required: [true, 'Vui lòng chọn giờ hẹn']
  },
  // Thông tin xe
  vehicleInfo: {
    make: { type: String, required: true },    // Hãng xe: Toyota
    model: { type: String, required: true },   // Dòng xe: Camry
    year: { type: Number, required: true },     // Năm: 2021
    licensePlate: { type: String, default: '' } // Biển số: 51F-888.88
  },
  // Ghi chú tình trạng xe
  notes: {
    type: String,
    maxlength: [500, 'Ghi chú không quá 500 ký tự'],
    default: ''
  },
  // Trạng thái lịch hẹn
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  // Tổng giá
  totalPrice: {
    type: Number,
    default: 0
  },
  // Thời gian bắt đầu sửa chữa thực tế
  startedAt: {
    type: Date,
    default: null
  },
  // Thời gian hoàn thành sửa chữa thực tế
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index cho truy vấn hiệu quả
appointmentSchema.index({ customerId: 1, status: 1 });
appointmentSchema.index({ technicianId: 1, appointmentDate: 1 });
appointmentSchema.index({ appointmentDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
