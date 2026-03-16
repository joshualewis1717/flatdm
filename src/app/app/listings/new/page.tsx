export default function NewListingsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary/85">Listings</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          New Listings page (delete all this)
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68">
          This page should just be a form to create a new listing. Only landlords should be able to access this route and the form should include all the necessary fields to create a listing based on the schema. For now we can just make it a static form and worry about hooking up the backend later, but make sure to include all the fields we will need so we dont have to worry about adding them in later.
        </p>
      </section>
    </div>
  );
}
