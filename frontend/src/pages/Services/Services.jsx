import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resolveAssetUrl, serviceAPI } from '../../api';

const categoryMap = { 'bao-duong': 'Bảo dưỡng', 'sua-chua': 'Sửa chữa', 'kiem-tra': 'Kiểm tra', 'thay-the': 'Thay thế' };
const categoryBadge = {
  'bao-duong': 'bg-tertiary-container/90 text-on-tertiary-container',
  'sua-chua': 'bg-error-container/90 text-on-error-container',
  'kiem-tra': 'bg-secondary-container/90 text-on-secondary-container',
  'thay-the': 'bg-surface-tint/90 text-on-primary'
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', search: '', page: 1 });

  useEffect(() => { fetchServices(); }, [filters]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: 6 };
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      const res = await serviceAPI.getAll(params);
      setServices(res.data.services);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + ' ₫';

  const categories = [
    { key: '', label: 'Tất cả dịch vụ', icon: 'dashboard' },
    { key: 'bao-duong', label: 'Bảo dưỡng định kỳ', icon: 'build_circle' },
    { key: 'sua-chua', label: 'Sửa chữa động cơ', icon: 'settings' },
    { key: 'kiem-tra', label: 'Chẩn đoán tổng quát', icon: 'troubleshoot' },
    { key: 'thay-the', label: 'Thay thế phụ tùng', icon: 'published_with_changes' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <section className="relative w-full h-[280px] flex items-center justify-center bg-primary overflow-hidden animate-fade-in">
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms] scale-105"
          style={{ backgroundImage: `url('${resolveAssetUrl('/image/service-banner.png')}')` }}>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary/95"></div>
        <div className="relative z-10 text-center px-margin-mobile">
          <h1 className="text-headline-lg-mobile md:text-headline-lg text-on-primary mb-stack-sm font-bold tracking-tight animate-slide-up">Dịch vụ sửa chữa & Bảo dưỡng</h1>
          <p className="font-body-lg text-body-lg text-tertiary-fixed-dim max-w-2xl mx-auto opacity-95 animate-slide-up delay-1">
            Quy trình chuẩn hóa, phụ tùng chính hãng và bảng giá công khai minh bạch.
          </p>
        </div>
      </section>

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg animate-fade-in delay-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          
          {/* Sidebar - Category list redesigned as luxurious badges */}
          <aside className="lg:col-span-3">
            <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 sticky top-24 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
              <h2 className="font-headline-sm text-primary border-b border-surface-container pb-4 mb-4 flex items-center gap-2 text-md font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-secondary">filter_alt</span> Danh mục dịch vụ
              </h2>
              <div className="flex flex-col gap-1">
                {categories.map(item => (
                  <button key={item.key} onClick={() => setFilters({ ...filters, category: item.key, page: 1 })}
                    className={`flex items-center gap-3 w-full text-left px-3.5 py-3 rounded-lg text-sm font-medium transition-all active:scale-[0.98] ${
                      filters.category === item.key
                        ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-sm border-l-4 border-secondary'
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary border-l-4 border-transparent'
                    }`}>
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Search Bar Elevated */}
            <div className="bg-surface-container-lowest rounded-xl p-2 shadow-sm border border-outline-variant/30 flex items-center focus-within:ring-2 focus-within:ring-secondary/50 focus-within:border-secondary transition-all">
              <span className="material-symbols-outlined text-outline-variant ml-3 select-none">search</span>
              <input type="text" placeholder="Tìm kiếm dịch vụ nhanh..."
                value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full bg-transparent border-none focus:ring-0 font-body-md text-on-surface placeholder:text-outline-variant py-3.5 px-4 outline-none" />
              <button className="bg-primary hover:bg-tertiary text-on-primary px-7 py-3 rounded-lg font-label-md text-label-md transition-colors font-bold shadow-md">
                Tìm kiếm
              </button>
            </div>

            <div className="flex items-center justify-between text-on-surface-variant text-sm font-medium">
              <span>Đang hiển thị {services.length} dịch vụ chuyên nghiệp</span>
            </div>

            {loading ? (
              <div className="text-center py-24 text-on-surface-variant font-medium flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                <span>Đang tải danh sách dịch vụ...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                  {services.map((s, idx) => (
                    <div key={s._id} className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/30 card-hover flex flex-col h-full animate-slide-up transition-premium"
                      style={{ animationDelay: `${idx * 80}ms` }}>
                      <div className="relative h-52 overflow-hidden">
                        <img src={resolveAssetUrl(s.image)} alt={s.name}
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                        <div className={`absolute top-4 left-4 px-3.5 py-1 rounded-full font-label-sm text-[11px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${categoryBadge[s.category] || 'bg-surface-tint/90 text-on-primary'}`}>
                          {categoryMap[s.category]}
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="font-headline-sm text-primary mb-2 line-clamp-1 text-lg font-bold hover:text-secondary cursor-pointer">{s.name}</h3>
                        <p className="font-body-md text-on-surface-variant mb-5 line-clamp-3 flex-grow text-[13.5px] leading-relaxed">{s.description}</p>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/10">
                          <div>
                            <span className="block font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">Giá tham khảo từ</span>
                            <span className="font-headline-sm text-secondary font-bold text-xl">{formatPrice(s.price)}</span>
                          </div>
                          <Link to={`/booking?service=${s._id}`}
                            className="booking-action-btn px-5 py-3 rounded-lg font-label-md text-label-md transition-all duration-300 font-bold active:scale-95">
                            Đặt lịch hẹn
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {services.length === 0 && (
                  <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl py-20 text-center text-on-surface-variant font-body-md">
                    Không tìm thấy dịch vụ nào phù hợp với từ khóa của bạn.
                  </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-2 pt-6">
                    <button disabled={filters.page === 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-40 cursor-pointer">
                      <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </button>
                    {Array.from({ length: pagination.pages }, (_, i) => (
                      <button key={i} onClick={() => setFilters({ ...filters, page: i + 1 })}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg font-label-md transition-colors cursor-pointer ${
                          filters.page === i + 1 ? 'bg-secondary text-on-secondary font-bold shadow-md' : 'border border-outline-variant/30 text-on-surface hover:bg-surface-container-low'
                        }`}>{i + 1}</button>
                    ))}
                    <button disabled={filters.page === pagination.pages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-40 cursor-pointer">
                      <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
