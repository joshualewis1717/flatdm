import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

//fake stats for now - will integrate real ones in a future iteration when we have more data flowing in.
const roleContent = {
  CONSULTANT: {
    intro:
      "Track open applications, keep landlord conversations moving, and stay close to placement logistics without digging across tabs.",
    primaryCta: { href: "/app/applications", label: "Review my applications" },
    secondaryCta: { href: "/app/messages", label: "Open inbox" },
    metrics: [
      { label: "Active applications", value: "08" },
      { label: "Unread threads", value: "03" },
    ],
  },
  LANDLORD: {
    intro:
      "Manage live stock, review incoming applicants quickly, and keep conversations moving from initial interest through move-in.",
    primaryCta: { href: "/app/listings/new", label: "Create a new listing" },
    secondaryCta: { href: "/app/applications", label: "Review applicants" },
    metrics: [
      { label: "Live listings", value: "12" },
      { label: "Message backlog", value: "05" },
    ],
  },
  MODERATOR: {
    intro:
      "Keep the marketplace healthy by monitoring supply, resolving conversations, and stepping into application flows when escalation is needed.",
    primaryCta: { href: "/app/applications", label: "Open review queue" },
    secondaryCta: { href: "/app/listings", label: "Inspect listings" },
    metrics: [
      { label: "Flagged items", value: "04" },
      { label: "At-risk threads", value: "02" },
    ],
  },
} as const;


export default async function AppHomePage() {
  const session = await auth();
  const role = session?.user?.role ?? "CONSULTANT";
  const content = roleContent[role as keyof typeof roleContent] ?? roleContent.CONSULTANT;

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
            {content.metrics.map((metric) => (
              <div key={metric.label} className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
                <p className="text-sm text-white/55">{metric.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{metric.value}</p>
              </div>
            ))}
          </div>

          <div>
            Bugs im gonna fix
            <ul className="list-disc pl-5 text-sm text-white/50">
              <li>headers dont work for catch all slugs</li>
              <li>i dont like where the profile is imma move it to the sidebar so user can see at all screen sizes</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
