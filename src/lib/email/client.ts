interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Email service for sending transactional emails
 * Uses configured email provider (Resend, SendGrid, SMTP, etc.)
 */
export class EmailService {
  private static apiKey = process.env.EMAIL_API_KEY;
  private static fromEmail = process.env.EMAIL_FROM || "noreply@llc-lanka.com";
  private static fromName = process.env.EMAIL_FROM_NAME || "LLC-Lanka IT";
  private static provider = process.env.EMAIL_PROVIDER || "resend";

  /**
   * Send an email
   */
  static async sendEmail(options: EmailOptions): Promise<EmailResponse> {
    const { to, subject, html, text } = options;

    try {
      switch (this.provider) {
        case "resend":
          return await this.sendViaResend({ to, subject, html, ...(text ? { text } : {}) });
        case "sendgrid":
          return await this.sendViaSendGrid({ to, subject, html, ...(text ? { text } : {}) });
        default:
          // Log in development, no-op in production if not configured
          if (process.env.NODE_ENV === "development") {
            console.warn(`[Email] To: ${to}\nSubject: ${subject}\n${html}`);
            return { success: true, messageId: "dev-mode" };
          }
          return { success: false, error: "Email provider not configured" };
      }
    } catch (error) {
      console.error("Email send error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to send email" };
    }
  }

  /**
   * Send via Resend API
   */
  private static async sendViaResend(options: EmailOptions): Promise<EmailResponse> {
    if (!this.apiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  }

  /**
   * Send via SendGrid API
   */
  private static async sendViaSendGrid(options: EmailOptions): Promise<EmailResponse> {
    if (!this.apiKey) {
      throw new Error("SENDGRID_API_KEY not configured");
    }

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: options.to }] }],
        from: { email: this.fromEmail, name: this.fromName },
        subject: options.subject,
        content: [
          { type: "text/html", value: options.html },
          ...(options.text ? [{ type: "text/plain", value: options.text }] : []),
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SendGrid API error: ${error}`);
    }

    return { success: true, messageId: "sent" };
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(to: string, resetLink: string): Promise<EmailResponse> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>LLC-Lanka Issue Tracker</h1>
    </div>
    <div class="content">
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your account. Click the button below to reset your password:</p>
      <p style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetLink}</p>
      <p>This link will expire in 24 hours. If you didn't request this reset, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>LLC-Lanka IT Team</p>
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      to,
      subject: "LLC-Lanka Issue Tracker - Password Reset",
      html,
    });
  }

  /**
   * Send account invitation email
   */
  static async sendInviteEmail(to: string, inviteLink: string, inviterName: string): Promise<EmailResponse> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>LLC-Lanka Issue Tracker</h1>
    </div>
    <div class="content">
      <h2>You've Been Invited!</h2>
      <p><strong>${inviterName}</strong> has invited you to join the LLC-Lanka Issue Tracker platform.</p>
      <p>Click the button below to set up your account:</p>
      <p style="text-align: center;">
        <a href="${inviteLink}" class="button">Accept Invitation</a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${inviteLink}</p>
      <p>This invitation will expire in 7 days.</p>
    </div>
    <div class="footer">
      <p>LLC-Lanka IT Team</p>
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      to,
      subject: "You've been invited to LLC-Lanka Issue Tracker",
      html,
    });
  }
}

export default EmailService;
