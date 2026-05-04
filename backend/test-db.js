const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  console.log('\n🔍 === DATABASE CONNECTION TEST ===\n');
  console.log('Configuration:');
  console.log(`  Host: ${process.env.DB_HOST}`);
  console.log(`  User: ${process.env.DB_USER}`);
  console.log(`  Password: ${process.env.DB_PASSWORD ? '(set)' : '(empty)'}`);
  console.log(`  Database: ${process.env.DB_NAME}\n`);

  try {
    console.log('Attempting connection...');
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const connection = await pool.getConnection();
    console.log('✅ Connected successfully!');
    
    // Test a simple query
    const [result] = await connection.query('SELECT 1 as test');
    console.log('✅ Query test passed:', result);
    
    connection.release();
    pool.end();
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
  }
}

testConnection();
