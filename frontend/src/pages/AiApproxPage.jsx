import { useEffect, useState } from 'react';
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

const IconBrain = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24A2.5 2.5 0 0 0 14.5 2Z" />
  </svg>
);

const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export default function AiApproxPage() {
  const navigate = useNavigate();
  const [modelLoading, setModelLoading] = useState(true);
  const [modelError, setModelError] = useState('');
  const [currentModel, setCurrentModel] = useState(null);
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
      setModelError('Không thể tải thông tin mô hình.');
      setApproxFields(buildFieldsFromModel(null));
    } finally {
      setModelLoading(false);
    }
  };

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

  return (
    <div className="page-wrapper">
      <PageHeader
        title="Dự đoán xấp xỉ"
        subtitle="Trang demo riêng - không ảnh hưởng mô hình chính"
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => navigate('/ai')}>
              <IconArrowLeft />
              Quay lại
            </button>
          </>
        }
      />

      <div className="dashboard-split">
        <div className="stack-grid">
          <SectionCard
            title="Dự đoán xấp xỉ (Feature Ranking)"
            subtitle="Có thể thay đổi thuộc tính để demo"
          >
            <div className="workflow-list">
              {modelLoading ? (
                <div className="loading loading--flex" style={{ minHeight: '120px' }}>
                  <div className="loading__spinner" />
                  Đang tải thông tin mô hình...
                </div>
              ) : modelError ? (
                <EmptyPanel
                  icon={<IconBrain />}
                  title="Không thể tải thông tin mô hình"
                  description={modelError}
                />
              ) : null}

              <div className="card card--soft" style={{ marginBottom: 0 }}>
                <div className="section-toolbar section-toolbar--compact">
                  <div>
                    <div className="card__title">Thuộc tính đầu vào mô phỏng</div>
                    <div className="card__subtitle">Có thể thêm/xóa để mô phỏng thiếu hoặc dư thuộc tính</div>
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
      </div>
    </div>
  );
}
