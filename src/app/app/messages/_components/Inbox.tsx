"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import type { Conversation, Request } from "./type";
import ConversationBox from "./ConversationBox";
import RequestBox from "../../requests/_components/RequestBox";
import ErrorDisplay from "./ErrorDisplay";

type Parameters = {
  conversations: Conversation[];
  requests: Request[];
  selectedConversation: number | null;
  setSelectedConversation: (id: number) => void;
  search: string;
  setSearch: (value: string) => void;
  deleteConversation: (conversationId: number) => void;
  acceptRequest: (requestId: number) => void;
  declineRequest: (requestId: number) => void;
  error?: string | null;
};

export default function Inbox({conversations, requests, selectedConversation, setSelectedConversation, search, setSearch,
  deleteConversation, acceptRequest, declineRequest, error=null}: Parameters) {

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRequests = requests.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
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

        {error && (
          <ErrorDisplay message={error} />
        )}

        {/* Available Conversations */}
        <ScrollArea className="h-[70vh] pr-2 w-full">
          <div className="space-y-4">
          {filteredRequests.length === 0 && filteredConversations.length === 0 ? (
            <div className="flex h-[50vh] items-center justify-center">
              <p className="text-sm text-white/50">No conversations found</p>
            </div>
          ) : (
            <>
              {filteredRequests.length > 0 && (
                <div className="space-y-2">
                  <p className="px-1 text-xs font-medium uppercase tracking-wide text-white/50">
                    Requests
                  </p>

                  {filteredRequests.map((request) => (
                    <RequestBox
                      key={request.id}
                      request={request}
                      acceptRequest={acceptRequest}
                      declineRequest={declineRequest}
                    />
                  ))}
                </div>
              )}

              <div className="space-y-2">
                {filteredRequests.length > 0 && (
                  <p className="px-1 text-xs font-medium uppercase tracking-wide text-white/50">
                    Conversations
                  </p>
                )}

                {filteredConversations.map((conversation) => (
                  <ConversationBox
                    key={conversation.id}
                    conversation={conversation}
                    selectedConversation={selectedConversation}
                    setSelectedConversation={setSelectedConversation}
                    deleteConversation={deleteConversation}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}