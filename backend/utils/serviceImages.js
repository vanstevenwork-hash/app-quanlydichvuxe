const serviceImageRules = [
  { pattern: /phanh|lốp|lop|cân bằng|can bang/i, image: '/image/service-photo-1.png' },
  { pattern: /động cơ|dong co|hộp số|hop so|ly hợp|ly hop|côn/i, image: '/image/service-photo-2.png' },
  { pattern: /điều hòa|dieu hoa|ắc quy|ac quy/i, image: '/image/service-photo-3.png' },
  { pattern: /obd|chẩn đoán|chan doan|tổng quát|tong quat|sơn|son|đánh bóng|danh bong/i, image: '/image/service-photo-4.png' }
];

const categoryFallbacks = {
  'bao-duong': '/image/service-photo-1.png',
  'sua-chua': '/image/service-photo-2.png',
  'kiem-tra': '/image/service-photo-4.png',
  'thay-the': '/image/service-photo-3.png'
};

const getServiceImage = (service) => {
  if (service.image) return service.image;

  const matchedRule = serviceImageRules.find((rule) => rule.pattern.test(service.name || ''));
  return matchedRule?.image || categoryFallbacks[service.category] || '/image/service-photo-1.png';
};

const withServiceImage = (service) => {
  const data = typeof service.toObject === 'function' ? service.toObject() : service;
  return { ...data, image: getServiceImage(data) };
};

module.exports = {
  getServiceImage,
  withServiceImage
};
