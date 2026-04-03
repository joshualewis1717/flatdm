import { prisma } from "@/lib/prisma";
import {User, Report, Review, PropertyApplication, Property, PropertyListing} from '@/app/app/reports/types';
import {sendEmail} from '@/app/app/reports/sendEmail'

export  async function deleteReport({report} : Report){

    // make sure we actually want to delete this
    const ok = window.confirm(`Delete Report ${report['reason']}? This cannot be undone.`);
    if (!ok) return;

    // delete from database
    await prisma.report.delete({
        where: {id: report['id']}
    });

    // confirm in logs
    console.log("deleting report with id: " + report['id']);

    return;
}

export  async function deleteUser({user} : User){

    // make sure we actually want to delete this
    const ok = window.confirm(`Delete User ${user['username']}? This cannot be undone.`);
    if (!ok) return;

    // if user is consultant, also remove related property applications
    if (user['role'] == "CONSULTANT"){

        // deleting property applications
        await prisma.propertyApplication.deleteMany({
            where: {userId: user["id"]}
        });
    }

    // if user is landlord, also remove related properties and property listings
    else if (user['role'] == "LANDLORD"){
        
        // deleting property listings
        await prisma.propertyListing.deleteMany({
            where: {landlordId: user["id"]}
        });

        // deleting properties
        await prisma.property.deleteMany({
            where: {landlordId: user["id"]}
        });
    }

    // delete from database
    await prisma.user.delete({
        where: {id: user["id"]}
    });

    sendEmail(user, "Your account has been deleted");

    // confirm in logs
    console.log("deleting user with id: " + user['id']);

    return;
}

export async function deleteReview({review} : Review){
    // make sure we actually want to delete this
    const ok = window.confirm(`Delete Review ${review['comment']}? This cannot be undone.`);
    if (!ok) return;

    // delete from database
    await prisma.review.delete({
        where: {id: review['id']}
    });

    // confirm in logs
    console.log("deleting review with id: " + id);
    
    return;
}