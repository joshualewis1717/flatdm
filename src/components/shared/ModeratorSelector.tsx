"use client"

import React, { useState } from "react";
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
  setVis: Function;
};

export function ModeratorSelector({ moderators, report, setVis }: Props) {
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
    <div className="flex items-center m-3 py-2 gap-3 border border-gray-300 rounded-md p-2">
      <label className="whitespace-nowrap">Assign Moderator:</label>

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger className="px-3 py-2 border border-gray-200 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-gray-200">
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

      <button
        onClick={handleSave}
        disabled={loading || (moderators.length === 0 && selectedUserId !== "Unassigned")}
        className="px-4 py-2 bg-[#c9fb00] text-black rounded-md text-base"
      >
        {loading ? "Saving..." : "Save"}
      </button>

      <button
        onClick={handleHide}
        className="px-4 py-2 border border-white text-white rounded-md text-base"
      >
        Hide
      </button>
    </div>
  );
}

export default ModeratorSelector;