import { useState, useEffect } from 'react';
import { inventoryAPI } from '../../../api';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import '../Services/AdminServices.css'; // Tái sử dụng CSS của Services
import './AdminInventory.css'; // CSS riêng cho Inventory (nếu cần)

const CATEGORIES = ['Dầu nhớt', 'Lốp xe', 'Phanh', 'Bình ắc quy', 'Lọc gió/Lọc dầu', 'Phụ tùng máy', 'Khác'];

const AdminInventory = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({
    name: '', sku: '', category: 'Dầu nhớt', quantity: 0, price: 0, importPrice: 0, unit: 'Cái', supplier: ''
  });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const res = await inventoryAPI.getAll({ limit: 100 });
      setItems(res.data.data);
    } catch (err) { console.error(err); }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setForm(item);
      setIsEdit(true);
    } else {
      setForm({ name: '', sku: '', category: 'Dầu nhớt', quantity: 0, price: 0, importPrice: 0, unit: 'Cái', supplier: '' });
      setIsEdit(false);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await inventoryAPI.update(form._id, form);
        toast.success('Cập nhật phụ tùng thành công');
      } else {
        await inventoryAPI.create(form);
        toast.success('Thêm phụ tùng thành công');
      }
      setShowModal(false);
      fetchItems();
    } catch (err) { toast.error(err.response?.data?.message || 'Có lỗi xảy ra'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phụ tùng này?')) return;
    try {
      await inventoryAPI.delete(id);
      toast.success('Xóa phụ tùng thành công');
      fetchItems();
    } catch (err) { toast.error('Không thể xóa'); }
  };

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="page-title">📦 Quản lý Kho phụ tùng</h1>
        <button className="btn-add" onClick={() => handleOpenModal()}><FaPlus /> Thêm phụ tùng</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã SKU</th>
              <th>Tên phụ tùng</th>
              <th>Danh mục</th>
              <th>Tồn kho</th>
              <th>ĐVT</th>
              <th>Giá nhập</th>
              <th>Giá bán</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i._id} className={i.quantity <= 5 ? 'row-warning' : ''}>
                <td><strong>{i.sku}</strong></td>
                <td>{i.name}</td>
                <td><span className="cat-badge">{i.category}</span></td>
                <td>
                  <span className={`status-badge ${i.quantity <= 5 ? 'low-stock' : 'in-stock'}`} 
                        style={{ background: i.quantity <= 5 ? '#fef2f2' : '#dcfce7', color: i.quantity <= 5 ? '#ef4444' : '#22c55e' }}>
                    {i.quantity}
                  </span>
                </td>
                <td>{i.unit}</td>
                <td>{formatPrice(i.importPrice)}</td>
                <td>{formatPrice(i.price)}</td>
                <td>
                  <button className="btn-icon edit" onClick={() => handleOpenModal(i)}><FaEdit /></button>
                  <button className="btn-icon delete" onClick={() => handleDelete(i._id)}><FaTrash /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan="8" style={{textAlign: 'center', padding: '20px'}}>Chưa có dữ liệu phụ tùng trong kho.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{isEdit ? 'Sửa Phụ tùng' : 'Thêm Phụ tùng mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-row">
                <div className="modal-field"><label>Mã SKU</label><input type="text" value={form.sku} onChange={(e) => setForm({...form, sku: e.target.value.toUpperCase()})} required placeholder="VD: NHOT-C-10W40" /></div>
                <div className="modal-field"><label>Danh mục</label>
                  <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-field"><label>Tên phụ tùng</label><input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
              <div className="modal-row">
                <div className="modal-field"><label>Số lượng tồn</label><input type="number" min="0" value={form.quantity} onChange={(e) => setForm({...form, quantity: e.target.value})} required /></div>
                <div className="modal-field"><label>Đơn vị tính</label><input type="text" value={form.unit} onChange={(e) => setForm({...form, unit: e.target.value})} required placeholder="Lít, Cái, Cặp..." /></div>
              </div>
              <div className="modal-row">
                <div className="modal-field"><label>Giá nhập (VNĐ)</label><input type="number" min="0" value={form.importPrice} onChange={(e) => setForm({...form, importPrice: e.target.value})} required /></div>
                <div className="modal-field"><label>Giá bán (VNĐ)</label><input type="number" min="0" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} required /></div>
              </div>
              <div className="modal-field"><label>Nhà cung cấp</label><input type="text" value={form.supplier} onChange={(e) => setForm({...form, supplier: e.target.value})} /></div>
              
              <div className="modal-actions">
                <button type="button" className="btn-cancel-modal" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-save">{isEdit ? 'Cập nhật' : 'Thêm vào kho'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
