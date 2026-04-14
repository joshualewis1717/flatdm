"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { type ConfirmFunction, type User } from "@/app/app/reports/types";

type Props = {
  text: string;
  user?: User | null;
  confirm: ConfirmFunction;
  visible?: boolean;
  hide?: () => void;
};

export function TextPromptPanel({ text, user, confirm, visible, hide }: Props) {
  const [inputValue, setInputValue] = useState("");

  const handleClose = () => {
    setInputValue("");
    hide?.();
  };

  const handleConfirm = async () => {
    const trimmedText = inputValue.trim();

    if (!trimmedText || !user) return;

    try {
      await confirm({ user, text: trimmedText });
      handleClose();
    } catch (e) {
      console.error("confirm error:", e);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={handleClose}
        aria-label="Close text prompt"
      />

      <Card className="relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-[2rem] border border-border/80 bg-card/65 py-0 shadow-2xl shadow-black/30 backdrop-blur-2xl">
        <div className="relative px-6 pb-6 pt-6 md:px-8 md:pb-8 md:pt-8">
          <CardHeader className="space-y-4 px-0 pb-2 pt-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                  {text}
                </CardTitle>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="rounded-2xl px-3 py-1 text-muted-foreground transition hover:text-foreground"
                aria-label="Close text prompt"
              >
                <X />
              </button>
            </div>
          </CardHeader>

          <CardContent className="px-0 pb-0 pt-4">
            <div className="space-y-2">
              <Label
                htmlFor="text-prompt-input"
                className="text-sm font-medium text-foreground"
              >
                Details
              </Label>
              <Textarea
                id="text-prompt-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type here..."
                className="min-h-[140px] rounded-2xl border-border/80 bg-card/70 px-4 py-3 text-foreground placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:ring-primary/20"
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={handleClose}
                className="h-12 rounded-2xl text-sm font-semibold"
              >
                Cancel
              </Button>

              <Button
                type="button"
                size="lg"
                onClick={handleConfirm}
                disabled={!inputValue.trim() || !user}
                className="h-12 rounded-2xl text-sm font-semibold"
              >
                Confirm
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}