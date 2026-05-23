import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaCar, FaTachometerAlt, FaCalendarAlt, FaTools,
  FaUsers, FaUserCog, FaChartBar, FaSignOutAlt, FaBars, FaBox
} from 'react-icons/fa';
import { useState } from 'react';
import './AdminLayout.css';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/admin', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/admin/appointments', icon: <FaCalendarAlt />, label: 'Lịch hẹn' },
    { path: '/admin/services', icon: <FaTools />, label: 'Dịch vụ' },
    { path: '/admin/customers', icon: <FaUsers />, label: 'Khách hàng' },
    { path: '/admin/technicians', icon: <FaUserCog />, label: 'Kỹ thuật viên' },
    { path: '/admin/inventory', icon: <FaBox />, label: 'Kho phụ tùng' },
    { path: '/admin/reports', icon: <FaChartBar />, label: 'Báo cáo' },
  ];

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <FaCar className="sidebar-logo-icon" />
          {sidebarOpen && (
            <div>
              <span className="sidebar-brand">AutoFix</span>
              <p className="sidebar-subtitle">Management Portal</p>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-link logout">
            <FaSignOutAlt />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="admin-content">
        <header className="admin-header">
          <button className="toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FaBars />
          </button>
          <div className="header-right">
            <span className="admin-name">{user?.name}</span>
            <div className="admin-avatar">{user?.name?.charAt(0)}</div>
          </div>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
