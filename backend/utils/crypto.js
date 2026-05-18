const crypto = require('crypto');

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // Phải là 32 bytes (64 ký tự hex)
const BLIND_INDEX_KEY = process.env.BLIND_INDEX_KEY; 
const ALGORITHM = 'aes-256-cbc';

// 1. Mã hóa PII (Email) bằng AES-256
function encryptAES(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  // Trả về định dạng iv:encryptedData để giải mã sau này
  return iv.toString('hex') + ':' + encrypted;
}

// 2. Giải mã dữ liệu PII
function decryptAES(text) {
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption error:', err);
    return null;
  }
}

// 3. Blind Index: Băm email để so sánh (không thể dịch ngược)
function hashBlindIndex(text) {
  return crypto.createHmac('sha256', BLIND_INDEX_KEY).update(text).digest('hex');
}

// 4. Data Masking: Che giấu thông tin
function maskEmail(email) {
  if (!email) return '***';
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  
  const name = parts[0];
  const domain = parts[1];
  
  if (name.length <= 2) {
    return name[0] + '***@' + domain;
  }
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1] + '@' + domain;
}

module.exports = {
  encryptAES,
  decryptAES,
  hashBlindIndex,
  maskEmail
};
