import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FeatureGrid({ 
    features
}: {
    features: { title: string; description: string }[]
}) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} className="rounded-2xl border-border/80 bg-card/80 py-0 backdrop-blur-sm">
              <CardHeader className="px-6 pt-6">
                <div className="mb-2 h-1 w-12 rounded-full bg-primary" />
                <CardTitle className="text-lg font-semibold"> {feature.title} </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <CardDescription className="text-sm leading-relaxed"> {feature.description} </CardDescription>
              </CardContent>
            </Card>
          ))}
        </section>
  );
}