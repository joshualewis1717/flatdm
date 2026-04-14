import InteractivePanel from "../components/viewListing/layout/InteractivePanel";
import ListingInfoPanel from "../components/viewListing/layout/ListingInfoPanel";
import { prisma } from "@/lib/prisma";
import ErrorMessage from "@/components/shared/ErrorMessage";
import { ListingReview } from "../types";
// listing page to show information about a specific listing 

//TODO: add in buttons for landlords to edit and whatnot, also a mode for current/ past occupants to leave a review?
//This page is a slug catch all, so scrape the id from the params (look at applications [id] i did an example there),
//  then use that to query an api route you make to display all the about a property and display it nicely here.
export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id) return null;

  let reviews;
    try {
      reviews = await prisma.review.findMany({
      where: {
        listingId: Number(id),
        isDeleted: false,
      },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    } catch(err) {
      return <ErrorMessage text="Database Error"/>
    }
    const formattedReviews: ListingReview[] = reviews.map((r) => ({
      id: r.id,
      listingId: r.listingId,
      rating: r.rating ?? 0,
      comment: r.comment ?? "",
      createdAt: r.createdAt,
      reviewerId: r.author.id,
      username: r.author.username,
    }));
  return (
    <div className="space-y-6">
       <div className="flex flex-col lg:flex-row gap-6">
        {/* Info panel: 2/3 */}
        <div className="lg:w-2/3">
          <ListingInfoPanel listingId={id} />
        </div>

        {/* Interactive panel: 1/3 */}
        <div className="lg:w-1/3">
          <InteractivePanel  listingId={id} reviews={formattedReviews}/>
        </div>
      </div>
    </div>
  );
}