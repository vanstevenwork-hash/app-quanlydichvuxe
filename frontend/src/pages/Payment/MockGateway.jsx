import { useSearchParams } from 'react-router-dom';

const MockGateway = () => {
  const [searchParams] = useSearchParams();
  const appId = searchParams.get('appId');
  const amount = searchParams.get('amount') || '0';
  const hash = searchParams.get('hash');

  const formattedAmount = new Intl.NumberFormat('vi-VN').format(amount) + ' VND';

  const handlePayment = (status) => {
    // Chuyển hướng trở lại Server Backend để xử lý Callback
    const backendUrl = 'http://localhost:5005';
    window.location.href = `${backendUrl}/api/payments/callback?appId=${appId}&status=${status}&hash=${hash}`;
  };

  if (!appId || !hash) {
    return <div className="p-8 text-center text-red-500 font-bold">Lỗi: Thiếu tham số thanh toán!</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in border border-gray-200">
        
        {/* Header VNPay */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-center text-white relative">
          <div className="absolute top-4 left-4 font-bold text-xs bg-white/20 px-2 py-1 rounded">Sandbox Environment</div>
          <h1 className="text-2xl font-black tracking-wider mt-4">VNPAY<span className="font-light">MOCK</span></h1>
          <p className="opacity-80 text-sm mt-1">Cổng thanh toán giả lập dành cho AutoFix</p>
        </div>

        {/* Info */}
        <div className="p-6 space-y-4">
          <div className="text-center mb-6">
            <p className="text-gray-500 text-sm font-medium mb-1">Số tiền thanh toán</p>
            <p className="text-3xl font-bold text-blue-600">{formattedAmount}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Mã đơn hàng:</span>
              <span className="font-semibold text-gray-800 uppercase">#{appId.slice(-8)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Nhà cung cấp:</span>
              <span className="font-semibold text-gray-800">AutoFix Service</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ngày tạo:</span>
              <span className="font-semibold text-gray-800">{new Date().toLocaleDateString('vi-VN')}</span>
            </div>
          </div>

          {/* Simulate Bank Selection */}
          <div className="pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Chọn ngân hàng (Giả lập)</p>
            <div className="grid grid-cols-2 gap-3">
              <button className="border-2 border-blue-500 bg-blue-50 py-3 rounded-lg flex justify-center items-center font-bold text-blue-700 shadow-sm">NCB</button>
              <button className="border border-gray-200 py-3 rounded-lg flex justify-center items-center text-gray-400 font-medium cursor-not-allowed">Vietcombank</button>
              <button className="border border-gray-200 py-3 rounded-lg flex justify-center items-center text-gray-400 font-medium cursor-not-allowed">MBBank</button>
              <button className="border border-gray-200 py-3 rounded-lg flex justify-center items-center text-gray-400 font-medium cursor-not-allowed">Techcombank</button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col gap-3">
          <button 
            onClick={() => handlePayment('00')}
            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-md active:scale-[0.98]"
          >
            XÁC NHẬN THANH TOÁN
          </button>
          <button 
            onClick={() => handlePayment('24')}
            className="w-full bg-white text-gray-600 font-bold py-3.5 rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors active:scale-[0.98]"
          >
            HỦY GIAO DỊCH
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockGateway;
