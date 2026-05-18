const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Chưa xác thực Access Token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded; // Lưu thông tin user (id, name, email) vào request
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'Access Token không hợp lệ hoặc đã hết hạn' });
  }
}

module.exports = { requireAuth };
