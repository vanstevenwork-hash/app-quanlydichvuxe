import { useState, useEffect } from 'react';
import { resolveAssetUrl, serviceAPI } from '../../../api';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import './AdminServices.css';

const categoryMap = { 'bao-duong': 'Bảo dưỡng', 'sua-chua': 'Sửa chữa', 'kiem-tra': 'Kiểm tra', 'thay-the': 'Thay thế' };

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'bao-duong', description: '', price: '', duration: '', image: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await serviceAPI.getAll({ limit: 100 });
      setServices(res.data.services);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (imageFile) formData.append('imageFile', imageFile);

      if (editingService) {
        await serviceAPI.update(editingService._id, formData);
        toast.success('Cập nhật dịch vụ thành công');
      } else {
        await serviceAPI.create(formData);
        toast.success('Tạo dịch vụ thành công');
      }
      setShowModal(false);
      setEditingService(null);
      setForm({ name: '', category: 'bao-duong', description: '', price: '', duration: '', image: '' });
      setImageFile(null);
      setImagePreview('');
      fetchServices();
    } catch (err) { toast.error(err.response?.data?.message || 'Có lỗi xảy ra'); }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setForm({ name: service.name, category: service.category, description: service.description, price: service.price, duration: service.duration, image: service.image || '' });
    setImageFile(null);
    setImagePreview(resolveAssetUrl(service.image));
    setShowModal(true);
  };

  const handleOpenCreate = () => {
    setEditingService(null);
    setForm({ name: '', category: 'bao-duong', description: '', price: '', duration: '', image: '' });
    setImageFile(null);
    setImagePreview('');
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa dịch vụ này?')) return;
    try {
      await serviceAPI.delete(id);
      toast.success('Xóa dịch vụ thành công');
      fetchServices();
    } catch (err) { toast.error('Không thể xóa dịch vụ'); }
  };

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="page-title">Quản lý Dịch vụ</h1>
        <button className="btn-add" onClick={handleOpenCreate}>
          <FaPlus /> Thêm dịch vụ
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Ảnh</th><th>Tên dịch vụ</th><th>Danh mục</th><th>Giá</th><th>Thời gian</th><th>Thao tác</th></tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s._id}>
                <td>
                  <img className="service-thumb" src={resolveAssetUrl(s.image)} alt={s.name} />
                </td>
                <td><strong>{s.name}</strong></td>
                <td><span className="cat-badge">{categoryMap[s.category]}</span></td>
                <td className="price-col">{formatPrice(s.price)}</td>
                <td>{s.duration} phút</td>
                <td>
                  <div className="action-btns">
                    <button className="btn-icon edit" onClick={() => handleEdit(s)}><FaEdit /></button>
                    <button className="btn-icon delete" onClick={() => handleDelete(s._id)}><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingService ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-field">
                <label>Tên dịch vụ</label>
                <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="modal-field">
                <label>Danh mục</label>
                <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                  {Object.entries(categoryMap).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label>Giá (VNĐ)</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} required min={0} />
                </div>
                <div className="modal-field">
                  <label>Thời gian (phút)</label>
                  <input type="number" value={form.duration} onChange={(e) => setForm({...form, duration: e.target.value})} required min={15} />
                </div>
              </div>
              <div className="modal-field">
                <label>Mô tả</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} required />
              </div>
              <div className="modal-field">
                <label>Ảnh dịch vụ</label>
                <label className="service-upload-box">
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                  <span>{imageFile ? imageFile.name : 'Chọn ảnh từ máy'}</span>
                </label>
                {imagePreview && <img className="service-preview" src={imagePreview} alt="Ảnh dịch vụ" />}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel-modal" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-save">{editingService ? 'Cập nhật' : 'Tạo mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
