const db = require('../config/db');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'database', 'reassign_lecturers.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split into individual statements (skip comments and empty lines)
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && s.length > 5);
    
    console.log(`Found ${statements.length} SQL statements to execute\n`);
    
    for (const stmt of statements) {
      // Skip USE statements
      if (stmt.toUpperCase().startsWith('USE ')) continue;
      
      try {
        const [result] = await db.query(stmt);
        
        // If it's a SELECT, print the results
        if (stmt.toUpperCase().trimStart().startsWith('SELECT')) {
          console.log('=== QUERY RESULT ===');
          if (Array.isArray(result)) {
            result.forEach(row => console.log(JSON.stringify(row)));
          }
          console.log('');
        } else if (result?.affectedRows !== undefined) {
          const action = stmt.toUpperCase().trimStart().substring(0, 6);
          console.log(`${action}: ${result.affectedRows} rows affected`);
        }
      } catch (err) {
        // Silently skip errors for SET commands
        if (!stmt.toUpperCase().startsWith('SET')) {
          console.error(`Error executing: ${stmt.substring(0, 60)}...`);
          console.error(err.message);
        }
      }
    }
    
    console.log('\n=== Done! ===');
    process.exit(0);
  } catch(e) {
    console.error(e.message);
    process.exit(1);
  }
})();
