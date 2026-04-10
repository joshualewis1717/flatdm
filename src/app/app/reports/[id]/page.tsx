import { Button } from '@/components/ui/button';
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {getReport, getUser, getUsers} from '@/app/app/reports/db_access'
import Status from '@/components/shared/Status';
import SelectedReportClient from './SelectedReportClient';


export default async function ReportPage({ params } : { params: Promise<{id: number}> }) {
  
  const {id} = await params;    // id represents the report id
  const numId = Number(id);     // make the id a number

  const report = await getReport({reportId:numId});

  const users = await getUsers();  // get all users from the db

  // set the target and reporter users to use later
  let target = await getUser({userId:report['targetUserID']});
  let reporter = await getUser({userId:report['reporterId']});

  return <SelectedReportClient report={report} target={target} reporter={reporter} />
}