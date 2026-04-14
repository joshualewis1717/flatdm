type LocationSuggestionProps = {
  label: string;
  subtitle?: string;
  onSelect: () => void;
};

export default function LocationSuggestion({
  label,
  subtitle,
  onSelect,
}: LocationSuggestionProps) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
      className="flex w-full cursor-pointer flex-col items-start gap-0.5 px-3 py-2 text-left transition-colors hover:bg-[#343434]/75"
    >
      <span className="text-sm text-white/80">{label}</span>
      {subtitle ? <span className="text-xs text-white/70">{subtitle}</span> : null}
    </button>
  );
}
