import nodemailer from 'nodemailer'

const SITE_NAME = 'Artha Saya'

function createTransport() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) {
    throw new Error('Gmail not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in your .env file.')
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { type: 'LOGIN', user, pass },
  })
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const transport = createTransport()
  await transport.sendMail({
    from: `"${SITE_NAME}" <${process.env.GMAIL_USER}>`,
    to,
    subject: `${otp} — your ${SITE_NAME} admin login code`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#071d2e;font-family:'Courier New',monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#071d2e;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#0d2d45;border:1px solid #1a4265;border-radius:12px;padding:40px;">
        <tr>
          <td style="padding-bottom:24px;border-bottom:1px solid #1a4265;">
            <span style="color:#C8A756;font-size:20px;font-weight:900;">◆</span>
            <span style="color:#F8F9F4;font-size:20px;font-weight:900;margin-left:8px;">${SITE_NAME}</span>
          </td>
        </tr>
        <tr>
          <td style="padding-top:32px;">
            <p style="color:#BFCCD5;font-size:14px;margin:0 0 8px;">Your admin login code</p>
            <p style="color:#C8A756;font-size:52px;font-weight:900;letter-spacing:16px;margin:0 0 24px;">${otp}</p>
            <p style="color:#BFCCD5;font-size:13px;margin:0 0 24px;">
              This code expires in <strong style="color:#F8F9F4;">5 minutes</strong>.
              Do not share it with anyone.
            </p>
            <p style="color:#7a9eb5;font-size:12px;margin:0;border-top:1px solid #1a4265;padding-top:16px;">
              If you didn&apos;t try to log in, you can safely ignore this email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
}
