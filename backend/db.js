const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

let db = null;

async function connectDb() {
  if (db) return db;
  
  db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  // Bảng users (đã có, thêm cột role)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email_hash TEXT UNIQUE NOT NULL,
      email_encrypted TEXT NOT NULL,
      password_hash TEXT,
      provider TEXT DEFAULT 'local',
      role TEXT DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migrate: Thêm cột role nếu chưa có (cho DB cũ)
  try {
    await db.run('ALTER TABLE users ADD COLUMN role TEXT DEFAULT \'customer\'');
    console.log('📌 Đã thêm cột role vào bảng users');
  } catch (e) {
    // Cột đã tồn tại — bỏ qua
  }

  // Bảng OTP
  await db.exec(`
    CREATE TABLE IF NOT EXISTS otps (
      email_hash TEXT PRIMARY KEY,
      otp_code TEXT NOT NULL,
      expires_at DATETIME NOT NULL
    )
  `);

  // Bảng sản phẩm
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      image TEXT,
      description TEXT,
      artisan TEXT,
      village_id INTEGER,
      village_name TEXT,
      stock INTEGER DEFAULT 99,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bảng giỏ hàng (server-side)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id)
    )
  `);

  // Bảng đơn hàng
  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_address TEXT NOT NULL,
      total_price INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bảng chi tiết đơn hàng
  await db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price INTEGER NOT NULL
    )
  `);

  // Xóa các OTP hết hạn tự động mỗi khi khởi động
  await db.run('DELETE FROM otps WHERE expires_at < CURRENT_TIMESTAMP');

  // Tự động set admin theo ADMIN_EMAIL trong .env (đảm bảo chữ thường và không có khoảng trắng thừa)
  if (process.env.ADMIN_EMAIL) {
    const { hashBlindIndex } = require('./utils/crypto');
    const adminEmailHash = hashBlindIndex(process.env.ADMIN_EMAIL.toLowerCase().trim());
    await db.run('UPDATE users SET role = ? WHERE email_hash = ?', ['admin', adminEmailHash]);
  }

  console.log('📦 Database SQLite đã kết nối & sẵn sàng');
  return db;
}

module.exports = { connectDb };
