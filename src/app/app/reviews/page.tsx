import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary/85">Reviews</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Reviews hub
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68">
          This route is ready for your future reviews experience. It is now wired into the profile stat cards so we can plug in listings, landlord reviews, and consultant reviews without changing the navigation again.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg" className="rounded-2xl px-5">
            <Link href="/app/reviews/new">
              <Star />
              Leave a review
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-2xl border-white/12 bg-white/[0.03] px-5 text-white hover:bg-white/[0.06]">
            <Link href="/app/profile">
              Back to profile
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
