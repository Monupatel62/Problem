// Email service — WohoCode uses WohoAuth for email
// This is a stub for build compatibility

export function isEmailProviderConfigured(): boolean {
  return !!(process.env.BREVO_API_KEY || process.env.BREVO_SMTP_KEY);
}

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(options: EmailOptions): Promise<{ ok: boolean }> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("[email] BREVO_API_KEY not set, skipping email send");
    return { ok: false };
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: process.env.EMAIL_FROM_NAME || "WohoCode",
          email: process.env.EMAIL_FROM || "noreply@wohotech.in",
        },
        to: [{ email: options.to }],
        subject: options.subject,
        htmlContent: options.html,
      }),
    });
    return { ok: res.ok };
  } catch (err) {
    console.error("[email] send failed:", err);
    return { ok: false };
  }
}
