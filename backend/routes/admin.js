const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { connectDb } = require('../db');
const { decryptAES, maskEmail } = require('../utils/crypto');

const router = express.Router();

// Tất cả route admin đều yêu cầu: Đăng nhập + Quyền Admin
router.use(requireAuth);
router.use(requireAdmin);

// ══════════════════════════════════════════
// GET /api/admin/dashboard — Thống kê tổng quan
// ══════════════════════════════════════════
router.get('/dashboard', async (req, res) => {
  try {
    const db = await connectDb();

    const totalRevenue = await db.get(`SELECT COALESCE(SUM(total_price), 0) as total FROM orders WHERE status != 'cancelled'`);
    const totalOrders = await db.get('SELECT COUNT(*) as count FROM orders');
    const pendingOrders = await db.get(`SELECT COUNT(*) as count FROM orders WHERE status = 'pending'`);
    const totalProducts = await db.get('SELECT COUNT(*) as count FROM products');
    const totalUsers = await db.get('SELECT COUNT(*) as count FROM users');

    // Đơn hàng gần đây (5 đơn mới nhất)
    const recentOrders = await db.all(`
      SELECT id, customer_name, total_price, status, created_at
      FROM orders ORDER BY created_at DESC LIMIT 5
    `);

    // Sản phẩm bán chạy nhất (top 5)
    const topProducts = await db.all(`
      SELECT oi.product_name, SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.unit_price) as revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY oi.product_id
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue.total,
        totalOrders: totalOrders.count,
        pendingOrders: pendingOrders.count,
        totalProducts: totalProducts.count,
        totalUsers: totalUsers.count,
        recentOrders,
        topProducts
      }
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, error: 'Lỗi tải dashboard' });
  }
});

// ══════════════════════════════════════════
// GET /api/admin/orders — Danh sách tất cả đơn hàng
// ══════════════════════════════════════════
router.get('/orders', async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const db = await connectDb();

    let query = 'SELECT * FROM orders';
    let countQuery = 'SELECT COUNT(*) as total FROM orders';
    const params = [];
    const countParams = [];

    if (status && status !== 'all') {
      query += ' WHERE status = ?';
      countQuery += ' WHERE status = ?';
      params.push(status);
      countParams.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const orders = await db.all(query, params);
    const totalResult = await db.get(countQuery, countParams);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total: totalResult.total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalResult.total / limit)
      }
    });
  } catch (err) {
    console.error('Admin orders error:', err);
    res.status(500).json({ success: false, error: 'Lỗi tải đơn hàng' });
  }
});

// ══════════════════════════════════════════
// GET /api/admin/orders/:id — Chi tiết đơn hàng
// ══════════════════════════════════════════
router.get('/orders/:id', async (req, res) => {
  try {
    const db = await connectDb();
    const order = await db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);

    if (!order) return res.status(404).json({ success: false, error: 'Đơn hàng không tồn tại' });

    const items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);

    res.json({ success: true, data: { ...order, items } });
  } catch (err) {
    console.error('Admin order detail error:', err);
    res.status(500).json({ success: false, error: 'Lỗi tải chi tiết đơn' });
  }
});

// ══════════════════════════════════════════
// PUT /api/admin/orders/:id/status — Cập nhật trạng thái đơn
// ══════════════════════════════════════════
router.put('/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'shipping', 'done', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'Trạng thái không hợp lệ. Chấp nhận: ' + validStatuses.join(', ') });
  }

  try {
    const db = await connectDb();

    // Nếu hủy đơn → hoàn lại tồn kho
    if (status === 'cancelled') {
      const order = await db.get('SELECT status FROM orders WHERE id = ?', [req.params.id]);
      if (order && order.status !== 'cancelled') {
        const items = await db.all('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [req.params.id]);
        for (const item of items) {
          await db.run('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
        }
      }
    }

    await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: 'Đã cập nhật trạng thái đơn hàng' });
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ success: false, error: 'Lỗi cập nhật trạng thái' });
  }
});

// ══════════════════════════════════════════
// GET /api/admin/products — Danh sách sản phẩm
// ══════════════════════════════════════════
router.get('/products', async (req, res) => {
  try {
    const db = await connectDb();
    const products = await db.all('SELECT * FROM products ORDER BY village_name, name');
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Lỗi tải sản phẩm' });
  }
});

// ══════════════════════════════════════════
// PUT /api/admin/products/:id — Sửa sản phẩm
// ══════════════════════════════════════════
router.put('/products/:id', async (req, res) => {
  const { price, stock, description } = req.body;

  try {
    const db = await connectDb();
    const updates = [];
    const params = [];

    if (price != null) { updates.push('price = ?'); params.push(price); }
    if (stock != null) { updates.push('stock = ?'); params.push(stock); }
    if (description != null) { updates.push('description = ?'); params.push(description); }

    if (updates.length === 0) return res.status(400).json({ success: false, error: 'Không có dữ liệu để cập nhật' });

    params.push(req.params.id);
    await db.run(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, params);

    res.json({ success: true, message: 'Đã cập nhật sản phẩm' });
  } catch (err) {
    console.error('Product update error:', err);
    res.status(500).json({ success: false, error: 'Lỗi cập nhật sản phẩm' });
  }
});

// ══════════════════════════════════════════
// GET /api/admin/users — Danh sách users (di chuyển từ server.js)
// ══════════════════════════════════════════
router.get('/users', async (req, res) => {
  try {
    const db = await connectDb();
    const users = await db.all('SELECT id, name, email_encrypted, provider, role, created_at FROM users ORDER BY created_at DESC');

    const maskedUsers = users.map(u => {
      const decryptedEmail = decryptAES(u.email_encrypted);
      return {
        ...u,
        email: maskEmail(decryptedEmail),
        email_encrypted: undefined
      };
    });

    res.json({ success: true, count: maskedUsers.length, data: maskedUsers });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Lỗi truy xuất cơ sở dữ liệu' });
  }
});

module.exports = router;
