import { ReactNode} from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";


export type ButtonVariant = "danger" | "success" | "warning" | "neutral";// the button variants that we will need for the confirm modal

// record to easily map between our varients to colour.
const variantStyles: Record<ButtonVariant, { base: string; hover: string; icon: string }> = {
  danger:  { base: "bg-red-500",     hover: "hover:bg-red-600",     icon: "text-red-400"    },
  success: { base: "bg-[#c9fb00]",   hover: "hover:opacity-90",     icon: "text-[#c9fb00]"  },
  warning: { base: "bg-amber-500",   hover: "hover:bg-amber-600",   icon: "text-amber-400"  },
  neutral: { base: "bg-white/10",    hover: "hover:bg-white/20",    icon: "text-white/50"   },
};

const confirmSpinnerColour: Record<ButtonVariant, string> = {
  danger:  "border-t-white",
  success: "border-t-black",   // black text on lime green
  warning: "border-t-white",
  neutral: "border-t-white",
};

type ConfirmModalProps = {
  title: string;
  description?: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: ButtonVariant;
  cancelVariant?: ButtonVariant
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean; // if we want to disable the button during some function e.g. wehn deleting from db
};


export default function ConfirmModal({title, description, confirmText = "Confirm", cancelText = "Cancel", onConfirm,
  onCancel,loading = false, confirmVariant= "danger", cancelVariant= "neutral"}: ConfirmModalProps) {// default into styles for a confirm delete
    // modal

    const confirm = variantStyles[confirmVariant];
    const cancel  = variantStyles[cancelVariant];
 
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
          <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${confirm.icon}`} />
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
            className={`px-4 py-2 rounded-xl text-white disabled:opacity-50 ${cancel.base} ${cancel.hover}`}
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-xl disabled:opacity-50 ${confirm.base} ${confirm.hover}
            ${confirmVariant === "success" ? "text-black font-semibold" : "text-white"}`}// we want black on green for readability
          >
            {loading ? <LoadingSpinner size='sm' spinnerColour={confirmSpinnerColour[confirmVariant]}/> : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}