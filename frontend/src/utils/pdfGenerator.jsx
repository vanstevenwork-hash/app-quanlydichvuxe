import React from 'react';
import { createRoot } from 'react-dom/client';
import html2pdf from 'html2pdf.js';
import InvoiceTemplate from '../components/InvoiceTemplate';
import { toast } from 'react-toastify';

export const generateInvoicePDF = (appointment) => {
  toast.info('Đang tạo hóa đơn PDF, vui lòng đợi...', { autoClose: 2000 });

  // 1. Tạo một thẻ div ẩn ngoài màn hình
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  document.body.appendChild(container);

  // 2. Render component Hóa đơn vào div ẩn đó
  const root = createRoot(container);
  root.render(<InvoiceTemplate appointment={appointment} />);

  // 3. Đợi một khoảng thời gian ngắn để ảnh và CSS kịp tải
  setTimeout(() => {
    const element = container.querySelector('#invoice-template-container');
    if (!element) {
      toast.error('Lỗi khởi tạo hóa đơn.');
      root.unmount();
      document.body.removeChild(container);
      return;
    }

    const displayId = appointment._id?.slice(-8).toUpperCase() || 'UNKNOWN';
    const opt = {
      margin:       0,
      filename:     `HoaDon_AutoFix_${displayId}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // 4. Gọi html2pdf để chụp lại và tải về
    html2pdf().set(opt).from(element).save().then(() => {
      toast.success('Tải hóa đơn thành công!');
      // 5. Dọn dẹp DOM
      setTimeout(() => {
        root.unmount();
        document.body.removeChild(container);
      }, 500);
    }).catch(err => {
      console.error('PDF Generation Error:', err);
      toast.error('Có lỗi xảy ra khi tạo PDF');
      root.unmount();
      document.body.removeChild(container);
    });

  }, 1500); // Đợi 1.5s
};
