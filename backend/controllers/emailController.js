const nodemailer = require('nodemailer');
const db = require('../config/db');

// Tạo transporter (dùng Gmail App Password hoặc SMTP tùy chỉnh)
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

function getRiskLabelVi(riskLevel) {
  if (riskLevel === 'Danger') return 'Nguy hiểm';
  if (riskLevel === 'Warning') return 'Cảnh báo';
  return 'An toàn';
}

function getRiskColor(riskLevel) {
  if (riskLevel === 'Danger') return '#dc2626';
  if (riskLevel === 'Warning') return '#ca8a04';
  return '#16a34a';
}

// Gửi email cảnh báo cho giảng viên chủ nhiệm
exports.sendWarningEmail = async (req, res) => {
  try {
    const { student_id } = req.body;

    if (!student_id) {
      return res.status(400).json({ success: false, message: 'Thiếu student_id' });
    }

    // Kiểm tra cấu hình SMTP
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({
        success: false,
        message: 'Chưa cấu hình SMTP email. Vui lòng thiết lập SMTP_USER và SMTP_PASS trong file .env'
      });
    }

    // Lấy thông tin sinh viên + lớp + giảng viên chủ nhiệm
    const [rows] = await db.query(`
      SELECT 
        s.id,
        s.student_code,
        s.full_name,
        s.email AS student_email,
        s.gpa,
        s.absences,
        s.risk_percentage,
        s.risk_level,
        s.actual_status,
        c.class_code, c.class_name,
        c.homeroom_teacher_id,
        u.full_name AS teacher_name,
        u.email AS teacher_email,
        d.department_name
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN users u ON c.homeroom_teacher_id = u.id
      LEFT JOIN departments d ON s.department_id = d.id
      WHERE s.id = ?
    `, [student_id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên' });
    }

    const student = rows[0];

    if (!student.teacher_email) {
      return res.status(400).json({
        success: false,
        message: `Lớp ${student.class_code || student.class_name || ''} chưa có giảng viên chủ nhiệm hoặc giảng viên chưa có email`
      });
    }

    const riskLabel = getRiskLabelVi(student.risk_level);
    const riskColor = getRiskColor(student.risk_level);
    const riskPercent = student.risk_percentage != null
      ? Number(student.risk_percentage).toFixed(2) + '%'
      : 'Chưa dự đoán';

    // Nội dung email HTML
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e293b, #334155); padding: 24px 28px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 18px; font-weight: 700;">
            ⚠️ CẢNH BÁO RỦI RO SINH VIÊN
          </h1>
          <p style="color: #94a3b8; margin: 6px 0 0; font-size: 13px;">
            Hệ thống Dự báo Rủi ro Sinh viên — Thông báo tự động
          </p>
        </div>

        <!-- Body -->
        <div style="padding: 24px 28px;">
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            Kính gửi <strong>${student.teacher_name || 'Giảng viên'}</strong>,
          </p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Hệ thống AI đã phát hiện sinh viên sau đang ở mức rủi ro cần được quan tâm:
          </p>

          <!-- Student Info Card -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 16px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 130px;">Mã sinh viên:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${student.student_code || '-'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Họ tên:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${student.full_name || '-'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Lớp:</td>
                <td style="padding: 6px 0; color: #0f172a;">${student.class_code || student.class_name || '-'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Khoa:</td>
                <td style="padding: 6px 0; color: #0f172a;">${student.department_name || '-'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">GPA hiện tại:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${student.gpa ?? '-'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Số buổi vắng:</td>
                <td style="padding: 6px 0; color: #0f172a;">${student.absences ?? '-'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Xác suất rủi ro:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${riskPercent}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Mức rủi ro:</td>
                <td style="padding: 6px 0;">
                  <span style="display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; color: #fff; background: ${riskColor};">
                    ${riskLabel}
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Kính đề nghị Thầy/Cô liên hệ với sinh viên để tìm hiểu tình hình và có biện pháp hỗ trợ kịp thời.
          </p>

          ${student.student_email ? `
            <p style="color: #475569; font-size: 13px;">
              📧 Email sinh viên: <a href="mailto:${student.student_email}" style="color: #2563eb;">${student.student_email}</a>
            </p>
          ` : ''}
        </div>

        <!-- Footer -->
        <div style="background: #f1f5f9; padding: 16px 28px; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="color: #94a3b8; font-size: 11px; margin: 0;">
            Email này được gửi tự động từ Hệ thống Dự báo Rủi ro Sinh viên. Vui lòng không reply trực tiếp.
          </p>
          <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0;">
            © ${new Date().getFullYear()} Student Risk System
          </p>
        </div>
      </div>
    `;

    // Gửi email
    const transporter = createTransporter();
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

    await transporter.sendMail({
      from: `"Hệ thống Dự báo Rủi ro SV" <${fromAddress}>`,
      to: student.teacher_email,
      subject: `[CẢNH BÁO] Sinh viên ${student.full_name} (${student.student_code}) - Mức rủi ro: ${riskLabel}`,
      html: htmlContent
    });

    return res.json({
      success: true,
      message: `Đã gửi email cảnh báo đến giảng viên ${student.teacher_name} (${student.teacher_email}) thành công!`,
      sent_to: student.teacher_email,
      student_code: student.student_code
    });

  } catch (error) {
    console.error('sendWarningEmail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi gửi email cảnh báo',
      error: error.message
    });
  }
};
