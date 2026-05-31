import { useState, useEffect } from 'react';
import { userAPI, appointmentAPI, resolveAssetUrl } from '../../../api';
import { generateInvoicePDF } from '../../../utils/pdfGenerator';
import '../Services/AdminServices.css';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Xem bằng chứng
  const [showEvidenceViewer, setShowEvidenceViewer] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  useEffect(() => { fetchCustomers(); }, [search]);

  const fetchCustomers = async () => {
    try {
      const params = { role: 'customer', limit: 50 };
      if (search) params.search = search;
      const res = await userAPI.getAll(params);
      setCustomers(res.data.users);
    } catch (err) { console.error(err); }
  };

  const fetchHistory = async (customerId) => {
    setLoadingHistory(true);
    try {
      const res = await appointmentAPI.getAll({ customerId, limit: 50 });
      setHistory(res.data.appointments);
    } catch (err) { console.error(err); }
    setLoadingHistory(false);
  };

  const handleViewHistory = (customer) => {
    setSelectedCustomer(customer);
    fetchHistory(customer._id);
  };

  const statusMap = {
    'pending': { label: 'Chờ xác nhận', color: '#f59e0b' },
    'confirmed': { label: 'Đã xác nhận', color: '#3b82f6' },
    'in-progress': { label: 'Đang sửa', color: '#22c55e' },
    'completed': { label: 'Hoàn thành', color: '#10b981' },
    'cancelled': { label: 'Đã hủy', color: '#ef4444' }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="page-title">Quản lý Khách hàng</h1>
        <input type="text" placeholder="Tìm kiếm..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '10px 16px', border: '1px solid #e0e4e8', borderRadius: '8px', fontSize: '0.9rem' }} />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Họ tên</th><th>Email</th><th>SĐT</th><th>Địa chỉ</th><th>Ngày tham gia</th><th>Trạng thái</th><th>Thao tác</th></tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c._id}>
                <td><strong>{c.name}</strong></td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>{c.address || '—'}</td>
                <td>{new Date(c.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <span className="status-badge" style={{ background: c.isActive ? '#dcfce7' : '#fef2f2', color: c.isActive ? '#22c55e' : '#ef4444' }}>
                    {c.isActive ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleViewHistory(c)} style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
                    Lịch sử
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Lịch sử sửa chữa - {selectedCustomer.name}</h2>
              <button onClick={() => setSelectedCustomer(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            
            {loadingHistory ? (
              <p>Đang tải dữ liệu...</p>
            ) : history.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr><th>Dịch vụ</th><th>Ngày hẹn</th><th>Trạng thái</th><th>Thanh toán</th><th>Bằng chứng</th></tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h._id}>
                      <td>{h.serviceId?.name}</td>
                      <td>{new Date(h.appointmentDate).toLocaleDateString('vi-VN')} {h.appointmentTime}</td>
                      <td>
                        <span className="status-badge" style={{ background: statusMap[h.status]?.color + '20', color: statusMap[h.status]?.color }}>
                          {statusMap[h.status]?.label}
                        </span>
                      </td>
                      <td>
                        <span className="status-badge" style={{ background: h.paymentStatus === 'paid' ? '#dcfce7' : '#fef2f2', color: h.paymentStatus === 'paid' ? '#16a34a' : '#ef4444' }}>
                          {h.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {(h.technicianNotes || (h.evidenceImages && h.evidenceImages.length > 0)) ? (
                            <button onClick={() => { setSelectedEvidence(h); setShowEvidenceViewer(true); }}
                              style={{ padding: '4px 8px', fontSize: '0.8rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #3b82f6', borderRadius: '4px', cursor: 'pointer' }}>
                              Xem báo cáo
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#9ca3af', padding: '4px 0' }}>Không có B/C</span>
                          )}
                          
                          {(h.paymentStatus === 'paid' || h.status === 'completed') && (
                            <button onClick={() => generateInvoicePDF(h)}
                              style={{ padding: '4px 8px', fontSize: '0.8rem', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>download</span> PDF
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#6b7280' }}>Khách hàng này chưa có lịch sử sửa chữa nào.</p>
            )}
          </div>
        </div>
      )}

      {/* Evidence Viewer Modal */}
      {showEvidenceViewer && selectedEvidence && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Báo cáo Kỹ thuật</h2>
              <button onClick={() => setShowEvidenceViewer(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px', color: '#4b5563' }}>Ghi chú</h3>
              <div style={{ background: '#f3f4f6', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                {selectedEvidence.technicianNotes || 'Không có ghi chú.'}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px', color: '#4b5563' }}>Hình ảnh ({selectedEvidence.evidenceImages?.length || 0})</h3>
              {selectedEvidence.evidenceImages && selectedEvidence.evidenceImages.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {selectedEvidence.evidenceImages.map((img, idx) => (
                    <a key={idx} href={resolveAssetUrl(img)} target="_blank" rel="noreferrer" style={{ display: 'block', position: 'relative', paddingTop: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                      <img src={resolveAssetUrl(img)} alt={`Evidence ${idx + 1}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    </a>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.9rem', color: '#6b7280', fontStyle: 'italic' }}>Không có hình ảnh.</p>
              )}
            </div>

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button onClick={() => setShowEvidenceViewer(false)} style={{ padding: '8px 16px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
