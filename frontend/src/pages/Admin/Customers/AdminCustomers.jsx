import { useState, useEffect } from 'react';
import { userAPI } from '../../../api';
import '../Services/AdminServices.css';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchCustomers(); }, [search]);

  const fetchCustomers = async () => {
    try {
      const params = { role: 'customer', limit: 50 };
      if (search) params.search = search;
      const res = await userAPI.getAll(params);
      setCustomers(res.data.users);
    } catch (err) { console.error(err); }
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
            <tr><th>Họ tên</th><th>Email</th><th>SĐT</th><th>Địa chỉ</th><th>Ngày tham gia</th><th>Trạng thái</th></tr>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCustomers;
