const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../frontend/src/pages');
const files = [
  'ClassesPage.jsx',
  'DepartmentsPage.jsx',
  'LecturersPage.jsx',
  'SemestersPage.jsx',
  'UsersPage.jsx'
];

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  const modelName = file.replace('Page.jsx', '');
  const dataVar = modelName.charAt(0).toLowerCase() + modelName.slice(1);
  const dataArrayVar = dataVar;

  if (content.includes('paginated')) {
    console.log(`Pagination already applied in ${file}`);
    continue;
  }

  // 1. imports
  if (!content.includes('useMemo(')) {
    content = content.replace(/import\s+\{.*?(useEffect|useState).*?\}\s+from\s+['"]react['"];/, (match) => {
      let m = match;
      if (!m.includes('useMemo')) {
          return m.replace('{', '{ useMemo,');
      }
      return m;
    });
  }

  // 2. PAGE_SIZE_OPTIONS
  if (!content.includes('PAGE_SIZE_OPTIONS')) {
    content = content.replace(/(import .*?\n)+/, (match) => {
      return match + "\nconst PAGE_SIZE_OPTIONS = [20, 50, 100];\n";
    });
  }

  // 3. States
  const stateRegex = new RegExp(`const \\[${dataArrayVar}, set${modelName}\\] = useState\\(\\[\\]\\);`);
  content = content.replace(stateRegex, (match) => {
    return match + `\n  const [currentPage, setCurrentPage] = useState(1);\n  const [pageSize, setPageSize] = useState(20);`;
  });

  // 4. Logic before return
  const logic = `
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(${dataArrayVar}.length / pageSize)),
    [${dataArrayVar}.length, pageSize]
  );

  const paginated${modelName} = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return ${dataArrayVar}.slice(startIndex, startIndex + pageSize);
  }, [${dataArrayVar}, currentPage, pageSize]);

  const pageStart = ${dataArrayVar}.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, ${dataArrayVar}.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
`;
  
  content = content.replace(/\s*return \(\s*<div className="page-wrapper/, (match) => {
    return logic + match;
  });

  // 5. Replace map in table
  const mapRegex = new RegExp(`${dataArrayVar}\\.map\\(\\(`);
  content = content.replace(mapRegex, `paginated${modelName}.map((`);

  // 6. Pagination UI
  const ui = `
            {${dataArrayVar}.length > 0 ? (
              <div className="table-pagination">
                <span>
                  Hiển thị {pageStart}-{pageEnd} / {${dataArrayVar}.length} mục
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label htmlFor="${dataArrayVar}-page-size">Mỗi trang</label>
                  <select
                    id="${dataArrayVar}-page-size"
                    className="select"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    style={{ width: 90 }}
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </button>

                  <span>Trang {currentPage}/{totalPages}</span>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </button>
                </div>
              </div>
            ) : null}
`;

  content = content.replace('</table>', '</table>' + ui);
  
  // also check if map is filtered or normal. 
  // Let's replace 'searchTerm' -> `useEffect(() => setCurrentPage(1), [keyword, searchTerm, pageSize])` logic if existent.
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
}
