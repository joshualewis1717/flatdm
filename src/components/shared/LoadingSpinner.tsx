// Shared loading spinner component
// Accepts a `text` prop for a contextual message beneath the spinner

type LoadingSpinnerProps = {
    text?: string;
  };
  
  export default function LoadingSpinner({ text = "Loading…" }: LoadingSpinnerProps) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[200px] gap-4 py-16">
        {/* Spinning ring */}
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"
            style={{ animationDuration: "0.75s" }}
          />
        </div>
  
        {/* Loading text */}
        <p className="text-sm text-white/40 tracking-wide">{text}</p>
      </div>
    );
  }