import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiAPI } from '../api';
import './AIChatbox.css';

const quickPrompts = [
  'Xe của tôi bị kêu khi phanh, nên kiểm tra gì?',
  'Bao dưỡng định kỳ gồm những gì?',
  'Tư vấn giúp tôi dịch vụ phù hợp cho xe bị rung máy.',
];

const initialMessage = {
  role: 'assistant',
  content: 'Xin chào, mình là trợ lý AI của AutoPro. Mình có thể tư vấn dịch vụ, giải thích tình trạng xe cơ bản và hướng dẫn bạn đặt lịch sửa chữa.'
};

const AIChatbox = () => {
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([initialMessage]);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async (text) => {
    const content = text.trim();
    if (!content || isLoading) return;

    const nextMessages = [...messages, { role: 'user', content }];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const history = nextMessages
        .slice(-10)
        .map((item) => ({ role: item.role, content: item.content }));

      const res = await aiAPI.chat({ message: content, history });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.data.reply || 'Mình chưa có phản hồi phù hợp. Bạn thử mô tả chi tiết hơn nhé.'
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: error.response?.data?.message || 'Chatbox đang bận một chút. Bạn thử lại sau giúp mình nhé.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendMessage(input);
  };

  return (
    <>
      {isOpen && (
        <div className="ai-chatbox-panel">
          <div className="ai-chatbox-header">
            <div>
              <h3>AI Tư Vấn AutoPro</h3>
              <p>Hỏi về dịch vụ, dấu hiệu hỏng xe và cách đặt lịch.</p>
            </div>
            <button type="button" className="ai-chatbox-close" onClick={() => setIsOpen(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="ai-chatbox-body">
            <div className="ai-chatbox-quick-actions">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="ai-chatbox-chip"
                  onClick={() => sendMessage(prompt)}
                  disabled={isLoading}
                >
                  {prompt}
                </button>
              ))}
              <button
                type="button"
                className="ai-chatbox-chip ai-chatbox-chip-secondary"
                onClick={() => navigate('/booking')}
              >
                Đi tới trang đặt lịch
              </button>
            </div>

            <div className="ai-chatbox-messages">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`ai-chatbox-message ${message.role === 'user' ? 'is-user' : 'is-assistant'}`}
                >
                  {message.content}
                </div>
              ))}
              {isLoading && (
                <div className="ai-chatbox-message is-assistant is-loading">
                  AI đang soạn câu trả lời...
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          <form className="ai-chatbox-form" onSubmit={handleSubmit}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ví dụ: Xe bị rung khi nổ máy thì nên kiểm tra gì?"
              rows={2}
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              Gửi
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="ai-chatbox-fab"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Mở AI chatbox tư vấn"
      >
        <span className="material-symbols-outlined">
          {isOpen ? 'forum' : 'smart_toy'}
        </span>
        <span>AI Tư vấn</span>
      </button>
    </>
  );
};

export default AIChatbox;
