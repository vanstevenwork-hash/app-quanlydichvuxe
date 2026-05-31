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

  // States for Evidence Modal
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [evidenceImages, setEvidenceImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleOpenEvidenceModal = (id, existingNotes = '') => {
    setSelectedAppointmentId(id);
    setEvidenceNotes(existingNotes);
    setEvidenceImages([]);
    setImagePreviews([]);
    setShowEvidenceModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (evidenceImages.length + files.length > 5) {
      toast.warning('Tối đa 5 ảnh!');
      return;
    }
    
    const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024); // max 5MB
    if (validFiles.length < files.length) toast.warning('Có ảnh vượt quá 5MB bị loại bỏ');

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setEvidenceImages(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    setEvidenceImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitEvidence = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('technicianNotes', evidenceNotes);
      evidenceImages.forEach(img => formData.append('images', img));
      
      await appointmentAPI.uploadEvidence(selectedAppointmentId, formData);
      toast.success('Lưu bằng chứng thành công!');
      setShowEvidenceModal(false);
      fetchAppointments();
    } catch (err) {
      toast.error('Có lỗi xảy ra khi lưu bằng chứng');
    }
    setIsSubmitting(false);
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {a.status !== 'completed' && a.status !== 'cancelled' && (
                      <select value={a.status} onChange={(e) => handleStatusChange(a._id, e.target.value)}
                        style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e0e4e8', fontSize: '0.82rem', width: '100%' }}>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="in-progress">Đang sửa</option>
                        <option value="completed">Hoàn thành</option>
                      </select>
                    )}
                    <button onClick={() => handleOpenEvidenceModal(a._id, a.technicianNotes)}
                      style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #3b82f6', background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '500', width: '100%' }}>
                      📷 Bằng chứng
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {appointments.length === 0 && <tr><td colSpan={7} className="empty-state">Chưa có lịch hẹn nào</td></tr>}
          </tbody>
        </table>
      </div>

      {showEvidenceModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>Cập nhật bằng chứng sửa chữa</h2>
            <form onSubmit={handleSubmitEvidence}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>Ghi chú kỹ thuật (Chẩn đoán, lỗi phát hiện, ...)</label>
                <textarea value={evidenceNotes} onChange={(e) => setEvidenceNotes(e.target.value)} rows={4}
                  style={{ width: '100%', padding: '10px', border: '1px solid #e0e4e8', borderRadius: '8px', fontSize: '0.875rem', outline: 'none' }} placeholder="Nhập ghi chú chi tiết..."></textarea>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>Tải lên hình ảnh (Tối đa 5 ảnh mới)</label>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ fontSize: '0.875rem', marginBottom: '12px' }} />
                
                {imagePreviews.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} style={{ position: 'relative', paddingTop: '100%' }}>
                        <img src={src} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} alt="" />
                        <button type="button" onClick={() => handleRemoveImage(idx)} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', cursor: 'pointer' }}>&times;</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowEvidenceModal(false)} style={{ padding: '8px 16px', border: '1px solid #e0e4e8', background: 'transparent', borderRadius: '8px', cursor: 'pointer' }}>Hủy</button>
                <button type="submit" disabled={isSubmitting} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                  {isSubmitting ? 'Đang lưu...' : 'Lưu bằng chứng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianSchedule;
