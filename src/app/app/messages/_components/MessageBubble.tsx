import { Message } from "./type";
import { formatTimestampChat } from "./helper-functions";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

type parameters = {
  message: Message & {
    showDaySeparator?: boolean;
    dayLabel?: string;
};
  handleDeleteMessage: (messageId: number) => void;
};

export default function MessageBubble({ message, handleDeleteMessage }: parameters){
    return (
        <div>
            <div key={message.id}>
                {message.showDaySeparator && (
                <div className="my-4 flex justify-center">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                        {message.dayLabel}
                    </span>
                </div>)
                }

                <div className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                    <div className="group flex items-start gap-2">
                        <div
                        className={`max-w-xs rounded-2xl px-4 py-2 text-sm shadow-sm ${
                            message.isOwn ? "rounded-br-md bg-primary text-black" : "rounded-bl-md bg-white/10 text-white"
                        } ${message.isDeleted ? "opacity-70 italic" : ""}`}>
                            <div className="flex items-end gap-2">
                                <p className="break-all">
                                    {message.isDeleted ? "This message was deleted" : message.content}
                                </p>
                                <span className={`shrink-0 text-[11px] leading-none ${message.isOwn ? "text-black/70" : "text-white/60"}`}>
                                    {formatTimestampChat(message.createdAt)}
                                </span>
                            </div>
                        </div>

                        {message.isOwn && !message.isDeleted && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="mt-1 rounded-md p-1 text-white/60 transition hover:bg-white/10 hover:text-white md:opacity-0 md:group-hover:opacity-100">
                                        <MoreVertical className="h-4 w-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleDeleteMessage(message.id)}>
                                        Delete Message
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}