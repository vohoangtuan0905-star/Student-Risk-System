import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { PageHeader, SectionCard, EmptyPanel } from '../components/PageKit';

const FEATURE_CATALOG = [
  { key: 'gender', inputKey: 'gioi_tinh', label: 'Giới tính', defaultValue: 1 },
  { key: 'age_at_enrollment', inputKey: 'tuoi_nhap_hoc', label: 'Tuổi nhập học', defaultValue: 19 },
  { key: 'gpa', inputKey: 'diem_trung_binh', label: 'Điểm trung bình', defaultValue: 12.5 },
  { key: 'tuition_debt', inputKey: 'no_hoc_phi', label: 'Nợ học phí', defaultValue: 0 },
  { key: 'scholarship', inputKey: 'hoc_bong', label: 'Học bổng (0/1)', defaultValue: 0 },
  { key: 'failed_subjects', inputKey: 'so_mon_truot', label: 'Số môn trượt', defaultValue: 0 },
  { key: 'credits_enrolled', inputKey: 'tin_chi_dang_ky', label: 'Số tín chỉ đăng ký', defaultValue: 12 },
  { key: 'credits_passed', inputKey: 'tin_chi_dat', label: 'Số tín chỉ đạt', defaultValue: 10 },
  { key: 'warning_level', inputKey: 'muc_canh_bao', label: 'Mức cảnh báo', defaultValue: 0 },
  { key: 'extra_parent_income', inputKey: 'thu_nhap_gia_dinh', label: 'Thu nhập gia đình (dư thuộc tính)', defaultValue: 15000000 },
  { key: 'extra_behavior_score', inputKey: 'diem_hanh_vi', label: 'Điểm hành vi (dư thuộc tính)', defaultValue: 92 },
];

const TRAIN_DEFAULT_FEATURES = [
  'gender',
  'age_at_enrollment',
  'gpa',
  'tuition_debt',
  'scholarship',
  'failed_subjects',
  'credits_enrolled',
  'credits_passed',
  'warning_level',
];

const FEATURE_LABEL_MAP = FEATURE_CATALOG.reduce((acc, item) => {
  acc[item.key] = item.label;
  return acc;
}, {});

function prettyFeatureName(feature) {
  return FEATURE_LABEL_MAP[feature] || feature;
}

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
  const [approxLoading, setApproxLoading] = useState(false);
  const [approxError, setApproxError] = useState('');
  const [approxResult, setApproxResult] = useState(null);
  const [approxFields, setApproxFields] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState('gender');
  const [customFeatureKey, setCustomFeatureKey] = useState('thuoc_tinh_tuy_chinh');
  const [customFeatureValue, setCustomFeatureValue] = useState('1');

  const normalizeValue = (value) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (trimmed === '') return '';
    if (trimmed.toLowerCase() === 'true') return true;
    if (trimmed.toLowerCase() === 'false') return false;
    if (!Number.isNaN(Number(trimmed))) return Number(trimmed);
    return trimmed;
  };

  const getDefaultFeatureValue = (featureKey) => {
    const found = FEATURE_CATALOG.find((item) => item.key === featureKey);
    return found ? found.defaultValue : '';
  };

  const getInputFeatureKey = (featureKey) => {
    const found = FEATURE_CATALOG.find((item) => item.key === featureKey);
    return found?.inputKey || featureKey;
  };

  const buildFieldsFromModel = (features) => {
    const sourceFeatures = Array.isArray(features) && features.length > 0
      ? features
      : TRAIN_DEFAULT_FEATURES;

    return sourceFeatures.map((featureKey) => ({
      key: getInputFeatureKey(featureKey),
      value: getDefaultFeatureValue(featureKey),
    }));
  };

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
      setApproxFields(buildFieldsFromModel(modelData?.features));
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

  const addSuggestedFeature = () => {
    setApproxFields((prev) => {
      const inputKey = getInputFeatureKey(selectedFeature);
      if (prev.some((item) => item.key === inputKey)) {
        return prev;
      }
      return [...prev, { key: inputKey, value: getDefaultFeatureValue(selectedFeature) }];
    });
  };

  const addCustomFeature = () => {
    const key = customFeatureKey.trim();
    if (!key) return;
    setApproxFields((prev) => {
      if (prev.some((item) => item.key === key)) {
        return prev.map((item) => (item.key === key ? { ...item, value: normalizeValue(customFeatureValue) } : item));
      }
      return [...prev, { key, value: normalizeValue(customFeatureValue) }];
    });
  };

  const updateApproxField = (index, field, value) => {
    setApproxFields((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const removeApproxField = (index) => {
    setApproxFields((prev) => prev.filter((_, i) => i !== index));
  };

  const resetApproxFields = () => {
    setApproxFields(buildFieldsFromModel(currentModel?.features));
    setApproxResult(null);
    setApproxError('');
  };

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

  const handleApproxPredict = async () => {
    try {
      setApproxLoading(true);
      setApproxError('');

      const payload = {};
      approxFields.forEach((item) => {
        const key = item.key?.trim();
        if (!key) return;
        payload[key] = normalizeValue(item.value);
      });

      if (Object.keys(payload).length === 0) {
        setApproxError('Cần ít nhất 1 thuộc tính để dự đoán xấp xỉ');
        return;
      }

      const response = await axiosClient.post('/ai/predict-approx', payload);
      setApproxResult(response.data?.ai_result || null);
    } catch (err) {
      setApproxError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Dự đoán xấp xỉ thất bại'
      );
    } finally {
      setApproxLoading(false);
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

          <SectionCard
            title="Dự đoán xấp xỉ (Feature Ranking)"
            subtitle="Hỗ trợ cả dữ liệu dư thuộc tính và thiếu thuộc tính so với schema train"
          >
            <div className="workflow-list">
              <div className="card card--soft" style={{ marginBottom: 0 }}>
                <div className="section-toolbar section-toolbar--compact">
                  <div>
                    <div className="card__title">Thuộc tính đầu vào mô phỏng</div>
                    <div className="card__subtitle">Mặc định nạp từ mô hình đang train, bạn có thể thêm/xóa để mô phỏng dư hoặc thiếu thuộc tính</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', marginBottom: '10px' }}>
                  <select className="input" value={selectedFeature} onChange={(e) => setSelectedFeature(e.target.value)}>
                    {FEATURE_CATALOG.map((item) => (
                      <option key={item.key} value={item.key}>{item.label}</option>
                    ))}
                  </select>
                  <button type="button" className="btn btn-secondary" onClick={addSuggestedFeature}>Thêm thuộc tính</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', marginBottom: '12px' }}>
                  <input
                    className="input"
                    placeholder="Tên thuộc tính tùy chỉnh"
                    value={customFeatureKey}
                    onChange={(e) => setCustomFeatureKey(e.target.value)}
                  />
                  <input
                    className="input"
                    placeholder="Giá trị"
                    value={customFeatureValue}
                    onChange={(e) => setCustomFeatureValue(e.target.value)}
                  />
                  <button type="button" className="btn btn-secondary" onClick={addCustomFeature}>Thêm</button>
                </div>

                <div className="kv-list" style={{ marginBottom: '8px' }}>
                  {approxFields.map((item, index) => (
                    <div key={`${item.key}-${index}`} className="kv-row" style={{ gridTemplateColumns: '1fr 1fr auto', gap: '8px' }}>
                      <input
                        className="input"
                        value={item.key}
                        onChange={(e) => updateApproxField(index, 'key', e.target.value)}
                        placeholder="Tên thuộc tính"
                      />
                      {item.key === 'gioi_tinh' ? (
                        <select
                          className="input"
                          value={String(item.value ?? '')}
                          onChange={(e) => updateApproxField(index, 'value', e.target.value)}
                        >
                          <option value="0">Nữ</option>
                          <option value="1">Nam</option>
                        </select>
                      ) : item.key === 'no_hoc_phi' ? (
                        <select
                          className="input"
                          value={String(item.value ?? '')}
                          onChange={(e) => updateApproxField(index, 'value', e.target.value)}
                        >
                          <option value="0">Không</option>
                          <option value="1">Có</option>
                        </select>
                      ) : (
                        <input
                          className="input"
                          value={String(item.value ?? '')}
                          onChange={(e) => updateApproxField(index, 'value', e.target.value)}
                          placeholder="Giá trị"
                        />
                      )}
                      <button type="button" className="btn btn-danger" onClick={() => removeApproxField(index)}>
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button className="btn btn-primary" onClick={handleApproxPredict} disabled={approxLoading}>
                    <IconBrain />
                    {approxLoading ? 'Đang dự đoán...' : 'Dự đoán xấp xỉ'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={resetApproxFields}
                    disabled={approxLoading}
                  >
                    Khôi phục thuộc tính gốc
                  </button>
                </div>

                {approxError ? (
                  <div style={{ color: 'var(--red-600)', marginTop: '12px' }}>{approxError}</div>
                ) : null}
              </div>

              {approxResult ? (
                <div className="card card--soft" style={{ marginBottom: 0 }}>
                  <div className="section-toolbar section-toolbar--compact">
                    <div>
                      <div className="card__title">Kết quả xấp xỉ</div>
                      <div className="card__subtitle">Không ảnh hưởng mô hình và endpoint dự đoán chính</div>
                    </div>
                    <span className={`badge ${approxResult.risk_level === 'Danger' ? 'badge-danger' : approxResult.risk_level === 'Warning' ? 'badge-warning' : 'badge-safe'}`}>
                      {approxResult.risk_level || 'N/A'}
                    </span>
                  </div>

                  <div className="metrics-grid" style={{ marginBottom: '12px' }}>
                    <div className="metric-card">
                      <div className="metric-card__value">{approxResult.dropout_probability ?? '—'}</div>
                      <div className="metric-card__label">Xác suất bỏ học</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-card__value">{approxResult?.approximation?.estimated_error ?? '—'}</div>
                      <div className="metric-card__label">Sai số ước lượng</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-card__value">{approxResult?.approximation?.confidence_score ?? '—'}</div>
                      <div className="metric-card__label">Độ tin cậy</div>
                    </div>
                  </div>

                  <div className="kv-list">
                    <div className="kv-row">
                      <span className="kv-row__label">Khoảng xác suất</span>
                      <span className="kv-row__value">
                        {Array.isArray(approxResult?.approximation?.probability_interval)
                          ? `[${approxResult.approximation.probability_interval[0]}, ${approxResult.approximation.probability_interval[1]}]`
                          : '—'}
                      </span>
                    </div>
                    <div className="kv-row">
                      <span className="kv-row__label">Thuộc tính bị thiếu</span>
                      <span className="kv-row__value">
                        {approxResult?.feature_diagnostics?.missing_features?.length
                          ? approxResult.feature_diagnostics.missing_features.map(prettyFeatureName).join(', ')
                          : 'Không có'}
                      </span>
                    </div>
                    <div className="kv-row">
                      <span className="kv-row__label">Thuộc tính dư bị bỏ qua</span>
                      <span className="kv-row__value">
                        {approxResult?.feature_diagnostics?.extra_features_ignored?.length
                          ? approxResult.feature_diagnostics.extra_features_ignored.map(prettyFeatureName).join(', ')
                          : 'Không có'}
                      </span>
                    </div>
                    <div className="kv-row">
                      <span className="kv-row__label">Tỷ lệ phủ thuộc tính (quan trọng)</span>
                      <span className="kv-row__value">
                        {approxResult?.approximation?.weighted_coverage_ratio !== undefined
                          ? `${(approxResult.approximation.weighted_coverage_ratio * 100).toFixed(1)}%`
                          : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="divider" />

                  <h4 className="section-title--tight" style={{ marginBottom: '10px' }}>
                    Top thuộc tính quan trọng
                  </h4>
                  <div className="kv-list">
                    {(approxResult?.feature_diagnostics?.top_important_features || []).slice(0, 5).map((item) => (
                      <div className="kv-row" key={item.feature}>
                        <span className="kv-row__label">{prettyFeatureName(item.feature)}</span>
                        <span className="kv-row__value">{item.importance_pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
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
