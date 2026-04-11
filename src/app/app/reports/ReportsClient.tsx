"use client";
import React, { useMemo, useState, useEffect } from "react";
import ReportOverviewItem from "@/components/shared/ReportOverviewItem";
import {Report, Status, User, Severity, Category} from '@/app/app/reports/types'
import { getReportsFilteredSorted } from "./db_access";
import { Checkbox } from "@/components/ui/checkbox";
import PaginationBar from '@/app/app/listings/components/PaginationBar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// map users by their ids. so userMap[3] returns the user with userId 3
function mapUsers({users}:{users: User[]}) {
  const userMap: Record<number, User | undefined> = {};
  for (let i = 0; i < users.length; i++){
    userMap[users[i].id] = users[i];
  }
  return userMap;
}

export default function ReportsClient({ initialReports, users }: {initialReports: Report[], users: User[]}) {

  // initially all reports viewable since user has made no selections yet
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

  function toggleStatus(status: Status) {
    setWorkingStatuses(prev => ({ ...prev, [status]: !prev[status] }));
  }

  function toggleSeverity(severity: Severity) {
    setWorkingSeverities(prev => ({ ...prev, [severity]: !prev[severity] }));
  }

  function toggleCategory(category: Category) {
    setWorkingCategories(prev => ({ ...prev, [category]: !prev[category] }));
  }

  // called when search button pressed, get the viewable results with the user's selection in their order choice
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



  // pagination logic

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    // reset to first page whenever the data set changes
    setPage(1);
  }, [viewableReports.length]);


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
    console.log("passed: " + p)
    const clamped = Math.min(Math.max(1, p), totalPages);
    console.log("clamped: " + clamped)
    setPage(clamped);
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">

        {/* filter and sorting panel */}
        <div className="flex flex-row gap-10 rounded-xl border border-white/10 bg-[#1e1e1e] px-5 py-4 text-white">

          {/* selection for statuses */}
          <fieldset className="flex flex-col gap-2">
            <legend className="font-semibold">Filter by status</legend>

            {/* iterate through each option to make a checkbox and label */}
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

          {/* selection for severities */}
          <fieldset className="flex flex-col gap-2">
            <legend className="font-semibold">Filter by severity</legend>

            {/* iterate through all severities and make a checkbox and label */}
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

          {/* selection for categories */}
          <fieldset className="flex flex-col gap-2">
            <legend className="font-semibold">Filter by category</legend>

            {/* iterate through options and make checbox and label for each */}
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

          {/* sorting, search and reset buttons */}
          <div className="flex items-center gap-4">
            
              {/* drop down menu for choosing option to sort by (modified at or created at) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="border rounded px-2 py-1 flex items-center gap-2">
                    <span className="text-sm font-medium">Sort by</span>
                    <span className="text-sm">
                      {workingSortField === "modifiedAt" ? "Modified At" : "Created At"}
                    </span>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" sideOffset={8}>
                  <DropdownMenuGroup>
                    <DropdownMenuRadioGroup
                      value={workingSortField}
                      onValueChange={(val: "modifiedAt" | "createdAt") =>
                        setWorkingSortField(val)
                      }
                    >
                      <DropdownMenuRadioItem value="modifiedAt">
                        Modified At
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="createdAt">
                        Created At
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>


              {/* drop down menu for order of sorting (desc or asc) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="border rounded px-2 py-1 flex items-center gap-2">
                    <span className="text-sm font-medium">Direction</span>
                    <span className="text-sm">
                      {workingSortDirection === "desc" ? "Newest first" : "Oldest first"}
                    </span>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" sideOffset={8}>
                  <DropdownMenuGroup>
                    <DropdownMenuRadioGroup
                      value={workingSortDirection}
                      onValueChange={(val: "asc" | "desc") =>
                        setWorkingSortDirection(val)
                      }
                    >
                      <DropdownMenuRadioItem value="desc">
                        Newest first
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="asc">
                        Oldest first
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* search and reset buttons */}
              <div className="flex gap-2">

                {/* "search" button that actually just sorts and filters the reports */}
                <button
                  onClick={handleApplyFilters}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Search
                </button>

                {/* reset to original settings where all options wanted */}
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
        </div>


      <PaginationBar currentPage={page} totalPages={totalPages} onPageChange={gotoPage} />

      {/* display the reports that fit the selections */}
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

      <PaginationBar currentPage={page} totalPages={totalPages} onPageChange={gotoPage} />

    </div>
  );
}