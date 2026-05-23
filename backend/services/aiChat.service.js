const OpenAI = require('openai');
const Service = require('../models/Service');

let openaiClient = null;

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
};

const buildServiceContext = async () => {
  const services = await Service.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(12)
    .lean();

  if (!services.length) {
    return 'Hien tai he thong chua co du lieu dich vu de tham chieu.';
  }

  return services.map((service, index) => {
    const price = new Intl.NumberFormat('vi-VN').format(service.price || 0);
    return [
      `${index + 1}. ${service.name}`,
      `- Nhom: ${service.category}`,
      `- Gia tham khao: ${price} VND`,
      `- Thoi gian: ${service.duration} phut`,
      `- Mo ta: ${service.description}`
    ].join('\n');
  }).join('\n');
};

const buildMessages = (history, message, serviceContext) => {
  const intro = [
    'Ban la tro ly AI cua AutoFix, mot website dat lich sua chua va bao duong o to.',
    'Hay tra loi bang tieng Viet, than thien, de hieu, uu tien su ro rang va thuc te.',
    'Nhiem vu cua ban:',
    '- Tu van khach hang ve cac dich vu sua chua, bao duong, kiem tra xe.',
    '- Goi y khi nao nen dat lich va nen chon dich vu nao dua tren mo ta su co.',
    '- Huong dan quy trinh dat lich tren website.',
    '- Neu cau hoi vuot qua pham vi chan doan tu xa, phai noi ro can kiem tra truc tiep tai gara.',
    '- Khong du doan qua muc ve cac loi an toan nghiem trong; hay khuyen khach dat lich neu co dau hieu bat thuong.',
    '- Chi cam ket cac thong tin co trong ngu canh duoc cung cap. Neu gia/chi tiet co the thay doi, hay noi la mang tinh tham khao.',
    '',
    'Thong tin du an AutoFix:',
    '- Khach hang co the xem dich vu, dat lich, xem lich su sua chua.',
    '- Ky thuat vien cap nhat trang thai: confirmed, in-progress, completed.',
    '- Quan tri vien quan ly dich vu, lich hen, khach hang, ky thuat vien va thong ke.',
    '- He thong co gui email thong bao lich hen cho khach hang.',
    '',
    'Danh sach dich vu dang co trong he thong:',
    serviceContext
  ].join('\n');

  const normalizedHistory = Array.isArray(history)
    ? history
      .filter((item) => item && typeof item.content === 'string' && typeof item.role === 'string')
      .slice(-8)
      .map((item) => ({
        role: item.role === 'assistant' ? 'assistant' : 'user',
        content: item.content.trim()
      }))
      .filter((item) => item.content)
    : [];

  return [
    { role: 'developer', content: intro },
    ...normalizedHistory,
    { role: 'user', content: message.trim() }
  ];
};

const buildFallbackReply = async (message) => {
  const lower = message.toLowerCase();
  const hasBrakeIssue = /(phanh|thang|keu kin|bo thang)/.test(lower);
  const hasEngineIssue = /(dong co|may|rung|chet may|bao loi dong co)/.test(lower);
  const hasOilIssue = /(nhot|dau may|bao duong dinh ky)/.test(lower);

  if (hasBrakeIssue) {
    return 'Nếu xe có dấu hiệu liên quan đến phanh, bạn nên đặt lịch kiểm tra sớm vì đây là nhóm lỗi ảnh hưởng trực tiếp đến an toàn. Bạn có thể vào mục "Đặt lịch hẹn", chọn dịch vụ kiểm tra hoặc sửa chữa phù hợp và ghi rõ tiếng kêu, độ rung hoặc tình trạng má phanh để gara tư vấn kỹ hơn.';
  }

  if (hasEngineIssue) {
    return 'Với dấu hiệu liên quan đến động cơ như rung, yếu máy hoặc đèn báo lỗi, bạn nên đặt lịch kiểm tra sớm để kỹ thuật viên chẩn đoán trực tiếp. Trên website AutoPro, bạn có thể chọn một dịch vụ sửa chữa hoặc kiểm tra, sau đó điền thêm ghi chú mô tả triệu chứng để xưởng chuẩn bị trước.';
  }

  if (hasOilIssue) {
    return 'Nếu bạn đang cần bảo dưỡng định kỳ hoặc thay nhớt, AutoPro có nhóm dịch vụ bảo dưỡng để khách hàng đặt lịch trước. Bạn nên ghi thêm hãng xe, dòng xe, năm sản xuất và tình trạng hiện tại để hệ thống lưu đầy đủ thông tin cho kỹ thuật viên.';
  }

  return 'Mình có thể tư vấn về dịch vụ sửa chữa, bảo dưỡng, cách đặt lịch và các dấu hiệu bất thường của xe. Hiện tính năng AI chưa được cấu hình API key trên máy chủ, nên bạn có thể đặt câu hỏi cụ thể hơn về tình trạng xe để mình hướng dẫn theo quy trình chung của AutoPro.';
};

const createChatReply = async ({ message, history }) => {
  const client = getOpenAIClient();

  if (!client) {
    return buildFallbackReply(message);
  }

  const serviceContext = await buildServiceContext();
  const input = buildMessages(history, message, serviceContext);

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || 'gpt-5.4-mini',
    reasoning: { effort: 'low' },
    max_output_tokens: 500,
    input
  });

  return (response.output_text || '').trim();
};

module.exports = { createChatReply };
