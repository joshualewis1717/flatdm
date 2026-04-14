"use client";
import React, { useMemo, useState } from "react";
import ReportOverviewItem from "@/components/shared/ReportOverviewItem";
import {Report, Status, User, Severity, Category} from '@/app/app/reports/types'
import { getReportsFilteredSorted } from "./db_access";
import { Checkbox } from "@/components/ui/checkbox";
import PaginationBar from '@/app/app/listings/components/PaginationBar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ErrorMessage from "@/components/shared/ErrorMessage";
import { Button } from "@/components/ui/button";
import { Filter, RotateCcw, Search } from "lucide-react";

// map users by their ids. so userMap[3] returns the user with userId 3
function mapUsers({users}:{users: User[]}) {
  const userMap: Record<number, User | undefined> = {};
  for (let i = 0; i < users.length; i++){
    userMap[users[i].id] = users[i];
  }

  return userMap;
}

// map words eg FRAUD to human nice words like Fraud
const wordMap = {
    "RESOLVED":"Resolved",
    "UNDER_REVIEW":"Under Review",
    "OPEN":"Open",
    "LOW":"Low",
    "MEDIUM":"Medium",
    "HIGH":"High",
    "UNRANKED":"Unranked",
    "INAPPROPRIATE_CONTENT": "Inappropriate Content",
    "FRAUD": "Fraud",
    "HARASSMENT": "Harassment",
    "FAKE_INFORMATION": "Fake Information",
    "IMPERSONATION": "Impersonation",
    "OTHER": "Other"
}

const defaultStatuses: Record<Status, boolean> = {
  "OPEN": true,
  "UNDER_REVIEW": true,
  "RESOLVED": true,
};

const defaultSeverities: Record<Severity, boolean> = {
  "UNRANKED": true,
  "LOW": true,
  "MEDIUM": true,
  "HIGH": true,
};

const defaultCategories: Record<Category, boolean> = {
  "INAPPROPRIATE_CONTENT": true,
  "FRAUD": true,
  "HARASSMENT": true,
  "FAKE_INFORMATION": true,
  "IMPERSONATION": true,
  "OTHER": true,
};



export default function ReportsClient({ error, initialReports, users }: {error : string | null, initialReports: Report[], users: User[]}) {

  // first check if an error was found
  const [errorFound, setErrorFound] = useState(error !== null);
  const [errorMessage, setErrorMessage] = useState(error)


  // initially all reports viewable since user has made no selections yet
  const [viewableReports, setViewableReports] = useState<Report[]>(initialReports);
  const userMap = mapUsers({users});

  // working values for sorting and filtering
  const [workingStatuses, setWorkingStatuses] = useState(defaultStatuses);
  const [workingSeverities, setWorkingSeverities] = useState(defaultSeverities);
  const [workingCategories, setWorkingCategories] = useState(defaultCategories);
  const [workingSortField, setWorkingSortField] = useState<"modifiedAt" | "createdAt">("modifiedAt");
  const [workingSortDirection, setWorkingSortDirection] = useState<"asc" | "desc">("desc");

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


    let resultReports = null;

    try{
      resultReports = await getReportsFilteredSorted({
        selectedStatuses: workingStatuses,
        selectedSeverities: workingSeverities,
        selectedCategories: workingCategories,
        sortField: workingSortField,
        sortDirection: workingSortDirection
      });

      // no error found
      if (resultReports.error == null){
        resultReports = resultReports.result;
        setViewableReports(resultReports);
        setPage(1);
      }
      else{
        setErrorFound(true);
        setErrorMessage("Error fetching reports. Refresh to try again");
      }
    }
    catch (error){
      setErrorFound(true);
      setErrorMessage(String(error));
    }

    return;
  }

  // pagination logic
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

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

  function getMod(report: Report) {
    if (report.assignedModeratorId == null){
      return null;
    }
    
    return userMap[report.assignedModeratorId]
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-white sm:p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
          <Filter className="size-4 text-primary" />
          Filters and sorting
        </div>

        {/* filter and sorting panel */}
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr_1.4fr] xl:grid-cols-[0.8fr_0.8fr_1.3fr_auto]">

          {/* selection for statuses */}
          <fieldset className="space-y-2">
            <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/45">Status</legend>

            {/* iterate through each option to make a checkbox and label */}
            {(["OPEN", "UNDER_REVIEW", "RESOLVED"] as Status[]).map((status) => (
              <label key={status} className="flex items-center gap-2 rounded-lg border border-white/8 bg-black/15 px-3 py-2 text-sm text-white/75">
                <Checkbox
                checked={!!workingStatuses[status]}
                onCheckedChange={() => toggleStatus(status)}
                className="w-4 h-4"
                />
                <span>{wordMap[status]}</span>
              </label>
            ))}
          </fieldset>

          {/* selection for severities */}
          <fieldset className="space-y-2">
            <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/45">Severity</legend>

            {/* iterate through all severities and make a checkbox and label */}
            {(["UNRANKED", "LOW", "MEDIUM", "HIGH"] as Severity[]).map((severity) => (
              <label key={severity} className="flex items-center gap-2 rounded-lg border border-white/8 bg-black/15 px-3 py-2 text-sm text-white/75">
                <Checkbox
                  checked={!!workingSeverities[severity]}
                  onCheckedChange={() => toggleSeverity(severity)}
                  className="w-4 h-4"
                />
                <span>{wordMap[severity]}</span>
              </label>
            ))}
          </fieldset>

          {/* selection for categories */}
          <fieldset className="space-y-2">
            <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/45">Category</legend>

            {/* iterate through options and make checbox and label for each */}
            {(["INAPPROPRIATE_CONTENT","FRAUD","HARASSMENT","FAKE_INFORMATION","IMPERSONATION","OTHER"] as Category[]
            ).map((category) => (
              <label key={category} className="flex items-center gap-2 rounded-lg border border-white/8 bg-black/15 px-3 py-2 text-sm text-white/75">
                <Checkbox
                  checked={!!workingCategories[category]}
                  onCheckedChange={() => toggleCategory(category)}
                  className="w-4 h-4"
                />
                <span>{wordMap[category]}</span>
              </label>
            ))}
          </fieldset>

          {/* sorting, search and reset buttons */}
          <div className="flex flex-col gap-3 lg:min-w-56">
            
              {/* drop down menu for choosing option to sort by (modified at or created at) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-left text-sm text-white transition-colors hover:border-white/20">
                    <span className="font-medium text-white/55">Sort by</span>
                    <span>
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
                  <button className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-left text-sm text-white transition-colors hover:border-white/20">
                    <span className="font-medium text-white/55">Direction</span>
                    <span>
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
              <div className="grid grid-cols-2 gap-2">

                {/* "search" button that actually just sorts and filters the reports */}
                <Button
                  type="button"
                  onClick={handleApplyFilters}
                  className="rounded-lg px-3"
                >
                  <Search className="size-4" />
                  Search
                </Button>

                {/* reset to original settings where all options wanted */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    setWorkingStatuses(defaultStatuses);
                    setWorkingSeverities(defaultSeverities);
                    setWorkingCategories(defaultCategories);
                    setWorkingSortField("modifiedAt");
                    setWorkingSortDirection("desc");

                    let resultReports = null;

                    try{
                      resultReports = await getReportsFilteredSorted({
                        selectedStatuses: defaultStatuses,
                        selectedSeverities: defaultSeverities,
                        selectedCategories: defaultCategories,
                        sortField: "modifiedAt",
                        sortDirection: "desc"
                      });

                      // no error found
                      if (resultReports.error == null){
                        resultReports = resultReports.result;
                        setViewableReports(resultReports);
                        setPage(1);
                      }
                      else{
                        setErrorFound(true);
                        setErrorMessage("Error fetching reports. Refresh to try again");
                      }
                    }
                    catch (error){
                      setErrorFound(true);
                      setErrorMessage(String(error));
                    }
                   
                  }}
                  className="rounded-lg border-white/12 bg-white/[0.03] px-3 text-white hover:bg-white/[0.06]"
                >
                  <RotateCcw className="size-4" />
                  Reset
                </Button>
              </div>
          </div>
        </div>
      </div>


      <PaginationBar currentPage={page} totalPages={totalPages} onPageChange={gotoPage} />

      {/* display the reports that fit the selections */}
      {!errorFound && (
        <div className="space-y-3">
          {(viewableReports && viewableReports.length === 0) ? (
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/60">
              No reports match the selected filters.
            </div>
          ) : (
            currentPageReports.map(report => (
              <ReportOverviewItem
                key={report.id}
                report={report}
                reporter={userMap[report.reporterId]}
                targetUser={userMap[report.targetUserId]}
                moderator={getMod(report)}
              />
            ))
          )}
        </div>
      )}
      {errorFound && (
        <ErrorMessage text={errorMessage} />
      )}


      <PaginationBar currentPage={page} totalPages={totalPages} onPageChange={gotoPage} />

    </div>
  );
}