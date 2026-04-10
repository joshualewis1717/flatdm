import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

type ConfirmModalProps = {
  title: string;
  description?: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean; // if we want to disable the button during some function e.g. wehn deleting from db
};

export default function ConfirmModal({title, description, confirmText = "Confirm", cancelText = "Cancel", onConfirm,
  onCancel,loading = false,}: ConfirmModalProps) {
 
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel} // clicking outside closes the modal
      />

      {/* modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0b0b] p-6 shadow-2xl animate-fade-in">
        
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>

        {description && (
          <div className="text-sm text-white/70 mb-6 leading-relaxed">
            {description}
          </div>
        )}

        <div className="flex justify-between gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}