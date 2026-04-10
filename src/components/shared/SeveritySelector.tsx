import React, { useEffect, useState } from "react";
import { changeReportSeverity } from "@/app/app/reports/db_access";
import {User, Report, } from '@/app/app/reports/types'


type Props = {
  report: Report;
  setSeverity: Function;
  setVis: Function
};

export function SeveritySelector({report, setSeverity, setVis} : Props) {
    const reportId = report.id;
    const [loading, setLoading] = useState(false);
    const [selectedSeverity, setSelectedSeverity] = useState(report.severity);

    useEffect(() => {
        setSelectedSeverity(report.severity);
    }, [report.severity]);

    const handleSave = async () => {
        setLoading(true)

        await changeReportSeverity({reportId: reportId, newSeverity:selectedSeverity});
        setSeverity(selectedSeverity)
        setLoading(false);
        setVis(false);
    };
    
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                disabled={loading}
            >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                
            </select>

            <button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
            </button>
        </div>
    );
};

export default SeveritySelector;
