import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ReportOverviewPanel from '@/components/shared/ReportOverviewPanel';

  // pretend this is from the db
const mockData : Report[] = [
  {
  reason: "Inappropriate and aggressive language toward staff",
  createdAt: "2026-03-18",
  target: "Timothy Carter",
  by: "Paul French",
  id: 12,
  description: "desc",
  status: "active",
  reporterId: 2,
  targetUserId: 1,
  listingId: 3
  },
  {
  reason: "Deliberate property damage — suspected arson",
  createdAt: "2026-02-11",
  target: "Jack Harrison",
  by: "Mr Landlord",
  id: 14,
  description: "desc",
  status: "rejected",
  reporterId: 1,
  targetUserId: 3,
  listingId: 4
  },
  {
  reason: "Failure to remit rent payments after repeated notices",
  createdAt: "2026-01-05",
  target: "Emily Bennington",
  by: "Tony Blank",
  id: 15,
  description: "desc",
  status: "rejected",
  reporterId: 1,
  targetUserId: 3,
  listingId: 4
  }////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
];











export default function HomePage() {
  return (

    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_45%)]" />
      </div>

      <section>
        <ReportOverviewPanel reports={mockData}/>
      </section>

    </main>
    );
}