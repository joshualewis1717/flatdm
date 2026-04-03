import { prisma } from "@/lib/prisma";

export function deleteReport({id} : {id: Number}){
    console.log("deleting report with id: " + id);
    return;
}