import nodemailer from "nodemailer";

type SendEmailArgs = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

type SendEmailResult = {
  messageId?: string;
  previewOnly: boolean;
  previewUrl?: string;
};

function getSmtpPort() {
  const rawPort = process.env.SMTP_PORT;
  if (!rawPort) return null;

  const port = Number(rawPort);
  return Number.isFinite(port) ? port : null;
}

export async function sendEmail(args: SendEmailArgs): Promise<SendEmailResult> {
  const host = process.env.SMTP_HOST;
  const port = getSmtpPort();
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true";
  const from = process.env.EMAIL_FROM ?? user ?? "no-reply@flatdm.local";

  if ((user && !pass) || (!user && pass)) {
    throw new Error("SMTP_USER and SMTP_PASS must be configured together");
  }

  if (!host || !port) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP is not configured");
    }

    const previewUrl = `mailto:${args.to}?subject=${encodeURIComponent(args.subject)}`;
    console.log("Email preview", {
      to: args.to,
      subject: args.subject,
      text: args.text,
      html: args.html,
    });

    return { previewOnly: true, previewUrl };
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
  });

  const info = await transport.sendMail({
    from,
    to: args.to,
    subject: args.subject,
    text: args.text,
    html: args.html,
  });

  return {
    messageId: info.messageId,
    previewOnly: false,
  };
}
