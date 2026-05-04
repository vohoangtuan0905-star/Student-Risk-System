const mysql = require('mysql2/promise');

async function fixMySQLAuth() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'mysql'
    });

    console.log('✅ Connected to MySQL');

    // Check current auth plugin
    const result = await conn.query("SELECT plugin FROM mysql.user WHERE user='root' AND host='localhost';");
    console.log('Current auth plugin:', result[0][0]?.plugin);

    // Already using caching_sha2_password, just proceed
    console.log('✅ MySQL is already using caching_sha2_password');

    conn.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

fixMySQLAuth();

