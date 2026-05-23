import { useState, useEffect } from 'react';
import { resolveAssetUrl, serviceAPI, statsAPI } from '../../../api';
import { FaUsers, FaWrench, FaSpinner, FaMoneyBillWave } from 'react-icons/fa';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import './Dashboard.css';

// Đăng ký ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, monthRes, statusRes, serviceRes] = await Promise.all([
          statsAPI.getDashboard(),
          statsAPI.getByMonth(),
          statsAPI.getByStatus(),
          serviceAPI.getAll({ limit: 12 })
        ]);
        setDashboard(dashRes.data);
        setMonthlyData(monthRes.data);
        setStatusData(statusRes.data);
        setServices(serviceRes.data.services);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-state">Đang tải dữ liệu...</div>;

  // Chart: Lượt sửa chữa theo tháng (Bar chart)
  const barChartData = {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    datasets: [{
      label: 'Lượt sửa chữa',
      data: monthlyData?.data?.map(d => d.count) || [],
      backgroundColor: 'rgba(37, 99, 235, 0.7)',
      borderRadius: 6,
      maxBarThickness: 36
    }]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#f0f0f0' } },
      x: { grid: { display: false } }
    }
  };

  // Chart: Trạng thái (Doughnut)
  const statusLabels = {
    'pending': 'Chờ xác nhận',
    'confirmed': 'Đã xác nhận',
    'in-progress': 'Đang sửa',
    'completed': 'Hoàn thành',
    'cancelled': 'Đã hủy'
  };

  const statusColors = ['#f59e0b', '#3b82f6', '#22c55e', '#10b981', '#ef4444'];

  const doughnutData = {
    labels: statusData?.data?.map(d => statusLabels[d._id] || d._id) || [],
    datasets: [{
      data: statusData?.data?.map(d => d.count) || [],
      backgroundColor: statusColors,
      borderWidth: 0,
      cutout: '70%'
    }]
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  const kpiCards = [
    { icon: <FaUsers />, label: 'Tổng khách hàng', value: dashboard?.totalCustomers || 0, change: '+12%', color: '#2563eb' },
    { icon: <FaWrench />, label: 'Tổng sửa chữa', value: dashboard?.totalAppointments || 0, change: '+5%', color: '#22c55e' },
    { icon: <FaSpinner />, label: 'Đang thực hiện', value: dashboard?.inProgress || 0, change: '', color: '#f59e0b' },
    { icon: <FaMoneyBillWave />, label: 'Doanh thu', value: formatPrice(dashboard?.revenue || 0), change: '+18%', color: '#10b981' }
  ];

  return (
    <div className="dashboard-page">
      <h1 className="page-title">Dashboard</h1>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpiCards.map((card, i) => (
          <div key={i} className="kpi-card">
            <div className="kpi-content">
              <span className="kpi-label">{card.label}</span>
              <span className="kpi-value">{card.value}</span>
              {card.change && <span className="kpi-change" style={{ color: card.color }}>↗ {card.change}</span>}
            </div>
            <div className="kpi-icon" style={{ background: card.color + '15', color: card.color }}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="service-image-card">
        <div className="chart-header">
          <h3>Ảnh dịch vụ</h3>
          <span className="chart-year">{services.length} dịch vụ</span>
        </div>
        <div className="dashboard-service-grid">
          {services.map((service) => (
            <div className="dashboard-service-item" key={service._id}>
              <img src={resolveAssetUrl(service.image)} alt={service.name} />
              <div>
                <strong>{service.name}</strong>
                <span>{formatPrice(service.price)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Repairs per Month</h3>
            <span className="chart-year">{monthlyData?.year}</span>
          </div>
          <div className="chart-body" style={{ height: '280px' }}>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Appointment Status</h3>
          </div>
          <div className="chart-body doughnut-wrap" style={{ height: '280px' }}>
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
