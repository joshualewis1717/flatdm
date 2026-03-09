import { Button } from "@/components/ui/button";

export default function Hero({
    onLoginClick,
    onRegisterClick,
}:{
    onLoginClick: () => void;
    onRegisterClick: () => void;
}) {
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
            <Button size="lg" className="px-6" onClick={onRegisterClick}>
              Create Account
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-6"
              onClick={onLoginClick}
            >
              Sign In
            </Button>
          </div>
        </section>
  )
}
