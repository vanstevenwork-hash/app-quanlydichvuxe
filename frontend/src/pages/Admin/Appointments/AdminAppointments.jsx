import { useState, useEffect } from 'react';
import { appointmentAPI, userAPI } from '../../../api';
import { toast } from 'react-toastify';
import '../Services/AdminServices.css';

const statusMap = {
  'pending': { label: 'Chờ xác nhận', color: '#f59e0b' },
  'confirmed': { label: 'Đã xác nhận', color: '#3b82f6' },
  'in-progress': { label: 'Đang sửa', color: '#22c55e' },
  'completed': { label: 'Hoàn thành', color: '#10b981' },
  'cancelled': { label: 'Đã hủy', color: '#ef4444' }
};

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filter) params.status = filter;
      const [appRes, techRes] = await Promise.all([
        appointmentAPI.getAll(params),
        userAPI.getAll({ role: 'technician', limit: 50 })
      ]);
      setAppointments(appRes.data.appointments);
      setTechnicians(techRes.data.users);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await appointmentAPI.updateStatus(id, status);
      toast.success('Cập nhật trạng thái thành công');
      fetchData();
    } catch (err) { toast.error('Lỗi cập nhật'); }
  };

  const handleAssign = async (id, technicianId) => {
    try {
      await appointmentAPI.assign(id, technicianId);
      toast.success('Phân công thành công');
      fetchData();
    } catch (err) { toast.error('Lỗi phân công'); }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="page-title">Quản lý Lịch hẹn</h1>
        <div style={{ display: 'flex', gap: '6px' }}>
          <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Tất cả</option>
            {Object.entries(statusMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>ID</th><th>Khách hàng</th><th>Dịch vụ</th><th>Lịch đặt</th><th>Thời gian thực tế</th><th>Kỹ thuật viên</th><th>Trạng thái</th><th>Thao tác</th></tr>
          </thead>
          <tbody>
            {appointments.map(a => (
              <tr key={a._id}>
                <td className="id-cell">#{a._id.slice(-6).toUpperCase()}</td>
                <td>
                  <strong>{a.customerId?.name}</strong>
                  <br/><span style={{fontSize: '0.8rem', color: '#6b7a8d'}}>{a.customerId?.phone}</span>
                </td>
                <td>{a.serviceId?.name}</td>
                <td>
                  {new Date(a.appointmentDate).toLocaleDateString('vi-VN')}<br/>
                  <span style={{color: '#6b7a8d'}}>{a.appointmentTime}</span>
                </td>
                <td>
                  <div style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    {a.startedAt ? (
                      <div style={{ color: '#d97706', marginBottom: '2px' }}>
                        ▶ BĐ: {new Date(a.startedAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    ) : <div style={{ color: '#9ca3af' }}>Chưa làm</div>}
                    {a.completedAt && (
                      <div style={{ color: '#059669' }}>
                        ✓ Xong: {new Date(a.completedAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <select className="assign-select" value={a.technicianId?._id || ''}
                    onChange={(e) => handleAssign(a._id, e.target.value)}>
                    <option value="">-- Chọn KTV --</option>
                    {technicians.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </select>
                </td>
                <td>
                  <span className="status-badge" style={{ background: statusMap[a.status]?.color + '20', color: statusMap[a.status]?.color }}>
                    {statusMap[a.status]?.label}
                  </span>
                </td>
                <td>
                  <select className="status-select" value={a.status}
                    onChange={(e) => handleStatusChange(a._id, e.target.value)}>
                    {Object.entries(statusMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAppointments;
