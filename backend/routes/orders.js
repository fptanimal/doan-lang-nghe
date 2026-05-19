const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { connectDb } = require('../db');

const router = express.Router();

// Tất cả route đơn hàng đều yêu cầu đăng nhập
router.use(requireAuth);

// POST /api/orders/checkout — Tạo đơn hàng từ giỏ hàng
router.post('/checkout', async (req, res) => {
  const { name, phone, address, note } = req.body;

  // Validate
  if (!name || !phone || !address) {
    return res.status(400).json({ success: false, error: 'Vui lòng điền đầy đủ Họ tên, SĐT và Địa chỉ' });
  }

  const db = await connectDb();

  try {
    // 1. Lấy giỏ hàng hiện tại
    const cartItems = await db.all(`
      SELECT ci.product_id, ci.quantity, p.name as product_name, p.price, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `, [req.user.userId]);

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, error: 'Giỏ hàng trống, không thể đặt hàng' });
    }

    // 2. Kiểm tra tồn kho từng sản phẩm
    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        return res.status(400).json({
          success: false,
          error: `Sản phẩm "${item.product_name}" chỉ còn ${item.stock} trong kho, bạn đang đặt ${item.quantity}`
        });
      }
    }

    // 3. Bắt đầu Transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // 4. Tạo đơn hàng
      const orderId = 'ORD_' + Date.now();
      const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      await db.run(`
        INSERT INTO orders (id, user_id, customer_name, customer_phone, customer_address, total_price, note)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [orderId, req.user.userId, name, phone, address, totalPrice, note || '']);

      // 5. Tạo chi tiết đơn hàng + Trừ tồn kho
      for (const item of cartItems) {
        await db.run(`
          INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
          VALUES (?, ?, ?, ?, ?)
        `, [orderId, item.product_id, item.product_name, item.quantity, item.price]);

        // Trừ stock
        await db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
      }

      // 6. Xóa giỏ hàng
      await db.run('DELETE FROM cart_items WHERE user_id = ?', [req.user.userId]);

      // 7. Commit
      await db.run('COMMIT');

      res.json({
        success: true,
        message: 'Đặt hàng thành công!',
        orderId,
        total: totalPrice
      });

    } catch (txErr) {
      // Rollback nếu bất kỳ bước nào lỗi
      await db.run('ROLLBACK');
      throw txErr;
    }

  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ success: false, error: 'Lỗi hệ thống khi đặt hàng. Vui lòng thử lại.' });
  }
});

// GET /api/orders/my — Lịch sử đơn hàng của user hiện tại
router.get('/my', async (req, res) => {
  try {
    const db = await connectDb();
    const orders = await db.all(`
      SELECT id, customer_name, total_price, status, created_at
      FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [req.user.userId]);

    res.json({ success: true, data: orders });
  } catch (err) {
    console.error('Orders list error:', err);
    res.status(500).json({ success: false, error: 'Lỗi tải lịch sử đơn hàng' });
  }
});

// GET /api/orders/:id — Chi tiết 1 đơn hàng (IDOR protection)
router.get('/:id', async (req, res) => {
  try {
    const db = await connectDb();

    // Kiểm tra ownership — chống IDOR
    const order = await db.get(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (!order) {
      return res.status(404).json({ success: false, error: 'Đơn hàng không tồn tại hoặc không thuộc về bạn' });
    }

    // Lấy danh sách sản phẩm trong đơn
    const items = await db.all(
      'SELECT * FROM order_items WHERE order_id = ?',
      [req.params.id]
    );

    res.json({ success: true, data: { ...order, items } });
  } catch (err) {
    console.error('Order detail error:', err);
    res.status(500).json({ success: false, error: 'Lỗi tải chi tiết đơn hàng' });
  }
});

module.exports = router;
