import { Button } from '@/components/ui/button';
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {getModerators, getReport, getUser, getUsers} from '@/app/app/reports/db_access'
import Status from '@/components/shared/Status';
import SelectedReportClient from './SelectedReportClient';


export default async function ReportPage({ params } : { params: Promise<{id: number}> }) {
  
  const {id} = await params;    // id represents the report id
  const numId = Number(id);     // make the id a number

  let report = null;
  let moderators = null;
  let dataError : string | null = null;
  let target = null;
  let reporter = null;

  // fetch targer, reporter, report and moderators from database
  try{
    report = await getReport({reportId:numId});

    if (report.error == null){
      report = report.result;

      target = await getUser({userId:report['targetUserID']});
      reporter = await getUser({userId:report['reporterId']});
      
      moderators = await getModerators();

      if (target.error == null && reporter.error == null && moderators.error == null){
        target = target.result;
        reporter = reporter.result;
        moderators = moderators.result;
      }
      else{
        dataError = "Error fetching data from database. Refresh to try again."
      }
    }
    else{
      dataError = "Error fetching data from database. Refresh to try again."
    }

  }
  catch (error){
    dataError="Error accessing the database. Refresh to try again.";
  }

  // final check to make sure nothing is null
  if (target == null || reporter == null || report == null || moderators == null){
    dataError="Error: Improper data from database. Refresh to try again";
  }
  

  return <SelectedReportClient error={dataError} report={report} target={target} reporter={reporter} moderators={moderators} />
}