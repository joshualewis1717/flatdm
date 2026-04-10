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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                disabled={loading}
            >
                <option value="OPEN">Open</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="RESOLVED">Resolved</option>
                
            </select>

            <button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
            </button>
        </div>
    );
};

export default SeveritySelector;
