//for consultants this page will just be read only with buttons to contact the landlord or report the listing if they find it inappropriate.

//for landlords and moderators this page will have buttons to edit the listing or delete it if they want to remove it from the platform.


export default function ApplicationDetailsPage({params}: {params: {id: string}}) {
    return (
        <div>
            <h1>Application Details</h1>
            <p>Application ID: {params.id}</p>
            <p>This page will display detailed information about a specific application.</p>
            <p>Users can view all the details of the application, including the applicant's information, the listing they applied for, and their application status.</p>
        </div>
    );
}