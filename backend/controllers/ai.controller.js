const { createChatReply } = require('../services/aiChat.service');

exports.chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'Nội dung câu hỏi không được để trống' });
    }

    const reply = await createChatReply({ message, history });

    res.json({
      reply: reply || 'Xin lỗi, mình chưa thể phản hồi lúc này. Bạn vui lòng thử lại sau ít phút.'
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      message: 'Không thể xử lý yêu cầu AI lúc này',
      error: error.message
    });
  }
};
