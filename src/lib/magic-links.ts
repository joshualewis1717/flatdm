import { createHash, randomBytes } from "crypto";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export type MagicLinkTypeValue = "EMAIL_VERIFICATION" | "PASSWORD_RESET";

type MagicLinkUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified?: boolean;
};

type MagicLinkResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "expired" | "used" | "mismatch" };

const MAGIC_LINK_TTL_MS: Record<MagicLinkTypeValue, number> = {
  EMAIL_VERIFICATION: 1000 * 60 * 60 * 24,
  PASSWORD_RESET: 1000 * 60 * 30,
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getBaseUrl(requestUrl: string) {
  const url = new URL(requestUrl);
  return `${url.protocol}//${url.host}`;
}

function getMagicLinkUrl(baseUrl: string, type: MagicLinkTypeValue, token: string) {
  const path = type === "EMAIL_VERIFICATION"
    ? "/api/auth/magic-links/verify"
    : "/reset-password";

  const url = new URL(path, baseUrl);
  url.searchParams.set("token", token);
  return url.toString();
}

function getEmailCopy(type: MagicLinkTypeValue, firstName: string, link: string, expiresAt: Date) {
  const expiryText = expiresAt.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  if (type === "EMAIL_VERIFICATION") {
    return {
      subject: "Verify your FlatDM email address",
      text: [
        `Hi ${firstName},`,
        "",
        "Use the link below to verify your email address:",
        link,
        "",
        `This link expires on ${expiryText}.`,
      ].join("\n"),
      html: [
        `<p>Hi ${firstName},</p>`,
        "<p>Use the link below to verify your email address:</p>",
        `<p><a href="${link}">Verify email address</a></p>`,
        `<p>This link expires on ${expiryText}.</p>`,
      ].join(""),
    };
  }

  return {
    subject: "Reset your FlatDM password",
    text: [
      `Hi ${firstName},`,
      "",
      "Use the link below to reset your password:",
      link,
      "",
      `This link expires on ${expiryText}.`,
    ].join("\n"),
    html: [
      `<p>Hi ${firstName},</p>`,
      "<p>Use the link below to reset your password:</p>",
      `<p><a href="${link}">Reset password</a></p>`,
      `<p>This link expires on ${expiryText}.</p>`,
    ].join(""),
  };
}

async function getActiveMagicLink(token: string) {
  const tokenHash = hashToken(token);

  return prisma.magicLink.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          emailVerified: true,
          isDeleted: true,
        },
      },
    },
  });
}

export async function sendMagicLinkEmail(args: {
  user: MagicLinkUser;
  type: MagicLinkTypeValue;
  requestUrl: string;
}) {
  const { user, type, requestUrl } = args;
  const baseUrl = getBaseUrl(requestUrl);
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MS[type]);
  const link = getMagicLinkUrl(baseUrl, type, rawToken);

  await prisma.magicLink.deleteMany({
    where: {
      userId: user.id,
      type,
      usedAt: null,
    },
  });

  await prisma.magicLink.create({
    data: {
      userId: user.id,
      email: user.email,
      type,
      tokenHash,
      expiresAt,
    },
  });

  const emailCopy = getEmailCopy(type, user.firstName, link, expiresAt);
  const result = await sendEmail({
    to: user.email,
    subject: emailCopy.subject,
    text: emailCopy.text,
    html: emailCopy.html,
  });

  return {
    ...result,
    expiresAt,
    link,
  };
}

export async function consumeEmailVerificationLink(token: string): Promise<MagicLinkResult> {
  const magicLink = await getActiveMagicLink(token);

  if (!magicLink || magicLink.type !== "EMAIL_VERIFICATION") {
    return { ok: false, reason: "invalid" };
  }

  if (magicLink.usedAt) {
    return { ok: false, reason: "used" };
  }

  if (magicLink.expiresAt <= new Date()) {
    return { ok: false, reason: "expired" };
  }

  if (magicLink.user.isDeleted || magicLink.user.email !== magicLink.email) {
    return { ok: false, reason: "mismatch" };
  }

  await prisma.$transaction([
    prisma.magicLink.update({
      where: { id: magicLink.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: magicLink.userId },
      data: { emailVerified: true },
    }),
  ]);

  return { ok: true };
}

export async function resetPasswordWithMagicLink(args: {
  token: string;
  password: string;
}): Promise<MagicLinkResult> {
  const magicLink = await getActiveMagicLink(args.token);

  if (!magicLink || magicLink.type !== "PASSWORD_RESET") {
    return { ok: false, reason: "invalid" };
  }

  if (magicLink.usedAt) {
    return { ok: false, reason: "used" };
  }

  if (magicLink.expiresAt <= new Date()) {
    return { ok: false, reason: "expired" };
  }

  if (magicLink.user.isDeleted || magicLink.user.email !== magicLink.email) {
    return { ok: false, reason: "mismatch" };
  }

  const passwordHash = await hash(args.password, 12);

  await prisma.$transaction([
    prisma.magicLink.update({
      where: { id: magicLink.id },
      data: { usedAt: new Date() },
    }),
    prisma.magicLink.deleteMany({
      where: {
        userId: magicLink.userId,
        type: "PASSWORD_RESET",
        usedAt: null,
        id: { not: magicLink.id },
      },
    }),
    prisma.user.update({
      where: { id: magicLink.userId },
      data: { passwordHash },
    }),
  ]);

  return { ok: true };
}
