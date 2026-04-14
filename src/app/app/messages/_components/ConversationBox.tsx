import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { formatTimestampInbox } from "./helperFunctions";
import { Conversation } from "./type";

import { MoreVertical } from "lucide-react";

type Parameters = {
  conversation: Conversation;
  selectedConversation: number | null;
  setSelectedConversation: (id: number) => void;
  deleteConversation: (conversationId: number) => void;
};

export default function ConversationBox({conversation, selectedConversation, setSelectedConversation, deleteConversation}: Parameters) {
  return (
    <div
      className={`w-full rounded-xl p-3 text-left transition hover:bg-white/5 ${
        selectedConversation === conversation.id ? "bg-white/10" : ""
      }`} >
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSelectedConversation(conversation.id)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left" >
          <Avatar className="shrink-0">
            <AvatarFallback>{conversation.name[0]}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <p className="min-w-0 truncate text-sm font-medium text-white">
                {conversation.name}
              </p>
              <span className="shrink-0 text-xs text-white/50">
                {formatTimestampInbox(conversation.timestamp)}
              </span>
            </div>

            <p className="truncate text-xs text-white/60">
              {conversation.lastMessage}
            </p>
          </div>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="rounded-md p-1 text-white/60 transition hover:bg-white/10 hover:text-white" >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                deleteConversation(conversation.id);
              }}>
              Delete Conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}