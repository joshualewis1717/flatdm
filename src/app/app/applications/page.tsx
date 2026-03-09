//applications page
// for landlords, moderators and consultants
// 3 views

//landlords will see all the applications for their listings and have the ability to accept or reject them and filter by status or property

//moderators and consultants will see all the applications for all listings but will not have the ability to accept or reject them but can contact the applicants if needed and filter by status or property

//consultants will see all their open applications and have the ability to withdraw them if they want to remove themselves from consideration for a listing

// i recommend creating a reusable component ApplicationCard in shared that can be used in both views to display data nicely
import { auth } from "@/lib/auth"

export default async function ApplicationsPage() {
    const session = await auth()
    
    return (
        <div>
            <h1>Applications</h1>
            <p>Session: {JSON.stringify(session)}</p>
            <p>This page will display all the applications for a specific listing.</p>
            <p>Landlords can manage the applications by accepting or rejecting them, while moderators and consultants can only view the applications and contact the applicants if needed.</p>
        </div>
    );
}