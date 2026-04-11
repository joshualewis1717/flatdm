import { SendEmailArgs } from "@/lib/email";
import { ApplicationEmailContext } from "../ApplicationEmails";
import 'server-only'

// application to be sent to landlord when an applicant has withdrawn from a listing application
export function applicationWithdrawnEmail(to: string, ctx: ApplicationEmailContext ): SendEmailArgs {
    return {
      to,
      subject: `Application withdrawn for ${ctx.listingTitle}`,
      text: `An applicant has withdrawn.`,
      html: `
        <p>Hi ${ctx.landlordName ?? "there"},</p>
        <p>${ctx.applicantName} has withdrawn their application for <strong>${ctx.listingTitle}</strong>.</p>
      `,
    };
  }