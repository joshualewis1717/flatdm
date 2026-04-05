import {User, Report, Review, PropertyApplication, Property, PropertyListing, ConfirmFunction} from '@/app/app/reports/types';




export const sendEmail: ConfirmFunction = async ({ user, text }) => {
    
    if (!user || !text) {
        console.error("sendEmail missing user or text", { user, text });
        return;
    }
    
    console.log("sending email to " + user['email'] + ": " + text);
    return;
}