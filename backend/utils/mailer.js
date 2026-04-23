import nodemailer from 'nodemailer';
let cachedTransporter = null;
let isGmail = false;

const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  // 走 Gmail：真邮箱能收到
  if (process.env.MAIL_USER && process.env.MAIL_PASS) {
    // app password 里的空格允许用户保留，这里统一去掉
    const pass = process.env.MAIL_PASS.replace(/\s+/g, '');
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.MAIL_USER, pass },
    });
    isGmail = true;
    console.log('[mailer] using Gmail SMTP as %s', process.env.MAIL_USER);
    return cachedTransporter;
  }

  // 回退到 Ethereal：邮件只生成预览链接，不真的投递
  const testAccount = await nodemailer.createTestAccount();
  console.log('[mailer] Ethereal test account created:');
  console.log('[mailer]   user: %s', testAccount.user);
  console.log('[mailer]   pass: %s', testAccount.pass);

  cachedTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  return cachedTransporter;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = await getTransporter();
  const from = isGmail
    ? `"Management Chuwa" <${process.env.MAIL_USER}>`
    : '"Management Chuwa" <no-reply@chuwa.test>';

  const info = await transporter.sendMail({ from, to, subject, html, text });
  const previewUrl = isGmail ? null : nodemailer.getTestMessageUrl(info);

  console.log('[mailer] ✉ sent to %s', to);
  console.log('[mailer]   subject: %s', subject);
  if (previewUrl) console.log('[mailer]   preview: %s', previewUrl);
  return { previewUrl };
};
