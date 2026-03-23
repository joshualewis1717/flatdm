import React from 'react';
import { Card, CardContent, CardDescription, CardAction, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '../ui/button';
import { Props } from 'next/script';

type Report = {
  id: number;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
  reporterId: number;
  targetUserId: number;
  listingId: number;
};

function ReportOverviewItem( {id, reason, status, createdAt, reporter, targetUser} : Props){//{id, reason, createdAt, reporter, targetUser} : Report){

    let statusClassName = "text-red-700 bg-red-100";
    console.log("wefrgthyju");

    if (status == "active"){
        console.log("egrt");
        statusClassName="text-green-800 bg-green-100";
    }


    return(
        <section className="px-[7%]">
            <div className="bg-black/70 rounded-[0.5rem] grid-cols-[4fr_1fr] p-4 grid grid-cols-2 items-start gap-4">
                <div className="flex flex-col gap-1">
                <h1 className="text-white font-bold text-lg">[{id}] {targetUser} : {reason}</h1>
                <h2 className="italic text-gray-400">{`Submitted by ${reporter} at ${createdAt}`}</h2>
                <h3 className={statusClassName}>{status}</h3>
                </div>

                <div className="flex flex-col gap-2 items-end">
                <Button className="w-full">
                    Investigate
                </Button>
                <Button className="w-full" variant="destructive">
                    Delete Report
                </Button>
                </div>
            </div>
        </section>
    );
}


export default function ReportOverviewPanel( {reports} ){
    // define reporter and targetUser using reporterId, targetUserId, and listingId maybe
    const reporter = "reporter";
    const targetUser = "target user";

    return(
        <section className="flex flex-col gap-2 py-[3%]">
            {
                reports.map( (report : Report, key : string) => (
                    <ReportOverviewItem id={report['id']}
                                        reason={report['reason']}
                                        status={report['status']}
                                        createdAt={report['createdAt']}
                                        reporter={reporter}
                                        targetUser={targetUser}/>
                ))
            }
        </section>
    );

}