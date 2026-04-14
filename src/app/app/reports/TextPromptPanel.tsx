
import React, { useState } from "react";
import { Input, Textarea } from "@/components/ui/textarea";
import { type ConfirmFunction, User } from '@/app/app/reports/types';

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
            py-30 width-200
        "
        >
        <div className="flex flex-col gap-1 rounded-[2rem] border border-white/10 bg-black p-6 sm:p-8">
            {/* Top text */}
            <header className="px-40 py-4 border-b border-gray-700">
            <h1 className="text-lg font-semibold">{text}</h1>
            </header>

            {/* Content area */}
            <main className="py-4">
            <label className="block text-sm"></label>
            <Textarea 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
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
                    if (!inputValue.trim()) return;
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
                disabled={!inputValue.trim()}
                className={`px-4 py-2 rounded-md transition ${
                    inputValue.trim()
                    ? "bg-[#c9fb00] text-black hover:bg-green-300"
                    : "bg-gray-600 text-gray-300 cursor-not-allowed"
                }`}
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
