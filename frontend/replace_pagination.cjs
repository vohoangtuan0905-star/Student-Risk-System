const fs = require('fs');
const path = require('path');

const pagesDir = 'D:/Student-Risk-System/frontend/src/pages';
const files = [
  { file: 'StudentsPage.jsx', itemName: 'sinh viên', varArray: 'filteredStudents' },
  { file: 'ClassesPage.jsx', itemName: 'lớp', varArray: 'classes' },
  { file: 'DepartmentsPage.jsx', itemName: 'khoa', varArray: 'departments' },
  { file: 'LecturersPage.jsx', itemName: 'giảng viên', varArray: 'lecturers' },
  { file: 'SemestersPage.jsx', itemName: 'kỳ học', varArray: 'semesters' },
  { file: 'UsersPage.jsx', itemName: 'người dùng', varArray: 'users' }
];

for (const { file, itemName, varArray } of files) {
  const filePath = path.join(pagesDir, file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');

  // Add import if missing
  if (!content.includes("import Pagination from '../components/Pagination';")) {
    content = content.replace(/(import .*?\n)+/, (match) => {
      return match + "import Pagination from '../components/Pagination';\n";
    });
  }

  const paginationCode = `
            {${varArray}.length > 0 ? (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={${varArray}.length}
                pageStart={pageStart}
                pageEnd={pageEnd}
                itemName="${itemName}"
              />
            ) : null}`;

  // Replace old pagination
  if (content.includes('className="table-pagination"')) {
    const oldPaginationRegex = /<div className="table-pagination">[\s\S]*?<\/div>\s*<\/div>\s*\)\s*:\s*null\}/;
    content = content.replace(oldPaginationRegex, paginationCode.trim());
  } else if (!content.includes('<Pagination')) {
    // If not found, insert at the end of table
    content = content.replace('</table>', '</table>\n' + paginationCode);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated', file);
}
