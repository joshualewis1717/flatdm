"use client"

import React, { useEffect, useState } from "react";
import { changeReportSeverity } from "@/app/app/reports/db_access";
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
  setSeverity: Function;
  setVis: Function;
};

export function SeveritySelector({ report, setSeverity, setVis }: Props) {
  const reportId = report.id;
  const [loading, setLoading] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState(report.severity);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSelectedSeverity(report.severity);
  }, [report.severity]);

  const handleSave = async () => {
    setLoading(true);
    await changeReportSeverity({ reportId: reportId, newSeverity: selectedSeverity });
    setSeverity(selectedSeverity);
    setLoading(false);
    setVis(false);
    setOpen(false);
  };

  const labelMap: Record<string, string> = {
    UNRANKED: "Unranked",
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
  };

  return (
    <div className="flex items-center m-3 py-2 gap-3 border border-gray-300 rounded-md p-2">
      <label className="whitespace-nowrap">Select Severity:</label>

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger className="px-3 py-2 border border-gray-200 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-gray-200">
          <span className="text-left">{labelMap[selectedSeverity] ?? selectedSeverity}</span>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="min-w-[160px]">
          <DropdownMenuLabel>Severity</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => {
              setSelectedSeverity("UNRANKED");
              setOpen(false);
            }}
          >
            Unranked
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              setSelectedSeverity("LOW");
              setOpen(false);
            }}
          >
            Low
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              setSelectedSeverity("MEDIUM");
              setOpen(false);
            }}
          >
            Medium
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              setSelectedSeverity("HIGH");
              setOpen(false);
            }}
          >
            High
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        className="px-4 py-2 bg-[#c9fb00] text-black rounded-md text-base"
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

export default SeveritySelector;



// import React, { useEffect, useState } from "react";
// import { changeReportSeverity } from "@/app/app/reports/db_access";
// import {User, Report, } from '@/app/app/reports/types'


// type Props = {
//   report: Report;
//   setSeverity: Function;
//   setVis: Function
// };

// export function SeveritySelector({report, setSeverity, setVis} : Props) {
//     const reportId = report.id;
//     const [loading, setLoading] = useState(false);
//     const [selectedSeverity, setSelectedSeverity] = useState(report.severity);

//     useEffect(() => {
//         setSelectedSeverity(report.severity);
//     }, [report.severity]);

//     const handleSave = async () => {
//         setLoading(true)

//         await changeReportSeverity({reportId: reportId, newSeverity:selectedSeverity});
//         setSeverity(selectedSeverity)
//         setLoading(false);
//         setVis(false);
//     };
    
//     return (
//         <div className="flex items-center m-3 py-2 gap-3 border border-gray-300 rounded-md p-2">
//             <label className="whitespace-nowrap">Select Severity:</label>

//             <select
//                 className="px-3 py-2 border border-gray-200 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-gray-200"
//                 value={selectedSeverity}
//                 onChange={(e) => setSelectedSeverity(e.target.value)}
//                 disabled={loading}
//             >
//                 <option className="text-black" value="UNRANKED">Unranked</option>
//                 <option className="text-black" value="LOW">Low</option>
//                 <option className="text-black" value="MEDIUM">Medium</option>
//                 <option className="text-black" value="HIGH">High</option>
//             </select>

//             <button
//                 className="px-4 py-2 bg-[#c9fb00] text-black rounded-md text-base"
//                 onClick={handleSave}
//                 disabled={loading}
//             >
//                 {loading ? "Saving..." : "Save"}
//             </button>
//         </div>
//     );
// };

// export default SeveritySelector;
