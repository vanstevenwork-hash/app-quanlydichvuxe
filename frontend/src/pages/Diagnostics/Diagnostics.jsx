import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiAPI } from '../../api';
import './Diagnostics.css';

const commonIssues = [
  { label: 'Động cơ kêu to', icon: 'volume_up' },
  { label: 'Rung vô lăng', icon: 'vibration' },
  { label: 'Phanh không ăn', icon: 'warning' },
  { label: 'Nhả khói đen', icon: 'cloud' },
  { label: 'Đèn Check Engine sáng', icon: 'engine' },
  { label: 'Đề khó nổ', icon: 'power_settings_new' },
];

const Diagnostics = () => {
  const [symptom, setSymptom] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();

  const handleSuggestClick = (issue) => {
    setSymptom((prev) => prev ? `${prev}, ${issue}` : issue);
  };

  const handleDiagnose = async () => {
    if (!symptom.trim()) return;
    setLoading(true);
    setResult(null);
    setHasError(false);

    try {
      const response = await aiAPI.chat({
        message: `Tôi đang gặp vấn đề với xe: ${symptom}. Hãy chẩn đoán tình trạng và đưa ra lời khuyên sửa chữa, dịch vụ phù hợp.`,
        history: [] // Không cần truyền lịch sử cho chẩn đoán 1 lần
      });
      setResult(response.data.reply);
    } catch (err) {
      console.error(err);
      setHasError(true);
      setResult('Rất tiếc, hệ thống chẩn đoán đang bận hoặc gặp lỗi. Vui lòng đặt lịch kiểm tra trực tiếp để kỹ thuật viên xem xét.');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    navigate('/booking');
  };

  // Hàm chuyển text xuống dòng thành các đoạn văn
  const formatResult = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        <br />
      </span>
    ));
  };

  return (
    <div className="diagnostics-page flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">
      
      {/* Hero Section */}
      <div className="diagnostics-hero bg-surface-container-lowest rounded-2xl p-8 md:p-12 mb-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="diagnostics-content max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-[12px] uppercase tracking-wider mb-4 font-bold border border-secondary/20">
            <span className="material-symbols-outlined text-[16px] text-secondary">smart_toy</span>
            AI Assistant
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-headline-lg font-bold text-primary mb-4 tracking-tight leading-tight">
            Chẩn đoán thông minh <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-tertiary">
              Tình trạng xe của bạn
            </span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            Mô tả các dấu hiệu bất thường bạn đang gặp phải, trợ lý ảo AI của AutoFix sẽ phân tích và đưa ra lời khuyên bảo dưỡng, sửa chữa phù hợp ngay lập tức.
          </p>
        </div>
        <div className="hidden md:flex flex-shrink-0 w-48 h-48 bg-surface-container rounded-full items-center justify-center border-8 border-background shadow-inner relative overflow-hidden">
          <span className="material-symbols-outlined text-[80px] text-secondary opacity-80" style={{ fontVariationSettings: "'FILL' 1" }}>troubleshoot</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Area */}
        <div className="col-span-1 lg:col-span-5 space-y-6">
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
            <h2 className="font-headline-sm text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">edit_note</span>
              Mô tả triệu chứng
            </h2>
            
            <textarea
              className="w-full rounded-xl border border-outline-variant/50 px-4 py-3 bg-surface-container-low focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none resize-none text-sm font-medium leading-relaxed mb-4 transition-all"
              rows={5}
              placeholder="Ví dụ: Xe kêu cọt kẹt khi đạp phanh ở tốc độ chậm..."
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
            />

            <div className="mb-6">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Hoặc chọn gợi ý nhanh:</p>
              <div className="flex flex-wrap gap-2">
                {commonIssues.map((issue, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestClick(issue.label)}
                    className="suggestion-chip inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant/50 bg-surface-container text-on-surface hover:border-secondary hover:text-secondary text-xs font-medium cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">{issue.icon}</span>
                    {issue.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleDiagnose}
              disabled={loading || !symptom.trim()}
              className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold flex justify-center items-center gap-2 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                  Đang phân tích...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                  Nhận chẩn đoán AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result Area */}
        <div className="col-span-1 lg:col-span-7">
          <div className="h-full bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant/30 shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex flex-col min-h-[400px]">
            <h2 className="font-headline-sm text-lg font-bold text-on-surface mb-6 flex items-center gap-2 border-b border-outline-variant/20 pb-4">
              <span className="material-symbols-outlined text-tertiary">query_stats</span>
              Kết quả chẩn đoán
            </h2>
            
            <div className="flex-grow flex flex-col">
              {!loading && !result && (
                <div className="m-auto flex flex-col items-center justify-center text-on-surface-variant opacity-60">
                  <span className="material-symbols-outlined text-6xl mb-4 font-light">neurology</span>
                  <p className="text-center text-sm font-medium">Nhập tình trạng xe của bạn và nhấn nút "Nhận chẩn đoán AI" <br/>để xem kết quả tại đây.</p>
                </div>
              )}

              {loading && (
                <div className="m-auto flex flex-col items-center justify-center">
                  <div className="typing-indicator flex gap-1 mb-4">
                    <span></span><span></span><span></span>
                  </div>
                  <p className="text-sm font-medium text-secondary animate-pulse">AI đang phân tích dữ liệu...</p>
                </div>
              )}

              {result && !loading && (
                <div className="diagnosis-result-box flex flex-col h-full">
                  <div className={`p-5 rounded-xl border ${hasError ? 'bg-error-container/30 border-error/20 text-error' : 'bg-surface-container border-outline-variant/20 text-on-surface'} leading-relaxed font-body-md text-sm mb-6 flex-grow overflow-y-auto custom-scrollbar`}>
                    <div className="flex gap-3 items-start mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${hasError ? 'bg-error/10 text-error' : 'bg-secondary/10 text-secondary'}`}>
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {hasError ? 'warning' : 'robot_2'}
                        </span>
                      </div>
                      <div className="pt-1">
                        {formatResult(result)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-on-surface-variant font-medium">
                      *Lưu ý: Chẩn đoán AI chỉ mang tính tham khảo. Hãy mang xe đến xưởng để được kiểm tra chính xác.
                    </p>
                    <button 
                      onClick={handleBooking}
                      className="whitespace-nowrap px-6 py-3 bg-secondary text-on-secondary rounded-xl font-bold font-label-md text-sm flex items-center gap-2 hover:bg-secondary/90 transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
                      Đặt lịch ngay
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnostics;
