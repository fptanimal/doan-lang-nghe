const { connectDb } = require('./db');

(async () => {
  const db = await connectDb();
  await db.run("UPDATE users SET role = 'admin'");
  console.log('All users set to admin');
  process.exit(0);
})();
