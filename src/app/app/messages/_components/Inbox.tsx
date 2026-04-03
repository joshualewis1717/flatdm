"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Conversation } from "./type";

import { formatTimestampInbox } from "./helper";

type Props = {
  conversations: Conversation[];
  selectedConversation: number | null;
  setSelectedConversation: (id: number) => void;
  search: string;
  setSearch: (value: string) => void;
};

export default function Inbox({conversations, selectedConversation, setSelectedConversation, search, setSearch}: Props) {
  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="col-span-1 rounded-2xl border-white/10 bg-white/[0.03]">
      <CardContent className="p-4 space-y-4">
        <h2 className="text-lg font-semibold text-white">Inbox</h2>

        {/* Conversation Search */}
        <Input
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white/5 border-white/10 text-white"
        />

        {/* Available Conversations */}
        <ScrollArea className="h-[70vh] pr-2">
            <div className="space-y-2">
                {filtered.map((conversation) => (
                    <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`w-full rounded-xl p-3 text-left transition hover:bg-white/5 ${
                    selectedConversation === conversation.id? "bg-white/10": ""}`}>
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarFallback>
                                    {conversation.name[0]}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-white">
                                        {conversation.name}
                                    </p>
                                    <span className="text-xs text-white/50">
                                        {formatTimestampInbox(conversation.timestamp)}
                                    </span>
                                </div>

                                <p className="text-xs text-white/60 truncate">
                                    {conversation.lastMessage}
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}