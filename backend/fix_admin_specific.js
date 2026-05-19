const { connectDb } = require('./db');

(async () => {
  const db = await connectDb();
  
  // 1. Reset tất cả về customer
  await db.run("UPDATE users SET role = 'customer'");
  
  // 2. Chỉ set Admin cho đúng tài khoản chính của bạn
  // Tôi set cả 2 tài khoản có tên "Lâm" để đảm bảo bạn không bị kẹt nếu lỡ login bằng tài khoản kia
  await db.run("UPDATE users SET role = 'admin' WHERE id = 'u_gg_1779152095424' OR id = 'u_gg_1779151804204'");
  
  console.log('Fixed roles: Only Lam is admin');
  process.exit(0);
})();
