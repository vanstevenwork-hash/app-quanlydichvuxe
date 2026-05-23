import { useState, useEffect } from 'react';
import { appointmentAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import '../Admin/Services/AdminServices.css';

const statusMap = {
  'pending': { label: 'Chờ xác nhận', color: '#f59e0b' },
  'confirmed': { label: 'Đã xác nhận', color: '#3b82f6' },
  'in-progress': { label: 'Đang sửa', color: '#22c55e' },
  'completed': { label: 'Hoàn thành', color: '#10b981' },
  'cancelled': { label: 'Đã hủy', color: '#ef4444' }
};

const TechnicianSchedule = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => { fetchAppointments(); }, [filter]);

  const fetchAppointments = async () => {
    try {
      const params = { limit: 50 };
      if (filter) params.status = filter;
      const res = await appointmentAPI.getAll(params);
      setAppointments(res.data.appointments);
    } catch (err) { console.error(err); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await appointmentAPI.updateStatus(id, status);
      toast.success('Cập nhật thành công');
      fetchAppointments();
    } catch (err) { toast.error('Lỗi cập nhật'); }
  };

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      <div className="admin-page-header">
        <h1 className="page-title">Lịch làm việc - {user?.name}</h1>
        <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '10px 16px', border: '1px solid #e0e4e8', borderRadius: '8px' }}>
          <option value="">Tất cả</option>
          {Object.entries(statusMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Khách hàng</th><th>Dịch vụ</th><th>Lịch đặt</th><th>Tiến độ</th><th>Xe</th><th>Ghi chú</th><th>Trạng thái</th><th>Cập nhật</th></tr>
          </thead>
          <tbody>
            {appointments.map(a => (
              <tr key={a._id}>
                <td><strong>{a.customerId?.name}</strong><br/><span style={{fontSize:'0.8rem',color:'#6b7a8d'}}>{a.customerId?.phone}</span></td>
                <td>{a.serviceId?.name}</td>
                <td>{new Date(a.appointmentDate).toLocaleDateString('vi-VN')}<br/><span style={{color:'#6b7a8d'}}>{a.appointmentTime}</span></td>
                <td>
                  <div style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
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
                <td>{a.vehicleInfo?.make} {a.vehicleInfo?.model} {a.vehicleInfo?.year}<br/><span style={{color:'#6b7a8d'}}>{a.vehicleInfo?.licensePlate}</span></td>
                <td style={{maxWidth:'200px',fontSize:'0.85rem'}}>{a.notes || '—'}</td>
                <td><span className="status-badge" style={{ background: statusMap[a.status]?.color + '20', color: statusMap[a.status]?.color }}>{statusMap[a.status]?.label}</span></td>
                <td>
                  {a.status !== 'completed' && a.status !== 'cancelled' && (
                    <select value={a.status} onChange={(e) => handleStatusChange(a._id, e.target.value)}
                      style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e0e4e8', fontSize: '0.82rem' }}>
                      <option value="confirmed">Đã xác nhận</option>
                      <option value="in-progress">Đang sửa</option>
                      <option value="completed">Hoàn thành</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
            {appointments.length === 0 && <tr><td colSpan={7} className="empty-state">Chưa có lịch hẹn nào</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TechnicianSchedule;
