const fs = require('fs');
const path = require('path');

const db = require('../config/db');

function readCsvHeaderColumns(csvPath) {
  const raw = fs.readFileSync(csvPath, 'utf8');
  const firstLine = raw.split(/\r?\n/)[0] || '';
  return firstLine
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function diffColumns(sourceName, sourceCols, targetName, targetCols) {
  const sourceSet = new Set(sourceCols);
  const targetSet = new Set(targetCols);

  const missingInTarget = sourceCols.filter((c) => !targetSet.has(c));
  const extraInTarget = targetCols.filter((c) => !sourceSet.has(c));

  return { sourceName, targetName, missingInTarget, extraInTarget };
}

(async () => {
  const csvPath = path.resolve(__dirname, '../../ai_core/data/processed/kaggle_demo_sync_from_data_csv.csv');
  const viewName = 'vw_demo_train_reduced_sync';

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV not found: ${csvPath}`);
    process.exit(2);
  }

  const csvCols = readCsvHeaderColumns(csvPath);
  if (csvCols.length === 0) {
    console.error('❌ CSV header is empty; cannot validate.');
    process.exit(2);
  }

  let viewCols;
  try {
    const [, fields] = await db.query(`SELECT * FROM ${viewName} LIMIT 0`);
    viewCols = (fields || []).map((f) => f.name);
  } catch (e) {
    console.error(`❌ Cannot query view ${viewName}.`);
    console.error('   Ensure the view exists in MySQL (run the SQL file / create view).');
    console.error('   Error:', e?.message || e);
    process.exit(2);
  }

  const a = diffColumns('CSV', csvCols, 'VIEW', viewCols);
  const b = diffColumns('VIEW', viewCols, 'CSV', csvCols);

  const ok = a.missingInTarget.length === 0 && a.extraInTarget.length === 0;

  console.log('=== Feature Schema Sync Check ===');
  console.log('CSV :', csvPath);
  console.log('VIEW:', viewName);
  console.log('---------------------------------');
  console.log('CSV columns :', csvCols.join(', '));
  console.log('VIEW columns:', viewCols.join(', '));
  console.log('---------------------------------');

  if (!ok) {
    if (a.missingInTarget.length) {
      console.log('❌ Missing in VIEW (present in CSV):', a.missingInTarget.join(', '));
    }
    if (a.extraInTarget.length) {
      console.log('❌ Extra in VIEW (not in CSV):', a.extraInTarget.join(', '));
    }

    // Also show reverse diff for readability (should mirror)
    if (b.missingInTarget.length) {
      console.log('ℹ️ Missing in CSV (present in VIEW):', b.missingInTarget.join(', '));
    }

    process.exit(1);
  }

  console.log('✅ OK: CSV and VIEW have identical column sets.');
  process.exit(0);
})().catch((e) => {
  console.error('❌ Unexpected error:', e);
  process.exit(2);
});
