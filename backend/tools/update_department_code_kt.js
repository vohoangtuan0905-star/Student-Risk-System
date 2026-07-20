const db = require('../config/db');

const run = async () => {
  try {
    const [beforeRows] = await db.query(
      "SELECT id, department_code, department_name FROM departments WHERE department_code IN ('KT2', 'KT') ORDER BY id"
    );

    if (beforeRows.length === 0) {
      console.log('No matching departments found.');
      return;
    }

    console.table(beforeRows);

    const [result] = await db.query(
      "UPDATE departments SET department_code = 'KT', department_name = 'Ke toan' WHERE department_code = 'KT2'"
    );

    console.log(`Updated ${result.affectedRows} row(s).`);

    const [afterRows] = await db.query(
      "SELECT id, department_code, department_name FROM departments WHERE id IN (?)",
      [beforeRows.map((row) => row.id)]
    );

    console.table(afterRows);
  } catch (error) {
    console.error('Failed to update department code:', error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
};

run();
