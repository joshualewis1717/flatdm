import { SendEmailArgs } from "@/lib/email";
import { ApplicationEmailContext } from "../ApplicationEmails";
import 'server-only'
// application to be sent to applicants when a landlord rejects their application
export function applicationRejectedEmail(to: string, ctx: ApplicationEmailContext): SendEmailArgs {
    return {
      to,
      subject: `Update on your application for ${ctx.listingTitle}`,
      text: `Hi ${ctx.applicantName ?? "there"}, your application was not successful.`,
      html: `
        <p>Hi ${ctx.applicantName ?? "there"},</p>
        <p>We’re sorry to let you know that your application for <strong>${ctx.listingTitle}</strong> was not successful.</p>
        <p>You can continue browsing other listings on the platform.</p>
      `,
    };
  }