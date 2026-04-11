// component to group together a lot of applications e.g. accepted, pending, rejected, confirmed applications etc

type props = {
  title: string;
  subtitle?: string;
  count?: number;
  children: React.ReactNode;
};

export default function DashboardSection({title,subtitle,count,children,}: props) {
  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-baseline gap-3">
          <h2 className="text-xl font-semibold text-white tracking-tight">
            {title}
          </h2>

          {count !== undefined && (
            <span className="text-sm font-semibold text-white/25 tabular-nums">
              {count}
            </span>
          )}

          {subtitle && (
            <span className="text-xs text-white/30 ml-auto">
              {subtitle}
            </span>
          )}
        </div>

        <div className="h-px w-full bg-white/10" />
      </div>

      {/* Scrollable content */}
      <div className="max-h-[45vh] overflow-y-auto pr-1">
        <ul className="grid gap-3 sm:grid-cols-2">
          {children}
        </ul>
      </div>
    </section>
  );
}