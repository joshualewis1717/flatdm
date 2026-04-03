import { Props, ScriptProps } from 'next/script';
import User from '@/app/app/reports/types';
import { Button } from '../ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// type User = {
//   id: number;
//   username: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   passwordHash: string;
//   role: string
//   createdAt: string;
//   updatedAt: string;
// }

export default function UserModOverviewPanel({user} : User){

    return(
        <section className="flex flex-row gap-1 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
           
            <div>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    {user['username']} ({user['firstName']} {user['lastName']})
                </h2>
                <p className="italic text-gray-400">{user['role']}: {user['email']}</p>
            </div>




            {/* button options: view / ban / add offence / issue warning*/}
            <div className="flex flex-wrap gap-1">
                <Button asChild size="lg" className="rounded-2xl px-5">
                    <Link href={`/app/profile/${user['id']}`}>View Profile <ArrowRight /></Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="rounded-2xl px-5">
                    <Link href={`/app/profile/${user['id']}`}>Issue Warning</Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="rounded-2xl px-5">
                    <Link href={`/app/profile/${user['id']}`}>Add Offence</Link>
                </Button>
                <Button asChild size="lg" variant="destructive" className="rounded-2xl px-5">
                    <Link href={`/app/profile/${user['id']}`}>Ban user</Link>
                </Button>
            </div>


        </section>
    )
}