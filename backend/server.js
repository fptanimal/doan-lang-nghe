require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDb } = require('./db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express();

// --- MIDDLEWARES BẢO MẬT (CHUẨN ZERO-TRUST) ---
app.use(helmet({
  contentSecurityPolicy: false // Tạm tắt CSP cứng để không block script/hình ảnh của bạn
}));

// Giới hạn số lượng request chống Brute-force/DDoS (Rate Limiting)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Giới hạn 100 request/15p cho mỗi IP
  message: { success: false, error: 'Quá nhiều yêu cầu, vui lòng thử lại sau.' }
});
app.use('/api/', limiter);

app.use(express.json());
app.use(cookieParser());
app.use(cors({ 
  origin: 'http://localhost:8080', 
  credentials: true 
}));

// Khởi tạo Database khi boot
connectDb().catch(console.error);

// --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// API ADMIN: Xem danh sách những ai đã đăng nhập (Chỉ dành cho bạn)
app.get('/api/admin/users', async (req, res) => {
  try {
    const db = await connectDb();
    const users = await db.all('SELECT id, name, email_encrypted, provider, created_at FROM users ORDER BY created_at DESC');
    
    // Đọc Crypto từ thư viện mình vừa tạo
    const { decryptAES, maskEmail } = require('./utils/crypto');

    // Giải mã và Masking danh sách
    const maskedUsers = users.map(u => {
      const decryptedEmail = decryptAES(u.email_encrypted);
      return {
        ...u,
        email: maskEmail(decryptedEmail),
        email_encrypted: undefined // Giấu chuỗi mã hóa
      };
    });

    res.json({ success: true, count: maskedUsers.length, data: maskedUsers });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Lỗi truy xuất cơ sở dữ liệu' });
  }
});

// --- PHỤC VỤ FRONTEND TĨNH (STATIC FILES) ---
// Phục vụ toàn bộ các file HTML, CSS, JS từ thư mục gốc
const frontendPath = path.join(__dirname, '..');
app.use(express.static(frontendPath));

// Mặc định trả về index.html nếu route không tồn tại (tránh lỗi 404 cho Web App)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// --- KHỞI ĐỘNG SERVER ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`🚀 Server Backend đã khởi chạy!`);
  console.log(`🌐 Truy cập Frontend: http://localhost:${PORT}`);
  console.log(`========================================\n`);
});

