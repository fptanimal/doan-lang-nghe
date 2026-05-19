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
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

const app = express();

// --- MIDDLEWARES BẢO MẬT (CHUẨN ZERO-TRUST) ---
app.use(helmet({
  contentSecurityPolicy: false // Tạm tắt CSP cứng để không block script/hình ảnh của bạn
}));

// Giới hạn số lượng request chống Brute-force/DDoS (Rate Limiting)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 200, // Tăng lên 200 vì có thêm nhiều API mới
  message: { success: false, error: 'Quá nhiều yêu cầu, vui lòng thử lại sau.' }
});
app.use('/api/', limiter);

app.use(express.json());
app.use(cookieParser());
app.use(cors({ 
  origin: process.env.BASE_URL || 'http://localhost:8080', 
  credentials: true 
}));

// Khởi tạo Database khi boot
connectDb().then(async (db) => {
  await seedProducts(db);
}).catch(console.error);

// --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// --- API PUBLIC: Lấy sản phẩm (không cần đăng nhập) ---
app.get('/api/products', async (req, res) => {
  try {
    const db = await connectDb();
    const { village_id } = req.query;
    
    let query = 'SELECT * FROM products WHERE stock > 0';
    const params = [];
    
    if (village_id) {
      query += ' AND village_id = ?';
      params.push(parseInt(village_id));
    }
    
    query += ' ORDER BY village_name, name';
    const products = await db.all(query, params);
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Lỗi tải sản phẩm' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const db = await connectDb();
    const product = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) return res.status(404).json({ success: false, error: 'Sản phẩm không tồn tại' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Lỗi tải sản phẩm' });
  }
});

// --- PHỤC VỤ FRONTEND TĨNH (STATIC FILES) ---
const frontendPath = path.join(__dirname, '..');
app.use(express.static(frontendPath));

// Mặc định trả về index.html nếu route không tồn tại
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// --- SEED DATA: Import sản phẩm từ data.js vào DB ---
async function seedProducts(db) {
  const count = await db.get('SELECT COUNT(*) as c FROM products');
  if (count.c > 0) {
    console.log(`📦 Đã có ${count.c} sản phẩm trong DB`);
    return;
  }

  console.log('🌱 Đang seed sản phẩm từ data.js...');

  // Đọc file data.js và eval VILLAGES
  const fs = require('fs');
  const dataPath = path.join(__dirname, '..', 'js', 'data.js');
  const dataCode = fs.readFileSync(dataPath, 'utf8');

  // Tạo sandbox để eval
  const sandbox = {};
  const fn = new Function(dataCode + '; return VILLAGES;');
  const VILLAGES = fn();

  let productCount = 0;
  for (const village of VILLAGES) {
    if (!village.products) continue;
    for (const p of village.products) {
      await db.run(`
        INSERT OR IGNORE INTO products (id, name, price, image, description, artisan, village_id, village_name, stock)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [p.id, p.name, p.price, p.image || '', p.desc || '', p.artisan || '', village.id, village.name, 99]);
      productCount++;
    }
  }

  console.log(`✅ Đã seed ${productCount} sản phẩm thành công!`);
}

// --- KHỞI ĐỘNG SERVER ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`🚀 Server Backend đã khởi chạy!`);
  console.log(`🌐 Truy cập Frontend: http://localhost:${PORT}`);
  console.log(`========================================\n`);
});
