"use client";

import {Report, User} from '@/app/app/reports/types';
import Status from '@/components/shared/Status';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';


export default function SelectedReportClient({report, target, reporter} : {report : Report, target : User, reporter : User}){

    console.log(report);
    console.log(target);
    console.log(reporter);

    // depending on what value 'status' holds, the status bar will appear a different colour
    // theme is passed into the Status component to style it
    const theme =
        report['status'] === 'RESOLVED' ? 'green' :
        report['status'] === 'UNDER_REVIEW' ? 'amber' :
        report['status'] === 'OPEN' ? 'red' :
        'neutral';


    return (
        <main className="relative min-h-screen overflow-hidden bg-background text-foreground">

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary/85">Report ID: {report['id']}</p>

                <>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    User {target['username']} : {report['reason']}
                </h1>
                <div className="flex items-center gap-5">
                    <div className="flex-1 min-w-0">
                    <p className="mt-3 text-sm text-white/60 truncate">
                        Submitted by User {reporter['username']} at {String(report['createdAt'])}
                    </p>
                    </div>
                    <Status theme={theme} text={report['status']} />
                </div>
                <hr />
                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/100">
                    Further Information:
                    <br />
                    {report['description']}
                </p>

                <div className="flex items-center space-x-4 gap-5">
                    <Button asChild size="lg" className="rounded-2xl px-5">
                        <Link href={`/app/profile/${report['targetUserId']}`}>View {target['username']}'s Profile <ArrowRight /></Link>
                    </Button>
                    <Button asChild size="lg" className="rounded-2xl px-5">
                        <Link href={`/app/profile/${report['reporterId']}`}>View {reporter['username']}'s Profile <ArrowRight /></Link>
                    </Button>
                </div>
                </>


            </section>

        </main>
    )
}