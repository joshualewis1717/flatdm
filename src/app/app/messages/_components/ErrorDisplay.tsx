type Parameters = {message?: string | null;};

export default function Error({ message }: Parameters) {
  if (!message) return null;

  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
      {message}
    </div>
  );
}