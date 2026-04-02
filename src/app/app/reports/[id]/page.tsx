export default function HomePage({ params } : { params: string }) {
  return (

    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_45%)]" />
      </div>

      <section>
        <h1>id</h1>
      </section>

    </main>
    );
}