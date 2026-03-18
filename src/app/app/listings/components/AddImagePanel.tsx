// panel for ladlords to add in images to listing page

type AddImagesPanelProps = {
    images: string[];
    onAdd: () => void;
    onRemove: (index: number) => void;
  };
  
  export default function AddImagesPanel({ images, onAdd, onRemove }: AddImagesPanelProps) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Images</h2>
          <button type="button" onClick={onAdd} className="text-sm text-primary hover:underline">
            + Add Image
          </button>
        </div>
  
        {images.length === 0 && (
          <p className="text-sm text-white/50">No images added</p>
        )}
  
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
                className="absolute top-1 right-1 text-xs bg-black/70 px-1 rounded"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>
    );
  }
