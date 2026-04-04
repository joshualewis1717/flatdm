import ReportOverviewItem from '@/components/shared/ReportOverviewItem';
import { prisma } from "@/lib/prisma";



export default async function HomePage({ params } : { params: Promise<{id: number}> }) {
  const reports = await prisma.report.findMany();

  return (

    <div className="flex flex-col gap-2 py-[3%]">

      {reports.map((report) => (
          <ReportOverviewItem key={report.id} report={report} />
      ))}
      
    </div>
  );
}