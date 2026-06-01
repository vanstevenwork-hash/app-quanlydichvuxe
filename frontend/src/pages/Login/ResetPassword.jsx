import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.warning('Mật khẩu nhập lại không khớp!');
      return;
    }
    if (password.length < 6) {
      toast.warning('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Token không hợp lệ hoặc đã hết hạn.');
    }
    setLoading(false);
  };

  return (
    <main className="flex-grow flex items-center justify-center min-h-[calc(100vh-80px)] bg-background p-6">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl soft-shadow p-8 relative border border-outline-variant/30">
        
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-4xl text-primary mb-2">lock_reset</span>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Đặt Lại Mật Khẩu</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">Vui lòng nhập mật khẩu mới cho tài khoản của bạn.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="new-password">Mật khẩu mới</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
              <input 
                className="h-12 w-full bg-surface-container-low rounded-lg pl-11 pr-11 border border-transparent focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all font-body-md text-body-md"
                id="new-password" 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Nhập mật khẩu mới" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <span onClick={() => setShowPassword(!showPassword)} className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant cursor-pointer select-none">
                {showPassword ? 'visibility' : 'visibility_off'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="confirm-password">Nhập lại mật khẩu</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">lock_clock</span>
              <input 
                className="h-12 w-full bg-surface-container-low rounded-lg pl-11 pr-4 border border-transparent focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all font-body-md text-body-md"
                id="confirm-password" 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Nhập lại mật khẩu mới" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          <button disabled={loading} className="h-12 mt-2 w-full bg-primary-container hover:bg-tertiary-container text-on-primary rounded-lg font-headline-sm text-headline-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]" type="submit">
            <span>{loading ? 'Đang xử lý...' : 'Xác nhận đặt lại'}</span>
          </button>
        </form>

      </div>
    </main>
  );
};

export default ResetPassword;
