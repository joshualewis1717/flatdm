export default async function ListingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary/85">Listings</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Specific Listing page (delete all this)
        </h1>
        <p>Listing ID: {id}</p>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68">
          This page is a slug catch all, so scrape the id from the params, then use that to query an api route you make to display all the 
          about a property and display it nicely here.
        </p>
      </section>
    </div>
  );
}