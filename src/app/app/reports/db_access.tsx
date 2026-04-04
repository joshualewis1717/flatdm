"use server";

import { prisma } from "@/lib/prisma";
import {User, Report, Review, PropertyApplication, Property, PropertyListing} from '@/app/app/reports/types';
import {sendEmail} from '@/app/app/reports/sendEmail'


export async function addOffence({user, text} : {user:User; text:string}){
    await prisma.offenceRecord.create({
        data: {
            reason: text,
            userId: user['id']
        },
    }); 

    console.log("Added offence record (" + text + ") to user " + user['username']);
    return;
}





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

    // if user is consultant, also remove related property applications
    if (user['role'] == "CONSULTANT"){
        console.log("user to be deleted is a consultant")

        // deleting property applications
        await prisma.propertyApplication.deleteMany({
            where: {userId: user["id"]}
        });
        console.log("deleted assocaited property applications")
    }

    // if user is landlord, also remove related properties and property listings
    else if (user['role'] == "LANDLORD"){
        console.log("user to be deleted is a landlord")
        
        // deleting property listings
        await prisma.propertyListing.deleteMany({
            where: {landlordId: user["id"]}
        });
        console.log("deleted property listings")

        // deleting properties
        await prisma.property.deleteMany({
            where: {landlordId: user["id"]}
        });
        console.log("deleted properties")
    }

    // for all users, delete reviews they wrote and that were about them
    deleteReviewsLinkedToUser(user['id']);
    console.log("deleted reviews")


    // 'delete' from database by setting isDeleted to true
    await prisma.user.update({
        where: {id: user["id"]},
        data: {isDeleted: true}
    });

    sendEmail({user}, "Your account has been deleted");

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

async function deleteReviewsLinkedToUser({userId} : number){
    console.log("userId: " + userId);

    // first get all reviews to be deleted (written by them or about them)
    const reviews = await prisma.review.findMany({
          where: {
            OR: [
            { authorId: userId },
            { targetUserId: userId }
            ],
        }
    });

    console.log("to del:");
    console.log(reviews);

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