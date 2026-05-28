import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI, paymentAPI, resolveAssetUrl } from '../../api';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const statusMap = {
  'pending': { label: 'Chờ xác nhận', icon: 'schedule', cls: 'bg-secondary-container text-on-secondary-container' },
  'confirmed': { label: 'Đã xác nhận', icon: 'check_circle', cls: 'bg-primary-container text-on-primary' },
  'in-progress': { label: 'Đang sửa chữa', icon: 'build', cls: 'bg-primary-fixed text-on-primary-fixed' },
  'completed': { label: 'Hoàn thành', icon: 'done_all', cls: 'bg-surface-container-highest text-on-surface' },
  'cancelled': { label: 'Đã hủy', icon: 'close', cls: 'bg-error-container text-on-error-container' }
};

const Profile = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAppointments(); }, [filter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.status = filter;
      const res = await appointmentAPI.getAll(params);
      setAppointments(res.data.appointments);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleCancel = async (id) => {
    if (!confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
    try {
      await appointmentAPI.cancel(id);
      toast.success('Đã hủy lịch hẹn');
      fetchAppointments();
    } catch (err) { toast.error('Không thể hủy'); }
  };

  const handlePayment = async (id) => {
    try {
      const res = await paymentAPI.createUrl(id);
      window.location.href = res.data.paymentUrl;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể khởi tạo thanh toán');
    }
  };

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + ' ₫';

  const filterBtns = [
    { key: '', label: 'Tất cả' },
    { key: 'in-progress', label: 'Đang xử lý' },
    { key: 'completed', label: 'Hoàn thành' }
  ];

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">
      
      {/* Profile Card & Overview */}
      <section className="mb-stack-lg">
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(15,23,42,0.05)] p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 border border-outline-variant/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-fixed rounded-full opacity-20 -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            <div className="w-24 h-24 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-3xl font-bold shadow-sm border border-outline-variant">
              {user?.name?.charAt(0)}
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="font-headline-md text-headline-md text-primary mb-2">{user?.name}</h1>
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-on-surface-variant font-body-sm text-body-sm">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">phone_iphone</span> {user?.phone || '090 123 4567'}
                </span>
                <span className="hidden md:inline text-outline-variant">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">mail</span> {user?.email}
                </span>
              </div>
              
              <div className="mt-4 flex gap-4 justify-center md:justify-start">
                <div className="bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/30 text-center">
                  <div className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wide">Tổng dịch vụ</div>
                  <div className="font-headline-sm text-headline-sm text-primary">{appointments.length}</div>
                </div>
                <div className="bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/30 text-center">
                  <div className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wide">Đã hoàn thành</div>
                  <div className="font-headline-sm text-headline-sm text-secondary flex items-center gap-1 justify-center">
                    <span className="material-symbols-outlined text-[20px] fill text-secondary">star</span>
                    {appointments.filter(a => a.status === 'completed').length}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0 w-full md:w-auto relative z-10 flex flex-col gap-2">
            <Link to="/booking"
              className="booking-action-btn w-full md:w-auto font-label-md text-label-md px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95">
              <span className="material-symbols-outlined">calendar_add_on</span> Đặt lịch mới
            </Link>
          </div>
        </div>
      </section>

      {/* Header Section */}
      <div className="mb-stack-lg flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-2">Lịch sử sửa chữa</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Theo dõi tiến độ và lịch sử bảo dưỡng phương tiện của bạn.</p>
        </div>
        
        {/* Quick Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {filterBtns.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-label-md text-label-md transition-all ${
                filter === f.key
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-on-surface-variant font-body-md">Đang tải lịch sử sửa chữa...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          {appointments.map(a => {
            const st = statusMap[a.status] || statusMap.pending;
            const vehicleText = `${a.vehicleInfo?.make || ''} ${a.vehicleInfo?.model || ''} ${a.vehicleInfo?.year || ''}`.trim() || 'Phương tiện chưa rõ';
            
            return (
              <div key={a._id} className="bg-surface-container-lowest rounded-xl p-gutter border border-outline-variant hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-between"
                style={{ boxShadow: '0px 4px 20px rgba(15, 23, 42, 0.05)' }}>
                
                <div>
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <div className="flex items-center gap-3">
                      {a.vehicleInfo?.imageUrl ? (
                        <div className="w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden border border-outline-variant/30">
                          <img src={resolveAssetUrl(a.vehicleInfo.imageUrl)} alt="Car" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1">{vehicleText}</h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Biển số: {a.vehicleInfo?.licensePlate || 'Chưa cung cấp'}</p>
                      </div>
                    </div>
                    
                    {/* Dynamic Status Badge */}
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-label-md text-label-md flex-shrink-0 ${st.cls}`}>
                      <span className="material-symbols-outlined text-[16px]">{st.icon}</span>
                      {st.label}
                    </span>
                  </div>

                  <div className="border-t border-surface-variant py-4 space-y-2">
                    <div className="flex justify-between font-body-sm text-body-sm">
                      <span className="text-on-surface-variant">Mã phiếu:</span>
                      <span className="font-semibold text-on-surface uppercase">#{a._id.slice(-8)}</span>
                    </div>
                    <div className="flex justify-between font-body-sm text-body-sm">
                      <span className="text-on-surface-variant">Thời gian đặt:</span>
                      <span className="text-on-surface">
                        {new Date(a.appointmentDate).toLocaleDateString('vi-VN')} - {a.appointmentTime}
                      </span>
                    </div>
                    <div className="flex justify-between font-body-sm text-body-sm">
                      <span className="text-on-surface-variant">Dịch vụ:</span>
                      <span className="text-on-surface text-right font-medium">{a.serviceId?.name || 'Không có tên dịch vụ'}</span>
                    </div>
                    {a.notes && (
                      <div className="flex justify-between font-body-sm text-body-sm">
                        <span className="text-on-surface-variant">Ghi chú:</span>
                        <span className="text-on-surface-variant text-right italic max-w-[70%] line-clamp-2">{a.notes}</span>
                      </div>
                    )}
                    {a.technicianId && (
                      <div className="flex justify-between font-body-sm text-body-sm">
                        <span className="text-on-surface-variant font-medium text-secondary">Kỹ thuật viên:</span>
                        <span className="text-on-surface font-semibold">{a.technicianId.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-surface-variant pt-4 flex items-center justify-between mt-auto">
                  <div className="font-headline-sm text-headline-sm text-primary flex flex-col">
                    <span>{a.serviceId?.price ? formatPrice(a.serviceId.price) : '0 ₫'}</span>
                    {a.paymentStatus === 'paid' && (
                      <span className="text-xs font-normal text-green-600 mt-0.5">Thanh toán ngày: {new Date(a.paymentDate).toLocaleDateString('vi-VN')}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {['pending', 'confirmed'].includes(a.status) && (
                      <button onClick={() => handleCancel(a._id)}
                        className="font-label-md text-label-md text-error border border-error px-4 py-2 rounded-lg hover:bg-error-container transition-colors active:scale-95">
                        Hủy lịch
                      </button>
                    )}
                    {(a.status === 'completed' || a.status === 'confirmed') && (!a.paymentStatus || a.paymentStatus === 'unpaid' || a.paymentStatus === 'failed') && (
                      <button onClick={() => handlePayment(a._id)}
                        className="font-label-md text-label-md bg-secondary text-on-secondary px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors active:scale-95 flex items-center gap-1 shadow-md">
                        <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span> Thanh toán ngay
                      </button>
                    )}
                    {a.paymentStatus === 'paid' && (
                      <span className="font-label-md text-label-md text-green-600 bg-green-50 border border-green-200 px-4 py-2 rounded-lg flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">verified</span> Đã thanh toán
                      </span>
                    )}
                  </div>
                </div>
                
              </div>
            );
          })}
          
          {appointments.length === 0 && (
            <div className="col-span-1 lg:col-span-2 bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl py-16 text-center text-on-surface-variant font-body-md">
              Chưa có lịch sửa chữa hoặc bảo dưỡng nào
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
