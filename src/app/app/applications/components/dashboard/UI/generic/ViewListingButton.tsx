// a button to redirect to listing page

import { getListingIdFromApplication } from "@/app/app/applications/prisma/clientServices"
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


type props={
    applicationId: number
    setError?: (message: string) => void;
}

export default function ViewListingButton({applicationId, setError}: props){
    const router = useRouter();
    const [listingId, setListingId] = useState<number | null>(null);

    useEffect(()=>{
        async function fetchListingId(){
            const {result, error} = await getListingIdFromApplication(applicationId);
            if (error && setError){
                setError(error)
            }
            setListingId(result)
        }
        fetchListingId();
    }, [])

    return(
        <>
            <button className="flex items-center gap-1.5 text-[11px] text-white/35 hover:text-white transition-colors font-medium"
            onClick={()=>router.push(`/app/listings/${listingId}`)}>
                <ArrowUpRight className="w-3.5 h-3.5" />
                View listing
            </button>
        </>
    )

}