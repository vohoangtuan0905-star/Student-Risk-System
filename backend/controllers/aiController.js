const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const db = require('../config/db');

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

    // Kiểm tra dữ liệu đầu vào
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

    const aiCorePath = path.join(__dirname, '..', '..', 'ai_core');
    const tempInputPath = path.join(aiCorePath, 'reports', 'temp_predict_input.json');
    const pythonScriptPath = path.join(aiCorePath, 'predict_best_model.py');

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

    pythonProcess.on('close', async (code) => {
      try {
        if (code !== 0) {
          console.error('Python stderr:', errorOutput);
          return res.status(500).json({
            success: false,
            message: 'Lỗi khi gọi mô hình Python',
            error: errorOutput
          });
        }

        const predictionResult = JSON.parse(result);

        // Nếu có student_id thì cập nhật snapshot vào bảng students
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
      } catch (innerError) {
        console.error('Parse/DB update error:', innerError);
        return res.status(500).json({
          success: false,
          message: 'Lỗi xử lý kết quả AI',
          error: innerError.message
        });
      }
    });

  } catch (error) {
    console.error('predictStudentRisk error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi dự đoán rủi ro sinh viên'
    });
  }
};