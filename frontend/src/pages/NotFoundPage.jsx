import { useNavigate } from 'react-router-dom';

const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11l9-8 9 8" />
    <path d="M5 10v10h14V10" />
    <path d="M9 20v-6h6v6" />
  </svg>
);

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <div className="empty-state__icon not-found-card__icon">
          <span>404</span>
        </div>

        <h1 className="page-title not-found-card__title">Không tìm thấy trang</h1>
        <p className="page-subtitle not-found-card__subtitle">
          Trang bạn yêu cầu không tồn tại hoặc đã được chuyển sang vị trí khác.
        </p>

        <div className="not-found-card__actions">
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            <IconHome />
            Về dashboard
          </button>
        </div>
      </div>
    </div>
  );
}