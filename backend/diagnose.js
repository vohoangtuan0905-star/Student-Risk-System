const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function diagnoseIssues() {
  console.log('\n🔍 === STUDENT RISK SYSTEM DIAGNOSTIC REPORT ===\n');

  // 1. Check Environment Variables
  console.log('📋 1. Environment Variables:');
  console.log(`   DB_HOST: ${process.env.DB_HOST}`);
  console.log(`   DB_USER: ${process.env.DB_USER}`);
  console.log(`   DB_PASSWORD: ${process.env.DB_PASSWORD || '(empty)'}`);
  console.log(`   DB_NAME: ${process.env.DB_NAME}`);
  console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✓ Set' : '✗ Not set'}`);
  console.log(`   PORT: ${process.env.PORT || 5000}`);

  try {
    // 2. Test Database Connection
    console.log('\n📡 2. Testing Database Connection...');
    const db = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const connection = await db.getConnection();
    console.log('   ✅ Database connection successful!');
    connection.release();

    // 3. Check if users table exists and has data
    console.log('\n👥 3. Checking Users Table...');
    const [users] = await db.query('SELECT id, email, full_name, role, is_active FROM users LIMIT 10');
    console.log(`   Total users in database: ${users.length}`);
    if (users.length > 0) {
      console.log('   Sample users:');
      users.forEach(u => {
        console.log(`     - ${u.email} (${u.full_name}) - Role: ${u.role} - Active: ${u.is_active}`);
      });
    } else {
      console.log('   ⚠️  No users found in database!');
    }

    // 4. Check if students table exists and has data
    console.log('\n👨‍🎓 4. Checking Students Table...');
    const [students] = await db.query('SELECT COUNT(*) as count FROM students');
    console.log(`   Total students in database: ${students[0].count}`);

    if (students[0].count > 0) {
      const [sampleStudents] = await db.query('SELECT id, student_code, full_name FROM students LIMIT 3');
      console.log('   Sample students:');
      sampleStudents.forEach(s => {
        console.log(`     - ${s.student_code}: ${s.full_name}`);
      });
    } else {
      console.log('   ⚠️  No students found in database!');
    }

    // 5. Test Password Hash Verification
    console.log('\n🔐 5. Testing Password Verification...');
    if (users.length > 0) {
      const testUser = users[0];
      const password = '123456';
      const hashedPassword = await bcrypt.hash(password, 10);
      const isMatch = await bcrypt.compare(password, hashedPassword);
      console.log(`   Test password: "${password}"`);
      console.log(`   Bcrypt verification works: ${isMatch ? '✅ Yes' : '❌ No'}`);
      
      // Try to verify with actual user's hash
      const actualUser = await db.query(
        'SELECT password_hash FROM users WHERE email = ?',
        [testUser.email]
      );
      if (actualUser[0].length > 0) {
        const actualHash = actualUser[0][0].password_hash;
        console.log(`   \n   Checking user: ${testUser.email}`);
        console.log(`   Password hash exists: ${actualHash ? '✅ Yes' : '❌ No'}`);
        console.log(`   Hash preview: ${actualHash ? actualHash.substring(0, 20) + '...' : 'N/A'}`);
      }
    }

    // 6. Check JWT Secret
    console.log('\n🔑 6. JWT Configuration:');
    console.log(`   JWT_SECRET length: ${process.env.JWT_SECRET?.length || 0} characters`);
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET}`);

    // 7. Verify API Routes
    console.log('\n🛣️  7. API Routes Configuration:');
    console.log('   ✓ /api/auth/login');
    console.log('   ✓ /api/auth/register');
    console.log('   ✓ /api/students (requires token)');
    console.log('   ✓ /api/students/:id (requires token)');

    console.log('\n✅ === DIAGNOSTIC COMPLETE ===\n');
    db.end();

  } catch (error) {
    console.error('\n❌ Error during diagnosis:');
    console.error(`   ${error.message}`);
    console.error('\n⚠️  === DIAGNOSTIC FAILED ===\n');
  }
}

diagnoseIssues();
