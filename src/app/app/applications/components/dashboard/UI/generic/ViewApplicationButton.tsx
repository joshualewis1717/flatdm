import { FileText } from "lucide-react";
import Link from "next/link";
// simple button to link to the passed in application

type props={
    applicationId: number;
}
export default function ViewApplicationButton({applicationId}: props){
    return(
        <Link className="flex items-center gap-1.5 text-[11px] text-white/35 hover:text-[#c9fb00] transition-colors font-medium"
        href={`/app/applications/${applicationId}`}>
                <FileText className="w-3.5 h-3.5" />
                View application
        </Link>
    )
}
