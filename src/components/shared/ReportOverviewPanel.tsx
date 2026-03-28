import React from 'react';
import { Card, CardContent, CardDescription, CardAction, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '../ui/button';
import { Props } from 'next/script';
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Report from '@/app/app/reports/types.ts';
import Status from '@/components/shared/Status';

function ReportOverviewItem( {id, reason, status, createdAt, reporter, targetUser} : Props){//{id, reason, createdAt, reporter, targetUser} : Report){

    // depending on what value 'status' holds, the status bar will appear a different colour
    // theme is passed into the Status component to style it
    const theme =
      status === 'RESOLVED' ? 'green' :
      status === 'UNDER_REVIEW' ? 'amber' :
      status === 'OPEN' ? 'red' :
    'neutral';

    return(
        <section className="px-[7%]">
            <div className="bg-black/70 rounded-[0.5rem] grid-cols-[4fr_1fr] p-4 grid grid-cols-2 items-start gap-4">
                <div className="flex flex-col gap-1">

                {/* key info about the report */}
                {/* format:
                    User [username] : [reason they were reported]
                    Submitted by [username] at [datetime]
                    [status]
                */}
                <h1 className="text-white font-bold text-lg">[{id}] {targetUser} : {reason}</h1>
                <h2 className="italic text-gray-400">{`Submitted by ${reporter} at ${createdAt}`}</h2>
                <Status theme={theme} text={status} />
                </div>

                {/* investigate and delete report buttons */}
                <div className="flex flex-wrap gap-3">
                    <Button asChild size="lg" className="rounded-2xl px-5">
                        <Link href={`/app/reports/${id}`}>Investigate<ArrowRight /> </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="rounded-2xl border-white/12 bg-white/[0.03] px-5 text-white hover:bg-white/[0.06]">
                        <Link href={`/app/reports/${id}`}>Delete Report</Link>
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
                // iterate through all reports passed in
                reports.map( (report : Report, key : string) => (
                    <ReportOverviewItem id={report['id']}
                                        reason={report['reason']}
                                        status={report['status']}
                                        createdAt={report['createdAt']}
                                        reporter={mockUsers[report['reporterId']]}
                                        targetUser={mockUsers[report['targetUserId']]}/>
                ))
            }
        </section>
    );

}