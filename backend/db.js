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

  // Khởi tạo bảng users nếu chưa có (Đã áp dụng bảo mật chuẩn Enterprise)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email_hash TEXT UNIQUE NOT NULL,
      email_encrypted TEXT NOT NULL,
      password_hash TEXT,
      provider TEXT DEFAULT 'local',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tạo bảng lưu mã OTP tạm thời
  await db.exec(`
    CREATE TABLE IF NOT EXISTS otps (
      email_hash TEXT PRIMARY KEY,
      otp_code TEXT NOT NULL,
      expires_at DATETIME NOT NULL
    )
  `);

  // Xóa các OTP hết hạn tự động mỗi khi khởi động
  await db.run('DELETE FROM otps WHERE expires_at < CURRENT_TIMESTAMP');

  console.log('📦 Database SQLite đã kết nối & sẵn sàng');
  return db;
}

module.exports = { connectDb };
