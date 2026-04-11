"use client"

import React, { useEffect, useState } from "react";
import { changeReportStatus } from "@/app/app/reports/db_access";
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
  report: Report;
  setStatus: Function;
  setVis: Function;
};

export function StatusSelector({ report, setStatus, setVis }: Props) {
  const reportId = report.id;
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(report.status);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSelectedStatus(report.status);
  }, [report.status]);

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

  return (
    <div className="flex items-center m-3 py-2 gap-3 border border-gray-300 rounded-md p-2">
      <label className="whitespace-nowrap">Select Status:</label>

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger className="px-3 py-2 border border-gray-200 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-gray-200">
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

      <button
        onClick={handleSave}
        disabled={loading}
        className="px-4 py-2 bg-[#c9fb00] text-black rounded-md text-base"
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

export default StatusSelector;



// import React, { useEffect, useState } from "react";
// import { changeReportStatus } from "@/app/app/reports/db_access";
// import {User, Report } from '@/app/app/reports/types'


// type Props = {
//   report: Report;
//   setStatus: Function;
//   setVis: Function
// };

// export function SeveritySelector({report, setStatus, setVis} : Props) {
//     const reportId = report.id;
//     const [loading, setLoading] = useState(false);
//     const [selectedStatus, setSelectedStatus] = useState(report.status);

//     useEffect(() => {
//         setSelectedStatus(report.severity);
//     }, [report.severity]);

//     const handleSave = async () => {
//         setLoading(true)

//         await changeReportStatus({reportId: reportId, newStatus:selectedStatus});
//         setStatus(selectedStatus)
//         setLoading(false);
//         setVis(false);
//     };
    
//     return (
// <div className="flex items-center m-3 py-2 gap-3 border border-gray-300 rounded-md p-2">
//   <label className="whitespace-nowrap">Select Status:</label>
//   <select
//     className="px-3 py-2 border border-gray-200 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-gray-200"
//     value={selectedStatus}
//     onChange={(e) => setSelectedStatus(e.target.value)}
//     disabled={loading}
//   >
//     <option className="text-black" value="OPEN">Open</option>
//     <option className="text-black" value="UNDER_REVIEW">Under Review</option>
//     <option className="text-black" value="RESOLVED">Resolved</option>
//   </select>

//   <button
//     onClick={handleSave}
//     disabled={loading}
//     className="px-4 py-2 bg-[#c9fb00] text-black rounded-md text-base"
//   >
//     {loading ? "Saving..." : "Save"}
//   </button>
// </div>

//     );
// };

// export default SeveritySelector;
