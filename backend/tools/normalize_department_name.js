const db = require('../config/db');

const run = async () => {
  try {
    const [beforeRows] = await db.query(
      "SELECT id, department_code, department_name FROM departments WHERE TRIM(department_name) COLLATE utf8mb4_unicode_ci IN ('ke toan', 'kế toán')"
    );

    if (beforeRows.length === 0) {
      console.log('No departments found to update.');
      return;
    }

    console.table(beforeRows);

    const [result] = await db.query(
      "UPDATE departments SET department_name = 'KT' WHERE TRIM(department_name) COLLATE utf8mb4_unicode_ci IN ('ke toan', 'kế toán')"
    );

    console.log(`Updated ${result.affectedRows} row(s).`);

    const [afterRows] = await db.query(
      "SELECT id, department_code, department_name FROM departments WHERE id IN (?)",
      [beforeRows.map((row) => row.id)]
    );

    console.table(afterRows);
  } catch (error) {
    console.error('Failed to normalize department names:', error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
};

run();
