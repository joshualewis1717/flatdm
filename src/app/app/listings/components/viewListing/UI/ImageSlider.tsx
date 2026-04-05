'use client'
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

// a component to slide through a list of images
type ImageSliderProps = {
  images: string[];
};

export default function ImageSlider({ images }: ImageSliderProps) {
  const [currentImage, setCurrentImage] = useState(0);

  if (images.length === 0) return null;
  const showButtons = images.length > 1;

  // loop back around when we reach beggining/ end
  const prevImage = () =>
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const nextImage = () =>
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <div className="relative w-full h-60 sm:h-72 bg-white/10">
      <img
        src={images[currentImage]}
        alt={`Listing image ${currentImage + 1}`}
        className="w-full h-full object-cover"
      />

      {showButtons && (
        <>
          <button
          onClick={prevImage}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          >
            <ArrowLeft />
          </button>
          
          <button
          onClick={nextImage}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          >
            <ArrowRight />
          </button>
        </>
        )}

      {/* Thumbnail previews */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <div
            key={idx}
            onClick={() => setCurrentImage(idx)}
            className={`h-12 w-12 rounded-md overflow-hidden border-2 cursor-pointer ${
              idx === currentImage ? "border-primary" : "border-white/20"
            }`}
          >
            <img
              src={images[idx]}
              alt={`Thumb ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}