"use client";

import {User, ConfirmFunction} from '@/app/app/reports/types';
import { Button } from '../ui/button';
import Link from 'next/link';
import { ArrowRight, Ban, MailWarning, ShieldPlus, UserRound } from 'lucide-react';
import { deleteUser } from '@/app/app/reports/db_access'
import { Dispatch, SetStateAction, useState } from 'react';
import { TextPromptPanel } from '@/app/app/reports/TextPromptPanel'
import { addOffence, warnUser } from '@/app/app/reports/db_access';

function setPanelFeatures({
    confirmFunc,
    setConfirmFunction,
    setShowTextPanel,
    panelText,
    setPanelText
} : {
    confirmFunc: ConfirmFunction;
    setConfirmFunction: Dispatch<SetStateAction<ConfirmFunction>>;
    setShowTextPanel: (value: boolean) => void;
    panelText:string;
    setPanelText: (value: string) => void;
}){
    setConfirmFunction(() => confirmFunc);
    setPanelText(panelText);
    setShowTextPanel(true);
    return;
}


// ban a user
function deleteUserWrap({user, setShowUser} : {user : User; setShowUser : (value: boolean) => void}){
    // make sure we actually want to delete this
    const ok = window.confirm(`Delete User ${user['username']}? This cannot be undone.`);
    if (!ok) return;
    try{
    deleteUser({user});
    setShowUser(false);
    }
    catch(error){
        console.error(error);
    }
    return;
}

export default function UserModOverviewPanel({user} : {user: User}){

    const [showUser, setShowUser] = useState(true);             // handles hiding user from list after they have been deleted
    const [showTextPanel, setShowTextPanel] = useState(false);  // handles whether text input panel should show
    const [confirmFunction, setConfirmFunction] = useState<ConfirmFunction>(() => warnUser); // handles what function the text panel does when confirmed
    const [panelText, setPanelText] = useState("");             // what should the text panel say

    function hide(){
        setShowTextPanel(false);
    }

    if (showUser){
            return(
            <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-primary/35 hover:bg-white/[0.05] sm:p-5">

                <TextPromptPanel text={panelText} user={user} confirm={confirmFunction} visible={showTextPanel} hide={hide}  />

                <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/25 text-white/70">
                            <UserRound className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-[0.24em] text-white/45">{user.role}</p>
                            <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
                                {user.username}
                            </h2>
                            <p className="mt-1 text-sm text-white/60">
                                {user.firstName} {user.lastName}
                            </p>
                            <p className="mt-1 break-all text-sm text-white/45">{user.email}</p>
                        </div>
                    </div>

                    {/* button options: view / ban / add offence / issue warning*/}
                    <div className="flex flex-wrap gap-2 lg:justify-end">

                        {/* go to user's profile page */}
                        <Button asChild size="lg" className="rounded-lg px-5">
                            <Link href={`/app/profile/${user.id}`}>View Profile <ArrowRight /></Link>
                        </Button>

                        {/* issue warning button */}
                        <button onClick={() => setPanelFeatures({confirmFunc:warnUser, setConfirmFunction, setShowTextPanel, panelText:`Reason for warning ${user.username}`, setPanelText})} className="group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/[0.08] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                            <MailWarning className="size-4" />
                            Issue Warning
                        </button>


                        {/* add offence button */}
                        <button onClick={() => setPanelFeatures({confirmFunc:addOffence, setConfirmFunction, setShowTextPanel, panelText:`Reason for adding offence record to ${user.username}`, setPanelText})} className="group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/[0.08] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                            <ShieldPlus className="size-4" />
                            Add Offence
                        </button>

                        {/* ban user button */}
                        <button onClick={() => deleteUserWrap({user:user, setShowUser:setShowUser})} className="group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-3 focus-visible:ring-destructive/20">
                            <Ban className="size-4" />
                            Ban User
                        </button>

                    </div>
                </div>

            </section>
    )
    }

    return null;

}