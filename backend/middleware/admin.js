const { connectDb } = require('../db');

/**
 * Middleware kiểm tra quyền Admin.
 * Phải dùng SAU middleware requireAuth (đã có req.user.userId).
 */
async function requireAdmin(req, res, next) {
  try {
    const db = await connectDb();
    const user = await db.get('SELECT role FROM users WHERE id = ?', [req.user.userId]);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Bạn không có quyền truy cập chức năng này.' });
    }

    next();
  } catch (err) {
    console.error('Admin middleware error:', err);
    res.status(500).json({ success: false, error: 'Lỗi kiểm tra quyền' });
  }
}

module.exports = { requireAdmin };
