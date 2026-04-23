import nodemailer from 'nodemailer';

/**
 * 邮件发送工具（Gmail SMTP / Ethereal 预览 双模式）
 * ------------------------------------------------------------------
 * 策略：.env 里配了 MAIL_USER + MAIL_PASS 就走 Gmail，真邮箱能收到；
 * 没配就回退到 Ethereal 测试账号 —— 不会真的投递，控制台打印 preview URL
 * 点开看就行，适合本地 demo。
 *
 * Gmail 用 app password 接入（https://myaccount.google.com/apppasswords
 * 生成 16 位的那串），不能用账号原始密码。
 */
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

/**
 * 发邮件。subject 必填；html 和 text 至少提供一个。
 * 返回 { previewUrl }（Ethereal 模式才有值；Gmail 模式返回 null）。
 * 失败抛异常让上层处理。
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = await getTransporter();
  // Gmail 不允许 from 伪造非本账号域名，这里动态取 MAIL_USER；
  // Ethereal 随便填，不校验
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
