const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middlewares/auth');
const statsController = require('../controllers/stats.controller');

// Tất cả routes thống kê chỉ dành cho Admin
router.get('/dashboard', auth, authorize('admin'), statsController.getDashboard);
router.get('/appointments-by-month', auth, authorize('admin'), statsController.getAppointmentsByMonth);
router.get('/appointments-by-status', auth, authorize('admin'), statsController.getAppointmentsByStatus);

module.exports = router;
