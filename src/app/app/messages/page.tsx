export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary/85">David</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Messages page (delete all this)
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68">
          This route should feel like an inbox. Every role can review their existing conversations, maybe have a button to view incoming message requests which would display a modal
          dont worry about reporting for now we will add that in later
        </p>
      </section>

    </div>
  );
}
