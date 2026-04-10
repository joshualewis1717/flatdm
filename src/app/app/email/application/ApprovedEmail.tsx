import { SendEmailArgs } from "@/lib/email";
import { ApplicationEmailContext } from "../ApplicationEmails";
import 'server-only'
import { MINIMUM_APPLICATION_WINDOW } from "../../applications/prisma/const";

// email to send to applicants when landlrod approves their application
export function applicationOfferEmailToApplicant( to: string,ctx: ApplicationEmailContext): SendEmailArgs {
    return {
      to,
      subject: `Update on your application for ${ctx.listingTitle}`,
      text: `Your application has been approved and an offer has been made.`,
      html: `
        <p>Hi ${ctx.applicantName ?? "there"},</p>
  
        <p>Your application for <strong>${ctx.listingTitle}</strong> has been <strong>approved</strong>.</p>
  
        <p>The landlord has made you an offer.</p>
  
        <p>You can review and respond to this offer from your dashboard.</p>

        <p> please repdond to this offer within <strong>${MINIMUM_APPLICATION_WINDOW} days</strong>, before it expires !<p>
  
        <p>Best,<br/>The FlatDM Team</p>
      `,
    };
  }