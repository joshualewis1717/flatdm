"use server";

import { prisma } from "@/lib/prisma";
import {DbReturnType, User, Report, Review, PropertyApplication, Property, PropertyListing, Status, Severity, Category, FilterSearchProps} from '@/app/app/reports/types';
import {sendEmail} from '@/app/app/reports/sendEmail'
import {ConfirmFunction} from '@/app/app/reports/types';


// functions not exporte are not to be used externally. use the exported functions found below

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

// given a landlord id, delete all associated property listings
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

// delete review given the id
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

// add an offence to a user
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

// change the severity of a report
export async function changeReportSeverity({reportId, newSeverity}): Promise<DbReturnType<void>> {
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

// change the status of a report
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

// unassign moderators from a report
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

// assign a moderator id to a report
export async function assignModToReport({reportId, userId}): Promise<DbReturnType<void>> {
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

// delete a report given the id
export async function deleteReport({ report }: { report: Report }): Promise<DbReturnType<void>> {
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

// get all moderator users
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

// get a report given the id
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

// get reports that pass through filters, sorted
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


// get all users
export async function getAllUsers(): Promise<DbReturnType<any[]>> {
  try {
    const users = await prisma.user.findMany();
    return ok(users);
  } catch (error: any) {
    console.error("error occured: " + error.message);
    return err(error);
  }
}

// get a user given their id
export async function getUser({ userId }: any): Promise<DbReturnType<any>> {
  try {
    const user = await prisma.user.findFirst({ where: { id: userId } });
    return ok(user);
  } catch (error: any) {
    console.error("error occured: " + error.message);
    return err(error);
  }
}

// get all reports
export async function getAllReports(): Promise<DbReturnType<any[]>> {
  try {
    const reports = await prisma.report.findMany();
    return ok(reports);
  } catch (error: any) {
    console.error("error occured: " + error.message);
    return err(error);
  }
}

// get all users who have not been deleted
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

// delete a user given the id
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
    return ok<void>(undefined);
  } catch (error: any) {
    console.error("error occured: " + error.message);
    return err<void>(error);
  }
}

// delete a review given the review
export async function deleteReview({ review }: { review: Review }): Promise<DbReturnType<void>> {
  try {
    const result = await rawDeleteReview({ reviewId: review.id });
    return ok<void>(undefined);
  } catch (error: any) {
    console.error("error occured: " + error.message);
    return err<void>(error);
  }
}

// get a review given the id
export async function deleteReviewById({ reviewId }: { reviewId: number }): Promise<DbReturnType<void>> {
  try {
    const result = await rawDeleteReview({ reviewId });
    return ok<void>(undefined);
  } catch (error: any) {
    console.error("error occured: " + error.message);
    return err<void>(error);
  }
}