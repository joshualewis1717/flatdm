import { CheckCircle } from "lucide-react";
// simple component to display a success message for consistent styling
type SuccessMessageProps = {
  text?: string;
  position?: "top" | "inline";// position fixed on top of page, or if it is inline and is to be used normally
};

export default function SuccessMessage({
  text = "Action completed successfully.",
  position = "inline",
}: SuccessMessageProps) {
  const isToast = position === "top";

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5
        border-[color:var(--primary)]/30 bg-[color:var(--primary)]/10
        ${isToast 
          ? "fixed top-6 left-1/2 -translate-x-1/2  z-9999 w-auto max-w-sm shadow-xl animate-fade-in"
          : "w-full"
        }
      `}
    >
      <CheckCircle className="w-4 h-4 text-[color:var(--primary)] mt-0.5 shrink-0" />
      <p className="text-sm text-[color:var(--primary)] leading-snug">
        {text}
      </p>
    </div>
  );
}