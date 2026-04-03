import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ReportOverviewPanel from '@/components/shared/ReportOverviewPanel';
import { prisma } from "@/lib/prisma";

const mockData : Report[] = [
  {
  reason: "Inappropriate and aggressive language toward staff",
  createdAt: "2026-03-18",
  id: 12,
  description: "desc",
  status: "Under Review",
  reporterId: 8,
  targetUserId: 3,
  listingId: 3
  },
  {
  reason: "Deliberate property damage — suspected arson",
  createdAt: "2026-02-11",
  id: 14,
  description: "desc",
  status: "Resolved",
  reporterId: 1,
  targetUserId: 5,
  listingId: 4
  },
  {
  reason: "Failure to remit rent payments after repeated notices",
  createdAt: "2026-01-05",
  id: 15,
  description: "desc",
  status: "Action Taken",
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

const reports = await prisma.report.findMany();


export default function HomePage() {
  return (

    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_45%)]" />
      </div>

      <section>
        <ReportOverviewPanel reports={reports}/>
      </section>

    </main>
    );
}