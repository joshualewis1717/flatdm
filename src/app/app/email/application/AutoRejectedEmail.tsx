import { SendEmailArgs } from "@/lib/email";
import { ApplicationEmailContext } from "../ApplicationEmails";
import 'server-only'
// email to be sent to be sent when other applicants are automatically rejected when the listing becomes full for
// their intended tenenant period
export function applicationAutoRejectionEmail(to: string,ctx: ApplicationEmailContext): SendEmailArgs {
    return {
      to,
      subject: `Application update for ${ctx.listingTitle}`,
      text: `The listing is no longer available.`,
      html: `
        <p>Hi ${ctx.applicantName ?? "there"},</p>
        <p>Unfortunately, <strong>${ctx.listingTitle}</strong> is no longer available as it has now been filled.</p>
        <p>Your application has been automatically withdrawn.</p>
        <p>You can continue browsing other listings.</p>
      `,
    };
  }