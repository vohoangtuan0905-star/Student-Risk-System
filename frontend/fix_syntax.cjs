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

  content = content.replace(/\{(\w+)\.length > 0 \? \(\s*\{\w+\.length > 0 \? \(/g, '{$1.length > 0 ? (');
  content = content.replace(/<\/\s*Pagination\s*>\s*\)\s*:\s*null\}\s*\)\s*:\s*null\}/g, '</Pagination>\n            ) : null}');
  
  fs.writeFileSync(filePath, content, 'utf8');
}
console.log("Fixed syntax");
