import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default function LoginBanner() {
    return (
        <Card className="rounded-2xl border-border/80 bg-card/70 p-4 backdrop-blur-xl">
          <CardContent className="flex items-center justify-between px-0">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Flat DM logo"
                width={44}
                height={44}
                className="rounded-xl border border-border bg-background p-1"
                priority
              />
              <div>
                <p className="text-sm text-muted-foreground">Platform</p>
                <h1 className="text-xl font-semibold tracking-tight">FlatDM</h1>
              </div>
            </div>
            <nav className="flex items-center gap-3">
              <Button asChild variant="outline" className="h-9 px-4">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="h-9 px-4">
                <Link href="/register">Get Started</Link>
              </Button>
            </nav>
          </CardContent>
        </Card>
    );
}
