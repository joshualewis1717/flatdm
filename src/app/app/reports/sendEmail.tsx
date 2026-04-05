import {User, Report, Review, PropertyApplication, Property, PropertyListing} from '@/app/app/reports/types';




export function sendEmail({user, text} : {user:User; text:string}) {
    
    if (!user || !text) {
        console.error("sendEmail missing user or text", { user, text });
        return;
    }

    console.log(user);
    console.log("sending email to " + user['email'] + ": " + text);
    return;
}