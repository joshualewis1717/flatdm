import { prisma } from "@/lib/prisma";
import UserModOverviewPanel from "@/components/shared/UserModOverviewPanel";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default async function HomePage({ params } : { params: Promise<{id: number}> }) {

    const users = await prisma.user.findMany();  // get all users from the db
    
    return (
        <div className="flex flex-col gap-2 py-[3%]">
            <h1>Users</h1>

            {users.map((user) => (
                <UserModOverviewPanel key={user.id} user={user} />
            ))}
        </div>
    );
}