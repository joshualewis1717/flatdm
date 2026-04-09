// import { Button } from '@/components/ui/button';
// import Link from "next/link";
// import { ArrowRight } from "lucide-react";
// import {getReport, getUsers} from '@/app/app/reports/db_access'
// import Status from '@/components/shared/Status';


// // passing in an id and array (such as from the db), return the entry for that specific id
// function getEntryById({id} : {id:number}, {data} : {data:Array<any>}){
//   for (let i = 0; i < data.length; i++){
//       if (data[i]['id'] == id){
//         return data[i];
//       }
//   }
//   return undefined;
// }

// export default async function HomePage({ params } : { params: Promise<{id: number}> }) {
  
//   const {id} = await params;    // id represents the report id
//   const numId = Number(id);     // make the id a number

//   const report = await getReport({reportId:numId});
//   //const report = getEntryById( {id: numId}, {data: reports} );  // get the report for the given report id

//   const users = await getUsers();  // get all users from the db

//   // set the target and reporter users to use later
//   let target = undefined;
//   let reporter = undefined;
//   for (let i = 0; i < users.length; i++){             // iterate through all users to get to target and reporter user ids
//       if (users[i]['id'] == report['targetUserId']){
//         target = users[i];
//       }
//       else if (users[i]['id'] == report['reporterId']){
//         reporter = users[i];
//       }
//   }

//   // depending on what value 'status' holds, the status bar will appear a different colour
//   // theme is passed into the Status component to style it
//   const theme =
//     report['status'] === 'RESOLVED' ? 'green' :
//     report['status'] === 'UNDER_REVIEW' ? 'amber' :
//     report['status'] === 'OPEN' ? 'red' :
//   'neutral';
      
//   return (

//     <main className="relative min-h-screen overflow-hidden bg-background text-foreground">

//         <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
//           <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary/85">Report ID: {report['id']}</p>

//           {report && reporter && target ? (
//             <>
//             <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
//                 User {target['username']} : {report['reason']}
//               </h1>
//               <div className="flex items-center gap-5">
//                 <div className="flex-1 min-w-0">
//                   <p className="mt-3 text-sm text-white/60 truncate">
//                     Submitted by User {reporter['username']} at {String(report['createdAt'])}
//                   </p>
//                 </div>
//                 <Status theme={theme} text={report['status']} />
//               </div>
//               <hr />
//               <p className="mt-4 max-w-3xl text-sm leading-7 text-white/100">
//                 Further Information:
//                 <br />
//                 {report['description']}
//               </p>

//               <div className="flex items-center space-x-4 gap-5">
//                 <Button asChild size="lg" className="rounded-2xl px-5">
//                     <Link href={`/app/profile/${report['targetUserId']}`}>View {target['username']}'s Profile <ArrowRight /></Link>
//                 </Button>
//                 <Button asChild size="lg" className="rounded-2xl px-5">
//                     <Link href={`/app/profile/${report['reporterId']}`}>View {reporter['username']}'s Profile <ArrowRight /></Link>
//                 </Button>
//               </div>
//             </>
//           ) : (
//             <p>Loading...</p>
//           )}


//         </section>

//     </main>
//     );
// }