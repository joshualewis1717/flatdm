"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import type { Conversation } from "./type";
import ConversationBox from "./ConversationBox";

type parameters = {
  conversations: Conversation[];
  selectedConversation: number | null;
  setSelectedConversation: (id: number) => void;
  search: string;
  setSearch: (value: string) => void;
  deleteConversation: (conversationId: number) => void;
};

export default function Inbox({conversations, selectedConversation, setSelectedConversation, search, setSearch, deleteConversation}: parameters) {
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
        <ScrollArea className="h-[70vh] pr-2 w-full">
            <div className="space-y-2">
                {filtered.map((conversation) => (
                    <ConversationBox
                    conversation={conversation}
                    selectedConversation={selectedConversation}
                    setSelectedConversation={setSelectedConversation}
                    deleteConversation={deleteConversation} />
                ))}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}