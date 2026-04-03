// 'use client';

// import React, {useMemo, useState} from 'react';
import { Card, CardContent, CardDescription, CardAction, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '../ui/button';
import { Props, ScriptProps } from 'next/script';
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Report from '@/app/app/reports/types';
import Status from '@/components/shared/Status';
import {deleteReport} from '@/app/app/reports/db_access';

export default function ReportOverviewItem( {report} : Report){//{id, reason, createdAt, reporter, targetUser} : Report){
    console.log("item report: " + report);
    // depending on what value 'status' holds, the status bar will appear a different colour
    // theme is passed into the Status component to style it
    const theme =
      report['status'] === 'RESOLVED' ? 'green' :
      report['status'] === 'UNDER_REVIEW' ? 'amber' :
      report['status'] === 'OPEN' ? 'red' :
    'neutral';
    const reporter = "reporter";
    const targetUser = "target user";

    return(
        <>
        <section className="px-[7%]">
            <div className="bg-black/70 rounded-[0.5rem] grid-cols-[4fr_1fr] p-4 grid grid-cols-2 items-start gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-white font-bold text-lg">[{report['id']}] {targetUser} : {report['reason']}</h1>
                    <h2 className="italic text-gray-400">{`Submitted by ${reporter} at ${report['createdAt']}`}</h2>
                    <Status theme={theme} text={report['status']} />
                </div>

                {/* investigate and delete report buttons */}
                <div className="flex flex-wrap gap-3">
                    <Button asChild size="lg" className="rounded-2xl px-5">
                        <Link href={`/app/reports/${report['id']}`}>Investigate<ArrowRight /> </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="rounded-2xl border-white/12 bg-white/[0.03] px-5 text-white hover:bg-white/[0.06]">
                        <Link href={`/app/reports/${report['id']}`}>Delete Report</Link>
                        Delete Report
                    </Button>
                </div>

            </div>
        </section>
        </>
    );
}