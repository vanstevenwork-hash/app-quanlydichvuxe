const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const User = require('../models/User');
const { sendAppointmentEmail } = require('../services/email.service');

// ============================================
// ĐẶT LỊCH SỬA CHỮA (Customer)
// POST /api/appointments
// ============================================
exports.createAppointment = async (req, res) => {
  try {
    let { serviceId, appointmentDate, appointmentTime, vehicleInfo, notes } = req.body;

    // Nếu vehicleInfo gửi lên từ FormData dưới dạng chuỗi JSON, parse nó
    if (typeof vehicleInfo === 'string') {
      vehicleInfo = JSON.parse(vehicleInfo);
    }

    // Xử lý lưu ảnh nếu có
    if (req.file) {
      vehicleInfo.imageUrl = `/uploads/${req.file.filename}`;
    }

    // Kiểm tra dịch vụ tồn tại
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Dịch vụ không tồn tại' });

    // Tạo lịch hẹn
    const appointment = await Appointment.create({
      customerId: req.user._id,
      serviceId,
      appointmentDate,
      appointmentTime,
      vehicleInfo,
      notes,
      totalPrice: service.price,
      status: 'pending'
    });

    // Gửi email xác nhận về email của tài khoản customer đang đặt lịch.
    const emailSent = await sendAppointmentEmail(req.user.email, {
      customerName: req.user.name,
      serviceName: service.name,
      date: new Date(appointmentDate).toLocaleDateString('vi-VN'),
      time: appointmentTime,
      vehicleInfo,
      status: 'pending'
    });

    // Populate để trả về đầy đủ thông tin
    const populated = await Appointment.findById(appointment._id)
      .populate('serviceId', 'name price category')
      .populate('customerId', 'name email phone');

    res.status(201).json({ message: 'Đặt lịch thành công', appointment: populated, emailSent });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// ============================================
// LẤY DANH SÁCH LỊCH HẸN (theo role)
// GET /api/appointments
// ============================================
exports.getAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, customerId } = req.query;
    const filter = {};

    // Phân quyền: customer chỉ xem của mình, technician xem được phân công
    if (req.user.role === 'customer') {
      filter.customerId = req.user._id;
    } else if (req.user.role === 'technician') {
      filter.technicianId = req.user._id;
    } else if (req.user.role === 'admin' && customerId) {
      filter.customerId = customerId;
    }

    if (status) filter.status = status;

    const total = await Appointment.countDocuments(filter);
    const appointments = await Appointment.find(filter)
      .populate('customerId', 'name email phone')
      .populate('serviceId', 'name price category')
      .populate('technicianId', 'name phone specialization')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      appointments,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// ============================================
// LẤY CHI TIẾT LỊCH HẸN
// GET /api/appointments/:id
// ============================================
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('customerId', 'name email phone address')
      .populate('serviceId', 'name price category duration description')
      .populate('technicianId', 'name phone specialization');

    if (!appointment) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });

    // Customer chỉ xem được của mình
    if (req.user.role === 'customer' && appointment.customerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền xem lịch hẹn này' });
    }

    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// ============================================
// CẬP NHẬT TRẠNG THÁI (Technician/Admin)
// PUT /api/appointments/:id/status
// ============================================
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const updateData = { status };
    if (status === 'in-progress') {
      updateData.startedAt = new Date();
    } else if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('customerId', 'name email')
     .populate('serviceId', 'name');

    if (!appointment) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });

    // Gửi email khi trạng thái thay đổi
    sendAppointmentEmail(appointment.customerId.email, {
      customerName: appointment.customerId.name,
      serviceName: appointment.serviceId.name,
      date: new Date(appointment.appointmentDate).toLocaleDateString('vi-VN'),
      time: appointment.appointmentTime,
      vehicleInfo: appointment.vehicleInfo,
      status
    });

    res.json({ message: 'Cập nhật trạng thái thành công', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// ============================================
// PHÂN CÔNG KỸ THUẬT VIÊN (Admin)
// PUT /api/appointments/:id/assign
// ============================================
exports.assignTechnician = async (req, res) => {
  try {
    const { technicianId } = req.body;

    // Kiểm tra kỹ thuật viên tồn tại
    const technician = await User.findOne({ _id: technicianId, role: 'technician' });
    if (!technician) return res.status(404).json({ message: 'Kỹ thuật viên không tồn tại' });

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { technicianId, status: 'confirmed' },
      { new: true }
    ).populate('customerId', 'name email')
     .populate('serviceId', 'name')
     .populate('technicianId', 'name phone specialization');

    if (!appointment) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });

    res.json({ message: 'Phân công kỹ thuật viên thành công', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// ============================================
// HỦY LỊCH HẸN (Customer/Admin)
// DELETE /api/appointments/:id
// ============================================
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });

    // Customer chỉ hủy được của mình và khi chưa bắt đầu sửa
    if (req.user.role === 'customer') {
      if (appointment.customerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Không có quyền hủy lịch hẹn này' });
      }
      if (['in-progress', 'completed'].includes(appointment.status)) {
        return res.status(400).json({ message: 'Không thể hủy lịch hẹn đang/đã hoàn thành' });
      }
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Hủy lịch hẹn thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// ============================================
// CẬP NHẬT BẰNG CHỨNG (Technician)
// PUT /api/appointments/:id/evidence
// ============================================
exports.uploadEvidence = async (req, res) => {
  try {
    const { technicianNotes } = req.body;
    
    // Tạo mảng đường dẫn ảnh từ file upload
    const uploadedImages = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const updateData = {};
    if (technicianNotes !== undefined) {
      updateData.technicianNotes = technicianNotes;
    }
    
    if (uploadedImages.length > 0) {
      // Append ảnh mới vào ảnh cũ hoặc tạo mới nếu chưa có
      updateData.$push = { evidenceImages: { $each: uploadedImages } };
    }

    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    
    // Đảm bảo chỉ technician được phân công hoặc admin mới được cập nhật
    if (req.user.role === 'technician' && appointment.technicianId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật bằng chứng cho đơn này' });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      uploadedImages.length > 0 ? updateData : { $set: updateData },
      { new: true }
    );

    res.json({ message: 'Cập nhật bằng chứng thành công', appointment: updatedAppointment });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
