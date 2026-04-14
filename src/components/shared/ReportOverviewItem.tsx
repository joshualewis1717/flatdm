import { Button } from '../ui/button';
import Link from "next/link";
import { ArrowRight, ShieldAlert, Trash2 } from "lucide-react";
import {Report, User} from '@/app/app/reports/types';
import Status from '@/components/shared/Status';

export default function ReportOverviewItem( {report, reporter, targetUser, moderator} : {report:Report, reporter: User, targetUser : User, moderator : User}){
    
    // depending on what value 'status' holds, the status bar will appear a different colour
    // theme is passed into the Status component to style it
    const themeMap: Record<string, string> = {
        "RESOLVED":"green",
        "UNDER_REVIEW":"amber",
        "OPEN":"red",
        "LOW":"green",
        "MEDIUM":"amber",
        "HIGH":"red",
        "UNRANKED":"neutral"
    }


    const wordMap: Record<string, string> = {
        "RESOLVED":"Resolved",
        "UNDER_REVIEW":"Under Review",
        "OPEN":"Open",
        "LOW":"Low",
        "MEDIUM":"Medium",
        "HIGH":"High",
        "UNRANKED":"Unranked",
        "INAPPROPRIATE_CONTENT": "Inappropriate Content",
        "FRAUD": "Fraud",
        "HARASSMENT": "Harassment",
        "FAKE_INFORMATION": "Fake Information",
        "IMPERSONATION": "Impersonation",
        "OTHER": "Other"
    }


    let severity = report['severity'];
    if (!severity || severity === null || severity == undefined){
        severity = "UNRANKED"
    }

    let modString = "No Assigned Moderator"

    if (moderator != null){
        modString = "Assigned Moderator: " + moderator.username;
    }

    return(
        <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-primary/45 hover:bg-white/[0.05] sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="min-w-0">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                            <ShieldAlert className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-[0.24em] text-white/45">Report #{report.id}</p>
                            <h2 className="mt-1 text-lg font-semibold text-white">
                                {targetUser.username}: {report.reason}
                            </h2>
                            <p className="mt-1 text-sm text-white/55">{wordMap[report.category ?? "OTHER"]}</p>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-white/60 md:grid-cols-2">
                        <p>{`Submitted by ${reporter.username} on ${String(report.createdAt).slice(0,10)}`}</p>
                        <p>{modString}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Status theme={themeMap[report['status']]} text={"Status: " + wordMap[report['status']]} />
                        <Status theme={themeMap[severity]} text={"Severity: " + wordMap[severity]} />
                    </div>
                </div>

                {/* investigate and delete report buttons */}
                <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Button asChild size="lg" className="rounded-lg px-5">
                        <Link href={`/app/reports/${report.id}`}>Investigate<ArrowRight /> </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="rounded-lg border-destructive/30 bg-destructive/10 px-5 text-destructive hover:bg-destructive/20">
                        <Link href={`/app/reports/${report.id}`}><Trash2 className="size-4" /> Delete Report</Link>
                    </Button>
                </div>
            </div>

        </section>
    );
}