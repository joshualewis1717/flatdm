export default function ListingsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary/85">Listings</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Listings page (delete all this)
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68">
          Treat this as the listings index. The main job here is to return the right records for the current
          role and present them in a list view of cards. the main job here is to just have a row of filters along the top and then a list of cards below
          that update based on the filters and the user role. This page doesnt really change depending on the role so just focus on 
        </p>
        <p>
          There should also be a button only displayed to landlords that takes them to the new listing flow. literally just direct then to /new
          maybe one for for landlords to also view their own listings
        </p>
      </section>
    </div>
  );
}
