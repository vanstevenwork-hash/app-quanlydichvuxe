const User = require('../models/User');

// ============================================
// LẤY DANH SÁCH USERS (Admin)
// GET /api/users?role=customer&page=1
// ============================================
exports.getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      users,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// ============================================
// LẤY CHI TIẾT USER
// GET /api/users/:id
// ============================================
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// ============================================
// CẬP NHẬT USER
// PUT /api/users/:id
// ============================================
exports.updateUser = async (req, res) => {
  try {
    const { name, phone, address, avatar, specialization, isActive } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (specialization !== undefined) updateData.specialization = specialization;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true
    });

    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json({ message: 'Cập nhật thành công', user });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// ============================================
// TẠO KỸ THUẬT VIÊN (Admin)
// POST /api/users/technician
// ============================================
exports.createTechnician = async (req, res) => {
  try {
    const { name, email, password, phone, specialization } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email đã tồn tại' });

    const user = await User.create({
      name, email, password, phone, specialization,
      role: 'technician'
    });

    res.status(201).json({
      message: 'Tạo kỹ thuật viên thành công',
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, specialization: user.specialization, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
