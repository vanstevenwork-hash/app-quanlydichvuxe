const mongoose = require('mongoose');

// Schema dịch vụ sửa chữa / bảo dưỡng
const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên dịch vụ'],
    trim: true,
    maxlength: [200, 'Tên dịch vụ không quá 200 ký tự']
  },
  category: {
    type: String,
    required: [true, 'Vui lòng chọn danh mục'],
    enum: {
      values: ['bao-duong', 'sua-chua', 'kiem-tra', 'thay-the'],
      message: 'Danh mục không hợp lệ'
    }
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả dịch vụ'],
    maxlength: [1000, 'Mô tả không quá 1000 ký tự']
  },
  price: {
    type: Number,
    required: [true, 'Vui lòng nhập giá dịch vụ'],
    min: [0, 'Giá không được âm']
  },
  duration: {
    type: Number, // Thời gian thực hiện (phút)
    required: [true, 'Vui lòng nhập thời gian thực hiện'],
    min: [15, 'Thời gian tối thiểu 15 phút']
  },
  image: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index hỗ trợ tìm kiếm
serviceSchema.index({ name: 'text', description: 'text' });
serviceSchema.index({ category: 1 });

module.exports = mongoose.model('Service', serviceSchema);
