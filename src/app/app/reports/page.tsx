import ReportsClient from "./ReportsClient";
import { getAllReports, getAllUsers } from "./db_access";

export default async function ReportsPage() {
  let dataError : string | null = null;
  let reports = null;
  let users = null;

  // fetch users and reports from database
  try{
    reports = await getAllReports();
    users = await getAllUsers();

    if (reports.error == null && users.error == null){
      reports = reports.result;
      users = users.result;
    }
    else{
      dataError = "Error fetching data from database. Refresh to try again."
    }
  }
  catch (error){
    dataError="Error accessing the database. Refresh to try again.";
  }

  // final check to make sure nothing is null
  if (reports == null || users == null){
    dataError="Error: Improper data from database. Refresh to try again";
  }
  
  let serializable = null;

  if (dataError === null){
    serializable = reports.map(r => ({ ...r, createdAt: r.createdAt.toISOString(), modifiedAt: r.modifiedAt.toISOString() }));
  }

  
  return <ReportsClient error={dataError} initialReports={serializable} users={users}/>;
}