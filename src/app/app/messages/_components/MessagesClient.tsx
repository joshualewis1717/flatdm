"use client";

import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";


type Message = {
  id: number;
  content: string;
  isOwn: boolean;
  timestamp?: string | null;
};

type Conversation = {
  id: number;
  name: string;
  lastMessage: string;
  timestamp?: string | null;
  messages?: Message[];
};

type UserConversations = {
  conversations: Conversation[];
};

export default function MessagesClient({ conversations }:UserConversations ) {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeConversation = conversations.find(
    (c) => c.id === selectedConversation
  );

  return (
    <div className="grid h-[calc(87vh-4rem)] grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="col-span-1 rounded-2xl border-white/10 bg-white/[0.03]">
            <CardContent className="p-4 space-y-4">
                <h2 className="text-lg font-semibold text-white">Inbox</h2>

                <Input
                    placeholder="Search conversations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                />

                <ScrollArea className="h-[70vh] pr-2">
                    <div className="space-y-2">
                    {filtered.map((conversation) => (
                        <button
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation.id)}
                        className={`w-full rounded-xl p-3 text-left transition hover:bg-white/5 ${
                            selectedConversation === conversation.id
                            ? "bg-white/10"
                            : ""
                        }`}
                        >
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
                                            {conversation.timestamp}
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

        <Card className="col-span-2 rounded-2xl border-white/10 bg-white/[0.03] flex flex-col">
            {activeConversation ? (
                <>
                    {/* Header */}
                    <div className="flex items-center gap-3 border-b border-white/10 p-4">
                        <Avatar>
                            <AvatarFallback>
                                {activeConversation.name[0]}
                            </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium text-white">
                            {activeConversation.name}
                        </p>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4 space-y-4">
                        {(activeConversation.messages ?? []).map((msg) => (
                            <div
                            key={msg.id}
                            className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`relative max-w-xs rounded-2xl px-4 py-2 text-sm shadow-sm ${
                                        msg.isOwn
                                        ? "bg-primary text-black rounded-br-md"
                                        : "bg-white/10 text-white rounded-bl-md"
                                    }`}
                                    >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                    </ScrollArea>

                    {/* Input */}
                    <div className="border-t border-white/10 p-4 flex gap-2">
                        <Input
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                        />
                        <Button disabled={!input.trim()}>Send</Button>
                    </div>
                </>
            ) : (
                <CardContent className="p-6 flex h-full items-center justify-center">
                    <p className="text-white/50">Select a conversation to start chatting</p>
                </CardContent>
            )}
        </Card>
    </div>
  );
}