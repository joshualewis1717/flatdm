import { auth } from "@/lib/auth";

export default async function ApplicationsPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary/85">Applications</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Applications page (delete all this)
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68">
          This route should branch by role. The record set and available actions are different for landlords,
          moderators, and consultants, so the query and UI controls need to be driven from the session role.
          landlords view incoming applications, consultants view their sent applications and moderators can view all applications and filter
        </p>
        <p className="mt-3 text-sm text-white/50">Current session role: {session?.user?.role ?? "Unknown"}</p>
      </section>
      {JSON.stringify(session, null, 2)}
    </div>
  );
}
