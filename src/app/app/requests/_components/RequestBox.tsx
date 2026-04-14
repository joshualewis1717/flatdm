import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

import { Request } from "../../messages/_components/type";
import { formatTimestampInbox } from "../../messages/_components/helperFunctions";

type Parameters = {
  request: Request;
  acceptRequest: (requestId: number) => void;
  declineRequest: (requestId: number) => void;
};

export default function RequestBox({request, acceptRequest, declineRequest}: Parameters) {
  return (
    <div className="w-full rounded-xl p-3 transition hover:bg-white/5">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar className="shrink-0">
            <AvatarFallback>
                {request.name[0]}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <p className="min-w-0 truncate text-sm font-medium text-white">
                {request.name}
              </p>
              <span className="shrink-0 text-xs text-white/50">
                {formatTimestampInbox(request.createdAt)}
              </span>
            </div>

            <p className="truncate text-xs text-white/60">
              Message request
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => acceptRequest(request.id)}
            className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white" >
            <Check className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => declineRequest(request.id)}
            className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white" >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}