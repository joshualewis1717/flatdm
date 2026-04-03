import {User, Report, Review, PropertyApplication, Property, PropertyListing} from '@/app/app/reports/types';

export default function sendEmail({user} : User, {text} : string){
    console.log("sending email to " + user['email'] + ": " + text);
    return;
}