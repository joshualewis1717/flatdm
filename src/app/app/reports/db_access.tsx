"use server";

import { prisma } from "@/lib/prisma";
import {User, Report, Review, PropertyApplication, Property, PropertyListing, FilterSearchProps} from '@/app/app/reports/types';
import {sendEmail} from '@/app/app/reports/sendEmail'
import { use } from "react";
import { isErrored } from "stream";
import {ConfirmFunction} from '@/app/app/reports/types';

// delete all properties (and all associated listings and applications) by a given landlord id
async function rawDeletePropertiesByLandlord({landlordId} : {landlordId : number}){
    if (landlordId == undefined){
        console.log("error: trying to delete properties for undefined user id");
        return;
    }

    // first remove associated property listings
    await rawDeletePropertyListingByLandlord({landlordId:landlordId});

    // deleting properties
    await prisma.property.deleteMany({
        where: {landlordId: landlordId}
    });
    console.log("deleted properties")
    return;
}

// delete all property applications made by a given user id
async function rawDeletePropertyApplicationsByUser({userId} : {userId : number}){

    await prisma.propertyApplication.deleteMany({
        where: {userId: {equals: userId}}
    });

    console.log("deleted property applications by user " + userId);
    return;
}

// delete all property applications for a given listing id
async function rawDeletePropertyApplicationsByListing({listingId} : {listingId : number}){
    await prisma.propertyApplication.deleteMany({
        where: {listingId: listingId}
    });

    console.log("deleted property applications for listing id " + listingId);
    return;
}

async function rawDeletePropertyListingByLandlord({landlordId} : {landlordId : number}){

    // get all property listings ids where the landlord id is landlordId
    const propertyListingIds = await prisma.propertyListing.findMany({
        where: { landlordId: { equals: landlordId } },
        select: { id: true },
    }).then(rows => rows.map(r => r.id));

    // first delete all associated property applications
    for (let p = 0; p< propertyListingIds.length; p++){
        await rawDeletePropertyApplicationsByListing({listingId:propertyListingIds[p]});
        console.log("removed property applications " + propertyListingIds[p]);
    };
    
    // finally 'delete' property listings
    await prisma.propertyListing.deleteMany({
        where: {landlordId: landlordId}
    });

    console.log("deleted property listings")
}

async function rawDeleteReview({reviewId} : {reviewId : number}){
    await prisma.review.updateMany({
        where: {id: reviewId},
        data: { isDeleted: true }
    });

    console.log("deleted review " + reviewId);
    return;
}

// delete all reviews written by this user or about this user
async function rawDeleteReviewByUser({userId} : {userId : number}){
    await prisma.review.updateMany({
        where: {
            OR: [
                { authorId: {equals: userId} },
                { targetUserId: {equals: userId} }
            ]
        },
        data: { isDeleted: true }
    });

    console.log("deleted reviews linked to user " + userId);
    return;
}

// delete a user - should be done last since not recursive for other tables
async function rawDeleteUser({userId} : {userId:number}){
    await prisma.user.update({
        where: {id: userId},
        data: {isDeleted: true}
    });

    return;
}


// functions to be used externally:

export const addOffence: ConfirmFunction = async ({ user, text }) => {
    await prisma.offenceRecord.create({
        data: {
            reason: text,
            userId: user.id
        },
    }); 

    console.log("Added offence record (" + text + ") to user ");// + user['username']);
    return;
}


export async function deleteReport({report} : Report){

    // make sure we actually want to delete this
    const ok = window.confirm(`Delete Report ${report['reason']}? This cannot be undone.`);
    if (!ok) return;

    // delete from database
    await prisma.report.delete({
        where: {id: report['id']}
    });

    // confirm in logs
    console.log("deleted report with id: " + report['id']);

    return;
}


export async function getReportsFilteredSorted({selectedStatuses, sortField, sortDirection} : FilterSearchProps){
    console.log("want")
    console.log(selectedStatuses)
    console.log(sortField)
    console.log(sortDirection)

    const statuses = [];

    // process statuses from eg [OPEN: true, UNDER_REVIEW: false, RESOLVED: true] into eg [OPEN, RESOLVED]
    for (let i = 0; i < selectedStatuses.length; i++){
        console.log("fsndfrgth")
        console.log(selectedStatuses[i]);
        statuses.push(selectedStatuses[i][0])
    }

    // const reports = await prisma.report.findMany({
    //   where: {status: {in: statuses}},
    //   orderBy: {[sortField]: sortDirection}
    // });

    // return reports;
}

export async function getUser({userId} : any){
    const user = await prisma.user.findFirst({
        where: { id: userId }
    });

    return user;
}




export async function getAllReports(){
    const reports = await prisma.report.findMany();
    return reports;
}


export async function deleteUser({user} : User){

    if (user['role'] == "LANDLORD"){
        // delete properties (-> delete property listings (-> delete associated property applications) )
        await rawDeletePropertiesByLandlord({landlordId:user.id});        
    }
    else if (user['role'] == "CONSULTANT"){

        // delete property applications made
        await rawDeletePropertyApplicationsByUser({userId:user.id});
    }

    // for both roles, 'delete' reviews made about them and by them
    await rawDeleteReviewByUser({userId:user.id});


    // 'delete' from database by setting isDeleted to true
    rawDeleteUser({userId:user.id});

    const text : string = "Your account has been deleted";
    sendEmail({user, text});

    // confirm in logs
    console.log("deleted user with id: " + user['id']);

    return;
}

export async function deleteReview({review} : Review){
    // make sure we actually want to delete this
    const ok = window.confirm(`Delete Review ${review['comment']}? This cannot be undone.`);
    if (!ok) return;

    rawDeleteReview({reviewId:review.id});

    // confirm in logs
    console.log("deleted review with id: " + review.id);
    
    return;
}