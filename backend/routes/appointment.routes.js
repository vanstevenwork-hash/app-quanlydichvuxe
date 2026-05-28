const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const appointmentController = require('../controllers/appointment.controller');

// Customer đặt lịch
router.post('/', auth, authorize('customer'), upload.single('vehicleImage'), appointmentController.createAppointment);

// Xem danh sách (mỗi role xem khác nhau)
router.get('/', auth, appointmentController.getAppointments);

// Xem chi tiết
router.get('/:id', auth, appointmentController.getAppointment);

// Cập nhật trạng thái (Technician & Admin)
router.put('/:id/status', auth, authorize('technician', 'admin'), appointmentController.updateStatus);

// Phân công kỹ thuật viên (Admin)
router.put('/:id/assign', auth, authorize('admin'), appointmentController.assignTechnician);

// Hủy lịch (Customer & Admin)
router.delete('/:id', auth, authorize('customer', 'admin'), appointmentController.cancelAppointment);

module.exports = router;
