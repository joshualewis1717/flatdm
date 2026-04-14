// Shared loading spinner component
// Accepts a `text` prop for a contextual message beneath the spinner

type LoadingSpinnerProps = {
  text?: string;
  size?: "sm" | "md";
  spinnerColour?: string; // Tailwind border-t class
};

export default function LoadingSpinner({  text = "Loading…", size = "md",spinnerColour = "border-t-primary"}: LoadingSpinnerProps) {
  
  const isInline = size === "sm";// e.g. if it is bing used inline (e.g. in a button) or inside a page

  return (
    <div className={`flex items-center justify-center gap-2
      ${isInline ? "" : "w-full min-h-[200px] py-16"}`}
    >
      <div className={`relative shrink-0 ${isInline ? "w-4 h-4" : "w-10 h-10"}`}>
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div
          className={`absolute inset-0 rounded-full border-2 border-transparent animate-spin ${spinnerColour}`}
          style={{ animationDuration: "0.75s" }}
        />
      </div>

      {text && (
        <p className={`tracking-wide ${isInline ? "text-xs" : "text-sm text-white/40"}`}>
          {text}
        </p>
      )}
    </div>
  );
}