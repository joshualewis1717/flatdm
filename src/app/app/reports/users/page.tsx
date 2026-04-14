import UserModOverviewPanel from "@/components/shared/UserModOverviewPanel";
import { getAllAliveUsers } from "../db_access";
import ErrorMessage from "@/components/shared/ErrorMessage";
import { UsersRound } from "lucide-react";


export default async function HomePage() {

    let users = null;
    let dataError : string | null = null;

    // get all users from the db who have not been deleted
    try{
        users = await getAllAliveUsers();

        if (users.error == null){
            users = users.result;
        }
        else{
            dataError = users.error;
        }
    }
    catch {
        dataError = "Error accessing the database. Refresh to try again."
    }

    return (
        <div className="space-y-6">
            <section className="border-b border-white/10 pb-6">
                <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    {dataError == null && (
                        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Active users</p>
                            <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-white">
                                <UsersRound className="size-5 text-primary" />
                                {users.length}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {dataError == null &&(
                <div className="space-y-3">
                    {users.map((user) => (
                        <UserModOverviewPanel key={user.id} user={user} />
                    ))}
                </div>
                
            )}

            {dataError != null && (
                <ErrorMessage text={dataError} />
            )}
        </div>
    );
}