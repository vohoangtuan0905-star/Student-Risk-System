const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const db = require('../config/db');

const FEATURE_KEY_ALIASES = {
  gender: ['gender', 'gioi_tinh', 'gioitinh', 'phai', 'sex'],
  age_at_enrollment: ['age_at_enrollment', 'age', 'tuoi_nhap_hoc', 'tuoinhaphoc', 'tuoi_vao_hoc', 'tuoivaohoc'],
  gpa: ['gpa', 'diem_trung_binh', 'diemtrungbinh', 'diem_tb', 'diemtb'],
  tuition_debt: ['tuition_debt', 'no_hoc_phi', 'nohocphi', 'hoc_phi_no', 'hocphino'],
  scholarship: ['scholarship', 'hoc_bong', 'hocbong'],
  failed_subjects: ['failed_subjects', 'so_mon_truot', 'somontruot', 'mon_truot', 'montruot'],
  credits_enrolled: ['credits_enrolled', 'tin_chi_dang_ky', 'tinchidangky', 'so_tin_chi_dang_ky', 'sotinchidangky'],
  credits_passed: ['credits_passed', 'tin_chi_dat', 'tinchidat', 'so_tin_chi_dat', 'sotinchidat'],
  warning_level: ['warning_level', 'muc_canh_bao', 'muccanhbao', 'canh_bao', 'canhbao']
};

function normalizeFeatureToken(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

const FEATURE_ALIAS_INDEX = Object.entries(FEATURE_KEY_ALIASES).reduce((acc, [canonicalKey, aliases]) => {
  aliases.forEach((alias) => {
    acc[normalizeFeatureToken(alias)] = canonicalKey;
  });
  return acc;
}, {});

function normalizeApproxPayloadKeys(payload) {
  const normalized = {};

  Object.entries(payload || {}).forEach(([rawKey, value]) => {
    const token = normalizeFeatureToken(rawKey);
    const mappedKey = FEATURE_ALIAS_INDEX[token] || rawKey;

    if (!(mappedKey in normalized)) {
      normalized[mappedKey] = value;
    }
  });

  return normalized;
}

function runPythonScript(scriptName, payload) {
  return new Promise((resolve, reject) => {
    try {
      const aiCorePath = path.join(__dirname, '..', '..', 'ai_core');
      const reportsDir = path.join(aiCorePath, 'reports');
      const tempInputPath = path.join(reportsDir, 'temp_predict_input.json');
      const pythonScriptPath = path.join(aiCorePath, scriptName);

      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      fs.writeFileSync(tempInputPath, JSON.stringify(payload, null, 2), 'utf-8');

      const pythonProcess = spawn('python', [pythonScriptPath, tempInputPath], {
        cwd: aiCorePath
      });

      let result = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(errorOutput || 'Lỗi khi gọi mô hình Python'));
        }

        try {
          const predictionResult = JSON.parse(result);
          resolve(predictionResult);
        } catch (parseError) {
          reject(parseError);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

function runPythonPrediction(payload) {
  return runPythonScript('predict_best_model.py', payload);
}

function runPythonApproxPrediction(payload) {
  return runPythonScript('predict_with_feature_ranking.py', payload);
}

function normalizeGender(gender) {
  if (gender === 'Male') return 1;
  if (gender === 'Female') return 0;
  return 0;
}

exports.predictStudentRisk = async (req, res) => {
  try {
    const {
      student_id,
      gender,
      age_at_enrollment,
      gpa,
      tuition_debt,
      scholarship,
      failed_subjects,
      credits_enrolled,
      credits_passed,
      warning_level
    } = req.body;

    if (
      gender === undefined ||
      age_at_enrollment === undefined ||
      gpa === undefined ||
      tuition_debt === undefined ||
      scholarship === undefined ||
      failed_subjects === undefined ||
      credits_enrolled === undefined ||
      credits_passed === undefined ||
      warning_level === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu một hoặc nhiều feature AI v1'
      });
    }

    const payload = {
      gender: Number(gender),
      age_at_enrollment: Number(age_at_enrollment),
      gpa: Number(gpa),
      tuition_debt: Number(tuition_debt),
      scholarship: Number(scholarship),
      failed_subjects: Number(failed_subjects),
      credits_enrolled: Number(credits_enrolled),
      credits_passed: Number(credits_passed),
      warning_level: Number(warning_level)
    };

    const predictionResult = await runPythonPrediction(payload);

    if (student_id) {
      await db.query(`
        UPDATE students
        SET
          gpa = ?,
          tuition_debt = ?,
          scholarship = ?,
          risk_percentage = ?,
          risk_level = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        payload.gpa,
        payload.tuition_debt,
        payload.scholarship,
        predictionResult.dropout_probability * 100,
        predictionResult.risk_level,
        student_id
      ]);
    }

    return res.json({
      success: true,
      message: 'Dự đoán thành công',
      input_features: payload,
      ai_result: predictionResult
    });

  } catch (error) {
    console.error('predictStudentRisk error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi dự đoán rủi ro sinh viên',
      error: error.message
    });
  }
};

exports.predictByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { semester_id } = req.body || {};

    // 1. Kiểm tra sinh viên
    const [studentRows] = await db.query(`
      SELECT id, student_code, full_name, gender, age_at_enrollment
      FROM students
      WHERE id = ?
    `, [studentId]);

    if (studentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sinh viên'
      });
    }

    const student = studentRows[0];

    // 2. Lấy academic record
    let academicRecordQuery = `
      SELECT
        sar.id,
        sar.student_id,
        sar.semester_id,
        sar.gpa,
        sar.tuition_debt,
        sar.scholarship,
        sar.failed_subjects,
        sar.credits_enrolled,
        sar.credits_passed,
        sar.warning_level,
        sem.academic_year,
        sem.semester_no,
        sem.semester_name
      FROM student_academic_records sar
      JOIN semesters sem ON sar.semester_id = sem.id
      WHERE sar.student_id = ?
    `;
    const queryParams = [studentId];

    if (semester_id) {
      academicRecordQuery += ` AND sar.semester_id = ? `;
      queryParams.push(semester_id);
    } else {
      academicRecordQuery += ` ORDER BY sem.academic_year DESC, sem.semester_no DESC LIMIT 1 `;
    }

    const [recordRows] = await db.query(academicRecordQuery, queryParams);

    if (recordRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bản ghi học tập phù hợp cho sinh viên này'
      });
    }

    const academicRecord = recordRows[0];

    // 3. Dựng feature AI v1 tự động từ DB
    const payload = {
      gender: normalizeGender(student.gender),
      age_at_enrollment: Number(student.age_at_enrollment || 18),
      gpa: Number(academicRecord.gpa || 0),
      tuition_debt: Number(academicRecord.tuition_debt || 0),
      scholarship: Number(academicRecord.scholarship || 0),
      failed_subjects: Number(academicRecord.failed_subjects || 0),
      credits_enrolled: Number(academicRecord.credits_enrolled || 0),
      credits_passed: Number(academicRecord.credits_passed || 0),
      warning_level: Number(academicRecord.warning_level || 0)
    };

    // 4. Gọi AI
    const predictionResult = await runPythonPrediction(payload);

    // 5. Cập nhật snapshot ở bảng students
    await db.query(`
      UPDATE students
      SET
        gpa = ?,
        tuition_debt = ?,
        scholarship = ?,
        risk_percentage = ?,
        risk_level = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      payload.gpa,
      payload.tuition_debt,
      payload.scholarship,
      predictionResult.dropout_probability * 100,
      predictionResult.risk_level,
      studentId
    ]);

    // 6. Cập nhật luôn kết quả AI vào record học kỳ
    await db.query(`
      UPDATE student_academic_records
      SET
        risk_percentage = ?,
        risk_level = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      predictionResult.dropout_probability * 100,
      predictionResult.risk_level,
      academicRecord.id
    ]);

    return res.json({
      success: true,
      message: 'Dự đoán theo student_id thành công',
      student: {
        id: student.id,
        student_code: student.student_code,
        full_name: student.full_name,
        gender: student.gender,
        age_at_enrollment: student.age_at_enrollment
      },
      academic_record: {
        id: academicRecord.id,
        semester_id: academicRecord.semester_id,
        academic_year: academicRecord.academic_year,
        semester_no: academicRecord.semester_no,
        semester_name: academicRecord.semester_name
      },
      input_features: payload,
      ai_result: predictionResult
    });

  } catch (error) {
    console.error('predictByStudentId error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi dự đoán theo student_id',
      error: error.message
    });
  }
  
};
exports.retrainModel = async (req, res) => {
  try {
    const requestedByUserId = req.user?.id || null;

    // 1. Tìm model production hiện tại
    const [currentModels] = await db.query(`
      SELECT id, version_label
      FROM ml_model_versions
      WHERE is_production = 1
      ORDER BY id DESC
      LIMIT 1
    `);

    const oldModelVersionId = currentModels.length > 0 ? currentModels[0].id : null;

    // 2. Tạo retrain job trạng thái running
    const [jobResult] = await db.query(`
      INSERT INTO retrain_jobs (
        requested_by_user_id,
        source_dataset,
        algorithm,
        status,
        old_model_version_id,
        started_at,
        log_text
      ) VALUES (?, ?, ?, ?, ?, NOW(), ?)
    `, [
      requestedByUserId,
      'kaggle',
      'LogisticRegression',
      'running',
      oldModelVersionId,
      'Bắt đầu retrain mô hình'
    ]);

    const retrainJobId = jobResult.insertId;

    // 3. Gọi Python retrain
    const aiCorePath = path.join(__dirname, '..', '..', 'ai_core');
    const pythonScriptPath = path.join(aiCorePath, 'retrain_best_model.py');

    const pythonProcess = spawn('python', [pythonScriptPath], {
      cwd: aiCorePath
    });

    let result = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      try {
        if (code !== 0) {
          await db.query(`
            UPDATE retrain_jobs
            SET status = 'failed',
                finished_at = NOW(),
                log_text = ?
            WHERE id = ?
          `, [errorOutput || 'Retrain failed', retrainJobId]);

          return res.status(500).json({
            success: false,
            message: 'Huấn luyện lại mô hình thất bại',
            error: errorOutput
          });
        }

        const retrainResult = JSON.parse(result);

        // 4. Hạ model production cũ
        await db.query(`
          UPDATE ml_model_versions
          SET is_production = 0
          WHERE is_production = 1
        `);

        // 5. Thêm version model mới
        const [newModelResult] = await db.query(`
          INSERT INTO ml_model_versions (
            model_name,
            version_label,
            algorithm,
            dataset_source,
            target_type,
            metrics_json,
            artifact_path,
            is_production,
            trained_at,
            created_by_user_id,
            note
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
        `, [
          'Student Dropout Predictor',
          retrainResult.version_label,
          'LogisticRegression',
          'kaggle',
          'binary',
          JSON.stringify(retrainResult.metrics),
          retrainResult.model_path,
          1,
          requestedByUserId,
          'Retrain theo chu kỳ từ API /api/ai/retrain'
        ]);

        const newModelVersionId = newModelResult.insertId;

        // 6. Cập nhật retrain job thành công
        await db.query(`
          UPDATE retrain_jobs
          SET status = 'success',
              new_model_version_id = ?,
              finished_at = NOW(),
              log_text = ?
          WHERE id = ?
        `, [
          newModelVersionId,
          `Retrain thành công. Version mới: ${retrainResult.version_label}`,
          retrainJobId
        ]);

        return res.json({
          success: true,
          message: 'Huấn luyện lại mô hình thành công',
          retrain_job_id: retrainJobId,
          new_model_version_id: newModelVersionId,
          retrain_result: retrainResult
        });

      } catch (innerError) {
        console.error('retrainModel inner error:', innerError);

        await db.query(`
          UPDATE retrain_jobs
          SET status = 'failed',
              finished_at = NOW(),
              log_text = ?
          WHERE id = ?
        `, [innerError.message, retrainJobId]);

        return res.status(500).json({
          success: false,
          message: 'Lỗi xử lý kết quả retrain',
          error: innerError.message
        });
      }
    });

  } catch (error) {
    console.error('retrainModel error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi huấn luyện lại mô hình',
      error: error.message
    });
  }
};

exports.getCurrentModel = async (req, res) => {
  try {
    // 1. Lấy model hiện tại từ database
    const [currentModels] = await db.query(`
      SELECT
        id,
        model_name,
        version_label,
        algorithm,
        dataset_source,
        target_type,
        metrics_json,
        artifact_path,
        is_production,
        trained_at,
        created_by_user_id
      FROM ml_model_versions
      WHERE is_production = 1
      ORDER BY id DESC
      LIMIT 1
    `);

    if (currentModels.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mô hình production'
      });
    }

    const model = currentModels[0];
    const metricsJson = typeof model.metrics_json === 'string' 
      ? JSON.parse(model.metrics_json) 
      : model.metrics_json;

    // 2. Đọc metadata từ file (để lấy tên feature)
    let features = [];
    try {
      const path = require('path');
      const fs = require('fs');
      const aiCorePath = path.join(__dirname, '..', '..', 'ai_core');
      const metadataPath = path.join(aiCorePath, 'artifacts', 'best_model_metadata.json');
      
      if (fs.existsSync(metadataPath)) {
        const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
        const metadata = JSON.parse(metadataContent);
        features = metadata.feature_columns || [];
      }
    } catch (err) {
      console.warn('Không thể đọc metadata file:', err.message);
    }

    return res.json({
      success: true,
      message: 'Lấy thông tin mô hình hiện tại thành công',
      model: {
        id: model.id,
        name: model.model_name,
        version: model.version_label,
        algorithm: model.algorithm,
        dataset_source: model.dataset_source,
        target_type: model.target_type,
        trained_at: model.trained_at,
        is_production: model.is_production,
        metrics: metricsJson,
        features: features,
        artifact_path: model.artifact_path
      }
    });

  } catch (error) {
    console.error('getCurrentModel error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin mô hình',
      error: error.message
    });
  }
};

exports.predictStudentRiskApprox = async (req, res) => {
  try {
    const payload = req.body;

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return res.status(400).json({
        success: false,
        message: 'Payload phải là object JSON chứa các thuộc tính đầu vào'
      });
    }

    const normalizedPayload = normalizeApproxPayloadKeys(payload);
    const approxResult = await runPythonApproxPrediction(normalizedPayload);

    return res.json({
      success: true,
      message: 'Dự đoán xấp xỉ thành công (không ảnh hưởng mô hình chính)',
      mode: 'approx_feature_ranking',
      input_features: normalizedPayload,
      ai_result: approxResult
    });
  } catch (error) {
    console.error('predictStudentRiskApprox error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi dự đoán xấp xỉ',
      error: error.message
    });
  }
};