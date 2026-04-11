"use client";
import React, { useMemo, useState, useEffect } from "react";
import ReportOverviewItem from "@/components/shared/ReportOverviewItem";
import {Report, Status, User, Severity, Category} from '@/app/app/reports/types'
import { getReportsFilteredSorted } from "./db_access";
import { Checkbox } from "@/components/ui/checkbox";

function mapUsers({users}:{users: User[]}) {
  const userMap: Record<number, User | undefined> = {};
  for (let i = 0; i < users.length; i++){
    userMap[users[i].id] = users[i];
  }
  return userMap;
}

export default function ReportsClient({ initialReports, users }: {initialReports: Report[], users: User[]}) {
  const [viewableReports, setViewableReports] = useState<Report[]>(initialReports);
  const userMap = mapUsers({users});

  const [selectedStatuses, setSelectedStatuses] = useState<Record<Status, boolean>>({
    "OPEN": true,
    "UNDER_REVIEW": true,
    "RESOLVED": true,
  });

  const [selectedSeverities, setSelectedSeverities] = useState<Record<Severity, boolean>>({
    "UNRANKED": true,
    "LOW": true,
    "MEDIUM": true,
    "HIGH": true,
  });

  const [selectedCategories, setCatetgories] = useState<Record<Category, boolean>>({
    "INAPPROPRIATE_CONTENT": true,
    "FRAUD": true,
    "HARASSMENT": true,
    "FAKE_INFORMATION": true,
    "IMPERSONATION": true,
    "OTHER": true,
  });

  const [sortField, setSortField] = useState<"modifiedAt" | "createdAt">("modifiedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // working values for sorting and filtering
  const [workingStatuses, setWorkingStatuses] = useState(selectedStatuses);
  const [workingSeverities, setWorkingSeverities] = useState(selectedSeverities);
  const [workingCategories, setWorkingCategories] = useState(selectedCategories);
  const [workingSortField, setWorkingSortField] = useState(sortField);
  const [workingSortDirection, setWorkingSortDirection] = useState(sortDirection);

  // pagination state
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    // reset to first page whenever the data set changes
    setPage(1);
  }, [viewableReports.length]);

  function toggleStatus(status: Status) {
    setWorkingStatuses(prev => ({ ...prev, [status]: !prev[status] }));
  }

  function toggleSeverity(severity: Severity) {
    setWorkingSeverities(prev => ({ ...prev, [severity]: !prev[severity] }));
  }

  function toggleCategory(category: Category) {
    setWorkingCategories(prev => ({ ...prev, [category]: !prev[category] }));
  }

  async function handleApplyFilters() {
    const resultReports = await getReportsFilteredSorted({
      selectedStatuses: workingStatuses,
      selectedSeverities: workingSeverities,
      selectedCategories: workingCategories,
      sortField: workingSortField,
      sortDirection: workingSortDirection
    });
    setViewableReports(resultReports);
    return;
  }

  // derived pagination values
  const totalReports = viewableReports?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalReports / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const currentPageReports = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;
    return (viewableReports || []).slice(start, end);
  }, [viewableReports, safePage, pageSize]);

  function gotoPage(p: number) {
    const clamped = Math.min(Math.max(1, p), totalPages);
    setPage(clamped);
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        {/* <fieldset className="flex flex-col gap-2">
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
        </fieldset> */}
        <fieldset className="flex flex-col gap-2">
          <legend className="font-semibold">Filter by status</legend>
          {(["OPEN", "UNDER_REVIEW", "RESOLVED"] as Status[]).map((status) => (
            <label key={status} className="inline-flex items-center gap-2">
              <Checkbox
              checked={!!workingStatuses[status]}
              onCheckedChange={() => toggleStatus(status)}
              className="w-4 h-4"
              />
              <span>{status}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="font-semibold">Filter by severity</legend>
          {(["UNRANKED", "LOW", "MEDIUM", "HIGH"] as Severity[]).map((severity) => (
            <label key={severity} className="inline-flex items-center gap-2">
              <Checkbox
                checked={!!workingSeverities[severity]}
                onCheckedChange={() => toggleSeverity(severity)}
                className="w-4 h-4"
              />
              <span>{severity}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="font-semibold">Filter by category</legend>
          {(["INAPPROPRIATE_CONTENT","FRAUD","HARASSMENT","FAKE_INFORMATION","IMPERSONATION","OTHER"] as Category[]
          ).map((category) => (
            <label key={category} className="inline-flex items-center gap-2">
              <Checkbox
                checked={!!workingCategories[category]}
                onCheckedChange={() => toggleCategory(category)}
                className="w-4 h-4"
              />
              <span>{category}</span>
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
                setWorkingStatuses({
                  "OPEN": true,
                  "UNDER_REVIEW": true,
                  "RESOLVED": true,
                });

                setWorkingSeverities({
                  "UNRANKED": true,
                  "LOW": true,
                  "MEDIUM": true,
                  "HIGH": true,
                });

                setWorkingCategories({
                  "INAPPROPRIATE_CONTENT": true,
                  "FRAUD": true,
                  "HARASSMENT": true,
                  "FAKE_INFORMATION": true,
                  "IMPERSONATION": true,
                  "OTHER": true,
                });
                setWorkingSortField("modifiedAt");
                setWorkingSortDirection("desc");
                handleApplyFilters();
              }}
              className="border px-3 py-1 rounded"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Pagination controls (top) */}
      <div className="flex items-center justify-between mb-3 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => gotoPage(page - 1)}
            disabled={safePage <= 1}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          {/* Page numbers: show up to 7 buttons with current centered when possible */}
          <div className="flex items-center gap-1">
            {(() => {
              const buttons = [];
              const maxButtons = 7;
              let start = Math.max(1, safePage - Math.floor(maxButtons / 2));
              let end = start + maxButtons - 1;
              if (end > totalPages) {
                end = totalPages;
                start = Math.max(1, end - maxButtons + 1);
              }
              for (let p = start; p <= end; p++) {
                buttons.push(
                  <button
                    key={p}
                    onClick={() => gotoPage(p)}
                    aria-current={p === safePage ? "page" : undefined}
                    className={`px-2 py-1 border rounded ${p === safePage ? "bg-gray-200" : ""}`}
                  >
                    {p}
                  </button>
                );
              }
              return buttons;
            })()}
          </div>

          <button
            onClick={() => gotoPage(page + 1)}
            disabled={safePage >= totalPages}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Page</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(1); }}
            className="border rounded px-2 py-1"
          >
            {[5,10,20,50].map(n => <option key={n} value={n}>{n} / page</option>)}
          </select>
          <span className="text-sm">Showing {Math.min(totalReports, (safePage - 1) * pageSize + 1)}-{Math.min(totalReports, safePage * pageSize)} of {totalReports}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 py-[3%]">
        {(viewableReports && viewableReports.length === 0) ? (
          <div>No reports match the selected filters.</div>
        ) : (
          currentPageReports.map(report => (
            <ReportOverviewItem
              key={report.id}
              report={report}
              reporter={userMap[report.reporterId]}
              targetUser={userMap[report.targetUserId]}
            />
          ))
        )}
      </div>

      {/* Pagination controls (bottom) */}
      <div className="flex items-center justify-between mt-4 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => gotoPage(1)}
            disabled={safePage <= 1}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            First
          </button>
          <button
            onClick={() => gotoPage(page - 1)}
            disabled={safePage <= 1}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
        </div>

        <div className="text-sm">Page {safePage} of {totalPages}</div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => gotoPage(page + 1)}
            disabled={safePage >= totalPages}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
          <button
            onClick={() => gotoPage(totalPages)}
            disabled={safePage >= totalPages}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
}