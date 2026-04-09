// app/reports/ReportsClient.tsx
"use client";
import React, { useMemo, useState } from "react";
import ReportOverviewItem from "@/components/shared/ReportOverviewItem";
import {Report, Status, User, Severity, Category} from '@/app/app/reports/types'
import { prisma } from "@/lib/prisma";
import { getReportsFilteredSorted } from "./db_access";


async function getUserById({users, userId} : {users: User[], userId : number}){
  console.log(users);
  console.log(userId);
  for (let i = 0; i < users.length; i++){
    if (users[i].id == userId){
      console.log("found " + users[i])
      return users[i];
    }
  }
  console.log("user with id " + userId + " not found");
  return undefined;
}

async function getUsers({users, reports} : {users:User[], reports:Report[]}){
  const ret = [];

  for (let i = 0; i < reports.length; i++){
    ret.push([getUserById(reports[i].reporterID), getUserById(reports[i].targetUserId)]);
  }

  return ret;
}

export default function ReportsClient({ initialReports, users }: {initialReports: Report[], users: User[]}) {

  console.log("received")
  console.log(initialReports)

  const [viewableReports, setViewableReports] = useState(initialReports);
  console.log(viewableReports)
  // const [viewableUsers, setViewableUsers] = useState(getUsers({users, reports:initialReports}));

  // parse dates lazily when needed
  const [selectedStatuses, setSelectedStatuses] = useState<Record<Status, boolean>>({
    "OPEN": true,
    "UNDER_REVIEW": true,
    "RESOLVED": true,
  });

  const [selectedSeverities, setSelectedSeverities] = useState<Record<Severity, boolean>>({
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

  // Local working copy so user can toggle controls before pressing Search
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

  async function handleApplyFilters() {
    const resultReports = await getReportsFilteredSorted({selectedStatuses:workingStatuses, selectedSeverities:workingSeverities, selectedCategories:workingCategories, sortField:workingSortField, sortDirection:workingSortDirection});
    setViewableReports(resultReports);
    // setViewableUsers( getUsers({users, resultReports}) );

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

          <fieldset className="flex flex-col gap-2">
          <legend className="font-semibold">Filter by severity</legend>
          {(["LOW", "MEDIUM", "HIGH"] as Severity[]).map(severity => (
            <label key={severity} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={workingSeverities[severity]}
                onChange={() => toggleSeverity(severity)}
                className="w-4 h-4"
              />
              <span>{severity}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="font-semibold">Filter by category</legend>
          {(["INAPPROPRIATE_CONTENT","FRAUD","HARASSMENT","FAKE_INFORMATION","IMPERSONATION","OTHER"] as Category[]).map(category => (
            <label key={category} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={workingCategories[category]}
                onChange={() => toggleCategory(category)}
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
                // reset working controls to show all
              setWorkingStatuses({
                  "OPEN": true,
                  "UNDER_REVIEW": true,
                  "RESOLVED": true,
                });

                setWorkingSeverities({
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

      {/* <div className="flex flex-col gap-2 py-[3%]">
        {viewableReports.length === 0 ? (
          <div>No reports match the selected filters.</div>
        ) : (
          {
            for (let i = 0; )
            viewableReports.map(report => (
            <ReportOverviewItem key={report.id} report={report} />
          ))
          }

        )}
      </div> */}
      <div className="flex flex-col gap-2 py-[3%]">
        {(viewableReports && viewableReports.length === 0) ? (
          <div>No reports match the selected filters.</div>
        ) : (
          (() => {
            const items = [];
            const list = viewableReports || [];
            for (let i = 0; i < list.length; i++) {
              const report = list[i];
              const targetUser = getUserById({ users, userId: report.reporterId });
              const reporter = getUserById({ users, userId: report.targetUserId });
              items.push(<ReportOverviewItem key={report.id} report={report} reporter={reporter} targetUser={targetUser} />);
            }
            return items;
          })()
        )}
      </div>

    </div>
  );
}
