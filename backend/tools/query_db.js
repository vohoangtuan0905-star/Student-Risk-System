const db = require('../config/db');

(async () => {
  try {
    const [results] = await db.query(`
      SELECT c.id, c.class_code, c.class_name, c.homeroom_teacher_id, u.full_name, u.lecturer_code
      FROM classes c
      LEFT JOIN users u ON c.homeroom_teacher_id = u.id
      WHERE c.class_code LIKE 'D22_LG%'
      ORDER BY c.class_code
    `);
    console.log('=== LOGISTICS CLASSES ===');
    results.forEach(r => console.log(JSON.stringify(r)));

    // check all D22 class codes
    const [allClasses] = await db.query(`
      SELECT c.class_code, c.homeroom_teacher_id, u.lecturer_code, u.full_name
      FROM classes c
      LEFT JOIN users u ON c.homeroom_teacher_id = u.id
      ORDER BY c.class_code
    `);
    console.log('\n=== ALL D22 CLASSES ===');
    allClasses.forEach(r => console.log(`${r.class_code} -> ${r.lecturer_code} (${r.full_name})`));

    process.exit(0);
  } catch(e) {
    console.error(e.message);
    process.exit(1);
  }
})();
