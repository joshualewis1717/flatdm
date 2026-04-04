import {User, Report, Review, PropertyApplication, Property, PropertyListing} from '@/app/app/reports/types';




export function sendEmail(args?: { user?: User | null; text?: string }) {
    const { user, text } = args ?? {};
    if (!user || !text) {
        console.error("sendEmail missing user or text", { user, text });
        return;
    }
    console.log(user);
    console.log("sending email to " + user['email'] + ": " + text);
    return;
}