import React, { useState } from "react";
import { assignModToReport, unassignReport } from "@/app/app/reports/db_access";
import {User, Report} from '@/app/app/reports/types'


type Props = {
  moderators: User[];
  report: Report;
  setVis: Function
};

export function ModeratorSelector({moderators, report, setVis} : Props) {
    const reportId = report.id;
    const [selectedUserId, setSelectedUserId] = useState<string | number | "">(
        moderators.length > 0 ? moderators[0].id : ""
    );
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        
        setLoading(true)
        if (selectedUserId === "Unassigned" || selectedUserId == null){
            await unassignReport({reportId});
        }
        else{
            await assignModToReport({ reportId: reportId, userId: selectedUserId });
        }
        
        setLoading(false);
        setVis(false);
    };

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select
                value={selectedUserId}
                onChange={(e) => {
                const val = e.target.value;
                // preserve numeric ids if originally numeric
                const exampleId = moderators.find((m) => String(m.id) === val)?.id;
                setSelectedUserId(exampleId ?? val);
                }}
                disabled={loading || moderators.length === 0}
            >
                {moderators.length === 0 ? (
                    <option value="Unassigned">No moderators (Unassign)</option>
                ) : (
                    moderators.map((mod) => (
                    <option key={mod.id} value={String(mod.id)}>
                    {`${mod.id} : ${mod.username}`}
                    </option>
                    ))
                )}
                <option value={"Unassigned"}>Unassign</option>
                
            </select>

            <button onClick={handleSave} disabled={loading || moderators.length === 0}>
            {loading ? "Saving..." : "Save"}
            </button>
        </div>
    );
};

export default ModeratorSelector;
