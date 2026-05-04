export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div className="page-header__content">
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>

      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </div>
  );
}

export function SectionCard({ title, subtitle, actions, children, flush = false }) {
  return (
    <div className={flush ? 'card card--flush' : 'card'}>
      <div className="section-toolbar section-toolbar--flush">
        <div>
          <div className="card__title">{title}</div>
          <div className="card__subtitle">{subtitle}</div>
        </div>

        {actions ? <div className="section-toolbar__actions">{actions}</div> : null}
      </div>

      {children}
    </div>
  );
}

export function EmptyPanel({ icon, title, description, actions, compact = true }) {
  return (
    <div className={`empty-state ${compact ? 'empty-state--compact' : ''}`}>
      {icon ? <div className="empty-state__icon">{icon}</div> : null}
      <div className="empty-state__title">{title}</div>
      <div className="empty-state__desc">{description}</div>
      {actions ? <div className="empty-state--action">{actions}</div> : null}
    </div>
  );
}
