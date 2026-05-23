import { useState, useEffect, useMemo, useCallback } from 'react';
import { appointmentAPI, userAPI } from '../../../api';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaPlus, FaTimes } from 'react-icons/fa';
import '../Services/AdminServices.css';

const statusMap = {
  'pending': { label: 'Chờ xác nhận', color: '#f59e0b' },
  'confirmed': { label: 'Đã xác nhận', color: '#3b82f6' },
  'in-progress': { label: 'Đang sửa', color: '#22c55e' },
  'completed': { label: 'Hoàn thành', color: '#10b981' },
  'cancelled': { label: 'Đã hủy', color: '#ef4444' }
};

const weekdayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatCurrency = (value = 0) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
}).format(value);

const AdminTechnicians = () => {
  const [technicians, setTechnicians] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDateKey, setSelectedDateKey] = useState(formatDateKey(new Date()));
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '123456', phone: '', specialization: '' });

  const fetchTechnicians = useCallback(async () => {
    try {
      const [techRes, appRes] = await Promise.all([
        userAPI.getAll({ role: 'technician', limit: 50 }),
        appointmentAPI.getAll({ limit: 500 })
      ]);
      setTechnicians(techRes.data.users);
      setAppointments(appRes.data.appointments);
      setSelectedTechnicianId((current) => current || techRes.data.users[0]?._id || '');
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchTechnicians);
  }, [fetchTechnicians]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userAPI.createTechnician(form);
      toast.success('Tạo kỹ thuật viên thành công');
      setShowModal(false);
      setForm({ name: '', email: '', password: '123456', phone: '', specialization: '' });
      fetchTechnicians();
    } catch (err) { toast.error(err.response?.data?.message || 'Có lỗi xảy ra'); }
  };

  const toggleActive = async (id, isActive) => {
    try {
      await userAPI.update(id, { isActive: !isActive });
      toast.success(isActive ? 'Đã khóa tài khoản' : 'Đã kích hoạt tài khoản');
      fetchTechnicians();
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra');
    }
  };

  const selectedTechnician = technicians.find((t) => t._id === selectedTechnicianId);

  const technicianAppointments = useMemo(() => (
    appointments.filter((appointment) => {
      if (!appointment.technicianId?._id) return false;
      if (!selectedTechnicianId) return true;
      return appointment.technicianId._id === selectedTechnicianId;
    })
  ), [appointments, selectedTechnicianId]);

  const appointmentsByDate = useMemo(() => {
    return technicianAppointments.reduce((groups, appointment) => {
      const key = formatDateKey(new Date(appointment.appointmentDate));
      groups[key] = groups[key] || [];
      groups[key].push(appointment);
      groups[key].sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
      return groups;
    }, {});
  }, [technicianAppointments]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const leadingEmptyDays = (firstDay.getDay() + 6) % 7;
    const days = Array.from({ length: leadingEmptyDays }, () => null);

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      days.push(new Date(year, month, day));
    }

    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [currentMonth]);

  const selectedDateAppointments = appointmentsByDate[selectedDateKey] || [];

  const calendarStats = useMemo(() => ({
    total: technicianAppointments.length,
    inProgress: technicianAppointments.filter((a) => a.status === 'in-progress').length,
    completed: technicianAppointments.filter((a) => a.status === 'completed').length,
    today: appointmentsByDate[formatDateKey(new Date())]?.length || 0
  }), [appointmentsByDate, technicianAppointments]);

  const changeMonth = (offset) => {
    setCurrentMonth((month) => new Date(month.getFullYear(), month.getMonth() + offset, 1));
    setSelectedAppointment(null);
  };

  const handleSelectDate = (date) => {
    setSelectedDateKey(formatDateKey(date));
    setSelectedAppointment(null);
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="page-title">Quản lý Kỹ thuật viên</h1>
        <button className="btn-add" onClick={() => setShowModal(true)}><FaPlus /> Thêm KTV</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Họ tên</th><th>Email</th><th>SĐT</th><th>Chuyên môn</th><th>Trạng thái</th><th>Thao tác</th></tr>
          </thead>
          <tbody>
            {technicians.map(t => (
              <tr key={t._id}>
                <td><strong>{t.name}</strong></td>
                <td>{t.email}</td>
                <td>{t.phone}</td>
                <td><span className="cat-badge">{t.specialization || 'Chung'}</span></td>
                <td>
                  <span className="status-badge" style={{ background: t.isActive ? '#dcfce7' : '#fef2f2', color: t.isActive ? '#22c55e' : '#ef4444' }}>
                    {t.isActive ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                </td>
                <td>
                  <button className={`btn-icon ${t.isActive ? 'delete' : 'edit'}`} onClick={() => toggleActive(t._id, t.isActive)}>
                    {t.isActive ? '🔒' : '🔓'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="technician-calendar-section">
        <div className="calendar-toolbar">
          <div>
            <h2><FaCalendarAlt /> Lịch công việc kỹ thuật viên</h2>
            <p>Xem nhanh khối lượng việc theo ngày và chi tiết từng lịch hẹn đã phân công.</p>
          </div>
          <select
            className="filter-select"
            value={selectedTechnicianId}
            onChange={(e) => {
              setSelectedTechnicianId(e.target.value);
              setSelectedAppointment(null);
            }}
          >
            <option value="">Tất cả kỹ thuật viên</option>
            {technicians.map((technician) => (
              <option key={technician._id} value={technician._id}>{technician.name}</option>
            ))}
          </select>
        </div>

        <div className="calendar-summary-grid">
          <div className="calendar-summary-card">
            <span>Tổng công việc</span>
            <strong>{calendarStats.total}</strong>
          </div>
          <div className="calendar-summary-card">
            <span>Hôm nay</span>
            <strong>{calendarStats.today}</strong>
          </div>
          <div className="calendar-summary-card">
            <span>Đang sửa</span>
            <strong>{calendarStats.inProgress}</strong>
          </div>
          <div className="calendar-summary-card">
            <span>Hoàn thành</span>
            <strong>{calendarStats.completed}</strong>
          </div>
        </div>

        <div className="technician-calendar-layout">
          <div className="calendar-board">
            <div className="calendar-monthbar">
              <button type="button" className="calendar-nav-btn" onClick={() => changeMonth(-1)} aria-label="Tháng trước">
                <FaChevronLeft />
              </button>
              <h3>
                {currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                {selectedTechnician && <span>{selectedTechnician.name}</span>}
              </h3>
              <button type="button" className="calendar-nav-btn" onClick={() => changeMonth(1)} aria-label="Tháng sau">
                <FaChevronRight />
              </button>
            </div>

            <div className="calendar-weekdays">
              {weekdayLabels.map((label) => <span key={label}>{label}</span>)}
            </div>

            <div className="calendar-grid">
              {calendarDays.map((date, index) => {
                if (!date) return <div key={`empty-${index}`} className="calendar-day empty" />;

                const dateKey = formatDateKey(date);
                const dayAppointments = appointmentsByDate[dateKey] || [];
                const isSelected = selectedDateKey === dateKey;
                const isToday = formatDateKey(new Date()) === dateKey;

                return (
                  <button
                    type="button"
                    key={dateKey}
                    className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                    onClick={() => handleSelectDate(date)}
                  >
                    <span className="calendar-day-number">{date.getDate()}</span>
                    <div className="calendar-events">
                      {dayAppointments.slice(0, 3).map((appointment) => (
                        <span
                          key={appointment._id}
                          className="calendar-event-pill"
                          style={{ borderLeftColor: statusMap[appointment.status]?.color }}
                        >
                          {appointment.appointmentTime} {appointment.serviceId?.name || 'Dịch vụ'}
                        </span>
                      ))}
                      {dayAppointments.length > 3 && (
                        <span className="calendar-more">+{dayAppointments.length - 3} việc</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="calendar-detail-panel">
            <div className="detail-panel-header">
              <div>
                <span>Chi tiết ngày</span>
                <h3>{new Date(`${selectedDateKey}T00:00:00`).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</h3>
              </div>
              <strong>{selectedDateAppointments.length} việc</strong>
            </div>

            {selectedDateAppointments.length === 0 ? (
              <div className="calendar-empty-state">Không có công việc được phân công trong ngày này.</div>
            ) : (
              <div className="appointment-list">
                {selectedDateAppointments.map((appointment) => (
                  <button
                    type="button"
                    key={appointment._id}
                    className={`appointment-detail-card ${selectedAppointment?._id === appointment._id ? 'active' : ''}`}
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    <div className="appointment-detail-top">
                      <strong>{appointment.appointmentTime}</strong>
                      <span
                        className="status-badge"
                        style={{
                          background: `${statusMap[appointment.status]?.color}20`,
                          color: statusMap[appointment.status]?.color
                        }}
                      >
                        {statusMap[appointment.status]?.label}
                      </span>
                    </div>
                    <p>{appointment.serviceId?.name || 'Chưa có dịch vụ'}</p>
                    <span>{appointment.customerId?.name || 'Khách hàng'} · {appointment.vehicleInfo?.licensePlate || 'Chưa có biển số'}</span>
                  </button>
                ))}
              </div>
            )}
          </aside>
        </div>
      </section>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Thêm Kỹ thuật viên</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-field"><label>Họ tên</label><input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
              <div className="modal-field"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required /></div>
              <div className="modal-row">
                <div className="modal-field"><label>Mật khẩu</label><input type="text" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required /></div>
                <div className="modal-field"><label>SĐT</label><input type="tel" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} required /></div>
              </div>
              <div className="modal-field"><label>Chuyên môn</label><input type="text" placeholder="VD: Động cơ, Điện, Gầm..." value={form.specialization} onChange={(e) => setForm({...form, specialization: e.target.value})} /></div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel-modal" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-save">Tạo mới</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedAppointment && (
        <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div className="modal-content appointment-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close-btn" onClick={() => setSelectedAppointment(null)} aria-label="Đóng">
              <FaTimes />
            </button>
            <h2>Chi tiết công việc</h2>
            <div className="appointment-modal-grid">
              <div>
                <span>Khách hàng</span>
                <strong>{selectedAppointment.customerId?.name || 'Chưa có thông tin'}</strong>
                <p>{selectedAppointment.customerId?.phone || 'Chưa có SĐT'}</p>
              </div>
              <div>
                <span>Kỹ thuật viên</span>
                <strong>{selectedAppointment.technicianId?.name || 'Chưa phân công'}</strong>
                <p>{selectedAppointment.technicianId?.specialization || 'Chuyên môn chung'}</p>
              </div>
              <div>
                <span>Dịch vụ</span>
                <strong>{selectedAppointment.serviceId?.name || 'Chưa có dịch vụ'}</strong>
                <p>{formatCurrency(selectedAppointment.totalPrice)}</p>
              </div>
              <div>
                <span>Lịch hẹn</span>
                <strong>{new Date(selectedAppointment.appointmentDate).toLocaleDateString('vi-VN')}</strong>
                <p>{selectedAppointment.appointmentTime}</p>
              </div>
              <div>
                <span>Xe</span>
                <strong>{selectedAppointment.vehicleInfo?.make} {selectedAppointment.vehicleInfo?.model} {selectedAppointment.vehicleInfo?.year}</strong>
                <p>{selectedAppointment.vehicleInfo?.licensePlate || 'Chưa có biển số'}</p>
              </div>
              <div>
                <span>Trạng thái</span>
                <strong style={{ color: statusMap[selectedAppointment.status]?.color }}>
                  {statusMap[selectedAppointment.status]?.label}
                </strong>
                <p>
                  {selectedAppointment.startedAt
                    ? `Bắt đầu: ${new Date(selectedAppointment.startedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                    : 'Chưa bắt đầu'}
                </p>
              </div>
            </div>
            <div className="appointment-notes">
              <span>Ghi chú tình trạng xe</span>
              <p>{selectedAppointment.notes || 'Không có ghi chú.'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTechnicians;
