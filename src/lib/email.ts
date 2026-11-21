type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

type SendEmailResult =
  | { ok: true; provider: string }
  | { ok: false; skipped: true }
  | { ok: false; error: string; allFailed: true };

/** Returns true when at least one provider is fully configured. */
export function isEmailProviderConfigured(): boolean {
  const hasBrevoApi  = Boolean(process.env.BREVO_API_KEY?.startsWith("xkeysib-") && process.env.EMAIL_FROM);
  const hasBrevoSmtp = Boolean(process.env.BREVO_SMTP_KEY && process.env.BREVO_SMTP_USER && process.env.EMAIL_FROM);
  const hasGenericSmtp = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  return hasBrevoApi || hasBrevoSmtp || hasGenericSmtp;
}

/**
 * Send a transactional email.
 *
 * Provider cascade:
 *  1. Brevo HTTP REST API  (xkeysib- key — no IP restriction)
 *  2. Brevo SMTP relay     (xsmtpsib- key — requires IP whitelist)
 *  3. Generic SMTP         (SMTP_HOST / SMTP_USER / SMTP_PASS)
 *
 * Returns { ok: false, skipped: true } when no provider is configured.
 * Returns { ok: false, allFailed: true, error } when all configured providers fail.
 * Returns { ok: true, provider } on success.
 *
 * This function does NOT throw — callers must check `result.ok`.
 */
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<SendEmailResult> {
  // Read credentials at call time so Next.js hot-reload and serverless cold
  // starts always pick up the current environment.
  const brevoApiKey   = (process.env.BREVO_API_KEY   ?? "").trim();
  const brevoSmtpKey  = (process.env.BREVO_SMTP_KEY  ?? "").trim();
  const brevoSmtpUser = (process.env.BREVO_SMTP_USER ?? "").trim();
  const smtpHost      = (process.env.SMTP_HOST       ?? "").trim();
  const smtpPort      = parseInt(process.env.SMTP_PORT ?? "587");
  const smtpUser      = (process.env.SMTP_USER       ?? "").trim();
  const smtpPass      = (process.env.SMTP_PASS       ?? "").trim();
  const emailFrom     = (process.env.EMAIL_FROM      ?? smtpUser).trim();
  const senderName    = (process.env.EMAIL_FROM_NAME ?? "WoHoTech").trim();

  // Emit safe diagnostics (no secrets)
  console.log("[email] --- diagnostics ---");
  console.log(`[email] BREVO_API_KEY configured : ${brevoApiKey.startsWith("xkeysib-") ? "YES (xkeysib-)" : brevoApiKey ? "YES (non-standard prefix)" : "NO"}`);
  console.log(`[email] BREVO_SMTP_KEY configured: ${brevoSmtpKey ? "YES (len=" + brevoSmtpKey.length + ")" : "NO"}`);
  console.log(`[email] BREVO_SMTP_USER          : ${brevoSmtpUser || "NOT SET"}`);
  console.log(`[email] SMTP_HOST                : ${smtpHost || "NOT SET"}`);
  console.log(`[email] EMAIL_FROM               : ${emailFrom || "NOT SET"}`);
  console.log("[email] ----------------");

  if (!emailFrom) {
    console.warn("[email] EMAIL_FROM not set — cannot send email.");
    return { ok: false, skipped: true };
  }

  const errors: string[] = [];
  console.log(`[email] Sending to ${to}...`);

  // ── 1. Brevo HTTP REST API ──────────────────────────────────────────────────
  // Only attempt when key starts with xkeysib- (HTTP API key, no IP restriction)
  if (brevoApiKey.startsWith("xkeysib-")) {
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": brevoApiKey,
        },
        body: JSON.stringify({
          sender: { name: senderName, email: emailFrom },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        console.log(`[email] ✅ Sent via Brevo HTTP API. ID: ${data?.messageId}`);
        return { ok: true, provider: "brevo-api" };
      }

      const errBody = await res.json().catch(() => null);
      const errMsg = `Brevo HTTP API ${res.status}: ${errBody?.message ?? "unknown"}`;
      console.error(`[email] ${errMsg}`);
      errors.push(errMsg);
    } catch (e: unknown) {
      const msg = `Brevo HTTP API exception: ${(e as Error).message}`;
      console.error(`[email] ${msg}`);
      errors.push(msg);
    }
  } else if (brevoApiKey) {
    console.warn(`[email] BREVO_API_KEY present but does not start with xkeysib- (starts with: ${brevoApiKey.slice(0, 8)}...). Skipping HTTP API.`);
  }

  // ── 2. Brevo SMTP relay ─────────────────────────────────────────────────────
  // Requires IP whitelist on Brevo dashboard — will fail from dynamic IPs.
  if (brevoSmtpKey && brevoSmtpUser) {
    const result = await trySMTP({
      host: "smtp-relay.brevo.com", port: 587, secure: false,
      user: brevoSmtpUser, pass: brevoSmtpKey,
      from: `${senderName} <${emailFrom}>`, to, subject, html,
      label: "Brevo SMTP",
    });
    if (result.ok) return result;
    errors.push(result.error ?? "Brevo SMTP failed");
  }

  // ── 3. Generic SMTP ─────────────────────────────────────────────────────────
  if (smtpHost && smtpUser && smtpPass) {
    const result = await trySMTP({
      host: smtpHost, port: smtpPort, secure: smtpPort === 465,
      user: smtpUser, pass: smtpPass,
      from: `${senderName} <${emailFrom}>`, to, subject, html,
      label: `SMTP (${smtpHost})`,
    });
    if (result.ok) return result;
    errors.push(result.error ?? "Generic SMTP failed");
  }

  const summary = errors.length > 0 ? errors.join("; ") : "No email provider configured";
  console.error(`[email] ❌ All providers failed: ${summary}`);
  return { ok: false, allFailed: true, error: summary };
}

async function trySMTP(opts: {
  host: string; port: number; secure: boolean;
  user: string; pass: string;
  from: string; to: string; subject: string; html: string;
  label: string;
}): Promise<{ ok: true; provider: string } | { ok: false; error: string }> {
  try {
    const nodemailer = (await import("nodemailer")) as typeof import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: opts.host,
      port: opts.port,
      secure: opts.secure,
      requireTLS: !opts.secure,
      auth: { user: opts.user, pass: opts.pass },
      tls: { rejectUnauthorized: false },
    });

    const info = await transporter.sendMail({
      from: opts.from, to: opts.to, subject: opts.subject, html: opts.html,
    });

    console.log(`[email] ✅ Sent via ${opts.label}. ID: ${info.messageId}`);
    return { ok: true, provider: opts.label };
  } catch (e: unknown) {
    const msg = `${opts.label} failed: ${(e as Error).message}`;
    console.error(`[email] ${msg}`);
    return { ok: false, error: msg };
  }
}
