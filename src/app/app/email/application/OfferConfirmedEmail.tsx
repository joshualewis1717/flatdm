import { SendEmailArgs } from "@/lib/email";
import { ApplicationEmailContext } from "../ApplicationEmails";
import 'server-only'
// email to landlord when an applicant has accetpted the landlords offer
export function applicationOfferConfirmedEmail(to: string,ctx: ApplicationEmailContext): SendEmailArgs {
    return {
      to,
      subject: `Application confirmed for ${ctx.listingTitle}`,
      text: `An applicant has accepted your offer.`,
      html: `
        <p>Hi ${ctx.landlordName ?? "there"},</p>
        <p>${ctx.applicantName} has <strong>accepted your offer</strong> for <strong>${ctx.listingTitle}</strong>.</p>
        <p>You can now prepare next steps with your new tenant.</p>
      `,
    };
  }