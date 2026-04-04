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

export async function deleteUser({user} : User){
    console.log(user)

    // make sure we actually want to delete this
    const ok = window.confirm(`Delete User ${user['username']}? This cannot be undone.`);
    if (!ok) return;

    // if user is consultant, also remove related property applications and reviews
    if (user['role'] == "CONSULTANT"){

        // deleting property applications
        await prisma.propertyApplication.deleteMany({
            where: {userId: user["id"]}
        });

        // delete reviews
        deleteReviewsFromUser(user['id']);
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

    // add to removed reviews database
    await prisma.removedReview.create({
        data: {
            originalReviewId: review['id'],
            rating: review['rating'],
            comment: review['comment'],
            createdAt: review['createdAt'],
            authorId: review['authorId'],
            targetUserId: review['targetUserId'],
            listingId: review['listingId']
        },
    });


    // delete from database
    await prisma.review.delete({
        where: {id: review['id']}
    });

    // confirm in logs
    console.log("deleting review with id: " + id);
    
    return;
}

async function deleteReviewsFromUser({userId} : number){
    // first get all reviews to be deleted
    const reviews = await prisma.review.findMany({
        where: { authorId: userId },
    });

    // put the reviews into the removed reviews table
    for (let r = 0; r < reviews.length; r++){
        const review = reviews[r];

        // put this review into removed reviews table
        await prisma.removedReview.create({
            data: {
                originalReviewId: review['id'],
                rating: review['rating'],
                comment: review['comment'],
                createdAt: review['createdAt'],
                authorId: review['authorId'],
                targetUserId: review['targetUserId'],
                listingId: review['listingId']
            },
        });
    }

    // remove all the original reviews
    await prisma.review.deleteMany({
        where: {authorId: userId},
    });
}