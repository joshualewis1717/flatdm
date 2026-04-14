import { prisma } from "@/lib/prisma";
import UserModOverviewPanel from "@/components/shared/UserModOverviewPanel";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAllAliveUsers } from "../db_access";
import ErrorMessage from "@/components/shared/ErrorMessage";


export default async function HomePage({ params } : { params: Promise<{id: number}> }) {

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
    catch (error){
        dataError = "Error accessing the database. Refresh to try again."
    }

    return (
        <div className="flex flex-col gap-2 py-[3%]">
            {dataError == null &&(
                <div>
                    <h1>Users</h1>

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