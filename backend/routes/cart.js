const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { connectDb } = require('../db');

const router = express.Router();

// Tất cả route giỏ hàng đều yêu cầu đăng nhập
router.use(requireAuth);

// GET /api/cart — Xem giỏ hàng hiện tại
router.get('/', async (req, res) => {
  try {
    const db = await connectDb();
    const items = await db.all(`
      SELECT ci.product_id, ci.quantity, p.name, p.price, p.image, p.village_name, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC
    `, [req.user.userId]);

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({ success: true, data: items, total, count: items.length });
  } catch (err) {
    console.error('Cart GET error:', err);
    res.status(500).json({ success: false, error: 'Lỗi tải giỏ hàng' });
  }
});

// POST /api/cart/add — Thêm sản phẩm vào giỏ
router.post('/add', async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  if (!product_id) return res.status(400).json({ success: false, error: 'Thiếu product_id' });

  try {
    const db = await connectDb();

    // Kiểm tra sản phẩm tồn tại
    const product = await db.get('SELECT id, stock FROM products WHERE id = ?', [product_id]);
    if (!product) return res.status(404).json({ success: false, error: 'Sản phẩm không tồn tại' });

    // Kiểm tra tồn kho
    const existing = await db.get('SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?', [req.user.userId, product_id]);
    const newQty = (existing ? existing.quantity : 0) + quantity;

    if (newQty > product.stock) {
      return res.status(400).json({ success: false, error: `Chỉ còn ${product.stock} sản phẩm trong kho` });
    }

    // UPSERT: Thêm mới hoặc cộng dồn số lượng
    await db.run(`
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, product_id) DO UPDATE SET quantity = quantity + ?
    `, [req.user.userId, product_id, quantity, quantity]);

    // Trả về số lượng tổng trong giỏ
    const countResult = await db.get('SELECT COALESCE(SUM(quantity), 0) as count FROM cart_items WHERE user_id = ?', [req.user.userId]);

    res.json({ success: true, message: 'Đã thêm vào giỏ hàng', cartCount: countResult.count });
  } catch (err) {
    console.error('Cart ADD error:', err);
    res.status(500).json({ success: false, error: 'Lỗi thêm vào giỏ' });
  }
});

// PUT /api/cart/update — Cập nhật số lượng
router.put('/update', async (req, res) => {
  const { product_id, quantity } = req.body;
  if (!product_id || quantity == null) return res.status(400).json({ success: false, error: 'Thiếu thông tin' });

  try {
    const db = await connectDb();

    if (quantity <= 0) {
      // Xóa nếu quantity <= 0
      await db.run('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [req.user.userId, product_id]);
    } else {
      // Kiểm tra tồn kho
      const product = await db.get('SELECT stock FROM products WHERE id = ?', [product_id]);
      if (product && quantity > product.stock) {
        return res.status(400).json({ success: false, error: `Chỉ còn ${product.stock} sản phẩm trong kho` });
      }
      await db.run('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?', [quantity, req.user.userId, product_id]);
    }

    res.json({ success: true, message: 'Đã cập nhật giỏ hàng' });
  } catch (err) {
    console.error('Cart UPDATE error:', err);
    res.status(500).json({ success: false, error: 'Lỗi cập nhật giỏ' });
  }
});

// DELETE /api/cart/remove/:productId — Xóa sản phẩm khỏi giỏ
router.delete('/remove/:productId', async (req, res) => {
  try {
    const db = await connectDb();
    await db.run('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [req.user.userId, req.params.productId]);
    res.json({ success: true, message: 'Đã xóa khỏi giỏ hàng' });
  } catch (err) {
    console.error('Cart REMOVE error:', err);
    res.status(500).json({ success: false, error: 'Lỗi xóa sản phẩm' });
  }
});

// GET /api/cart/count — Lấy nhanh số lượng items trong giỏ
router.get('/count', async (req, res) => {
  try {
    const db = await connectDb();
    const result = await db.get('SELECT COALESCE(SUM(quantity), 0) as count FROM cart_items WHERE user_id = ?', [req.user.userId]);
    res.json({ success: true, count: result.count });
  } catch (err) {
    res.json({ success: true, count: 0 });
  }
});

module.exports = router;
