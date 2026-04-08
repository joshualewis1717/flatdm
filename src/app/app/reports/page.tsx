import { prisma } from "@/lib/prisma";
import ReportsClient from "./ReportsClient";

export default async function ReportsPage() {
  const reports = await prisma.report.findMany();
  const users = await prisma.user.findMany();
  
  const serializable = reports.map(r => ({ ...r, createdAt: r.createdAt.toISOString(), modifiedAt: r.modifiedAt.toISOString() }));
  return <ReportsClient initialReports={serializable} users={users}/>;
}