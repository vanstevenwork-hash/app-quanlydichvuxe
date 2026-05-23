const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Service = require('../models/Service');

// ============================================
// DASHBOARD TỔNG QUAN (Admin)
// GET /api/stats/dashboard
// ============================================
exports.getDashboard = async (req, res) => {
  try {
    const [totalCustomers, totalServices, totalAppointments, inProgress] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Service.countDocuments({ isActive: true }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'in-progress' })
    ]);

    // Doanh thu (tổng giá các lịch hẹn hoàn thành)
    const revenueResult = await Appointment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const revenue = revenueResult[0]?.total || 0;

    res.json({
      totalCustomers,
      totalServices,
      totalAppointments,
      inProgress,
      revenue
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// ============================================
// THỐNG KÊ LƯỢT SỬA CHỮA THEO THÁNG (ChartJS)
// GET /api/stats/appointments-by-month?year=2024
// ============================================
exports.getAppointmentsByMonth = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const data = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$appointmentDate' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Tạo mảng 12 tháng, fill 0 cho tháng không có dữ liệu
    const months = Array.from({ length: 12 }, (_, i) => {
      const found = data.find(d => d._id === i + 1);
      return { month: i + 1, count: found ? found.count : 0 };
    });

    res.json({ year, data: months });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// ============================================
// THỐNG KÊ THEO TRẠNG THÁI (Doughnut chart)
// GET /api/stats/appointments-by-status
// ============================================
exports.getAppointmentsByStatus = async (req, res) => {
  try {
    const data = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({ data });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
