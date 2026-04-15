import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import {getAllReports} from '@/app/app/reports/db_access'
import ErrorMessage from "@/components/shared/ErrorMessage";
import { getOverviewStats, isOverviewRole, type OverviewMetric } from "@/lib/overview";

// get numbers for moderator page

let reports = null;
let dataError : string | null = null;

try{
  reports = await getAllReports();

  if (reports.error == null){
    reports = reports.result
  }
  else{
    dataError = reports.error;
  }
}
catch (error){
  dataError = "Error accessing the database. Refresh to try again."
}


let resolvedCount = 0;
let activeCount = 0;

if (dataError == null){
  for (let i = 0; i < reports.length; i++){
    const rep = reports[i];
    if (rep.status == "RESOLVED"){
      resolvedCount++;
    }
    else if (rep.status == "UNDER_REVIEW" || rep.status == "OPEN"){
      activeCount++;
    }
    else{
      console.log("error: " + rep.status + " is not a valid report status");
    }
  }

  console.log(resolvedCount)
  console.log(activeCount)
}
else{
  resolvedCount = (<ErrorMessage text={dataError} />);
  activeCount = (<ErrorMessage text={dataError} />);
}

//fake stats for now - will integrate real ones in a future iteration when we have more data flowing in.
const roleContent = {
  CONSULTANT: {
    intro:
      "Track open applications, keep landlord conversations moving, and stay close to placement logistics without digging across tabs.",
    primaryCta: { href: "/app/applications/dashboard", label: "Review my applications" },
    secondaryCta: { href: "/app/messages", label: "Open inbox" },
  },
  LANDLORD: {
    intro:
      "Manage live stock, review incoming applicants quickly, and keep conversations moving from initial interest through move-in.",
    primaryCta: { href: "/app/listings/new", label: "Create a new listing" },
    secondaryCta: { href: "/app/applications", label: "Review applicants" },
  },
  MODERATOR: {
    intro:
      "Keep the marketplace healthy by monitoring supply, resolving conversations, and stepping into application flows when escalation is needed.",
    primaryCta: { href: "/app/reports", label: "Open report queue" },
    secondaryCta: { href: "/app/reports/users", label: "View All Users" },
  },
} as const;

const fallbackMetrics = [
  { key: "activeApplications", label: "Active applications", value: 0 },
  { key: "unreadMessages", label: "Unread messages", value: 0 },
] satisfies OverviewMetric[];

export default async function AppHomePage() {
  const session = await auth();
  const userId = Number(session?.user?.id);
  const role = isOverviewRole(session?.user?.role) ? session.user.role : "CONSULTANT";
  const content = roleContent[role as keyof typeof roleContent] ?? roleContent.CONSULTANT;
  const metrics = Number.isInteger(userId) && userId > 0 ? (await getOverviewStats({ userId, role })).metrics : fallbackMetrics;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/5 bg-[linear-gradient(135deg,rgba(201,251,0,0.18),rgba(255,255,255,0.04)_42%,rgba(255,255,255,0.02)_100%)]">
        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)] lg:px-8 lg:py-10">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary/85">{session?.user?.role ?? "Welcome to FlatDM"}</p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Welcome back {session?.user?.firstName ? `, ${session.user.firstName}` : "to FlatDM"}!
              </h1>
              <p className="max-w-2xl text-base leading-7 text-white/68">{content.intro}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-2xl px-5">
                <Link href={content.primaryCta.href}> {content.primaryCta.label}<ArrowRight /> </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-2xl border-white/12 bg-white/[0.03] px-5 text-white hover:bg-white/[0.06]">
                <Link href={content.secondaryCta.href}>{content.secondaryCta.label}</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {metrics.map((metric) => (
              <div key={metric.key} className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
                <p className="text-sm text-white/55">{metric.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
