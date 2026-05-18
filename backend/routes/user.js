const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { connectDb } = require('../db');
const { decryptAES, maskEmail } = require('../utils/crypto');

const router = express.Router();

// Lấy thông tin user hiện tại (Yêu cầu phải có token)
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const db = await connectDb();
    const user = await db.get('SELECT id, name, email_encrypted, provider, created_at FROM users WHERE id = ?', [req.user.userId]);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User không tồn tại' });
    }

    // Giải mã và Data Masking
    const decryptedEmail = decryptAES(user.email_encrypted);
    user.email = maskEmail(decryptedEmail);
    delete user.email_encrypted; // Ẩn chuỗi mã hóa khỏi response

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

module.exports = router;
