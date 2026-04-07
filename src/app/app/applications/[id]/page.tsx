import ApplicationForm from "../components/Submitform/ApplicationForm";
// page to go into a specific application form in view mode
export default async function Page({params,}: {params: { id: string };}) {

  const {id} = await params;
  return (
    <ApplicationForm applicationId={Number(id)} />
  );
}