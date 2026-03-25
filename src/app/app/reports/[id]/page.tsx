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

import Report from '@/app/app/reports/types.ts';

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
  return (

    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_45%)]" />
      </div>

      <section>
        <h1>User {mockUsers[report['targetUserId']]}</h1>
      </section>

    </main>
    );
}