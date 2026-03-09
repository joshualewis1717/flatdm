//for consultants this page will just be read only with buttons to contact the landlord or report the listing if they find it inappropriate.

//for landlords and moderators this page will have buttons to edit the listing or delete it if they want to remove it from the platform.

export default async function ListingDetailsPage({params}: {params: {id: string}}) {
    //get some data


    return (
        <div>
            <h1>Listing Detail</h1>
            <p>Listing ID: {params.id}</p>
            <p>This page will display detailed information about a specific listing.</p>
            <p>Users can view all the details of the listing, including images, description, price, and contact information.</p>
        </div>
    );
}