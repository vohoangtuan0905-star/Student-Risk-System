import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { PageHeader, EmptyPanel } from '../components/PageKit';

const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconXCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconBrain = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24A2.5 2.5 0 0 0 14.5 2Z" />
  </svg>
);

const IconRefresh = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconTrendUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const IconTrendDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

// ── Sparkline SVG (giống Wieldy card chart) ──────────────────
function Sparkline({ points, color, fillColor }) {
  const w = 120, h = 52;
  const xs = points.map((_, i) => (i / (points.length - 1)) * w);
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const ys = points.map(p => h - ((p - min) / range) * (h - 6) - 3);

  const linePath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${w},${h} L0,${h} Z`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`g-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} stopOpacity="0.5" />
          <stop offset="100%" stopColor={fillColor} stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#g-${color})`} />
      <path d={linePath} fill="none" stroke={fillColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Stat card — Wieldy style với sparkline ───────────────────
const SPARKLINES = {
  blue:   [42, 55, 48, 62, 58, 70, 65, 72, 68, 80],
  green:  [30, 38, 35, 42, 40, 48, 44, 52, 48, 55],
  yellow: [8, 12, 10, 15, 13, 18, 14, 20, 17, 22],
  red:    [5, 8, 6, 10, 8, 12, 9, 14, 11, 16],
};
const SPARK_COLORS = {
  blue:   '#3b82f6',
  green:  '#22c55e',
  yellow: '#f59e0b',
  red:    '#ef4444',
};
const TREND_COLORS = {
  blue:   { up: true,  pct: '12%' },
  green:  { up: true,  pct: '8%' },
  yellow: { up: true,  pct: '5%' },
  red:    { up: false, pct: '3%' },
};

function StatCard({ label, value, color, icon: Icon, loading }) {
  const pts = SPARKLINES[color];
  const clr = SPARK_COLORS[color];
  const trend = TREND_COLORS[color];

  return (
    <div className={`wield-stat wield-stat--${color}`}>
      <div className="wield-stat__top">
        <div className="wield-stat__meta">
          <div className="wield-stat__value">{loading ? '—' : value}</div>
          <div className="wield-stat__label">{label}</div>
          <div className={`wield-stat__trend wield-stat__trend--${trend.up ? 'up' : 'down'}`}>
            {trend.up ? <IconTrendUp /> : <IconTrendDown />}
            <span>{trend.pct}</span>
          </div>
        </div>
        <div className={`wield-stat__icon wield-stat__icon--${color}`}>
          <Icon />
        </div>
      </div>
      <div className="wield-stat__chart">
        <Sparkline points={pts} color={color} fillColor={clr} />
      </div>
    </div>
  );
}

function RiskBadge({ level }) {
  const classMap = {
    Safe: 'badge badge-safe',
    Warning: 'badge badge-warning',
    Danger: 'badge badge-danger'
  };

  const labelMap = {
    Safe: 'An toàn',
    Warning: 'Cảnh báo',
    Danger: 'Nguy hiểm'
  };

  return <span className={classMap[level] || 'badge badge-neutral'}>{labelMap[level] || level || '—'}</span>;
}

const formatRiskPercentage = (value, digits = 1) => {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return `${num.toFixed(digits)}%`;
};

// ── Risk donut mini-chart ────────────────────────────────────
function RiskDonut({ safe, warning, danger, total }) {
  if (!total) return null;
  const r = 44, cx = 52, cy = 52, circumference = 2 * Math.PI * r;
  const safeP    = safe    / total;
  const warningP = warning / total;
  const dangerP  = danger  / total;

  const segments = [
    { pct: safeP,    color: '#22c55e', offset: 0 },
    { pct: warningP, color: '#f59e0b', offset: safeP },
    { pct: dangerP,  color: '#ef4444', offset: safeP + warningP },
  ];

  return (
    <svg width="104" height="104" viewBox="0 0 104 104">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
      {segments.map((seg, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={seg.color}
          strokeWidth="10"
          strokeDasharray={`${seg.pct * circumference} ${circumference}`}
          strokeDashoffset={-seg.offset * circumference}
          transform={`rotate(-90 ${cx} ${cy})`}
          strokeLinecap="round"
        />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="16" fontWeight="700" fill="#0f172a">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#64748b">sinh viên</text>
    </svg>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user?.role === 'admin';
  const [students, setStudents] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);

      const [studentsResponse, semestersResponse] = await Promise.all([
        axiosClient.get('/students').catch(() => ({ data: [] })),
        isAdmin ? axiosClient.get('/semesters').catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
      ]);

      if (cancelled) return;

      setStudents(Array.isArray(studentsResponse.data) ? studentsResponse.data : (studentsResponse.data?.data ?? []));
      setSemesters(Array.isArray(semestersResponse.data) ? semestersResponse.data : (semestersResponse.data?.data ?? []));
      setLoading(false);
    };

    fetchData();
    return () => { cancelled = true; };
  }, [refreshTick, isAdmin]);

  const total   = students.length;
  const safe    = students.filter(s => s.risk_level === 'Safe').length;
  const warning = students.filter(s => s.risk_level === 'Warning').length;
  const danger  = students.filter(s => s.risk_level === 'Danger').length;

  const topRisk = [...students]
    .filter(s => s.risk_level === 'Danger' || s.risk_level === 'Warning')
    .sort((a, b) => Number(b.risk_percentage ?? 0) - Number(a.risk_percentage ?? 0))
    .slice(0, 5);

  return (
    <div className="page-wrapper">
      <PageHeader
        title="Dashboard hệ thống"
        subtitle="Tổng quan dữ liệu sinh viên và trạng thái cảnh báo rủi ro"
        actions={
          <button className="btn btn-secondary" onClick={() => setRefreshTick(v => v + 1)} disabled={loading}>
            <IconRefresh />
            Làm mới
          </button>
        }
      />

      {/* ── Stat cards — Wieldy style with sparklines ── */}
      <div className="wield-stats-grid">
        <StatCard label="Tổng sinh viên"     value={total}   color="blue"   icon={IconUsers}    loading={loading} />
        <StatCard label="Sinh viên an toàn"  value={safe}    color="green"  icon={IconShield}   loading={loading} />
        <StatCard label="Sinh viên cảnh báo" value={warning} color="yellow" icon={IconAlert}    loading={loading} />
        <StatCard label="Sinh viên nguy hiểm" value={danger}  color="red"    icon={IconXCircle}  loading={loading} />
      </div>

      {/* ── Main content row ── */}
      <div className="panel-grid panel-grid--split">

        {/* Left — top risk list */}
        <div className="card card--flush">
          <div className="section-toolbar section-toolbar--flush" style={{ padding: '18px 20px 14px' }}>
            <div>
              <div className="card__title">Sinh viên rủi ro cao nhất</div>
              <div className="card__subtitle">Cần ưu tiên theo dõi</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/students')}>
              Xem tất cả <IconArrow />
            </button>
          </div>

          {loading ? (
            <div className="loading loading--flex">
              <div className="loading__spinner" />
              Đang tải dữ liệu...
            </div>
          ) : topRisk.length === 0 ? (
            <EmptyPanel
              icon={<IconShield />}
              title="Không có sinh viên rủi ro"
              description="Tất cả sinh viên đều ở trạng thái an toàn."
            />
          ) : (
            <div className="content-list">
              {topRisk.map((student, index) => (
                <div
                  key={student.id || index}
                  className="content-list__item"
                  onClick={() => navigate(`/students/${student.id}`)}
                >
                  {/* Avatar initials */}
                  <div className="content-list__avatar">
                    {(student.full_name || '?').split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="content-list__primary">{student.full_name || '—'}</div>
                    <div className="content-list__secondary">{student.student_code || '—'}</div>
                  </div>
                  <div className="content-list__meta">
                    <span
                      className="content-list__value"
                      style={{ color: student.risk_level === 'Danger' ? 'var(--red-600)' : 'var(--yellow-600)' }}
                    >
                      {formatRiskPercentage(student.risk_percentage)}
                    </span>
                    <RiskBadge level={student.risk_level} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — AI model + donut */}
        <div className="card">
          <div className="section-toolbar">
            <div>
              <div className="card__title">Phân bố rủi ro</div>
              <div className="card__subtitle">Toàn bộ sinh viên</div>
            </div>
            <span className="badge badge-safe">Live</span>
          </div>

          {/* Donut + legend */}
          {!loading && (
            <div className="risk-donut-wrap">
              <RiskDonut safe={safe} warning={warning} danger={danger} total={total} />
              <div className="risk-donut-legend">
                {[
                  { label: 'An toàn',   count: safe,    color: '#22c55e' },
                  { label: 'Cảnh báo',  count: warning, color: '#f59e0b' },
                  { label: 'Nguy hiểm', count: danger,  color: '#ef4444' },
                ].map(item => (
                  <div key={item.label} className="risk-legend-item">
                    <span className="risk-legend-dot" style={{ background: item.color }} />
                    <span className="risk-legend-label">{item.label}</span>
                    <span className="risk-legend-count">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="divider" />

          {/* AI model info */}
          <div className="card__title" style={{ marginBottom: 12 }}>Mô hình AI hiện tại</div>
          <div className="value-list">
            {[
              { label: 'Tên mô hình', value: 'Logistic Regression' },
              { label: 'Phiên bản',   value: 'v1.0.0' },
              { label: 'Mục tiêu',    value: 'Dự báo nguy cơ bỏ học' },
              { label: 'Trạng thái',  value: 'Đang hoạt động' },
            ].map(row => (
              <div key={row.label} className="value-row">
                <span className="value-row__label">{row.label}</span>
                <span className="value-row__value">{row.value}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Semester strip ── */}
      {isAdmin && !loading && semesters.length > 0 && (
        <div className="card summary-strip">
          <div className="summary-strip__group">
            <div className="summary-strip__icon">
              <IconCalendar />
            </div>
            <div>
              <div className="summary-strip__title">{semesters.length} học kỳ đang quản lý</div>
              <div className="summary-strip__subtitle">
                Học kỳ gần nhất: {semesters[0]?.semester_name || '—'}
              </div>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/semesters')}>
            Quản lý học kỳ <IconArrow />
          </button>
        </div>
      )}
    </div>
  );
}