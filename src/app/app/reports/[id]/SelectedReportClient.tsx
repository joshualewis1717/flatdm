"use client";

import {Report, User} from '@/app/app/reports/types';
import Status from '@/components/shared/Status';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { assignModToReport } from '../db_access';
import { useEffect, useState } from 'react';
import ModeratorSelector from '@/components/shared/ModeratorSelector';
import StatusSelector from '@/components/shared/StatusSelector';
import SeveritySelector from '@/components/shared/SeveritySelector';
import ErrorMessage from '@/components/shared/ErrorMessage';

const themeMap = {
    "RESOLVED":"green",
    "UNDER_REVIEW":"amber",
    "OPEN":"red",
    "LOW":"green",
    "MEDIUM":"amber",
    "HIGH":"red",
    "UNRANKED":"neutral"
}

const wordMap = {
    "RESOLVED":"Resolved",
    "UNDER_REVIEW":"Under Review",
    "OPEN":"Open",
    "LOW":"Low",
    "MEDIUM":"Medium",
    "HIGH":"High",
    "UNRANKED":"Unranked"
}

export default function SelectedReportClient({error, report, target, reporter, moderators} : {error:string|null, report : Report, target : User, reporter : User, moderators : User[]}){

    // first check if an error was found
    const errorFound = error !== null;

    // states for the assigning moderator, changing status and changing severity functionality
    const [assignModVis, setAssignModVis] = useState(false);
    const [changeStatusVis, setChangeStatusVis] = useState(false);
    const [changeSeverityVis, setChangeSeverityVis] = useState(false);

    // variables for the status for easier processing (for the theme of the Status component)
    const [status, setStatus] = useState(report['status']);
    const [severity, setSeverity] = useState(report['severity']);

    function assignModeratorWrap({setVis, vis} : {setVis:Function, vis:boolean}): void {
        setVis(!vis);
    }

    function changeStatusWrap({setVis, vis} : {setVis:Function, vis:boolean}): void {
        setVis(!vis);
    }

    function changeSeverityWrap({setVis, vis} : {setVis:Function, vis:boolean}): void {
        setVis(!vis)
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-background text-foreground">

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">

                {/* title bar with report id, title, submission info and status and severity */}
                <div className="flex flex-row gap-5">

                    {/* error text, only to render if an error was found */}
                    {errorFound && (
                        <ErrorMessage text={error} />
                    )}

                    {!errorFound && (
                        <>
                            {/* text info */}
                            <div>
                                <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary/85">Report ID: {report['id']}</p>

                                {/* title with username and report reason */}
                                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                                    {/* User {target['username']} : {report['reason']} */}
                                    User {target.username} : {report.reason}
                                </h1>

                                <p className="mt-3 text-sm text-white/60 truncate">
                                    {/* Submitted by User {reporter['username']} at {String(report['createdAt'])} */}
                                    Submitted by User {reporter.username} at {String(report.createdAt)}
                                </p>
                            </div>

                            {/* status and severity */}
                            <div className="flex flex-col gap-1 justify-center items-right">
                                <Status theme={themeMap[status]} text={"Status: " + wordMap[status]} />
                                <Status theme={themeMap[severity]} text={"Severity: " + wordMap[severity]} />
                            </div>
                        </>
                    )}


                </div>


                {!errorFound && (
                    <>
                        <hr />

                        {/* bottom panel */}
                        <div className="flex flex-row">
                            {/* investigation area */}
                            <div className="flex flex-col gap-4">

                                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/100">
                                    Further Information:
                                    <br />
                                    {report['description']}
                                </p>

                                {/* profile buttons */}
                                <div className="flex flex-row gap-5 justify-center">
                                    {/* view target profile */}
                                    {report && target && (
                                        <Button asChild size="lg" className="rounded-2xl px-5">
                                            <Link href={`/app/profile/${report.targetUserId}`}>
                                                View {target.username}'s Profile <ArrowRight />
                                            </Link>
                                        </Button>
                                    )}

                                    {/* view reporter profile */}
                                    {report && reporter && (
                                        <Button asChild size="lg" className="rounded-2xl px-5">
                                            <Link href={`/app/profile/${report.reporterId}`}>
                                                View {reporter.username}'s Profile <ArrowRight />
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* button options */}
                            <div className="flex flex-col items-center space-x-4 gap-5 justify-center">
                                {/* assign moderator */}
                                {!assignModVis &&
                                    <button onClick={() => assignModeratorWrap({setVis:setAssignModVis, vis:assignModVis})} className="group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground">
                                        Assign Moderator
                                    </button>
                                }
                                
                                {assignModVis &&
                                    <ModeratorSelector moderators={moderators} report={report} setVis={setAssignModVis} />
                                }

                                {/* change status */}
                                {!changeStatusVis &&
                                    <button onClick={() => changeStatusWrap({setVis:setChangeStatusVis, vis:changeStatusVis})} className="group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground">
                                        Change Status
                                    </button>
                                }

                                {changeStatusVis &&
                                    <StatusSelector report={report} setStatus={setStatus} setVis={setChangeStatusVis} />
                                }
                                

                                {/* change severity */}
                                {!changeSeverityVis &&
                                    <button onClick={() => changeSeverityWrap({setVis:setChangeSeverityVis, vis:changeSeverityVis})} className="group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground">
                                        Change Severity
                                    </button>
                                }

                                {changeSeverityVis &&
                                    <SeveritySelector report={report} setSeverity={setSeverity} setVis={setChangeSeverityVis} />
                                }
                                
                            </div>
                        </div>
                    </>
                )}


            </section>
        </main>
    )
}