// Shared error message component
// Accepts a `text` prop for the specific error message to display

import { AlertCircle } from "lucide-react";

type ErrorMessageProps = {
  text?: string;
};

export default function ErrorMessage({ text = "Something went wrong. Please try again." }: ErrorMessageProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3.5 w-full">
      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
      <p className="text-sm text-red-400 leading-snug">{text}</p>
    </div>
  );
}