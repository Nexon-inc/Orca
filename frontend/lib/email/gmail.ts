import nodemailer from 'nodemailer'

export const gmailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER!,
    pass: process.env.GMAIL_APP_PASSWORD!,
  },
})

export async function verifyGmailConnection(): Promise<boolean> {
  try {
    await gmailTransport.verify()
    return true
  } catch (error) {
    console.error('Gmail SMTP connection failed:', error)
    return false
  }
}

export async function sendVerificationEmail(
  toEmail: string,
  userName: string,
  verificationLink: string
): Promise<void> {
  await gmailTransport.sendMail({
    from: `"ORCA by Nexonic" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `Verify your ORCA account, ${userName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
      <body style="margin:0;padding:0;background:#030a06;font-family:'DM Mono',monospace;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:40px 20px;">
              <table width="560" cellpadding="0" cellspacing="0"
                style="background:#040d06;border:1px solid rgba(0,255,135,0.12);border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:32px 40px;border-bottom:1px solid rgba(0,255,135,0.08);">
                    <span style="font-family:sans-serif;font-weight:900;font-size:22px;color:#00FF87;letter-spacing:-0.5px;">ORCA</span>
                    <span style="font-size:11px;color:#4a7a5a;margin-left:10px;font-family:monospace;">AI Company OS</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px;">
                    <h1 style="margin:0 0 12px;font-family:sans-serif;font-weight:800;font-size:24px;color:#FFFFFF;">Verify your account</h1>
                    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.7;">
                      Hey ${userName} — you're almost in. Click the button below to verify your email and access your ORCA dashboard.
                    </p>
                    <a href="${verificationLink}"
                      style="display:inline-block;background:#00FF87;color:#030a06;padding:14px 28px;border-radius:8px;text-decoration:none;font-family:sans-serif;font-weight:700;font-size:14px;">
                      Verify my account →
                    </a>
                    <p style="margin:28px 0 0;font-size:12px;color:#374151;line-height:1.6;">
                      This link expires in 24 hours. If you didn't create an ORCA account, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);">
                    <p style="margin:0;font-size:11px;color:#374151;">Nexonic Industries · nexonic-industries.vercel.app</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Hey ${userName},\n\nVerify your ORCA account: ${verificationLink}\n\nExpires in 24 hours.\n\nNexonic Industries`,
  })
}

export async function sendPasswordResetEmail(
  toEmail: string,
  userName: string,
  resetLink: string
): Promise<void> {
  await gmailTransport.sendMail({
    from: `"ORCA by Nexonic" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `Reset your ORCA password`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#030a06;font-family:'DM Mono',monospace;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:40px 20px;">
              <table width="560" cellpadding="0" cellspacing="0"
                style="background:#040d06;border:1px solid rgba(0,255,135,0.12);border-radius:12px;">
                <tr>
                  <td style="padding:32px 40px;border-bottom:1px solid rgba(0,255,135,0.08);">
                    <span style="font-family:sans-serif;font-weight:900;font-size:22px;color:#00FF87;">ORCA</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px;">
                    <h1 style="margin:0 0 12px;font-family:sans-serif;font-weight:800;font-size:24px;color:#FFFFFF;">Reset your password</h1>
                    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.7;">
                      Hey ${userName} — we received a request to reset your ORCA password. Click below to choose a new one.
                    </p>
                    <a href="${resetLink}"
                      style="display:inline-block;background:#00FF87;color:#030a06;padding:14px 28px;border-radius:8px;text-decoration:none;font-family:sans-serif;font-weight:700;font-size:14px;">
                      Reset my password →
                    </a>
                    <p style="margin:28px 0 0;font-size:12px;color:#374151;line-height:1.6;">
                      This link expires in 1 hour. If you didn't request a password reset, your account is safe — ignore this email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);">
                    <p style="margin:0;font-size:11px;color:#374151;">Nexonic Industries · nexonic-industries.vercel.app</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Reset your ORCA password: ${resetLink}\n\nExpires in 1 hour.\n\nNexonic Industries`,
  })
}
export async function sendWelcomeEmail(
  toEmail: string,
  userName: string
): Promise<void> {
  await gmailTransport.sendMail({
    from: `"ORCA by Nexonic" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `Welcome to the Future of Work, ${userName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:0;background:#030a06;font-family:sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#030a06;padding:40px;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#040d06;border:1px solid rgba(0,255,135,0.1);border-radius:16px;padding:40px;">
                <tr>
                  <td>
                    <h1 style="color:#00FF87;font-size:32px;margin-bottom:20px;">Welcome to ORCA.</h1>
                    <p style="color:#FFFFFF;font-size:16px;line-height:1.6;margin-bottom:30px;">
                      You just deployed your first AI-powered company. While your agents are being initialized, we need to verify your access.
                    </p>
                    <div style="background:rgba(0,255,135,0.05);border-radius:12px;padding:24px;margin-bottom:30px;">
                      <h3 style="color:#00FF87;margin:0 0 10px;font-size:14px;text-transform:uppercase;">What's Next?</h3>
                      <p style="color:#6b7280;font-size:14px;margin:0;">
                        1. Verify your email (check your next email)<br>
                        2. Setup your departments<br>
                        3. Activate your executive team
                      </p>
                    </div>
                    <p style="color:#4a7a5a;font-size:12px;">Automated by Nexonic Industries</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Welcome to ORCA, ${userName}!\n\nYou've just deployed your first AI-powered company.\n\nPlease check your next email for the verification link to activate your dashboard.`,
  })
}

