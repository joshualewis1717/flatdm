import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="space-y-6 text-center">
          <p className="mx-auto w-fit rounded-full border border-primary/50 bg-primary/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.25em] text-primary">
            Modern Rental Workflow
          </p>
          <h2 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
            Welcome to FlatDM
          </h2>
          <p className="mx-auto max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
            A platform for FDM consultants and landlords to manage accommodation during client placements.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button asChild size="lg" className="px-6">
              <Link href="/register">Create Account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-6">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </section>
  )
}
