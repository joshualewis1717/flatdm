"use client";

import { Props, ScriptProps } from 'next/script';
import {User, ConfirmFunction} from '@/app/app/reports/types';
import { Button } from '../ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { deleteUser } from '@/app/app/reports/db_access'
import { useState } from 'react';
import { sendEmail } from '@/app/app/reports/sendEmail';
import { TextPromptPanel } from '@/app/app/reports/TextPromptPanel'
import { addOffence } from '@/app/app/reports/db_access';
import { RemoveReviewButton } from '@/components/ui/RemoveReviewButton'


function setPanelFeatures({confirmFunc, setConfirmFunction, setShowTextPanel, panelText, setPanelText} : {user:User; setFocusUser:any; confirmFunc:any; setConfirmFunction:any; setShowTextPanel:any, panelText:string; setPanelText: any}){
    setConfirmFunction(() => confirmFunc);
    setPanelText(panelText);
    setShowTextPanel(true);
    return;
}


// ban a user
function deleteUserWrap({user, setShowUser} : {user : User; setShowUser : any}){
    // make sure we actually want to delete this
    const ok = window.confirm(`Delete User ${user['username']}? This cannot be undone.`);
    if (!ok) return;
    let delError = null;

    try{
    deleteUser({user});
    setShowUser(false);
    }
    catch(error){
        delError = error;
    }
    return;
}

export default function UserModOverviewPanel({user} : User){

    const [showUser, setShowUser] = useState(true);             // handles hiding user from list after they have been deleted
    const [showTextPanel, setShowTextPanel] = useState(false);  // handles whether text input panel should show
    const [confirmFunction, setConfirmFunction] = useState<ConfirmFunction>(() => sendEmail); // handles what function the text panel does when confirmed
    const [panelText, setPanelText] = useState("");             // what should the text panel say

    function hide(){
        setShowTextPanel(false);
    }

    if (showUser){
            return(
            <section className="flex flex-row gap-1 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">

                <TextPromptPanel text={panelText} user={user} confirm={confirmFunction} visible={showTextPanel} hide={hide}  />
            
                <div>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                        {user['username']} ({user['firstName']} {user['lastName']})
                    </h2>
                    <p className="italic text-gray-400">{user['role']}: {user['email']}</p>
                </div>

                {/* button options: view / ban / add offence / issue warning*/}
                <div className="flex flex-wrap gap-1">

                    {/* go to user's profile page */}
                    <Button asChild size="lg" className="rounded-2xl px-5">
                        <Link href={`/app/profile/${user['id']}`}>View Profile <ArrowRight /></Link>
                    </Button>

                    {/* issue warning button */}
                    <button onClick={() => setPanelFeatures({confirmFunc:sendEmail, setConfirmFunction, setShowTextPanel, panelText:`Reason for warning ${user['username']}`, setPanelText})} className="group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground">
                        Issue Warning
                    </button>


                    {/* add offence button */}
                    <button onClick={() => setPanelFeatures({confirmFunc:addOffence, setConfirmFunction, setShowTextPanel, panelText:`Reason for adding offence record to ${user['username']}`, setPanelText})} className="group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground">
                        Add Offence
                    </button>

                    {/* ban user button */}
                    <button onClick={() => deleteUserWrap({user:user, setShowUser:setShowUser})} className="group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40">
                        Ban User
                    </button>

                </div>


            </section>
    )
    }

}