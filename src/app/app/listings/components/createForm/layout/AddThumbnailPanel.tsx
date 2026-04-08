'use client'
import { ImagePlus, X } from "lucide-react";
import { useRef } from "react";

// thumbnail panel for landlord to add a thumnail image to their listings
type AddThumbnailPanelProps = {
  thumbnail: string | null;
  onSet: (url: string) => void;
  onRemove: () => void;
};

export default function AddThumbnailPanel({ thumbnail, onSet, onRemove }: AddThumbnailPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // function to allow user to add in thumnail into panel
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onSet(reader.result as string);
    reader.readAsDataURL(file);
    // reset so selecting the same file again still fires onChange
    e.target.value = "";
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            Thumbnail Image
            <span className="text-red-500 text-sm">*</span>
          </h2>
          <p className="text-xs text-white/40">
            This is the main image shown on listing cards. Required before saving.
          </p>
        </div>
      </div>

      {/* invisible input tag that we use only for logic (we style it differently*/}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {thumbnail ? (
        <div className="relative w-full max-w-sm">
            {/* Preview */}
          <img
            src={thumbnail}
            alt="Thumbnail preview"
            className="w-full rounded-xl object-cover aspect-video border border-white/10"
          />
            {/* Remove button */}
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 rounded-full bg-black/70 p-1 text-white/70 hover:text-white hover:bg-black transition"
            aria-label="Remove thumbnail"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="mt-2 text-xs text-white/40">Thumbnail set. Click × to replace.</p>
        </div>
      ) : (// add button
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.02] px-5 py-4 text-sm text-white/50 hover:border-white/40 hover:text-white/70 transition w-full sm:w-auto"
        >
          <ImagePlus className="w-4 h-4" />
          Upload thumbnail
        </button>
      )}
    </section>
  );
}