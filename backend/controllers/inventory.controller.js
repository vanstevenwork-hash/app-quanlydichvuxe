const Inventory = require('../models/Inventory');

// Lấy danh sách phụ tùng
exports.getAllItems = async (req, res) => {
  try {
    const { category, search, sort = '-createdAt' } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Inventory.find(query).sort(sort);
    
    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Lấy 1 phụ tùng
exports.getItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Không tìm thấy phụ tùng' });
    
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Tạo mới phụ tùng
exports.createItem = async (req, res) => {
  try {
    const existingSku = await Inventory.findOne({ sku: req.body.sku.toUpperCase() });
    if (existingSku) {
      return res.status(400).json({ success: false, message: 'Mã SKU đã tồn tại' });
    }

    const item = await Inventory.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Cập nhật phụ tùng
exports.updateItem = async (req, res) => {
  try {
    let item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Không tìm thấy phụ tùng' });

    // Kiểm tra SKU trùng nếu có cập nhật SKU
    if (req.body.sku && req.body.sku.toUpperCase() !== item.sku) {
      const existingSku = await Inventory.findOne({ sku: req.body.sku.toUpperCase() });
      if (existingSku) {
        return res.status(400).json({ success: false, message: 'Mã SKU đã tồn tại ở sản phẩm khác' });
      }
    }

    item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Xóa phụ tùng
exports.deleteItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Không tìm thấy phụ tùng' });

    await item.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};
