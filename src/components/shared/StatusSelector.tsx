import React, { useEffect, useState } from "react";
import { changeReportStatus } from "@/app/app/reports/db_access";
import {User, Report } from '@/app/app/reports/types'


type Props = {
  report: Report;
  setStatus: Function;
  setVis: Function
};

export function SeveritySelector({report, setStatus, setVis} : Props) {
    const reportId = report.id;
    const [loading, setLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(report.status);

    useEffect(() => {
        setSelectedStatus(report.severity);
    }, [report.severity]);

    const handleSave = async () => {
        setLoading(true)

        await changeReportStatus({reportId: reportId, newStatus:selectedStatus});
        setStatus(selectedStatus)
        setLoading(false);
        setVis(false);
    };
    
    return (
<div className="flex items-center m-3 py-2 gap-3 border border-gray-300 rounded-md p-2">
  <label className="whitespace-nowrap">Select Status:</label>
  <select
    className="px-3 py-2 border border-gray-200 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-gray-200"
    value={selectedStatus}
    onChange={(e) => setSelectedStatus(e.target.value)}
    disabled={loading}
  >
    <option className="text-black" value="OPEN">Open</option>
    <option className="text-black" value="UNDER_REVIEW">Under Review</option>
    <option className="text-black" value="RESOLVED">Resolved</option>
  </select>

  <button
    onClick={handleSave}
    disabled={loading}
    className="px-4 py-2 bg-[#c9fb00] text-black rounded-md text-base"
  >
    {loading ? "Saving..." : "Save"}
  </button>
</div>

    );
};

export default SeveritySelector;
