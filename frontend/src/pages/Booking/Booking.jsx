import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { serviceAPI, appointmentAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const timeSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'];

const Booking = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [form, setForm] = useState({
    serviceId: searchParams.get('service') || '',
    appointmentDate: '', appointmentTime: '',
    vehicleInfo: { make: '', model: '', year: '', licensePlate: '' },
    notes: ''
  });
  const [vehicleImage, setVehicleImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => { serviceAPI.getAll({ limit: 50 }).then(res => setServices(res.data.services)); }, []);

  const selectedService = services.find(s => s._id === form.serviceId);
  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + ' ₫';

  const getNextDays = () => {
    const days = [];
    for (let i = 1; i <= 7; i++) { const d = new Date(); d.setDate(d.getDate() + i); days.push(d); }
    return days;
  };
  const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.warning('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      setVehicleImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.warning('Vui lòng đăng nhập tài khoản trước'); navigate('/login'); return; }
    if (!form.serviceId) { toast.warning('Vui lòng chọn dịch vụ sửa chữa'); return; }
    if (!form.appointmentDate) { toast.warning('Vui lòng chọn ngày hẹn'); return; }
    if (!form.appointmentTime) { toast.warning('Vui lòng chọn giờ hẹn'); return; }
    if (!form.vehicleInfo.make || !form.vehicleInfo.model || !form.vehicleInfo.year) {
      toast.warning('Vui lòng điền đầy đủ thông tin phương tiện');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('serviceId', form.serviceId);
      formData.append('appointmentDate', form.appointmentDate);
      formData.append('appointmentTime', form.appointmentTime);
      formData.append('notes', form.notes);
      formData.append('vehicleInfo', JSON.stringify(form.vehicleInfo));
      if (vehicleImage) {
        formData.append('vehicleImage', vehicleImage);
      }

      const res = await appointmentAPI.createWithImage(formData);
      setBookingRef('#AFX-' + res.data.appointment._id.slice(-4).toUpperCase());
      setShowSuccess(true);
      if (res.data.emailSent) {
        toast.success('Email xác nhận đã được gửi về email của bạn');
      } else {
        toast.warning('Đặt lịch thành công nhưng email chưa gửi được. Vui lòng kiểm tra cấu hình SMTP.');
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Đặt lịch thất bại'); }
    setLoading(false);
  };

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg animate-fade-in">
      <div className="mb-stack-lg">
        <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-2 font-bold tracking-tight">Đặt lịch dịch vụ</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">Đặt lịch chăm sóc, bảo dưỡng hoặc sửa chữa xế yêu chuyên nghiệp chỉ trong vài phút.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* LEFT - Steps */}
        <div className="col-span-1 lg:col-span-8 space-y-stack-md">

          {/* Step 1: Service */}
          <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary flex items-center justify-center font-bold text-sm shadow">1</div>
              <h2 className="font-headline-sm text-primary text-xl font-bold">Bước 1: Chọn dịch vụ</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {services.slice(0, 6).map(s => (
                <div key={s._id} onClick={() => setForm({ ...form, serviceId: s._id })}
                  className={`relative p-4 rounded-xl cursor-pointer transition-all duration-300 ${form.serviceId === s._id
                      ? 'border-2 border-secondary bg-secondary/5 shadow-sm'
                      : 'border border-outline-variant/30 hover:border-secondary hover:bg-surface-container-low/20 bg-surface-container-lowest'
                    }`}>
                  {form.serviceId === s._id && (
                    <div className="absolute top-3 right-3 text-secondary animate-[scaleIn_0.2s]">
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                  )}
                  <span className="material-symbols-outlined text-3xl mb-2 block text-secondary">car_repair</span>
                  <h3 className="font-label-md text-label-md text-on-surface mb-1 font-bold line-clamp-1">{s.name}</h3>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{formatPrice(s.price)}</p>
                </div>
              ))}
            </div>
            {services.length > 6 && (
              <div className="relative mt-4">
                <select value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                  className="w-full rounded-lg border-outline-variant/30 border px-4 py-3 bg-surface-container-low text-sm font-medium focus:ring-1 focus:ring-secondary focus:border-secondary outline-none appearance-none">
                  <option value="">-- Hoặc chọn danh mục dịch vụ khác tại đây --</option>
                  {services.map(s => <option key={s._id} value={s._id}>{s.name} - {formatPrice(s.price)}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">unfold_more</span>
              </div>
            )}
          </section>

          {/* Step 2: Date & Time */}
          <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-6 animate-slide-up delay-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary flex items-center justify-center font-bold text-sm shadow">2</div>
              <h2 className="font-headline-sm text-primary text-xl font-bold">Bước 2: Chọn Ngày & Giờ</h2>
            </div>
            <h3 className="font-label-md text-label-md text-on-surface mb-3 uppercase tracking-wider text-xs font-bold text-secondary">Chọn ngày hẹn</h3>
            <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
              {getNextDays().map((d, i) => {
                const dateStr = d.toISOString().split('T')[0];
                const active = form.appointmentDate === dateStr;
                return (
                  <button type="button" key={i} onClick={() => setForm({ ...form, appointmentDate: dateStr })}
                    className={`flex flex-col items-center justify-center min-w-[90px] p-3 rounded-lg transition-all duration-300 cursor-pointer ${active
                        ? 'border-2 border-secondary bg-secondary-container text-on-secondary shadow-md'
                        : 'border border-outline-variant/30 hover:border-secondary bg-surface hover:bg-surface-container-low/20'
                      }`}>
                    <span className={`font-label-sm text-label-sm uppercase text-[10px] ${active ? 'text-white font-semibold' : 'text-on-surface-variant'}`}>{dayNames[d.getDay()]}</span>
                    <span className={`font-headline-sm text-headline-sm text-2xl font-bold my-1 ${active ? 'text-white' : 'text-on-surface'}`}>{d.getDate()}</span>
                    <span className={`font-label-sm text-label-sm text-[10px] ${active ? 'text-white/80' : 'text-on-surface-variant'}`}>{monthNames[d.getMonth()]}</span>
                  </button>
                );
              })}
            </div>
            <h3 className="font-label-md text-label-md text-on-surface mb-3 uppercase tracking-wider text-xs mt-6 font-bold text-secondary">Khung giờ trống trong ngày</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {timeSlots.map(t => (
                <button type="button" key={t} onClick={() => setForm({ ...form, appointmentTime: t })}
                  className={`py-2.5 rounded-lg font-label-md text-label-md transition-all duration-200 cursor-pointer ${form.appointmentTime === t
                      ? 'bg-secondary text-on-secondary font-bold shadow-md active:scale-95 border-none'
                      : 'border border-outline-variant/30 text-on-surface hover:border-secondary hover:bg-surface-container-low/30'
                    }`}>{t}</button>
              ))}
            </div>
          </section>

          {/* Step 3: Vehicle */}
          <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-6 animate-slide-up delay-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary flex items-center justify-center font-bold text-sm shadow">3</div>
              <h2 className="font-headline-sm text-primary text-xl font-bold">Bước 3: Thông tin phương tiện</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface mb-1.5 block text-xs font-semibold">Hãng xe</label>
                <input type="text" placeholder="Ví dụ: Toyota, Honda, Ford..." value={form.vehicleInfo.make}
                  onChange={(e) => setForm({ ...form, vehicleInfo: { ...form.vehicleInfo, make: e.target.value } })}
                  className="w-full rounded-lg border-outline-variant/30 border px-4 py-3 bg-surface-container-low focus:ring-1 focus:ring-secondary focus:border-secondary outline-none text-sm font-medium" required />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface mb-1.5 block text-xs font-semibold">Dòng xe (Model)</label>
                <input type="text" placeholder="Ví dụ: Camry, Civic, Ranger..." value={form.vehicleInfo.model}
                  onChange={(e) => setForm({ ...form, vehicleInfo: { ...form.vehicleInfo, model: e.target.value } })}
                  className="w-full rounded-lg border-outline-variant/30 border px-4 py-3 bg-surface-container-low focus:ring-1 focus:ring-secondary focus:border-secondary outline-none text-sm font-medium" required />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface mb-1.5 block text-xs font-semibold">Năm sản xuất</label>
                <input type="number" placeholder="Ví dụ: 2022, 2023..." value={form.vehicleInfo.year}
                  onChange={(e) => setForm({ ...form, vehicleInfo: { ...form.vehicleInfo, year: e.target.value } })}
                  className="w-full rounded-lg border-outline-variant/30 border px-4 py-3 bg-surface-container-low focus:ring-1 focus:ring-secondary focus:border-secondary outline-none text-sm font-medium" required />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface mb-1.5 block text-xs font-semibold">Biển số (Khuyên dùng)</label>
                <input type="text" placeholder="Ví dụ: 30K-987.65" value={form.vehicleInfo.licensePlate}
                  onChange={(e) => setForm({ ...form, vehicleInfo: { ...form.vehicleInfo, licensePlate: e.target.value } })}
                  className="w-full rounded-lg border-outline-variant/30 border px-4 py-3 bg-surface-container-low focus:ring-1 focus:ring-secondary focus:border-secondary outline-none text-sm uppercase font-semibold" />
              </div>
            </div>

            <div className="mt-4">
              <label className="font-label-md text-label-md text-on-surface mb-1.5 block text-xs font-semibold">Hình ảnh xe (Tùy chọn)</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-outline-variant/30 border-dashed rounded-lg cursor-pointer bg-surface-container-low hover:bg-surface-container-high overflow-hidden relative">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-on-surface-variant">
                      <span className="material-symbols-outlined text-3xl mb-2">cloud_upload</span>
                      <p className="mb-2 text-sm"><span className="font-semibold">Nhấn để tải lên</span> hoặc kéo thả</p>
                      <p className="text-xs opacity-70">PNG, JPG or GIF (MAX. 5MB)</p>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
            </div>
          </section>

          {/* Step 4: Notes */}
          <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-6 animate-slide-up delay-3">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary flex items-center justify-center font-bold text-sm shadow">4</div>
              <h2 className="font-headline-sm text-primary text-xl font-bold">Bước 4: Ghi chú tình trạng xe</h2>
            </div>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Vui lòng mô tả chi tiết tình trạng xe hiện tại, tiếng kêu động cơ lạ hoặc các bộ phận cần kỹ thuật viên tập trung kiểm tra..." rows={4}
              className="w-full rounded-lg border-outline-variant/30 border px-4 py-3 bg-surface-container-low focus:ring-1 focus:ring-secondary focus:border-secondary outline-none resize-none text-sm font-medium leading-relaxed" />
          </section>
        </div>

        {/* RIGHT - Summary */}
        <div className="col-span-1 lg:col-span-4 relative">
          <div className="sticky top-24 bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/30 overflow-hidden animate-[scaleIn_0.4s]">
            <div className="bg-primary-container p-6 text-on-primary border-b border-white/5">
              <h2 className="font-headline-sm text-xl font-bold mb-1 text-white">Tóm tắt lịch đặt</h2>
              <p className="font-label-sm text-label-sm opacity-80 text-on-primary-container">Xem lại chi tiết lịch hẹn của bạn.</p>
            </div>
            <div className="p-6 space-y-6">
              {selectedService ? (
                <div className="flex items-start gap-4 pb-4 border-b border-outline-variant/10 animate-[fadeIn_0.3s]">
                  <div className="w-10 h-10 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-label-md text-label-md text-on-surface font-bold line-clamp-2 leading-snug">{selectedService.name}</h4>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-1.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span> ~{selectedService.duration} phút
                    </p>
                  </div>
                  <div className="font-label-md text-label-md text-secondary font-bold text-right">{formatPrice(selectedService.price)}</div>
                </div>
              ) : (
                <div className="text-center py-4 text-on-surface-variant font-medium text-xs border-b border-outline-variant/10 border-dashed">
                  Bạn chưa chọn dịch vụ sửa chữa ở bước 1.
                </div>
              )}
              {form.appointmentDate && (
                <div className="flex items-start gap-4 py-1 animate-[fadeIn_0.3s]">
                  <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">calendar_month</span>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface font-bold">
                      {new Date(form.appointmentDate).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {form.appointmentTime && <p className="font-label-sm text-label-sm text-secondary font-semibold mt-0.5">Thời gian: {form.appointmentTime}</p>}
                  </div>
                </div>
              )}
              <div className="flex items-start gap-4 py-1">
                <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">location_on</span>
                <div>
                  <p className="font-label-md text-label-md text-on-surface font-bold">Trung tâm dịch vụ AutoFix</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Số 123 đường Nguyễn Văn Linh, Quận 7, TP. HCM</p>
                </div>
              </div>
              <div className="pt-4 border-t border-outline-variant/10">
                <div className="flex justify-between font-headline-sm text-primary pt-2 items-center">
                  <span className="text-md font-bold">Chi phí ước tính</span>
                  <span className="text-xl font-bold text-secondary">{selectedService ? formatPrice(selectedService.price) : '0 ₫'}</span>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="booking-action-btn w-full py-4 mt-4 rounded-lg font-label-md text-label-md flex justify-center items-center gap-2 transition-all duration-300 active:scale-[0.98] font-bold cursor-pointer">
                <span>{loading ? 'Đang gửi yêu cầu...' : 'Xác nhận đặt lịch'}</span>
                {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
              </button>
              <p className="text-center font-label-sm text-label-sm text-on-surface-variant mt-3 leading-relaxed">
                Quý khách sẽ chỉ phải thanh toán sau khi hoàn thành dịch vụ tại xưởng.
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm transition-opacity"></div>
          <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 flex flex-col items-center text-center animate-scale-in border border-outline-variant/30">
            <div className="w-20 h-20 rounded-full bg-secondary-container text-on-secondary flex items-center justify-center mb-6 shadow-md">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 className="font-headline-sm text-primary mb-2 text-xl font-bold text-on-surface">Đặt lịch thành công!</h2>
            <p className="font-body-md text-on-surface-variant mb-6 text-sm leading-relaxed">Yêu cầu của bạn đã được ghi nhận. Hệ thống đã gửi một email xác nhận tự động về hòm thư của bạn.</p>
            <div className="bg-surface-container-low w-full p-4 rounded-lg mb-6 border border-outline-variant border-dashed">
              <p className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider mb-1.5 font-bold">Mã số lịch đặt</p>
              <p className="font-headline-sm text-secondary font-mono tracking-widest text-lg font-bold">{bookingRef}</p>
            </div>
            <button onClick={() => { setShowSuccess(false); navigate('/profile'); }}
              className="w-full py-3.5 rounded-lg bg-primary hover:bg-tertiary text-on-primary font-label-md text-label-md transition-colors font-bold shadow-md cursor-pointer active:scale-[0.98]">
              Xem lịch sử sửa chữa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
