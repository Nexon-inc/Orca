import { Resend } from 'resend'

export const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : { emails: { send: async () => ({ data: null, error: null }) } } as any

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export const emailTemplates = {
  invite: (inviterName: string, orgName: string, role: string, token: string) => ({
    subject: `You've been invited to join ${orgName} on ORCA`,
    html: `
      <!DOCTYPE html><html>
      <body style="margin:0;padding:0;background:#030a06;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center" style="padding:40px 20px;">
            <table width="560" cellpadding="0" cellspacing="0"
              style="background:#040d06;border:1px solid rgba(0,255,135,0.12);border-radius:12px;">
              <tr><td style="padding:32px 40px;border-bottom:1px solid rgba(0,255,135,0.08);">
                <span style="font-family:sans-serif;font-weight:900;font-size:22px;color:#00FF87;">ORCA</span>
              </td></tr>
              <tr><td style="padding:40px;">
                <h1 style="margin:0 0 12px;font-family:sans-serif;font-weight:800;font-size:24px;color:#FFFFFF;">You've been invited</h1>
                <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.7;">
                  <strong style="color:#FFFFFF;">${inviterName}</strong> has invited you to join
                  <strong style="color:#FFFFFF;">${orgName}</strong> on ORCA as a
                  <strong style="color:#00FF87;">${role}</strong>.
                </p>
                <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.7;">
                  ORCA is an AI Company OS — 9 departments, 45 coordinated agents, one dashboard.
                </p>
                <a href="${APP_URL}/invite/accept/${token}"
                  style="display:inline-block;background:#00FF87;color:#030a06;padding:14px 28px;border-radius:8px;text-decoration:none;font-family:sans-serif;font-weight:700;font-size:14px;">
                  Accept Invite →
                </a>
                <p style="margin:24px 0 0;font-size:12px;color:#374151;">This invite expires in 7 days. If you weren't expecting this, ignore it.</p>
              </td></tr>
              <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);">
                <p style="margin:0;font-size:11px;color:#374151;">Nexonic Industries · nexonic-industries.vercel.app</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>
    `,
  }),

  welcomeOwner: (name: string, orgName: string) => ({
    subject: `Welcome to ORCA, ${name}. Your workforce is ready.`,
    html: `
      <!DOCTYPE html><html>
      <body style="margin:0;padding:0;background:#030a06;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center" style="padding:40px 20px;">
            <table width="560" cellpadding="0" cellspacing="0"
              style="background:#040d06;border:1px solid rgba(0,255,135,0.12);border-radius:12px;">
              <tr><td style="padding:32px 40px;border-bottom:1px solid rgba(0,255,135,0.08);">
                <span style="font-family:sans-serif;font-weight:900;font-size:22px;color:#00FF87;">ORCA</span>
              </td></tr>
              <tr><td style="padding:40px;">
                <h1 style="margin:0 0 12px;font-family:sans-serif;font-weight:800;font-size:24px;color:#FFFFFF;">Welcome, ${name}.</h1>
                <p style="margin:0 0 8px;font-size:14px;color:#6b7280;line-height:1.7;">
                  Your organisation <strong style="color:#FFFFFF;">${orgName}</strong> is set up. Your AI Company OS is ready.
                </p>
                <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.7;">
                  Complete your 5-step onboarding to activate your departments and brief your first agent.
                </p>
                <a href="${APP_URL}/onboarding"
                  style="display:inline-block;background:#00FF87;color:#030a06;padding:14px 28px;border-radius:8px;text-decoration:none;font-family:sans-serif;font-weight:700;font-size:14px;">
                  Start Onboarding →
                </a>
              </td></tr>
              <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);">
                <p style="margin:0;font-size:11px;color:#374151;">Nexonic Industries · nexonic-industries.vercel.app</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>
    `,
  }),

  approvalRequired: (recipientName: string, what: string, orgName: string) => ({
    subject: `Action required: ${what}`,
    html: `
      <!DOCTYPE html><html>
      <body style="margin:0;padding:0;background:#030a06;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center" style="padding:40px 20px;">
            <table width="560" cellpadding="0" cellspacing="0"
              style="background:#040d06;border:1px solid rgba(0,255,135,0.12);border-radius:12px;">
              <tr><td style="padding:32px 40px;border-bottom:1px solid rgba(0,255,135,0.08);">
                <span style="font-family:sans-serif;font-weight:900;font-size:22px;color:#00FF87;">ORCA</span>
              </td></tr>
              <tr><td style="padding:40px;">
                <h1 style="margin:0 0 12px;font-family:sans-serif;font-weight:800;font-size:24px;color:#FFFFFF;">Your approval is needed</h1>
                <p style="margin:0 0 8px;font-size:14px;color:#6b7280;line-height:1.7;">
                  Hi ${recipientName}, an agent action in <strong style="color:#FFFFFF;">${orgName}</strong> requires your approval:
                </p>
                <p style="margin:0 0 24px;font-size:14px;color:#FFFFFF;background:rgba(0,255,135,0.06);border:1px solid rgba(0,255,135,0.12);padding:12px 16px;border-radius:7px;">
                  ${what}
                </p>
                <a href="${APP_URL}/dashboard/review"
                  style="display:inline-block;background:#00FF87;color:#030a06;padding:14px 28px;border-radius:8px;text-decoration:none;font-family:sans-serif;font-weight:700;font-size:14px;">
                  Review Now →
                </a>
              </td></tr>
              <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);">
                <p style="margin:0;font-size:11px;color:#374151;">Nexonic Industries · nexonic-industries.vercel.app</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>
    `,
  }),

  planUpgraded: (name: string, plan: string) => ({
    subject: `You're now on ORCA ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
    html: `
      <!DOCTYPE html><html>
      <body style="margin:0;padding:0;background:#030a06;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center" style="padding:40px 20px;">
            <table width="560" cellpadding="0" cellspacing="0"
              style="background:#040d06;border:1px solid rgba(0,255,135,0.12);border-radius:12px;">
              <tr><td style="padding:32px 40px;border-bottom:1px solid rgba(0,255,135,0.08);">
                <span style="font-family:sans-serif;font-weight:900;font-size:22px;color:#00FF87;">ORCA</span>
              </td></tr>
              <tr><td style="padding:40px;">
                <h1 style="margin:0 0 12px;font-family:sans-serif;font-weight:800;font-size:24px;color:#FFFFFF;">
                  You're on ${plan.charAt(0).toUpperCase() + plan.slice(1)}.
                </h1>
                <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.7;">
                  Hey ${name} — your plan is live. Your new departments and agents are unlocked. Go to your dashboard to start using them.
                </p>
                <a href="${APP_URL}/dashboard"
                  style="display:inline-block;background:#00FF87;color:#030a06;padding:14px 28px;border-radius:8px;text-decoration:none;font-family:sans-serif;font-weight:700;font-size:14px;">
                  Go to Dashboard →
                </a>
              </td></tr>
              <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);">
                <p style="margin:0;font-size:11px;color:#374151;">Nexonic Industries · nexonic-industries.vercel.app</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>
    `,
  }),
}
