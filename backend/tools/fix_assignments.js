const db = require('../config/db');

(async () => {
  try {
    // Fix Logistics: Long (173) should have LG01, LG02, LG03
    await db.query("UPDATE classes SET homeroom_teacher_id = 173 WHERE class_code IN ('D22_LG01', 'D22_LG02', 'D22_LG03')");
    
    // Also fix CNTT: Trang (159) should have TH01, TH02, TH03
    await db.query("UPDATE classes SET homeroom_teacher_id = 159 WHERE class_code IN ('D22_TH01', 'D22_TH02', 'D22_TH03')");
    
    // Fix CK: Nam (160) should have CK01, CK02, CK03
    await db.query("UPDATE classes SET homeroom_teacher_id = 160 WHERE class_code IN ('D22_CK01', 'D22_CK02', 'D22_CK03')");
    
    // Fix DL: Bình (153) should have DL01, DL02, DL03
    await db.query("UPDATE classes SET homeroom_teacher_id = 153 WHERE class_code IN ('D22_DL01', 'D22_DL02', 'D22_DL03')");
    
    // Fix KD: Quang (156) should have KD01, KD02, KD03
    await db.query("UPDATE classes SET homeroom_teacher_id = 156 WHERE class_code IN ('D22_KD01', 'D22_KD02', 'D22_KD03')");
    
    // Fix MK: Hồng (158) should have MK01, MK02, MK03
    await db.query("UPDATE classes SET homeroom_teacher_id = 158 WHERE class_code IN ('D22_MK01', 'D22_MK02', 'D22_MK03')");
    
    // Fix KT: Phúc (161) should have KT01, KT02, KT03
    await db.query("UPDATE classes SET homeroom_teacher_id = 161 WHERE class_code IN ('D22_KT01', 'D22_KT02', 'D22_KT03')");
    
    // Fix NH: Thiên (162) should have NH01, NH02, NH03
    await db.query("UPDATE classes SET homeroom_teacher_id = 162 WHERE class_code IN ('D22_NH01', 'D22_NH02', 'D22_NH03')");
    
    // Fix NN: Dũng (154) should have NN01, NN02, NN03
    await db.query("UPDATE classes SET homeroom_teacher_id = 154 WHERE class_code IN ('D22_NN01', 'D22_NN02', 'D22_NN03')");
    
    // Fix XD: Hiếu (165) should have XD01, XD02, XD03
    await db.query("UPDATE classes SET homeroom_teacher_id = 165 WHERE class_code IN ('D22_XD01', 'D22_XD02', 'D22_XD03')");

    // Verify
    const [results] = await db.query(`
      SELECT 
          u.lecturer_code, u.full_name, d.department_name,
          COUNT(c.id) AS so_lop,
          GROUP_CONCAT(c.class_code ORDER BY c.class_code SEPARATOR ', ') AS lop
      FROM users u
      LEFT JOIN departments d ON d.id = u.department_id
      LEFT JOIN classes c ON c.homeroom_teacher_id = u.id
      WHERE u.role = 'teacher'
      GROUP BY u.id
      ORDER BY COUNT(c.id) DESC, d.department_name
    `);
    
    console.log('=== KẾT QUẢ SAU SỬA ===\n');
    results.forEach(r => {
      console.log(`${r.lecturer_code} | ${r.full_name.padEnd(23)} | ${r.department_name.padEnd(23)} | ${r.so_lop} lớp | ${r.lop || '-'}`);
    });

    const counts = {};
    results.forEach(r => { counts[r.so_lop] = (counts[r.so_lop] || 0) + 1; });
    console.log('\n=== THỐNG KÊ ===');
    Object.entries(counts).sort((a,b) => b[0]-a[0]).forEach(([c, n]) => {
      console.log(`  ${n} GV phụ trách ${c} lớp`);
    });
    
    process.exit(0);
  } catch(e) {
    console.error(e.message);
    process.exit(1);
  }
})();
