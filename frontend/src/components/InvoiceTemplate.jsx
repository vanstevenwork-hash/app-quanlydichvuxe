import React from 'react';
import { resolveAssetUrl } from '../api';

// Định dạng tiền tệ
const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p || 0) + ' ₫';

const InvoiceTemplate = ({ appointment }) => {
  if (!appointment) return null;

  const {
    _id,
    customerId,
    serviceId,
    appointmentDate,
    appointmentTime,
    vehicleInfo,
    status,
    totalPrice,
    paymentStatus,
    paymentDate,
    evidenceImages,
    technicianNotes
  } = appointment;

  const isPaid = paymentStatus === 'paid';
  const displayId = _id?.slice(-8).toUpperCase() || 'UNKNOWN';

  return (
    <div id="invoice-template-container" className="bg-white text-gray-900 p-10 mx-auto" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Arial, sans-serif' }}>
      
      {/* HEADER */}
      <div className="flex justify-between items-start border-b-2 border-gray-200 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-2xl">car_repair</span>
            </div>
            <h1 className="text-3xl font-bold text-blue-700 tracking-tight">AutoFix</h1>
          </div>
          <p className="text-sm text-gray-500">Chuyên gia chăm sóc xe hơi chuyên nghiệp</p>
          <p className="text-sm text-gray-500">Số 123 Nguyễn Văn Linh, Quận 7, TP. HCM</p>
          <p className="text-sm text-gray-500">Hotline: 090 123 4567 | Email: contact@autofix.vn</p>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">HÓA ĐƠN DỊCH VỤ</h2>
          <p className="text-sm font-semibold text-gray-600">Mã phiếu: #{displayId}</p>
          <p className="text-sm text-gray-600">Ngày in: {new Date().toLocaleDateString('vi-VN')}</p>
          {isPaid && <p className="text-sm font-bold text-green-600 mt-1">Trạng thái: ĐÃ THANH TOÁN</p>}
        </div>
      </div>

      {/* INFO ROW */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Khách hàng */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 uppercase mb-3 border-b border-gray-200 pb-2">Thông tin Khách hàng</h3>
          <p className="text-sm mb-1"><span className="font-semibold text-gray-600 inline-block w-20">Họ tên:</span> {customerId?.name || 'Khách hàng'}</p>
          <p className="text-sm mb-1"><span className="font-semibold text-gray-600 inline-block w-20">Số ĐT:</span> {customerId?.phone || 'N/A'}</p>
          <p className="text-sm mb-1"><span className="font-semibold text-gray-600 inline-block w-20">Email:</span> {customerId?.email || 'N/A'}</p>
        </div>
        
        {/* Phương tiện */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 uppercase mb-3 border-b border-gray-200 pb-2">Thông tin Phương tiện</h3>
          <p className="text-sm mb-1"><span className="font-semibold text-gray-600 inline-block w-20">Xe:</span> {vehicleInfo?.make} {vehicleInfo?.model}</p>
          <p className="text-sm mb-1"><span className="font-semibold text-gray-600 inline-block w-20">Đời xe:</span> {vehicleInfo?.year}</p>
          <p className="text-sm mb-1"><span className="font-semibold text-gray-600 inline-block w-20">Biển số:</span> <span className="uppercase font-bold">{vehicleInfo?.licensePlate || 'N/A'}</span></p>
        </div>
      </div>

      {/* SERVICE TABLE */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-800 uppercase mb-3">Chi tiết dịch vụ</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-blue-50 text-blue-800 border-y-2 border-blue-200">
              <th className="py-3 px-4 font-semibold text-sm">Tên dịch vụ</th>
              <th className="py-3 px-4 font-semibold text-sm w-40 text-center">Thời gian hẹn</th>
              <th className="py-3 px-4 font-semibold text-sm w-32 text-right">Đơn giá</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-4 px-4">
                <p className="font-bold text-gray-800">{serviceId?.name || 'Dịch vụ sửa chữa'}</p>
                <p className="text-xs text-gray-500 mt-1">{serviceId?.description || 'Bảo dưỡng, chăm sóc xe chuyên nghiệp'}</p>
              </td>
              <td className="py-4 px-4 text-center text-sm text-gray-700">
                {new Date(appointmentDate).toLocaleDateString('vi-VN')}
                <br />{appointmentTime}
              </td>
              <td className="py-4 px-4 text-right font-bold text-gray-800">{formatPrice(totalPrice || serviceId?.price)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* SUMMARY */}
      <div className="flex justify-end mb-12">
        <div className="w-1/2">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Tạm tính:</span>
            <span className="font-medium">{formatPrice(totalPrice || serviceId?.price)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">VAT (0%):</span>
            <span className="font-medium">0 ₫</span>
          </div>
          <div className="flex justify-between py-4 border-b-2 border-blue-500">
            <span className="font-bold text-lg text-gray-800">TỔNG CỘNG:</span>
            <span className="font-bold text-2xl text-blue-700">{formatPrice(totalPrice || serviceId?.price)}</span>
          </div>
          
          {isPaid && (
            <div className="mt-4 text-right">
              <div className="inline-block border-2 border-green-500 text-green-600 font-bold px-4 py-2 rounded uppercase tracking-widest rotate-[-5deg] opacity-80">
                Đã Thanh Toán
              </div>
              <p className="text-xs text-gray-500 mt-2">vào lúc {new Date(paymentDate || Date.now()).toLocaleString('vi-VN')}</p>
            </div>
          )}
        </div>
      </div>

      {/* EVIDENCE SECTION (If any) */}
      {(technicianNotes || (evidenceImages && evidenceImages.length > 0)) && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-bold text-gray-800 uppercase mb-4">Báo cáo & Bằng chứng Kỹ thuật</h3>
          
          {technicianNotes && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-600 mb-1">Ghi chú từ Kỹ thuật viên:</p>
              <div className="bg-gray-50 p-4 rounded text-sm text-gray-800 italic">"{technicianNotes}"</div>
            </div>
          )}
          
          {evidenceImages && evidenceImages.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              {evidenceImages.map((img, idx) => (
                <div key={idx} className="aspect-square bg-gray-100 rounded overflow-hidden border border-gray-200">
                  <img src={resolveAssetUrl(img)} alt="Evidence" className="w-full h-full object-cover" crossOrigin="anonymous" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FOOTER */}
      <div className="mt-16 pt-8 border-t border-gray-200 text-center text-xs text-gray-500">
        <p className="font-bold mb-1">CẢM ƠN QUÝ KHÁCH ĐÃ SỬ DỤNG DỊCH VỤ TẠI AUTOFIX</p>
        <p>Mọi thắc mắc về hóa đơn vui lòng liên hệ Hotline: 090 123 4567 trong vòng 7 ngày.</p>
      </div>
      
    </div>
  );
};

export default InvoiceTemplate;
