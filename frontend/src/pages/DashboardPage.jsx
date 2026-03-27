export default function DashboardPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Chào mừng bạn đến với hệ thống dự báo rủi ro sinh viên.</p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginTop: '24px'
      }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '10px' }}>
          <h3>Người dùng hiện tại</h3>
          <p>{user.full_name || 'Chưa xác định'}</p>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '10px' }}>
          <h3>Vai trò</h3>
          <p>{user.role || 'Chưa xác định'}</p>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '10px' }}>
          <h3>Trạng thái hệ thống</h3>
          <p>Backend và AI Core đã kết nối</p>
        </div>
      </div>
    </div>
  );
}