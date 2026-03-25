// type Report = {
//   id: number;
//   reason: string;
//   description: string;
//   status: string;
//   createdAt: string;
//   reporterId: number;
//   targetUserId: number;
//   listingId: number;
// };

import { Button } from '@/components/ui/button';
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import Report from '@/app/app/reports/types.ts';
import Status from '@/components/shared/Status';

const mockData : Report[] = [
  {
  reason: "Inappropriate and aggressive language toward staff",
  createdAt: "2026-03-18",
  id: 12,
  description: "desc",
  status: "active",
  reporterId: 8,
  targetUserId: 3,
  listingId: 3
  },
  {
  reason: "Deliberate property damage — suspected arson",
  createdAt: "2026-02-11",
  id: 14,
  description: "desc",
  status: "rejected",
  reporterId: 1,
  targetUserId: 5,
  listingId: 4
  },
  {
  reason: "Failure to remit rent payments after repeated notices",
  createdAt: "2026-01-05",
  id: 15,
  description: "desc",
  status: "rejected",
  reporterId: 6,
  targetUserId: 7,
  listingId: 4
  }////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
];

const mockUsers: string[] = [
  "Alice Johnson",
  "Bob Martinez",
  "Charlie Nguyen",
  "Dana Patel",
  "Ethan Brown",
  "Fiona O'Connor",
  "George Kim",
  "Hannah Lopez",
  "Ivan Petrov",
  "Jade Williams"
];

function getReportFromId({id} : {id:number}){
  console.log("id:" + id);
  for (let i = 0; i < mockData.length; i++){
    if (mockData[i]['id'] == id){
      console.log("hey" + mockData[i]);
      return mockData[i];
    }
  }
}


export default async function HomePage({ params } : { params: Promise<{id: number}> }) {
  const {id} = await params;
  const numId = Number(id);
  console.log(numId + typeof numId)
  const report : Report = getReportFromId({id:numId});
  console.log(report);

  const statusStyle =
    report['status'] === 'active' ? 'text-green-700' :
    report['status'] === 'in progress' ? 'text-green-600' :
    report['status'] === 'unstarted' ? 'text-yellow-400' :
  'text-gray-700';
  console.log(statusStyle);


  return (

    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary/85">Report ID: {report['id']}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            User {mockUsers[report['targetUserId']]} : {report['reason']}
          </h1>
          <div className="flex items-center space-x-4 gap-5">
            <p className="mt-3 text-sm text-white/60">Submitted by User {mockUsers[report['reporterId']]} at {report['createdAt']}</p>
            <Status theme="greem" text={report['status']}/>
          </div>
          <hr />
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/100">
            Further Information:
            <br />
            {report['description']}
          </p>

          <div className="flex items-center space-x-4 gap-5">
            <Button asChild size="lg" className="rounded-2xl px-5">
                <Link href={`/app/profile/${report['targetUserId']}`}>View {mockUsers[report['targetUserId']]}'s Profile <ArrowRight /></Link>
            </Button>
            <Button asChild size="lg" className="rounded-2xl px-5">
                <Link href={`/app/profile/${report['reporterId']}`}>View {mockUsers[report['reporterId']]}'s Profile <ArrowRight /></Link>
            </Button>
          </div>

        </section>

    </main>
    );
}


  // description: "desc",
  // listingId: 3