export default async function ApplicationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary/85">Application details</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Application detail page (delete all this)
        </h1>
        <p className="mt-4 text-sm leading-7 text-white/68">
          Use this route for one full application record. Keep the detail page focused on context, status, and
          role-sensitive actions rather than trying to duplicate the whole applications index.
        </p>
        <p>Application ID: {id}</p>
      </section>
    </div>
  );
}