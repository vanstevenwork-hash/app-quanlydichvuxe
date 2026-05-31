import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import AIChatbox from '../../components/AIChatbox';

const ClientLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (path) => location.pathname === path;

  const getNavLinks = () => {
    if (user?.role === 'admin') {
      return [
        { path: '/', label: 'Trang chủ' },
        { path: '/admin', label: 'Quản trị (Admin)' }
      ];
    }

    if (user?.role === 'technician') {
      return [
        { path: '/', label: 'Trang chủ' },
        { path: '/technician', label: 'Lịch làm việc' }
      ];
    }

    // Dành cho Customer và Guest
    const links = [
      { path: '/', label: 'Trang chủ' },
      { path: '/services', label: 'Dịch vụ' },
      { path: '/diagnostics', label: 'Chẩn đoán AI' },
      { path: '/booking', label: 'Đặt lịch hẹn' }
    ];

    if (user) {
      links.push({ path: '/profile', label: 'Hồ sơ của tôi' });
    }
    
    links.push({ path: '/contact', label: 'Liên hệ' });
    return links;
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* NAVBAR */}
      <header className="bg-surface fixed top-0 w-full z-50 shadow-sm animate-fade-in">
        <div className="flex justify-between items-center h-20 px-gutter max-w-container-max mx-auto">

          {/* Brand Logo & Text Synchronized */}
          <Link to="/" className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2 cursor-pointer active:scale-95 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary shadow-md group-hover:rotate-[15deg] transition-transform duration-300">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>car_repair</span>
            </div>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              AutoFix
            </span>
          </Link>

          {/* Navigation (Desktop) - Clean Spacious Underlines */}
          <nav className="hidden md:flex gap-8 items-center font-body-md text-body-md">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path}
                className={`font-body-md text-body-md transition-all duration-300 relative py-2 font-semibold group hover:text-orange-500 ${isActive(link.path)
                    ? 'text-orange-500'
                    : 'text-on-surface-variant'
                  }`}>
                {link.label}
                <span className={`absolute bottom-[-6px] left-0 h-[3px] rounded-full bg-orange-500 transition-all duration-300 ${isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}></span>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
                <button className="flex items-center gap-2 text-primary hover:bg-surface-container-low transition-all duration-300 px-3 py-2 rounded-lg font-body-md border border-outline-variant/30 shadow-sm">
                  <span className="material-symbols-outlined text-secondary">person</span>
                  <span className="font-semibold">{user.name}</span>
                  <span className="material-symbols-outlined text-sm transition-transform duration-200">keyboard_arrow_down</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full bg-surface border border-outline-variant rounded-xl shadow-lg min-w-[200px] p-2 z-50 animate-slide-down">
                    <Link to="/profile" className="block px-4 py-2.5 text-on-surface-variant hover:bg-surface-container-low rounded-lg text-sm transition-colors">Hồ sơ & Lịch sử</Link>
                    {user.role === 'admin' && <Link to="/admin" className="block px-4 py-2.5 text-on-surface-variant hover:bg-surface-container-low rounded-lg text-sm transition-colors">Admin CMS</Link>}
                    {user.role === 'technician' && <Link to="/technician" className="block px-4 py-2.5 text-on-surface-variant hover:bg-surface-container-low rounded-lg text-sm transition-colors">Lịch làm việc</Link>}
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-error hover:bg-error-container rounded-lg text-sm transition-colors mt-1 border-t border-outline-variant/20 pt-2 font-medium">
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="font-label-md text-label-md text-primary px-4 py-2 hover:bg-surface-container rounded-lg transition-all duration-200 active:scale-95 border border-outline/30">
                  Đăng nhập
                </Link>
                <Link to="/login?tab=signup" className="font-label-md text-label-md bg-secondary text-on-secondary px-6 py-2 rounded-lg hover:bg-on-secondary-container transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg">
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-primary p-2 active:scale-90 transition-transform" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-surface border-t border-outline-variant/30 px-gutter pb-4 shadow-md absolute w-full left-0 top-20 animate-slide-down">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path} onClick={() => setMenuOpen(false)}
                className={`block py-3 font-body-md text-body-md transition-colors ${isActive(link.path) ? 'text-orange-500 font-bold' : 'text-on-surface-variant hover:text-orange-500'}`}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <div className="mt-4 pt-4 border-t border-outline-variant/30 space-y-2">
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="block py-2 text-on-surface-variant hover:text-secondary text-sm">Hồ sơ & Lịch sử</Link>
                {user.role === 'admin' && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block py-2 text-on-surface-variant hover:text-secondary text-sm">Admin CMS</Link>}
                {user.role === 'technician' && <Link to="/technician" onClick={() => setMenuOpen(false)} className="block py-2 text-on-surface-variant hover:text-secondary text-sm">Lịch làm việc</Link>}
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="w-full text-left py-2 text-error text-sm font-semibold">Đăng xuất</button>
              </div>
            ) : (
              <div className="flex gap-4 mt-4 pt-4 border-t border-outline-variant/30">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center font-label-md text-label-md text-primary border border-outline px-4 py-2 rounded-lg hover:bg-surface-container-low transition-colors">
                  Đăng nhập
                </Link>
                <Link to="/login?tab=signup" onClick={() => setMenuOpen(false)} className="flex-1 text-center font-label-md text-label-md bg-secondary text-on-secondary px-4 py-2 rounded-lg hover:bg-on-secondary-container transition-colors">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* MAIN */}
      <main className="flex-grow pt-20"><Outlet /></main>

      {/* FOOTER */}
      <footer className="bg-primary-container w-full py-stack-lg mt-stack-lg border-t border-outline-variant/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter px-gutter max-w-container-max mx-auto text-on-primary">

          {/* Brand Column */}
          <div className="flex flex-col gap-4 animate-slide-up">
            <div className="font-headline-sm text-headline-sm text-on-primary flex items-center gap-2 font-bold">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>car_repair</span>
              </div>
              AutoFix
            </div>
            <p className="font-body-sm text-body-sm text-on-primary-container opacity-90">
              Chuyên gia chăm sóc và bảo dưỡng xe hơi chuyên nghiệp với công nghệ hiện đại.
            </p>
          </div>

          {/* Links Column */}
          <div className="flex flex-col gap-2 animate-slide-up delay-1">
            <h4 className="font-label-md text-label-md font-bold text-secondary-fixed mb-1 uppercase tracking-wider">Thông Tin Pháp Lý</h4>
            <a className="font-body-sm text-body-sm text-on-primary-container hover:text-secondary-fixed-dim transition-colors" href="#">Chính sách bảo mật</a>
            <a className="font-body-sm text-body-sm text-on-primary-container hover:text-secondary-fixed-dim transition-colors" href="#">Điều khoản dịch vụ</a>
            <a className="font-body-sm text-body-sm text-on-primary-container hover:text-secondary-fixed-dim transition-colors" href="#">Câu hỏi thường gặp</a>
            <a className="font-body-sm text-body-sm text-on-primary-container hover:text-secondary-fixed-dim transition-colors" href="#">Hỗ trợ khách hàng</a>
          </div>

          {/* Contact/Copyright */}
          <div className="flex flex-col justify-between items-start md:items-end animate-slide-up delay-2">
            <div className="flex gap-4 text-on-primary mb-4 md:mb-0">
              <span className="material-symbols-outlined cursor-pointer hover:text-secondary-fixed-dim transition-premium hover:-translate-y-1 p-2 bg-white/5 rounded-full">location_on</span>
              <span className="material-symbols-outlined cursor-pointer hover:text-secondary-fixed-dim transition-premium hover:-translate-y-1 p-2 bg-white/5 rounded-full">call</span>
              <span className="material-symbols-outlined cursor-pointer hover:text-secondary-fixed-dim transition-premium hover:-translate-y-1 p-2 bg-white/5 rounded-full">mail</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-primary-container mt-auto opacity-80">
              © 2024 AutoPro Professional Service. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </footer>

      <AIChatbox />
    </div>
  );
};

export default ClientLayout;
