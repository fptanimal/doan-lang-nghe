const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

async function sendOtpEmail(toEmail, otpCode) {
  const mailOptions = {
    from: `"Làng Nghề Support" <${process.env.SMTP_EMAIL}>`,
    to: toEmail,
    subject: 'Mã xác thực tài khoản - Làng Nghề',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
        <div style="background: #A8492A; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Xác thực tài khoản</h2>
        </div>
        <div style="padding: 20px; text-align: center; color: #333;">
          <p>Chào bạn,</p>
          <p>Cảm ơn bạn đã đăng ký tham gia khám phá <strong>Làng Nghề</strong>. Dưới đây là mã OTP xác thực của bạn (Mã có hiệu lực trong 5 phút):</p>
          <div style="margin: 30px 0; font-size: 36px; font-weight: bold; letter-spacing: 5px; color: #D4AF37;">
            ${otpCode}
          </div>
          <p style="font-size: 13px; color: #777;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Đã gửi OTP tới ${toEmail}`);
    return true;
  } catch (error) {
    console.error('Lỗi gửi email:', error);
    return false;
  }
}

module.exports = { sendOtpEmail };
