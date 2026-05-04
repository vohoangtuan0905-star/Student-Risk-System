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

  if (!content.includes("import Pagination")) {
    content = 'import Pagination from "../components/Pagination";\n' + content;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Added import to", file);
  }
}
