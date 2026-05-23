const Service = require('../models/Service');
const { getServiceImage, withServiceImage } = require('../utils/serviceImages');

// ============================================
// LẤY DANH SÁCH DỊCH VỤ (có filter, search, paginate)
// GET /api/services
// ============================================
exports.getServices = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 8, minPrice, maxPrice } = req.query;

    // Build query filter
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const total = await Service.countDocuments(filter);
    const services = await Service.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      services: services.map(withServiceImage),
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// ============================================
// LẤY CHI TIẾT DỊCH VỤ
// GET /api/services/:id
// ============================================
exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    res.json({ service: withServiceImage(service) });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// ============================================
// TẠO DỊCH VỤ MỚI (Admin)
// POST /api/services
// ============================================
exports.createService = async (req, res) => {
  try {
    const { name, category, description, price, duration, image } = req.body;
    const serviceData = { name, category, description, price, duration, image };
    if (req.file) serviceData.image = `/image/services/${req.file.filename}`;
    serviceData.image = serviceData.image || getServiceImage(serviceData);
    const service = await Service.create(serviceData);
    res.status(201).json({ message: 'Tạo dịch vụ thành công', service: withServiceImage(service) });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// ============================================
// CẬP NHẬT DỊCH VỤ (Admin)
// PUT /api/services/:id
// ============================================
exports.updateService = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.image = `/image/services/${req.file.filename}`;
    if (!updateData.image) {
      const currentService = await Service.findById(req.params.id);
      updateData.image = getServiceImage({ ...currentService?.toObject(), ...updateData });
    }

    const service = await Service.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true
    });
    if (!service) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    res.json({ message: 'Cập nhật dịch vụ thành công', service: withServiceImage(service) });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// ============================================
// XÓA DỊCH VỤ (Admin - soft delete)
// DELETE /api/services/:id
// ============================================
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!service) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    res.json({ message: 'Xóa dịch vụ thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
