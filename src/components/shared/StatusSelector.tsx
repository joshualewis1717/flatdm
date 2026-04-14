"use client"

import React, { useState } from "react";
import { changeReportStatus } from "@/app/app/reports/db_access";
import { Report } from "@/app/app/reports/types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"; // adjust path if needed

type Props = {
  report: Report;
  setStatus: (value: string) => void;
  setVis: (value: boolean) => void;
};

export default function StatusSelector({ report, setStatus, setVis }: Props) {
  const reportId = report.id;
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(report.status);
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await changeReportStatus({ reportId: reportId, newStatus: selectedStatus });
    setStatus(selectedStatus);
    setLoading(false);
    setVis(false);
    setOpen(false);
  };

  const labelMap: Record<string, string> = {
    OPEN: "Open",
    UNDER_REVIEW: "Under Review",
    RESOLVED: "Resolved",
  };

  function handleHide(){
    setVis(false);
  }

  return (
    <div className="space-y-3 rounded-lg border border-white/10 bg-black/20 p-3">
      <label className="block text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Select status</label>

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/40">
          <span className="text-left">{labelMap[selectedStatus] ?? selectedStatus}</span>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="min-w-[160px]">
          <DropdownMenuLabel>Status</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => {
              setSelectedStatus("OPEN");
              setOpen(false);
            }}
          >
            Open
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => {
              setSelectedStatus("UNDER_REVIEW");
              setOpen(false);
            }}
          >
            Under Review
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => {
              setSelectedStatus("RESOLVED");
              setOpen(false);
            }}
          >
            Resolved
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleSave}
          disabled={loading}
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