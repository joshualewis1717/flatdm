"use client";

import {Report, User} from '@/app/app/reports/types';
import Status from '@/components/shared/Status';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, FileText, ShieldAlert, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import ModeratorSelector from '@/components/shared/ModeratorSelector';
import StatusSelector from '@/components/shared/StatusSelector';
import SeveritySelector from '@/components/shared/SeveritySelector';
import ErrorMessage from '@/components/shared/ErrorMessage';

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

// map users by their ids. so userMap[3] returns the user with userId 3
function mapUsers({users}:{users: User[]}) {
  const userMap: Record<number, User | undefined> = {};
  for (let i = 0; i < users.length; i++){
    userMap[users[i].id] = users[i];
  }

  return userMap;
}

// get moderator given userMap and userId
function getMod({userId, userMap} : {userId?: number | null, userMap : Record<number, User | undefined>}){
    if (userId == null){
        return null;
    }
    return userMap[userId];
}

export default function SelectedReportClient({error, report, target, reporter, moderators} : {error:string|null, report : Report, target : User, reporter : User, moderators : User[]}){

    // first check if an error was found
    const errorFound = error !== null;

    // states for the assigning moderator, changing status and changing severity functionality
    const [assignModVis, setAssignModVis] = useState(false);
    const [changeStatusVis, setChangeStatusVis] = useState(false);
    const [changeSeverityVis, setChangeSeverityVis] = useState(false);
    
   
    const userMap = mapUsers({users:moderators});

    // variables for the status for easier processing (for the theme of the Status component)
    const [status, setStatus] = useState(report['status']);
    const [severity, setSeverity] = useState(report['severity'] ?? "UNRANKED");
    const moderator = getMod({userId:report.assignedModeratorId, userMap:userMap})

    function assignModeratorWrap({setVis, vis} : {setVis: (value: boolean) => void, vis:boolean}): void {
        setVis(!vis);
    }

    function changeStatusWrap({setVis, vis} : {setVis: (value: boolean) => void, vis:boolean}): void {
        setVis(!vis);
    }

    function changeSeverityWrap({setVis, vis} : {setVis: (value: boolean) => void, vis:boolean}): void {
        setVis(!vis)
    }

    return (
        <main className="space-y-6">
            <Button asChild variant="outline" className="rounded-lg border-white/12 bg-white/[0.03] text-white hover:bg-white/[0.06]">
                <Link href="/app/reports">
                    <ArrowLeft className="size-4" />
                    Back to queue
                </Link>
            </Button>

            {errorFound && (
                <ErrorMessage text={error} />
            )}

            {!errorFound && (
                <>
                    <section className="border-b border-white/10 pb-6">
                        <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary/85">Report #{report.id}</p>
                        <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
                            <div>
                                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                                    {target.username}: {report.reason}
                                </h1>
                                <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">
                                    Submitted by {reporter.username} on {String(report.createdAt).slice(0, 10)}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2 lg:justify-end">
                                <Status theme={themeMap[status]} text={"Status: " + wordMap[status]} />
                                <Status theme={themeMap[severity]} text={"Severity: " + wordMap[severity]} />
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-5 xl:grid-cols-[1fr_340px]">
                        <div className="space-y-5">
                            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
                                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                                    <ShieldAlert className="size-4 text-primary" />
                                    Case summary
                                </div>
                                <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                                    <div className="rounded-lg border border-white/8 bg-black/15 p-4">
                                        <p className="text-xs uppercase tracking-[0.22em] text-white/45">Target user</p>
                                        <p className="mt-2 font-medium text-white">{target.username}</p>
                                    </div>
                                    <div className="rounded-lg border border-white/8 bg-black/15 p-4">
                                        <p className="text-xs uppercase tracking-[0.22em] text-white/45">Reporter</p>
                                        <p className="mt-2 font-medium text-white">{reporter.username}</p>
                                    </div>
                                    <div className="rounded-lg border border-white/8 bg-black/15 p-4">
                                        <p className="text-xs uppercase tracking-[0.22em] text-white/45">Category</p>
                                        <p className="mt-2 font-medium text-white">{wordMap[report.category ?? "OTHER"]}</p>
                                    </div>
                                    <div className="rounded-lg border border-white/8 bg-black/15 p-4">
                                        <p className="text-xs uppercase tracking-[0.22em] text-white/45">Moderator</p>
                                        <p className="mt-2 font-medium text-white">{moderator?.username ?? "Unassigned"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
                                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                                    <FileText className="size-4 text-primary" />
                                    Further information
                                </div>
                                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-white/70">
                                    {report.description || "No additional information was supplied."}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Button asChild size="lg" className="rounded-lg px-5">
                                    <Link href={`/app/profile/${report.targetUserId}`}>
                                        <UserRound className="size-4" />
                                        Open target profile <ArrowRight />
                                    </Link>
                                </Button>
                                <Button asChild size="lg" variant="outline" className="rounded-lg border-white/12 bg-white/[0.03] px-5 text-white hover:bg-white/[0.06]">
                                    <Link href={`/app/profile/${report.reporterId}`}>
                                        <UserRound className="size-4" />
                                        Open reporter profile <ArrowRight />
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <aside className="h-fit rounded-lg border border-white/10 bg-white/[0.03] p-5">
                            <p className="text-sm font-semibold text-white">Moderator actions</p>
                            <p className="mt-2 text-sm leading-6 text-white/55">
                                Assign ownership and update the case state as the investigation progresses.
                            </p>

                            <div className="mt-5 space-y-3">
                                {/* assign moderator */}
                                {!assignModVis &&
                                    <button onClick={() => assignModeratorWrap({setVis:setAssignModVis, vis:assignModVis})} className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/[0.08]">
                                        Assign moderator
                                    </button>
                                }
                                
                                {assignModVis &&
                                    <ModeratorSelector moderators={moderators} report={report} setVis={setAssignModVis} />
                                }

                                {/* change status */}
                                {!changeStatusVis &&
                                    <button onClick={() => changeStatusWrap({setVis:setChangeStatusVis, vis:changeStatusVis})} className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/[0.08]">
                                        Change status
                                    </button>
                                }

                                {changeStatusVis &&
                                    <StatusSelector report={report} setStatus={setStatus} setVis={setChangeStatusVis} />
                                }
                                

                                {/* change severity */}
                                {!changeSeverityVis &&
                                    <button onClick={() => changeSeverityWrap({setVis:setChangeSeverityVis, vis:changeSeverityVis})} className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/[0.08]">
                                        Change severity
                                    </button>
                                }

                                {changeSeverityVis &&
                                    <SeveritySelector report={report} setSeverity={setSeverity} setVis={setChangeSeverityVis} />
                                }
                            </div>
                        </aside>
                    </section>
                </>
            )}
        </main>
    )
}