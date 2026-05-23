import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'signup') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [searchParams]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin && (!form.email || !form.password)) {
      toast.warning('Vui lòng điền đầy đủ Email và Mật khẩu');
      return;
    }
    if (!isLogin && (!form.name || !form.email || !form.password || !form.phone)) {
      toast.warning('Vui lòng điền đầy đủ tất cả thông tin đăng ký');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const data = await login(form.email, form.password);
        toast.success('Đăng nhập thành công!');
        if (data.user.role === 'admin') navigate('/admin');
        else if (data.user.role === 'technician') navigate('/technician');
        else navigate('/profile');
      } else {
        await register(form);
        toast.success('Đăng ký thành công!');
        navigate('/profile');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thông tin đăng nhập hoặc đăng ký không hợp lệ');
    }
    setLoading(false);
  };

  return (
    <main className="flex-grow flex flex-col md:flex-row w-full max-w-container-max mx-auto min-h-[calc(100vh-80px)] bg-background">
      {/* LEFT SIDEBAR - premium image and text */}
      <div className="hidden md:block w-1/2 relative bg-primary-container overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-container/80 to-transparent z-10"></div>
        <img alt="Premium Auto Service Garage" className="w-full h-full object-cover relative z-0 mix-blend-multiply opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjBCmzT1r5Jr5wk29hQ3qOB4Sq0-UfAHPPbcrGv5nicpz9kAgm3XmweBowQpjXFRmnQBVLg3gft9QwzsLJaUPlYPQHWq4aPDxxyaR6sD2V6XgljRmZ99jbxMXthTX6GsZ77WE-m29rsqiy3TbySxo-kkO_zO88InLGNgWrWk3GV4DLCUXihE2txNhRA2qh3MJepz_XXjuBmOKYQ4J3R5GI4rEZ-w2lGwTcH6uMIiKXY3q9GOOr4_Y2S7gBzEysGhGegytxUQ2gGgM" />
        <div className="absolute bottom-16 left-12 z-20 text-on-primary max-w-md">
          <h2 className="font-headline-xl text-headline-xl text-on-primary mb-stack-md">Chuyên Gia Chăm Sóc Xe Của Bạn.</h2>
          <p className="font-body-lg text-body-lg opacity-90">Tham gia hệ thống AutoFix để quản lý lịch sử bảo dưỡng, theo dõi tiến độ sửa chữa và nhận ưu đãi độc quyền.</p>
        </div>
      </div>

      {/* RIGHT SIDEBAR - form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-surface">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-xl soft-shadow p-8 relative border border-outline-variant/30 mt-8">

          {/* Floating Back to Home Button */}
          <button
            onClick={() => navigate('/')}
            type="button"
            className="absolute -top-12 left-0 flex items-center gap-1.5 text-on-surface-variant hover:text-secondary transition-all duration-200 group text-sm font-semibold active:scale-95 cursor-pointer py-1.5"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform duration-200">arrow_back</span>
            Quay về trang chủ
          </button>

          <div className="flex border-b border-surface-container mb-8">
            <button type="button" className={`flex-1 pb-4 font-headline-sm text-headline-sm transition-colors text-center ${isLogin ? 'text-secondary-container border-b-2 border-secondary-container' : 'text-on-surface-variant border-b-2 border-transparent hover:text-on-surface'
              }`} onClick={() => setIsLogin(true)}>
              Đăng nhập
            </button>
            <button type="button" className={`flex-1 pb-4 font-headline-sm text-headline-sm transition-colors text-center ${!isLogin ? 'text-secondary-container border-b-2 border-secondary-container' : 'text-on-surface-variant border-b-2 border-transparent hover:text-on-surface'
              }`} onClick={() => setIsLogin(false)}>
              Đăng ký
            </button>
          </div>

          {isLogin ? (
            <div className="block animate-[fadeIn_0.3s]">
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="login-email">Email</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">mail</span>
                    <input className="h-12 w-full bg-surface-container-low rounded-lg pl-11 pr-4 border border-transparent focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all font-body-md text-body-md"
                      id="login-email" name="email" type="email" placeholder="Nhập địa chỉ email" value={form.email} onChange={handleChange} required />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="login-password">Mật khẩu</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
                    <input className="h-12 w-full bg-surface-container-low rounded-lg pl-11 pr-11 border border-transparent focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all font-body-md text-body-md text-on-surface"
                      id="login-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Nhập mật khẩu" value={form.password} onChange={handleChange} required />
                    <span onClick={() => setShowPassword(!showPassword)} className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant cursor-pointer select-none">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <span className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary-container transition-colors cursor-pointer">Quên mật khẩu?</span>
                </div>

                <button disabled={loading} className="h-12 mt-2 w-full bg-secondary-container hover:bg-secondary text-on-primary rounded-lg font-headline-sm text-headline-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]" type="submit">
                  <span>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</span>
                  {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
                </button>
              </form>
              <div className="mt-6 bg-surface-container-low p-4 rounded-lg text-xs text-on-surface-variant border border-outline-variant/30">
                <p className="font-bold mb-1">Tài khoản thử nghiệm:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Khách hàng: <code className="font-mono text-secondary">huy@gmail.com</code> / <code className="font-mono text-secondary">123456</code></li>
                  <li>Admin: <code className="font-mono text-secondary">admin@autofix.com</code> / <code className="font-mono text-secondary">123456</code></li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="block animate-[fadeIn_0.3s]">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="signup-name">Họ tên</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">person</span>
                    <input className="h-12 w-full bg-surface-container-low rounded-lg pl-11 pr-4 border border-transparent focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all font-body-md text-body-md"
                      id="signup-name" name="name" type="text" placeholder="Nguyễn Văn A" value={form.name} onChange={handleChange} required />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="signup-email">Email</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">mail</span>
                    <input className="h-12 w-full bg-surface-container-low rounded-lg pl-11 pr-4 border border-transparent focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all font-body-md text-body-md"
                      id="signup-email" name="email" type="email" placeholder="email@example.com" value={form.email} onChange={handleChange} required />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="signup-phone">Số điện thoại</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">call</span>
                    <input className="h-12 w-full bg-surface-container-low rounded-lg pl-11 pr-4 border border-transparent focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all font-body-md text-body-md"
                      id="signup-phone" name="phone" type="tel" placeholder="090 123 4567" value={form.phone} onChange={handleChange} required />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="signup-password">Mật khẩu</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
                    <input className="h-12 w-full bg-surface-container-low rounded-lg pl-11 pr-11 border border-transparent focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all font-body-md text-body-md"
                      id="signup-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Tạo mật khẩu mạnh" value={form.password} onChange={handleChange} required minLength={6} />
                    <span onClick={() => setShowPassword(!showPassword)} className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant cursor-pointer select-none">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </div>
                </div>

                <button disabled={loading} className="h-12 mt-4 w-full bg-primary-container hover:bg-tertiary-container text-on-primary rounded-lg font-headline-sm text-headline-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]" type="submit">
                  <span>{loading ? 'Đang tạo...' : 'Tạo tài khoản'}</span>
                </button>

                <p className="text-center font-body-sm text-body-sm text-on-surface-variant mt-2">
                  Bằng việc đăng ký, bạn đồng ý với <a className="text-secondary-container hover:underline" href="#">Điều khoản dịch vụ</a> của chúng tôi.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Login;
