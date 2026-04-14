"use client"

import { useState } from "react";
import { assignModToReport, unassignReport } from "@/app/app/reports/db_access";
import { User, Report } from "@/app/app/reports/types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"; // adjust path if needed

type Props = {
  moderators: User[];
  report: Report;
  setVis: (value: boolean) => void;
};

export default function ModeratorSelector({ moderators, report, setVis }: Props) {
  const reportId = report.id;
  const [selectedUserId, setSelectedUserId] = useState<string | number | "">(
    moderators.length > 0 ? moderators[0].id : ""
  );
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    if (selectedUserId === "Unassigned" || selectedUserId == null) {
      await unassignReport({ reportId });
    } else {
      await assignModToReport({ reportId: reportId, userId: selectedUserId });
    }
    setLoading(false);
    setVis(false);
    setOpen(false);
  };

  function handleHide(){
    setVis(false);
  }

  const currentLabel =
    selectedUserId === "Unassigned" || selectedUserId == null
      ? "Unassigned"
      : (moderators.find((m) => String(m.id) === String(selectedUserId))?.username ??
         String(selectedUserId));

  return (
    <div className="space-y-3 rounded-lg border border-white/10 bg-black/20 p-3">
      <label className="block text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Assign moderator</label>

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/40">
          <span className="text-left">{currentLabel}</span>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="min-w-[200px]">
          <DropdownMenuLabel>Select moderator</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => {
              setSelectedUserId("Unassigned");
              setOpen(false);
            }}
          >
            Unassign
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {moderators.length === 0 ? (
            <DropdownMenuItem
              onClick={() => {
                setSelectedUserId("Unassigned");
                setOpen(false);
              }}
            >
              No moderators
            </DropdownMenuItem>
          ) : (
            moderators.map((mod) => (
              <DropdownMenuItem
                key={mod.id}
                onClick={() => {
                  setSelectedUserId(mod.id);
                  setOpen(false);
                }}
              >
                {`${mod.id} : ${mod.username}`}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleSave}
          disabled={loading || (moderators.length === 0 && selectedUserId !== "Unassigned")}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>

        <button
          onClick={handleHide}
          className="rounded-lg border border-white/12 bg-white/[0.03] px-4 py-2 text-sm font-medium text-white hover:bg-white/[0.06]"
        >
          Hide
        </button>
      </div>
    </div>
  );
}