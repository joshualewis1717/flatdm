// ListingsPage.tsx
// for landlords, moderators and consultants

// two views one for landlords to view only their listings 

// and one for moderators and consultants to view all listings#


// i recommend creating a reusable component ListingCard that can be used in both views to diplay data nicely
//then when users click on a listing it takes them to a detailed page using a slug /lisings/:id which uses the function Lis

export default function ListingsPage() {
    return (
        <div>
            <h1>Listings</h1>
            <p>This page will display all the listings for landlords, moderators, and consultants.</p>
            <p>Landlords will see only their listings, while moderators and consultants will see all listings.</p>
            <p>Each listing will be displayed using a reusable ListingCard component, and clicking on a listing will take users to a detailed page.</p>
        </div>
    );
}