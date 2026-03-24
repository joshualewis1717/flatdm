import { ReactNode } from "react";

// component to display the summary info of a particular property
type Stat = {
  icon: ReactNode;
  label: string;
  value: string | number;
  highlight?: boolean;
};

type PropertyStatGridProps = {
  stats: Stat[];
};

export default function PropertyStatsGrid({ stats }: PropertyStatGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(({ icon, label, value, highlight }) => (
        <div
          key={label}
          className="bg-white/[0.04] border border-white/10 rounded-xl p-3 flex flex-col gap-1.5"
        >
          <div
            className={`flex items-center gap-1.5 text-xs ${
              highlight ? "text-primary" : "text-white/50"
            }`}
          >
            {icon}
            <span>{label}</span>
          </div>
          <p
            className={`text-sm font-medium ${
              highlight ? "text-primary" : "text-white"
            }`}
          >
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}