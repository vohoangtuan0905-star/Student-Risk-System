import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { PageHeader, SectionCard, EmptyPanel } from '../components/PageKit';

function prettyMetricLabel(metricKey) {
  const map = {
    accuracy: 'Độ chính xác',
    precision: 'Precision',
    recall: 'Recall',
    f1_score: 'F1-score',
    roc_auc: 'ROC-AUC',
    cv_f1_mean: 'CV F1 trung bình',
    cv_f1_std: 'CV F1 độ lệch chuẩn',
  };
  return map[metricKey] || metricKey;
}

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

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

function StatCard({ label, value, color, icon: Icon, helper }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className={`stat-card__icon stat-card__icon--${color}`}>
        <Icon />
      </div>
      <div className="stat-card__body">
        <div className="stat-card__value">{value}</div>
        <div className="stat-card__label">{label}</div>
        {helper ? <div className="metric-note">{helper}</div> : null}
      </div>
    </div>
  );
}

export default function AiPage() {
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [currentModel, setCurrentModel] = useState(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [modelError, setModelError] = useState('');

  useEffect(() => {
    fetchModelInfo();
  }, []);

  const fetchModelInfo = async () => {
    try {
      setModelLoading(true);
      setModelError('');
      const res = await axiosClient.get('/ai/current-model').catch(() => ({ data: null }));
      const modelData = res?.data?.model || null;
      setCurrentModel(modelData);
    } catch (err) {
      setModelError('Không thể tải thông tin mô hình');
    } finally {
      setModelLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const values = result?.metrics && typeof result.metrics === 'object'
      ? Object.entries(result.metrics)
      : [];

    return values;
  }, [result]);

  const modelMetrics = useMemo(() => {
    if (!currentModel?.metrics) return [];
    return Object.entries(currentModel.metrics)
      .map(([key, value]) => {
        const numericValue = typeof value === 'number' ? value : Number(value);
        if (!Number.isFinite(numericValue)) {
          return null;
        }

        return {
          key,
          value: numericValue.toFixed(4)
        };
      })
      .filter(Boolean);
  }, [currentModel]);


  const handleRetrain = async () => {
    try {
      setRunning(true);
      setError('');
      setMessage('');
      setResult(null);

      const response = await axiosClient.post('/ai/retrain');
      setMessage(response.data?.message || 'Huấn luyện lại mô hình hoàn tất');
      setResult(response.data?.retrain_result || response.data || null);
      
      // Refresh model info after retrain
      await fetchModelInfo();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Huấn luyện lại mô hình thất bại'
      );
    } finally {
      setRunning(false);
    }
  };


  const modelName = currentModel?.name || 'Logistic Regression';
  const modelStatus = currentModel ? 'Đang hoạt động' : 'Chưa khả dụng';

  return (
    <div className="page-wrapper">
      <PageHeader
        title="AI & Retrain"
        subtitle="Theo dõi trạng thái mô hình và chạy huấn luyện lại khi cần"
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              <IconArrowLeft />
              Dashboard
            </button>
            <button className="btn btn-secondary" onClick={fetchModelInfo} disabled={modelLoading}>
              <IconRefresh />
              Tải lại
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/ai/approx')}>
              <IconBrain />
              Dự đoán xấp xỉ
            </button>
            <button className="btn btn-primary" onClick={handleRetrain} disabled={running}>
              <IconRefresh />
              {running ? 'Đang retrain...' : 'Chạy retrain'}
            </button>
          </>
        }
      />

      <div className="stats-grid">
        <StatCard 
          label="Mô hình hiện tại" 
          value={modelName} 
          color="blue" 
          icon={IconBrain} 
          helper="Mô hình production đang triển khai" 
        />
        <StatCard 
          label="Mục tiêu" 
          value="Dự báo nguy cơ bỏ học" 
          color="green" 
          icon={IconShield} 
          helper="Binary classification" 
        />
        <StatCard 
          label="Trạng thái" 
          value={running ? 'Đang xử lý' : modelStatus} 
          color={running ? 'yellow' : (currentModel ? 'green' : 'yellow')} 
          icon={IconRefresh} 
          helper="Kết nối tới backend AI" 
        />
        <StatCard 
          label="Kết quả gần nhất" 
          value={message || 'Chưa có'} 
          color="red" 
          icon={IconCheck} 
          helper="Xem bên dưới để biết chi tiết" 
        />
      </div>

      <div className="dashboard-split">
        <div className="stack-grid">
          <SectionCard
            title="Quy trình AI"
            subtitle="Sắp xếp hành động để kiểm soát việc cập nhật mô hình"
          >
            <div className="workflow-list">
              {[
                { title: '1. Dự đoán', desc: 'Chạy mô hình trên dữ liệu sinh viên hiện có để cập nhật risk score.' },
                { title: '2. Retrain', desc: 'Huấn luyện lại từ dữ liệu mới để cải thiện chất lượng dự báo.' },
                { title: '3. Triển khai', desc: 'Đưa phiên bản tốt nhất vào production và theo dõi kết quả.' }
              ].map((item) => (
                <div key={item.title} className="workflow-step">
                  <div className="workflow-step__title">{item.title}</div>
                  <div className="workflow-step__desc">{item.desc}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Trạng thái retrain"
            subtitle="Kết quả mới nhất từ API /api/ai/retrain"
          >
            <div className="workflow-list">
              {error ? (
                <EmptyPanel
                  icon={<IconAlert />}
                  title="Không thể retrain mô hình"
                  description={error}
                />
              ) : result ? (
                <div className="workflow-list">
                  <div className="card card--soft" style={{ marginBottom: 0 }}>
                    <div className="section-toolbar section-toolbar--compact">
                      <div>
                        <div className="card__title">Kết quả retrain</div>
                        <div className="card__subtitle">Thông tin trả về từ backend</div>
                      </div>
                      {result.version_label ? <span className="badge badge-info">{result.version_label}</span> : null}
                    </div>

                    <div className="kv-list">
                      {metrics.length > 0 ? metrics.map(([key, value]) => (
                        <div key={key} className="kv-row">
                          <span className="kv-row__label">{key}</span>
                          <span className="kv-row__value">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      )) : (
                        <div className="empty-state empty-state--tight">
                          Không có metrics chi tiết trong phản hồi.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyPanel
                  icon={<IconBrain />}
                  title="Chưa có lần retrain nào"
                  description="Nhấn nút retrain để chạy lại mô hình và xem kết quả tại đây."
                />
              )}
            </div>
          </SectionCard>

        </div>

        <SectionCard
          title="Thông tin triển khai"
          subtitle="Tổng quan mô hình và cách sử dụng trong hệ thống"
        >
          {modelLoading ? (
            <div className="loading loading--flex" style={{ minHeight: '200px' }}>
              <div className="loading__spinner" />
              Đang tải thông tin mô hình...
            </div>
          ) : modelError ? (
            <div style={{ color: 'var(--red-600)', padding: '16px' }}>
              {modelError}
            </div>
          ) : currentModel ? (
            <>
              <div className="kv-list">
                {[
                  { label: 'Tên mô hình', value: currentModel.name || '—' },
                  { label: 'Phiên bản', value: currentModel.version || '—' },
                  { label: 'Thuật toán', value: currentModel.algorithm || 'LogisticRegression' },
                  { label: 'Nguồn dữ liệu', value: currentModel.dataset_source || 'kaggle' },
                  { label: 'Kiểu bài toán', value: 'Binary classification' },
                  { label: 'Ngày train', value: currentModel.trained_at ? new Date(currentModel.trained_at).toLocaleString('vi-VN') : '—' }
                ].map((item) => (
                  <div key={item.label} className="kv-row">
                    <span className="kv-row__label">{item.label}</span>
                    <span className="kv-row__value">{item.value}</span>
                  </div>
                ))}
              </div>

              {modelMetrics.length > 0 && (
                <>
                  <div className="divider" />
                  <div style={{ marginTop: '16px' }}>
                    <h4 className="section-title--tight" style={{ marginBottom: '12px' }}>Metrics mô hình hiện tại</h4>
                    <div className="metrics-grid">
                      {modelMetrics.map(({ key, value }) => (
                        <div key={key} className="metric-card">
                          <div className="metric-card__value">{value}</div>
                          <div className="metric-card__label">{prettyMetricLabel(key)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="empty-state empty-state--tight">
              <div style={{ color: 'var(--gray-600)', padding: '24px' }}>
                Không có dữ liệu mô hình. Hãy chạy retrain để tạo mô hình.
              </div>
            </div>
          )}

          {(currentModel || result) && (
            <>
              <div className="divider" />

              <div className="note-list">
                {[
                  'Giữ dữ liệu đầu vào đồng nhất để kết quả dự đoán ổn định.',
                  'Sau khi retrain, kiểm tra lại metrics trước khi dùng production.',
                  'Khi cần dự đoán theo từng sinh viên, dùng trang chi tiết sinh viên.'
                ].map((note) => (
                  <div key={note} className="note-item">• {note}</div>
                ))}
              </div>
            </>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
