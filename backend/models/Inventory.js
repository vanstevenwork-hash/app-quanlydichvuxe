const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên phụ tùng/vật tư'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'Vui lòng nhập mã SKU'],
    unique: true,
    trim: true,
    uppercase: true
  },
  category: {
    type: String,
    required: [true, 'Vui lòng chọn danh mục'],
    enum: ['Dầu nhớt', 'Lốp xe', 'Phanh', 'Bình ắc quy', 'Lọc gió/Lọc dầu', 'Phụ tùng máy', 'Khác'],
    default: 'Khác'
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, 'Số lượng không được âm'],
    default: 0
  },
  importPrice: {
    type: Number,
    required: true,
    min: [0, 'Giá nhập không hợp lệ']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Giá bán không hợp lệ']
  },
  unit: {
    type: String,
    required: true,
    default: 'Cái' // Cái, Lít, Cặp, Bình...
  },
  supplier: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Inventory', inventorySchema);
