import { Home } from "lucide-react";
// component to be displayed as a placeholder when e.g. a section is empty, e.g. no pending applications
type props ={
    label: string;
}
export default function EmptyState({ label }: props) {
    return (
      <li className="col-span-2 flex flex-col items-center justify-center gap-2 py-10 rounded-2xl border border-dashed border-white/[0.08] text-white/20">
        <Home className="w-5 h-5" />
        <p className="text-xs">{label}</p>
      </li>
    );
  }