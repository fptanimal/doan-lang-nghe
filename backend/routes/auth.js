const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { OAuth2Client } = require('google-auth-library');
const { connectDb } = require('../db');
const { encryptAES, hashBlindIndex } = require('../utils/crypto');
const { sendOtpEmail } = require('../utils/mailer');

const router = express.Router();
const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  BASE_URL + '/api/auth/google/callback'
);

// -- SCHEMAS --
const registerSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự')
});

// Helper sinh Token
function generateTokens(user, res) {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, name: user.name },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
  });

  return accessToken;
}

// -- ĐĂNG KÝ (BƯỚC 1: GỬI OTP) --
router.post('/register', async (req, res) => {
  try {
    const { email } = registerSchema.parse(req.body); // Vẫn validate qua schema
    const db = await connectDb();

    // 1. Kiểm tra user đã tồn tại chưa
    const email_hash = hashBlindIndex(email);
    const existingUser = await db.get('SELECT id FROM users WHERE email_hash = ?', [email_hash]);
    if (existingUser) return res.status(400).json({ success: false, error: 'Email đã được sử dụng' });

    // 2. Tạo mã OTP ngẫu nhiên 6 số
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 3. Tính thời gian hết hạn (5 phút sau)
    const expiresAt = new Date(Date.now() + 5 * 60000).toISOString();

    // 4. Lưu OTP vào bảng tạm (UPSERT để ghi đè nếu spam gửi lại)
    await db.run(
      `INSERT INTO otps (email_hash, otp_code, expires_at) 
       VALUES (?, ?, ?) 
       ON CONFLICT(email_hash) DO UPDATE SET otp_code = excluded.otp_code, expires_at = excluded.expires_at`,
      [email_hash, otpCode, expiresAt]
    );

    // 5. Gửi thư
    const emailSent = await sendOtpEmail(email, otpCode);
    if (!emailSent) {
      return res.status(500).json({ success: false, error: 'Không thể gửi email lúc này. Vui lòng thử lại.' });
    }
    
    // 6. Trả về cờ requireOtp để Frontend biết chuyển sang màn hình nhập mã
    res.json({ success: true, requireOtp: true, message: 'Vui lòng kiểm tra hộp thư email của bạn' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.errors ? error.errors[0].message : 'Dữ liệu không hợp lệ' });
  }
});

// -- ĐĂNG KÝ (BƯỚC 2: XÁC MINH OTP VÀ TẠO TÀI KHOẢN) --
router.post('/verify-otp', async (req, res) => {
  const { name, email, password, otp } = req.body;
  if (!otp || otp.length !== 6) return res.status(400).json({ success: false, error: 'Mã OTP không hợp lệ' });

  try {
    const db = await connectDb();
    const email_hash = hashBlindIndex(email);

    // 1. Kiểm tra OTP
    const otpRecord = await db.get(
      'SELECT * FROM otps WHERE email_hash = ? AND otp_code = ? AND expires_at > CURRENT_TIMESTAMP', 
      [email_hash, otp]
    );

    if (!otpRecord) {
      return res.status(400).json({ success: false, error: 'Mã OTP sai hoặc đã hết hạn' });
    }

    // 2. Xóa OTP (đã dùng xong)
    await db.run('DELETE FROM otps WHERE email_hash = ?', [email_hash]);

    // 3. Khởi tạo tài khoản
    const email_encrypted = encryptAES(email);
    const password_hash = await bcrypt.hash(password, 12);
    const id = 'u_' + Date.now();
    
    let role = 'customer';
    if (process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()) {
      role = 'admin';
    }
    
    await db.run(
      'INSERT INTO users (id, name, email_hash, email_encrypted, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, email_hash, email_encrypted, password_hash, role]
    );
    
    res.json({ success: true, message: 'Xác thực và tạo tài khoản thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
  }
});

// -- ĐĂNG NHẬP --
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const db = await connectDb();
  
  // Dùng Blind Index để tìm kiếm chính xác mà không cần giải mã
  const email_hash = hashBlindIndex(email);
  const user = await db.get('SELECT * FROM users WHERE email_hash = ?', [email_hash]);
  
  if (!user || !user.password_hash) {
    return res.status(401).json({ success: false, error: 'Sai email hoặc mật khẩu' });
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ success: false, error: 'Sai email hoặc mật khẩu' });
  }

  // user.email lúc này không còn tồn tại dạng plaintext, truyền thẳng email khách hàng vừa nhập vào token
  user.email = email; 

  if (process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase() && user.role !== 'admin') {
    await db.run('UPDATE users SET role = ? WHERE id = ?', ['admin', user.id]);
    user.role = 'admin';
  }

  const accessToken = generateTokens(user, res);
  res.json({ success: true, message: 'Đăng nhập thành công', accessToken, user: { id: user.id, name: user.name, email: user.email } });
});

// -- REFRESH TOKEN --
router.post('/refresh', async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ success: false, error: 'Chưa đăng nhập' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const db = await connectDb();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [decoded.userId]);
    
    if (!user) throw new Error();

    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );
    res.json({ success: true, accessToken: newAccessToken });
  } catch {
    res.status(401).json({ success: false, error: 'Session hết hạn, vui lòng đăng nhập lại' });
  }
});

// -- ĐĂNG XUẤT --
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
  res.json({ success: true, message: 'Đã đăng xuất' });
});

// ================= GOOGLE OAUTH =================

// Bước 1: Trả về URL để Frontend redirect tới Google
router.get('/google/url', (req, res) => {
  const url = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
  });
  res.json({ url });
});

// Bước 2: Nhận code từ Google trả về và lấy thông tin user
router.get('/google/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.redirect('/login.html?error=no_code');

  try {
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    // Lấy thông tin user
    const { data } = await googleClient.request({ url: 'https://www.googleapis.com/oauth2/v2/userinfo' });
    
    const db = await connectDb();
    
    // Tìm kiếm bằng Blind Index
    const email_hash = hashBlindIndex(data.email);
    let user = await db.get('SELECT * FROM users WHERE email_hash = ?', [email_hash]);
    
    if (!user) {
      // Đăng ký tự động
      const id = 'u_gg_' + Date.now();
      const email_encrypted = encryptAES(data.email);
      
      let role = 'customer';
      if (process.env.ADMIN_EMAIL && data.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()) {
        role = 'admin';
      }

      await db.run(
        'INSERT INTO users (id, name, email_hash, email_encrypted, provider, role) VALUES (?, ?, ?, ?, ?, ?)',
        [id, data.name, email_hash, email_encrypted, 'google', role]
      );
      user = { id, name: data.name, email: data.email, role };
    } else {
      user.email = data.email;
      if (process.env.ADMIN_EMAIL && data.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase() && user.role !== 'admin') {
        await db.run('UPDATE users SET role = ? WHERE id = ?', ['admin', user.id]);
        user.role = 'admin';
      }
    }

    // Tạo JWT
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Truyền Access Token về Frontend qua URL Hash để JS frontend bắt lấy
    res.redirect(`/login.html#token=${accessToken}&name=${encodeURIComponent(user.name)}`);

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.redirect('/login.html?error=google_auth_failed');
  }
});

module.exports = router;
