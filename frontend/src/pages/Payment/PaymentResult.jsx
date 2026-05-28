import { useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get('status');
  const msg = searchParams.get('msg');
  const appId = searchParams.get('appId');

  const isSuccess = status === 'success';

  useEffect(() => {
    // Nếu không có status, chuyển về trang chủ
    if (!status) {
      navigate('/');
    }
  }, [status, navigate]);

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex items-center justify-center min-h-[70vh]">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 p-8 md:p-12 max-w-md w-full text-center animate-scale-in">
        
        {isSuccess ? (
          <>
            <div className="w-24 h-24 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-6 shadow-md border-4 border-green-50">
              <span className="material-symbols-outlined text-[50px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h1>
            <p className="text-gray-500 mb-6 font-medium">Cảm ơn bạn đã sử dụng dịch vụ của AutoFix.</p>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Mã đơn hàng</p>
              <p className="font-mono text-lg font-bold text-gray-800 uppercase">#{appId?.slice(-8)}</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-24 h-24 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-6 shadow-md border-4 border-red-50">
              <span className="material-symbols-outlined text-[50px]" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Giao dịch thất bại</h1>
            <p className="text-gray-500 mb-6 font-medium">
              {msg === 'invalid_signature' && 'Lỗi xác thực chữ ký bảo mật.'}
              {msg === 'not_found' && 'Không tìm thấy thông tin đơn hàng.'}
              {msg === 'server_error' && 'Lỗi hệ thống từ máy chủ.'}
              {!msg && 'Giao dịch đã bị hủy hoặc có lỗi xảy ra trong quá trình thanh toán.'}
            </p>
            {appId && (
              <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Mã đơn hàng</p>
                <p className="font-mono text-lg font-bold text-gray-800 uppercase">#{appId?.slice(-8)}</p>
              </div>
            )}
          </>
        )}

        <div className="flex flex-col gap-3">
          <Link 
            to="/profile" 
            className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-tertiary transition-colors shadow-md flex justify-center items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            Quản lý lịch sử sửa chữa
          </Link>
          <Link 
            to="/" 
            className="w-full bg-white text-gray-600 font-bold py-3.5 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors flex justify-center items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
