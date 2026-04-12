// a button to redirect to listing page

import { getListingIdFromApplication } from "@/app/app/applications/prisma/clientServices"
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ErrorMessage from "@/components/shared/ErrorMessage";
import Link from "next/link";


type props={
    applicationId: number
    setError?: (message: string) => void;
}

export default function ViewListingButton({applicationId, setError}: props){
    const router = useRouter();
    const [listingId, setListingId] = useState<number | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);// prevent the button from rendering before listingId resolves

    useEffect(()=>{
        async function fetchListingId(){
            setLoading(true);
            const {result, error} = await getListingIdFromApplication(applicationId);
            if (error){
                // propagate to parent if a setter was provided, otherwise show inline
                if (setError) {
                    setError(error);
                } else {
                    setLocalError(error);
                }
            }
            setListingId(result)
            setLoading(false);
        }
        fetchListingId();
    }, [])

    // don't render anything until we have the listing ID, avoids navigating to /listings/null
    if (loading) return null;

    return(
        <>
            {/* Show inline error only when no parent error handler was supplied */}
            {localError && <ErrorMessage text={localError} />}

            <Link className="flex items-center gap-1.5 text-[11px] text-white/35 hover:text-white transition-colors font-medium"
            href={`/app/listings/${listingId}`}>
                <ArrowUpRight className="w-3.5 h-3.5" />
                View listing
            </Link>
        </>
    )

}