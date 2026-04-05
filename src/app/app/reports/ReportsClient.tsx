// app/reports/ReportsClient.tsx
"use client";
import React, { useMemo, useState } from "react";
import ReportOverviewItem from "@/components/shared/ReportOverviewItem";
import {Report, Status} from '@/app/app/reports/types'
import { prisma } from "@/lib/prisma";
import { getReportsFilteredSorted } from "./db_access";


export default function ReportsClient({ initialReports }: { initialReports: Report[] }) {

  console.log("received")
  console.log(initialReports)

  const [viewableReports, setViewableReports] = useState(initialReports);

  // parse dates lazily when needed
  const [selectedStatuses, setSelectedStatuses] = useState<Record<Status, boolean>>({
    "OPEN": true,
    "UNDER_REVIEW": true,
    "RESOLVED": true,
  });

  const [sortField, setSortField] = useState<"modifiedAt" | "createdAt">("modifiedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Local working copy so user can toggle controls before pressing Search
  const [workingStatuses, setWorkingStatuses] = useState(selectedStatuses);
  const [workingSortField, setWorkingSortField] = useState(sortField);
  const [workingSortDirection, setWorkingSortDirection] = useState(sortDirection);

  function toggleStatus(status: Status) {
    setWorkingStatuses(prev => ({ ...prev, [status]: !prev[status] }));
  }

  async function handleApplyFilters() {
    const resultReports = await getReportsFilteredSorted({selectedStatuses:workingStatuses, sortField:workingSortField, sortDirection:workingSortDirection});
    setViewableReports(resultReports);

    return;
  }


  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <fieldset className="flex flex-col gap-2">
          <legend className="font-semibold">Filter by status</legend>
          {(["OPEN", "UNDER_REVIEW", "RESOLVED"] as Status[]).map(status => (
            <label key={status} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={workingStatuses[status]}
                onChange={() => toggleStatus(status)}
                className="w-4 h-4"
              />
              <span>{status}</span>
            </label>
          ))}
        </fieldset>

        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium">Sort by</label>
            <select
              value={workingSortField}
              onChange={(e) => setWorkingSortField(e.target.value as "modifiedAt" | "createdAt")}
              className="border rounded px-2 py-1"
            >
              <option value="modifiedAt">Modified At</option>
              <option value="createdAt">Created At</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Direction</label>
            <select
              value={workingSortDirection}
              onChange={(e) => setWorkingSortDirection(e.target.value as "asc" | "desc")}
              className="border rounded px-2 py-1"
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleApplyFilters}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              Search
            </button>
            <button
              onClick={() => {
                // reset working controls to show all
                const allTrue = {
                  "OPEN": true,
                  "UNDER_REVIEW": true,
                  "RESOLVED": true,
                } as Record<Status, boolean>;
                setWorkingStatuses(allTrue);
                setWorkingSortField("modifiedAt");
                setWorkingSortDirection("desc");
              }}
              className="border px-3 py-1 rounded"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 py-[3%]">
        {viewableReports.length === 0 ? (
          <div>No reports match the selected filters.</div>
        ) : (
          viewableReports.map(report => (
            <ReportOverviewItem key={report.id} report={report} />
          ))
        )}
      </div>
    </div>
  );
}
