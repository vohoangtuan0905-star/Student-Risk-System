const fs = require('fs');
const path = require('path');

const pagesDir = 'D:/Student-Risk-System/frontend/src/pages';
const files = [
  'StudentsPage.jsx',
  'ClassesPage.jsx',
  'DepartmentsPage.jsx',
  'LecturersPage.jsx',
  'SemestersPage.jsx',
  'UsersPage.jsx'
];

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(/const PAGE_SIZE_OPTIONS = \[\d+, \d+, \d+\];\n?/g, '');
  content = content.replace(/const \[pageSize, setPageSize\] = useState\(\d+\);/g, 'const pageSize = 10;');
  content = content.replace(/const \[pageSize\] = useState\(\d+\);/g, 'const pageSize = 10;');
  content = content.replace(/const pageSize = 20;/g, 'const pageSize = 10;');

  fs.writeFileSync(filePath, content, 'utf8');
}
console.log("Cleaned up unused vars");