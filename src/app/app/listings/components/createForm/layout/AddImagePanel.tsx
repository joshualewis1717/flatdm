'use client'
import { ImagePlus, X } from "lucide-react";
import { useRef } from "react";

type AddImagesPanelProps = {
  images: string[];
  onAdd: (dataUrl: string) => void;
  onRemove: (index: number) => void;
};

export default function AddImagesPanel({ images, onAdd, onRemove }: AddImagesPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // same function as the one in add thumbnail panel component to help users to add in an image
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {//TO DO make this a reusable helper and use it in both components
    // for consistency
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => onAdd(reader.result as string);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Images</h2>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ImagePlus className="w-4 h-4" />
          Add Images
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {images.length === 0 ? (
        <p className="text-sm text-white/50">No images added</p>
      ) : (
        <div className="flex flex-wrap gap-4">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/10"
            >
              <img src={img} className="w-full h-full object-cover" alt="" />
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white/70 hover:text-white transition"
                aria-label="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}