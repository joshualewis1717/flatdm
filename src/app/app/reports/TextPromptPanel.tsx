import { useState } from "react";
import type { ConfirmFunction, User } from '@/app/app/reports/types';

type Props = {
  text: string;
  user?: User | null;
  confirm: ConfirmFunction;
  visible?: boolean;
  hide?: () => void;
};

export function TextPromptPanel({ text, user, confirm, visible , hide }: Props){
  const [inputValue, setInputValue] = useState("");

  if (visible){
        return (
        <div
        className="
            fixed inset-0
            pointer-events-auto
            flex items-start justify-center
        "
        style={{ padding: "10rem" }} // leaves 5rem outside area on all sides
        >
        <div
            className="
            w-full h-full
            bg-black/90 text-gray-200
            rounded-lg
            overflow-auto
            shadow-xl
            flex flex-col
            "
        >
            {/* Top text */}
            <header className="px-6 py-4 border-b border-gray-700">
            <h1 className="text-lg font-semibold text-gray-100">{text}</h1>
            </header>

            {/* Content area */}
            <main className="flex-1 px-6 py-8">
            <label className="block text-sm text-gray-300 mb-2"></label>
            <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="
                w-full
                bg-gray-900 text-gray-100
                border border-gray-700
                focus:border-green-300 focus:ring-2 focus:ring-green-300
                rounded-md
                px-3 py-2
                outline-none
                transition
                "
                placeholder="Type here..."
            />
            </main>

            {/* Actions */}
            <footer className="px-6 py-4 border-t border-gray-700 flex gap-3 justify-end">
            <button
                onClick={() => hide?.()}
                className="
                px-4 py-2 rounded-md
                bg-gray-800 text-gray-200
                border border-gray-700
                hover:bg-gray-700
                transition
                "
                type="button"
            >
                Cancel
            </button>

            <button
                onClick={async () => {
                    if (typeof confirm !== "function") return;
                    try {
                        if (!user) return;
                        await confirm({ user, text: inputValue });
                    } catch (e) {
                        console.error("confirm error:", e);
                    } finally {
                        hide?.();
                    }
                }}
                className="
                px-4 py-2 rounded-md
                bg-green-400 text-black
                hover:bg-green-500
                transition
                "
                type="button"
            >
                Confirm
            </button>
            </footer>
        </div>
        </div>
    );
  }
};
