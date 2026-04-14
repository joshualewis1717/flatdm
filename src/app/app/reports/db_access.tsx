"use server";

import { prisma } from "@/lib/prisma";
import {DbReturnType, User, Report, Review, PropertyApplication, Property, PropertyListing, Status, Severity, Category, FilterSearchProps} from '@/app/app/reports/types';
import {sendEmail} from '@/app/app/reports/sendEmail'
import { use } from "react";
import { isErrored } from "stream";
import {ConfirmFunction} from '@/app/app/reports/types';
import { Database, UnfoldHorizontal } from "lucide-react";
import { error } from "console";

// delete all properties (and all associated listings and applications) by a given landlord id
async function rawDeletePropertiesByLandlord({landlordId} : {landlordId : number}){
    if (landlordId == undefined){
        console.log("error occured: trying to delete properties for undefined user id");
        return;
    }

    // first remove associated property listings
    await rawDeletePropertyListingByLandlord({landlordId:landlordId});

    // deleting properties
    try{
        await prisma.property.deleteMany({
            where: {landlordId: landlordId}
        });
    }
    catch (error){
        console.error("error occured: " + error.message);
    }

    return;
}


// set status to "WITHDRAWN" for all property applications made by a given user id
async function rawDeletePropertyApplicationsByUser({ userId }: { userId: number }) {
  try {
    await prisma.propertyApplication.updateMany({
      where: { userId: userId },
      data: { status: "WITHDRAWN" },
    });
  } catch (error: any) {
    console.error("error occured:", error?.message ?? error);
  }
  return;
}

// set status to "WITHDRAWN" for all property applications for a given listing id
async function rawDeletePropertyApplicationsByListing({ listingId }: { listingId: number }) {
  try {
    await prisma.propertyApplication.updateMany({
      where: { listingId: listingId },
      data: { status: "WITHDRAWN" },
    });
  } catch (error: any) {
    console.error("error occured:", error?.message ?? error);
  }
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
    };
    
    // finally 'delete' property listings
    try{
        await prisma.propertyListing.deleteMany({
            where: {landlordId: landlordId}
        });  
    }
    catch (error){
        console.error("error occured: " + error.message);
    }

    return;
}

async function rawDeleteReview({reviewId} : {reviewId : number}){
    try{
        await prisma.review.updateMany({
            where: {id: reviewId},
            data: { isDeleted: true }
        });
    }
    catch (error){
        console.error("error occured: " + error.message);
    }

    return;
}


// delete all reviews written by this user or about this user
async function rawDeleteReviewByUser({userId} : {userId : number}){
    try{
        await prisma.review.updateMany({
            where: {
                OR: [
                    { authorId: {equals: userId} },
                    { targetUserId: {equals: userId} }
                ]
            },
            data: { isDeleted: true }
        });
    }
    catch (error){
        console.error("error occured: " + error.message);
    }

    return;
}

// delete a user - should be done last since not recursive for other tables
async function rawDeleteUser({userId} : {userId:number}){

   try{
        await prisma.user.update({
            where: {id: userId},
            data: {isDeleted: true}
        });
    }
    catch (error){
        console.error("error occured: " + error.message);
    }

    return;
}



// helper functions for the return object //////////////////////////////////////////////////////

function ok<T>(result: T): DbReturnType<T> {
  return { error: null, result };
}

function err<T = null>(error: Error): DbReturnType<T> {
  return { error, result: null };
}

// functions to be used externally /////////////////////////////////////////////////////////////









export const addOffence: ConfirmFunction = async ({ user, text }): Promise<DbReturnType<void>> => {
  try {
    const result = await prisma.offenceRecord.create({
      data: { reason: text, userId: user.id },
    });
    return ok(result); // result typed as create return (void or created object)
  } catch (error: any) {
    console.error("error occured: " + error.message);
    return err(error);
  }
};

export async function changeReportSeverity({
  reportId,
  newSeverity,
}): Promise<DbReturnType<void>> {
  try {
    const result = await prisma.report.update({
      where: { id: reportId },
      data: { severity: newSeverity },
    });
    return ok(result);
  } catch (error: any) {
    console.error("error occured: " + error.message);
    return err(error);
  }
}

export async function changeReportStatus({
  reportId,
  newStatus,
}): Promise<DbReturnType<void>> {
  try {
    const result = await prisma.report.update({
      where: { id: reportId },
      data: { status: newStatus },
    });
    return ok(result);
  } catch (error: any) {
    console.error("error occured: " + error.message);
    return err(error);
  }
}

export async function unassignReport({ reportId }): Promise<DbReturnType<void>> {
  try {
    const result = await prisma.report.update({
      where: { id: reportId },
      data: { assignedModeratorId: null },
    });
    return ok(result);
  } catch (error: any) {
    console.error("error occured: " + error.message);
    return err(error);
  }
}

export async function assignModToReport({
  reportId,
  userId,
}): Promise<DbReturnType<void>> {
  try {
    const userRole = await prisma.user.findFirst({
      where: { id: userId },
      select: { role: true },
    });

    if (String(userRole?.role) === "MODERATOR") {
      const result = await prisma.report.update({
        where: { id: reportId },
        data: { assignedModeratorId: userId },
      });
      return ok(result);
    } else {
      const message = `report assignment denied since user ${userId} is not a moderator`;
      console.log(message);
      return err(new Error(message));
    }
  } catch (error: any) {
    console.error("error occured: " + error.message);
    return err(error);
  }
}

export async function deleteReport({ report }: { report: any }): Promise<DbReturnType<void>> {
  try {
    const result = await prisma.report.delete({
      where: { id: report["id"] },
    });
    return ok(result);
  } catch (error: any) {
    console.error("error occured: " + error.message);
    return err(error);
  }
}

export async function getModerators(): Promise<DbReturnType<any[]>> {
  try {
    const mods = await prisma.user.findMany({
      where: { role: "MODERATOR", isDeleted: false },
    });
    return ok(mods);
  } catch (error: any) {
    console.error("error occured: " + error.message);
    return err(error);
  }
}

export async function getReport({ reportId }: any): Promise<DbReturnType<any | undefined>> {
  if (reportId == undefined) {
    const e = new Error("trying to get report with undefined id");
    console.log(e.message);
    return err(e);
  }
  try {
    const report = await prisma.report.findFirst({ where: { id: reportId } });
    return ok(report);
  } catch (error: any) {
    console.error("error occured: " + error.message);
    return err(error);
  }
}

export async function getReportsFilteredSorted({
  selectedStatuses,
  selectedSeverities,
  selectedCategories,
  sortField,
  sortDirection,
}: FilterSearchProps): Promise<DbReturnType<any[]>> {
  const STATUSES = ["OPEN", "UNDER_REVIEW", "RESOLVED"];
  const SEVERITIES = ["LOW", "MEDIUM", "HIGH"];
  const CATEGORIES = [
    "INAPPROPRIATE_CONTENT",
    "FRAUD",
    "HARASSMENT",
    "FAKE_INFORMATION",
    "IMPERSONATION",
    "OTHER",
  ];

  const statuses: Status[] = STATUSES.filter((s) => selectedStatuses[s]);
  const severities: Severity[] = SEVERITIES.filter((s) => selectedSeverities[s]);
  const categories: Category[] = CATEGORIES.filter((c) => selectedCategories[c]);

  try {
    const reports = await prisma.report.findMany({
      where: {
        AND: [{ status: { in: statuses } }, { severity: { in: severities } }, { category: { in: categories } }],
      },
      orderBy: { [sortField]: sortDirection },
    });
    return ok(reports);
  } catch (error: any) {
    console.error("error occured: " + error.message);
    return err(error);
  }
}

export async function getUsers(): Promise<DbReturnType<any[]>> {
  try {
    const users = await prisma.user.findMany();
    return ok(users);
  } catch (error: any) {
    console.error("error occured: " + error.message);
    return err(error);
  }
}

export async function getUser({ userId }: any): Promise<DbReturnType<any>> {
  try {
    const user = await prisma.user.findFirst({ where: { id: userId } });
    return ok(user);
  } catch (error: any) {
    console.error("error occured: " + error.message);
    return err(error);
  }
}

export async function getAllReports(): Promise<DbReturnType<any[]>> {
  try {
    const reports = await prisma.report.findMany();
    return ok(reports);
  } catch (error: any) {
    console.error("error occured: " + error.message);
    return err(error);
  }
}

export async function getAllUsers(): Promise<DbReturnType<any[]>> {
  try {
    const users = await prisma.user.findMany();
    return ok(users);
  } catch (error: any) {
    console.error("error occured: " + error.message);
    return err(error);
  }
}


export async function getAllAliveUsers(): Promise<DbReturnType<any[]>> {
  try {
    const users = await prisma.user.findMany({
        where: {isDeleted: false}
    });
    return ok(users);
  } catch (error: any) {
    console.error("error occured: " + error.message);
    return err(error);
  }
}







export async function deleteUser({ user }: { user: User }): Promise<DbReturnType<void>> {
  try {
    if (user.role === "LANDLORD") {
      await rawDeletePropertiesByLandlord({ landlordId: user.id });
    } else if (user.role === "CONSULTANT") {
      await rawDeletePropertyApplicationsByUser({ userId: user.id });
    }

    await rawDeleteReviewByUser({ userId: user.id });

    await rawDeleteUser({ userId: user.id });

    const text: string = "Your account has been deleted";
    sendEmail({ user, text });

    console.log("deleted user with id: " + user.id);
    return ok<void>(undefined);
  } catch (error: any) {
    console.error("error occured: " + error.message);
    return err<void>(error);
  }
}

export async function deleteReview({ review }: { review: Review }): Promise<DbReturnType<void>> {
  try {
    const result = await rawDeleteReview({ reviewId: review.id });
    return ok<void>(undefined);
  } catch (error: any) {
    console.error("error occured: " + error.message);
    return err<void>(error);
  }
}

export async function deleteReviewById({ reviewId }: { reviewId: number }): Promise<DbReturnType<void>> {
  try {
    const result = await rawDeleteReview({ reviewId });
    return ok<void>(undefined);
  } catch (error: any) {
    console.error("error occured: " + error.message);
    return err<void>(error);
  }
}







// export const addOffence: ConfirmFunction = async ({ user, text }) => {

//     try{
//         await prisma.offenceRecord.create({
//             data: {
//                 reason: text,
//                 userId: user.id
//             },
//         }); 
//     }
//     catch (error){
//         console.error("error occured: " + error.message);
//     }

//     return;
// }

// // change the severity of a report
// export async function changeReportSeverity({reportId, newSeverity}){

//     try{
//         await prisma.report.update({
//             where: {id: reportId},
//             data: {severity: newSeverity}
//         });
 
//     }
//     catch (error){
//         console.error("error occured: " + error.message);
//     }

//     return;
// }



// // change the status of a report
// export async function changeReportStatus({reportId, newStatus}){

//     try{
//         await prisma.report.update({
//             where: {id: reportId},
//             data: {status: newStatus}
//         });
 
//     }
//     catch (error){
//         console.error("error occured: " + error.message);
//     }

//     return;
// }

// // assign no mod to a report
// export async function unassignReport({reportId}){
//     await prisma.report.update({
//         where: {id: reportId},
//         data: {assignedModeratorId: null}
//     });
// }


// // assign a moderator to a report
// export async function assignModToReport({reportId, userId}){

//     try{
//         // make sure the user is actually a moderator
//         const userRole = await prisma.user.findFirst({
//             where: {id: userId},
//             select: {role: true}
//         })

//         if (String(userRole.role) == "MODERATOR"){      
//             await prisma.report.update({
//                 where: { id: reportId },
//                 data: { assignedModeratorId: userId },
//             });
//         }
//         else{
//             console.log("report assignment denied since user " + userId + " is not a moderator")
//         }
//     }
//     catch (error){
//         console.error("error occured: " + error.message);
//     }

//     return;
// }




// export async function deleteReport({report} : Report){

//     try{
//         // delete from database
//         await prisma.report.delete({
//             where: {id: report['id']}
//         });
//     }
//     catch (error){
//         console.error("error occured: " + error.message);
//     }

//     return;
// }

// export async function getModerators() {
//     try {
//         const mods = await prisma.user.findMany({
//         where: {
//             role: "MODERATOR",
//             isDeleted: false
//         }
//         });
//         return mods;
//     } catch (error: any) {
//         console.error("error occured: " + error.message);
//         return [];
//     }
// }


// export async function getReport({reportId}: any){
//     if (reportId == undefined){
//         console.log("trying to get report with undefined id")
//         return undefined;
//     }

//     try{
//         const report = await prisma.report.findFirst({
//             where: {id: reportId}
//         })
//         return report;
//     }
//     catch (error){
//         console.error("error occured: " + error.message);
//     }
// }


// export async function getReportsFilteredSorted({selectedStatuses, selectedSeverities, selectedCategories, sortField, sortDirection} : FilterSearchProps){

//     const STATUSES = ["OPEN", "UNDER_REVIEW", "RESOLVED"];
//     const SEVERITIES = ["LOW", "MEDIUM", "HIGH"];
//     const CATEGORIES = ["INAPPROPRIATE_CONTENT", "FRAUD", "HARASSMENT", "FAKE_INFORMATION", "IMPERSONATION", "OTHER"]

//     // map to array containing only selected fields
//     const statuses: Status[] = STATUSES.filter(s => selectedStatuses[s]);
//     const severities: Severity[] = SEVERITIES.filter(s => selectedSeverities[s]);
//     const categories: Category[] = CATEGORIES.filter(c => selectedCategories[c]);


//     // get reports that fit the requirements
//     try{
//         const reports = await prisma.report.findMany({
//             where: {
//                 AND: [
//                     {status: {in: statuses}},
//                     {severity: {in: severities}},
//                     {category: {in: categories}},
//                 ]
//             },
//             orderBy: { [sortField]: sortDirection },
//         });

//         return reports; 
//     }
//     catch (error){
//         console.error("error occured: " + error.message);
//     }
// }

// export async function getUsers(){
//     try{
//         const users = await prisma.user.findMany();
//         return users;
//     }
//     catch (error){
//         console.error("error occured: " + error.message);
//     }
// }

// export async function getUser({userId} : any){
//     try{
//         const user = await prisma.user.findFirst({
//             where: { id: userId }
//         });
//         return user;
//     }
//     catch (error){
//         console.error("error occured: " + error.message);
//     }
//     return await prisma.user.findFirst({where:{id:userId}});
// }




// export async function getAllReports(){
//     try{   
//         const reports = await prisma.report.findMany();
//         return reports;
//     }
//     catch (error){
//         console.error("error occured: " + error.message);
//     }
// }


// export async function deleteUser({user} : User){

//     try{   
//         if (user['role'] == "LANDLORD"){
//             // delete properties (-> delete property listings (-> delete associated property applications) )
//             await rawDeletePropertiesByLandlord({landlordId:user.id});        
//         }
//         else if (user['role'] == "CONSULTANT"){

//             // delete property applications made
//             await rawDeletePropertyApplicationsByUser({userId:user.id});
//         }

//         // for both roles, 'delete' reviews made about them and by them
//         await rawDeleteReviewByUser({userId:user.id});


//         // 'delete' from database by setting isDeleted to true
//         rawDeleteUser({userId:user.id});

//         const text : string = "Your account has been deleted";
//         sendEmail({user, text});

//         // confirm in logs
//         console.log("deleted user with id: " + user['id']);
//     }
//     catch (error){
//         console.error("error occured: " + error.message);
//     }

//     return;
// }

// export async function deleteReview({ review }: Review) {
//     await rawDeleteReview({ reviewId: review.id });
//     return;
// }

// export async function deleteReviewById({ reviewId }: { reviewId: number }) {
//     await rawDeleteReview({ reviewId: reviewId });
//     return;
// }