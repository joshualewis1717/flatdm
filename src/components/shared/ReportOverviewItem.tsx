import { Button } from '../ui/button';
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {Report, User} from '@/app/app/reports/types';
import Status from '@/components/shared/Status';

export default function ReportOverviewItem( {report, reporter, targetUser} : {report:Report, reporter: User, targetUser : User}){
    
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

    return(
        <section className="px-[7%]">
            <div className="bg-black/20 border border-white/10 hover:border-[#c9fb00] focus:border-[#c9fb00] transition-colors rounded-[0.5rem] grid-cols-[4fr_1fr] p-4 grid grid-cols-2 items-start gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-white font-bold text-lg">{targetUser.username} : {report['reason']} ({wordMap[report['category'] ?? "OTHER"]})</h1>
                    <h2 className="italic text-gray-300">{`Submitted by ${reporter.username} at ${String(report['createdAt']).slice(0,10)}`}</h2>
                    <div className="flex flex-row gap-2">
                        <Status theme={themeMap[report['status']]} text={"Status: " + wordMap[report['status']]} />
                        <Status theme={themeMap[severity]} text={"Severity: " + wordMap[severity]} />
                    </div>

                </div>

                {/* investigate and delete report buttons */}
                <div className="flex flex-wrap gap-3">
                    <Button asChild size="lg" className="rounded-2xl px-5">
                        <Link href={`/app/reports/${report['id']}`}>Investigate<ArrowRight /> </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="rounded-2xl border-white/12 bg-white/[0.03] px-5 text-white hover:bg-white/[0.06]">
                        <Link href={`/app/reports/${report['id']}`}>Delete Report</Link>
                    </Button>
                </div>

            </div>
        </section>
    );
}