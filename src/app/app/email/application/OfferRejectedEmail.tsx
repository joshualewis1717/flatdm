import { SendEmailArgs } from "@/lib/email";
import { ApplicationEmailContext } from "../ApplicationEmails";
import 'server-only'

// email to be sent to landlord when an applicant with an offer rejects the offer
export function applicationOfferRejectedEmail(to: string,ctx: ApplicationEmailContext): SendEmailArgs {
    return {
      to,
      subject: `Offer declined for ${ctx.listingTitle}`,
      text: `An applicant has declined your offer.`,
      html: `
        <p>Hi ${ctx.landlordName ?? "there"},</p>
  
        <p>${ctx.applicantName} has <strong>declined your offer</strong> for <strong>${ctx.listingTitle}</strong>.</p>
  
        <p>You can review other applicants or continue managing your listing from your dashboard.</p>
  
        <p>Best,<br/>The Team</p>
      `,
    };
  }