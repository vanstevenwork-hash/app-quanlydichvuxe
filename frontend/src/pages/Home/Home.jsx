import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleBookingClick = () => {
    navigate('/booking');
  };

  return (
    <div className="bg-background text-on-background font-body-md overflow-x-hidden">
      {/* Hero Section - Elevated with float and fade slide-up animations */}
      <section className="relative hero-gradient text-on-primary py-24 px-margin-mobile md:px-margin-desktop overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
        <div className="max-w-container-max mx-auto relative z-10 flex flex-col md:flex-row items-center gap-gutter">
          <div className="md:w-1/2 space-y-stack-md animate-slide-up">
            <h1 className="font-headline-xl text-headline-xl text-on-primary leading-tight drop-shadow-sm">
              Chăm Sóc Xe Chuyên Nghiệp,<br />
              <span className="text-secondary-fixed bg-gradient-to-r from-secondary-fixed to-secondary-fixed-dim bg-clip-text text-transparent">Vận Hành Hoàn Hảo</span>
            </h1>
            <p className="font-body-lg text-body-lg text-tertiary-fixed-dim max-w-lg opacity-95">
              AutoFix mang đến giải pháp bảo dưỡng và sửa chữa ô tô toàn diện với công nghệ hiện đại và đội ngũ kỹ thuật viên giàu kinh nghiệm.
            </p>
            <div className="pt-stack-sm flex gap-unit">
              <button onClick={handleBookingClick} className="booking-action-btn font-headline-sm text-headline-sm rounded px-6 py-3 transition-all duration-300 font-bold active:scale-95 transform hover:-translate-y-0.5">
                Đặt Lịch Ngay
              </button>
              <button onClick={() => navigate('/services')} className="border border-tertiary-fixed-dim text-tertiary-fixed-dim font-headline-sm text-headline-sm rounded px-6 py-3 hover:bg-surface-container-low/10 hover:border-white transition-all duration-300 active:scale-95">
                Tìm Hiểu Thêm
              </button>
            </div>
          </div>
          <div className="md:w-1/2 mt-stack-lg md:mt-0 relative animate-scale-in delay-1">
            <div className="rounded-xl overflow-hidden shadow-2xl relative transition-transform duration-500 hover:scale-[1.01]" style={{ paddingBottom: '66%' }}>
              <img alt="Gara hiện đại" className="absolute inset-0 w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZT1D9d8LsIdetoMxeDpumS-Mrpgs1O2U3_ggEKd6TdJzY65duIxNQ1_ARUKULWvfQXQia_wyGZgJGk-fA2x4ODqbh-ioMaNnbcix1zru3g30HVC2ngySgEu7DLJEv6zOPbtBeQAxpJ0F6ZWLjyqeYQPedO-4ATS2v0U3bVvq1yIzhGoyPQ7-QdB73BjbMJ-cajRUMU5MUZINTEsNjwQN4VkdygFAgeZ-gcavsJlJvHqc3H-0scS-Ze4YqRkPlvESi4kT7zVAmTXw" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-surface p-4 rounded-lg shadow-xl flex items-center gap-unit text-primary animate-float border border-outline-variant/30">
              <span className="material-symbols-outlined text-secondary-container text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <div>
                <div className="font-label-md text-label-md font-bold">Được Chứng Nhận</div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">Bởi chuyên gia hàng đầu</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section (Bento Grid Style) - Smooth grid animation */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface animate-fade-in delay-2">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-16 space-y-stack-sm animate-slide-up">
            <h2 className="font-headline-lg text-headline-lg text-primary">Dịch Vụ Nổi Bật</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">Giải pháp toàn diện cho xế yêu của bạn, từ bảo dưỡng định kỳ đến sửa chữa chuyên sâu.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">

            {/* Large Card - Bento Layout */}
            <div className="md:col-span-2 md:row-span-2 rounded-xl p-8 border border-surface-container-highest shadow-sm card-hover flex flex-col justify-between relative overflow-hidden group animate-slide-up">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800')" }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20"></div>
              
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 bg-primary/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <span className="material-symbols-outlined text-white text-2xl">car_repair</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-white font-bold drop-shadow-md">Bảo Dưỡng Tổng Thể</h3>
                <p className="font-body-md text-body-md text-gray-200 max-w-md drop-shadow">Gói bảo dưỡng cao cấp giúp xe luôn trong tình trạng hoàn hảo. Kiểm tra hơn 50 hạng mục an toàn và hiệu suất.</p>
              </div>
              <button onClick={() => navigate('/services')} className="relative z-10 w-fit font-label-md text-label-md text-white border border-white/50 backdrop-blur-md rounded-full px-5 py-2.5 hover:bg-white hover:text-black transition-all duration-300 mt-auto font-bold shadow-lg">Xem chi tiết</button>
            </div>

            {/* Small Cards */}
            <div onClick={() => navigate('/services')} className="rounded-xl p-6 border border-surface-container-highest shadow-sm card-hover flex flex-col justify-between cursor-pointer animate-slide-up delay-1 group relative overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&q=80&w=400')" }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30"></div>
              <div className="relative z-10 w-10 h-10 bg-surface/20 backdrop-blur-md rounded-full flex items-center justify-center text-white mb-8 group-hover:scale-105 transition-transform duration-300">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>oil_barrel</span>
              </div>
              <div className="relative z-10">
                <h3 className="font-headline-sm text-headline-sm text-white mb-2 font-bold drop-shadow-md">Thay Nhớt & Bộ Lọc</h3>
                <p className="font-body-sm text-body-sm text-gray-300 drop-shadow">Sử dụng dầu nhớt chính hãng, kéo dài tuổi thọ động cơ.</p>
              </div>
            </div>

            <div onClick={() => navigate('/services')} className="rounded-xl p-6 border border-surface-container-highest shadow-sm card-hover flex flex-col justify-between cursor-pointer animate-slide-up delay-2 group relative overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=400')" }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30"></div>
              <div className="relative z-10 w-10 h-10 bg-surface/20 backdrop-blur-md rounded-full flex items-center justify-center text-white mb-8 group-hover:scale-105 transition-transform duration-300">
                <span className="material-symbols-outlined">settings_suggest</span>
              </div>
              <div className="relative z-10">
                <h3 className="font-headline-sm text-headline-sm text-white mb-2 font-bold drop-shadow-md">Sửa Chữa Động Cơ</h3>
                <p className="font-body-sm text-body-sm text-gray-300 drop-shadow">Chẩn đoán chính xác, khắc phục triệt để các lỗi phức tạp.</p>
              </div>
            </div>

            <div onClick={() => navigate('/services')} className="rounded-xl p-6 border border-surface-container-highest shadow-sm card-hover flex flex-col justify-between cursor-pointer animate-slide-up delay-3 group relative overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=400')" }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30"></div>
              <div className="relative z-10 w-10 h-10 bg-surface/20 backdrop-blur-md rounded-full flex items-center justify-center text-white mb-8 group-hover:scale-105 transition-transform duration-300">
                <span className="material-symbols-outlined">ac_unit</span>
              </div>
              <div className="relative z-10">
                <h3 className="font-headline-sm text-headline-sm text-white mb-2 font-bold drop-shadow-md">Điện & Điều Hòa</h3>
                <p className="font-body-sm text-body-sm text-gray-300 drop-shadow">Xử lý hệ thống điện thông minh và nạp gas điều hòa.</p>
              </div>
            </div>

            <div onClick={() => navigate('/services')} className="rounded-xl p-6 border border-surface-container-highest shadow-sm card-hover flex flex-col justify-between cursor-pointer animate-slide-up delay-4 group relative overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&q=80&w=400')" }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30"></div>
              <div className="relative z-10 w-10 h-10 bg-surface/20 backdrop-blur-md rounded-full flex items-center justify-center text-white mb-8 group-hover:scale-105 transition-transform duration-300">
                <span className="material-symbols-outlined">local_car_wash</span>
              </div>
              <div className="relative z-10">
                <h3 className="font-headline-sm text-headline-sm text-white mb-2 font-bold drop-shadow-md">Chăm Sóc & Detailing</h3>
                <p className="font-body-sm text-body-sm text-gray-300 drop-shadow">Làm sạch sâu, phủ ceramic bảo vệ sơn xe toàn diện.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workshop Info Section */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-low">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2 relative animate-scale-in">
            <div className="rounded-xl overflow-hidden shadow-xl border border-surface-container-highest relative transition-transform duration-500 hover:scale-[1.01]" style={{ paddingBottom: '75%' }}>
              <img alt="Kỹ thuật viên đang làm việc" className="absolute inset-0 w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpjGNoYOtgv-qHaZuD0gUrmw1Bs-1Gd3WMc_NBt5U8cePrse61lNan3L88j68ltiLEe3UNPG80uxaFKN_nYXK1kTm0TVqL8K7hjaDJyVPtFj8zWH3OCVZGMlorO80giPYgsXY_vebInd8ZFEvEX3cGmwgyI3OvE7IKkZej3RAdKkDtgB9g0qGM0DK6X_fW6GBbWAtXKqUM8E48l9G0HD6J5WqED6dPInUcnkLWPmlDApltvQJgYc_Fky5BSrwtg1k9EvTMLKsBvkk" />
            </div>
            <div className="absolute top-4 right-4 bg-secondary-container text-on-secondary-container font-label-md text-label-md px-3 py-1.5 rounded-full shadow-md font-bold">Công Nghệ 4.0</div>
          </div>
          <div className="md:w-1/2 space-y-6 animate-slide-up">
            <h2 className="font-headline-lg text-headline-lg text-primary font-bold">Cơ Sở Vật Chất Hiện Đại</h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">Tại AutoPro, chúng tôi đầu tư mạnh mẽ vào trang thiết bị chẩn đoán tiên tiến nhất. Mọi quy trình sửa chữa đều được chuẩn hóa để đảm bảo độ chính xác tuyệt đối.</p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <span className="material-symbols-outlined text-secondary-container mt-1 group-hover:scale-110 transition-transform">check_circle</span>
                <div>
                  <div className="font-headline-sm text-headline-sm text-primary font-semibold">Máy chẩn đoán lỗi chuyên sâu</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">Phát hiện lỗi nhanh chóng cho mọi dòng xe châu Âu, Á, Mỹ.</div>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <span className="material-symbols-outlined text-secondary-container mt-1 group-hover:scale-110 transition-transform">check_circle</span>
                <div>
                  <div className="font-headline-sm text-headline-sm text-primary font-semibold">Phòng sơn sấy công nghệ cao</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">Đảm bảo màu sơn chuẩn zin, bền bỉ theo thời gian.</div>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <span className="material-symbols-outlined text-secondary-container mt-1 group-hover:scale-110 transition-transform">check_circle</span>
                <div>
                  <div className="font-headline-sm text-headline-sm text-primary font-semibold">Khu vực chờ hạng thương gia</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">Thư giãn với wifi, cafe miễn phí trong lúc chờ xe.</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials - Infinite Marquee */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface overflow-hidden">
        <div className="text-center mb-16">
          <h2 className="font-headline-lg text-headline-lg text-primary font-bold animate-slide-up">Khách Hàng Nói Gì Về Chúng Tôi</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto mt-4 animate-slide-up delay-1">Hàng nghìn khách hàng đã trải nghiệm và hài lòng với dịch vụ tại AutoFix.</p>
        </div>
        
        <div className="testimonial-marquee-wrapper animate-fade-in delay-2">
          <div className="testimonial-marquee">
            {/* Duplicated Testimonials to create infinite scroll effect */}
            {[...Array(2)].map((_, groupIndex) => (
              <div key={groupIndex} className="flex gap-[24px]">
                {/* Testimonial 1 */}
                <div className="testimonial-card bg-surface-container-lowest p-8 rounded-2xl border border-surface-container-highest shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-[#F59E0B] text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                    <span className="material-symbols-outlined text-outline-variant/30 text-[40px] rotate-180 group-hover:text-primary/20 transition-colors">format_quote</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-8 leading-relaxed line-clamp-4">"Dịch vụ rất chuyên nghiệp. Các bạn kỹ thuật viên giải thích rõ ràng tình trạng xe trước khi làm. Phòng chờ siêu xịn, có cafe và wifi cực mạnh. Sẽ ủng hộ lâu dài."</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <img src="https://ui-avatars.com/api/?name=Anh+Tuan&background=0D8ABC&color=fff" alt="Anh Tuấn" className="w-12 h-12 rounded-full shadow-sm" />
                    <div>
                      <div className="font-label-md text-label-md text-primary font-bold">Anh Tuấn</div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">VinFast Lux SA2.0</div>
                    </div>
                  </div>
                </div>

                {/* Testimonial 2 */}
                <div className="testimonial-card bg-surface-container-lowest p-8 rounded-2xl border border-surface-container-highest shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-[#F59E0B] text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                    <span className="material-symbols-outlined text-outline-variant/30 text-[40px] rotate-180 group-hover:text-primary/20 transition-colors">format_quote</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-8 leading-relaxed line-clamp-4">"Mình mang xe qua sửa điều hòa, làm rất nhanh và mát sâu. Giá cả minh bạch, không phát sinh linh tinh. Kỹ thuật viên rất nhiệt tình hướng dẫn cách bảo quản xe."</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <img src="https://ui-avatars.com/api/?name=Chi+Mai&background=10B981&color=fff" alt="Chị Mai" className="w-12 h-12 rounded-full shadow-sm" />
                    <div>
                      <div className="font-label-md text-label-md text-primary font-bold">Chị Mai</div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">Mazda CX-5</div>
                    </div>
                  </div>
                </div>

                {/* Testimonial 3 */}
                <div className="testimonial-card bg-surface-container-lowest p-8 rounded-2xl border border-surface-container-highest shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-[#F59E0B] text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                    <span className="material-symbols-outlined text-outline-variant/30 text-[40px] rotate-180 group-hover:text-primary/20 transition-colors">format_quote</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-8 leading-relaxed line-clamp-4">"Chỗ bảo dưỡng ruột của tôi mấy năm nay. Luôn yên tâm giao xe. Kỹ thuật cứng, đồ đạc xịn sò chính hãng. Quan trọng nhất là chữ tín luôn được đặt lên hàng đầu."</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <img src="https://ui-avatars.com/api/?name=Chu+Hai&background=F59E0B&color=fff" alt="Chú Hải" className="w-12 h-12 rounded-full shadow-sm" />
                    <div>
                      <div className="font-label-md text-label-md text-primary font-bold">Chú Hải</div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">Toyota Camry</div>
                    </div>
                  </div>
                </div>

                {/* Testimonial 4 */}
                <div className="testimonial-card bg-surface-container-lowest p-8 rounded-2xl border border-surface-container-highest shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-[#F59E0B] text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                    <span className="material-symbols-outlined text-outline-variant/30 text-[40px] rotate-180 group-hover:text-primary/20 transition-colors">format_quote</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-8 leading-relaxed line-clamp-4">"Gói dọn nội thất và đánh bóng ở đây cực kỳ đỉnh. Lấy xe về mà tưởng như mới mua từ showroom. Cảm ơn AutoFix rất nhiều vì sự tỉ mỉ."</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <img src="https://ui-avatars.com/api/?name=Thanh+Dat&background=8B5CF6&color=fff" alt="Thành Đạt" className="w-12 h-12 rounded-full shadow-sm" />
                    <div>
                      <div className="font-label-md text-label-md text-primary font-bold">Thành Đạt</div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">Honda Civic</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
