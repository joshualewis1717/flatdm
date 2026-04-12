import LoadingSpinner from "@/components/shared/LoadingSpinner";
// global loading fallback in case if a page takes time to render
export default function Loading() {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner text="Loading..." />
      </div>
    );
  }