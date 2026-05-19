const { connectDb } = require('./db');

(async () => {
  const db = await connectDb();
  
  // Set admin cho user "Lâm Nguyễn Đăng" (Google account)
  await db.run("UPDATE users SET role = 'admin' WHERE id = 'u_gg_1779152095424'");
  
  const u = await db.get("SELECT id, name, role FROM users WHERE id = 'u_gg_1779152095424'");
  console.log('Updated user:', u);
  
  // Verify all users
  const users = await db.all('SELECT id, name, role FROM users');
  console.log('All users:', users);
  
  process.exit(0);
})();
