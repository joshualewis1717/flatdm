"use client";

import { useEffect, useRef, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

import { Conversation, Message } from "./type";

type Props = {
  activeConversation?: Conversation;
  addMessage: (conversationId: number, message: Message) => void;
  replaceMessage: (
    conversationId: number,
    tempId: number,
    savedMessage: Message
  ) => void;
  removeMessage: (conversationId: number, tempId: number) => void;
};

export default function Chat({activeConversation, addMessage, replaceMessage, removeMessage}: Props) {
    const [input, setInput] = useState("");
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const t = setTimeout(() => {bottomRef.current?.scrollIntoView({ block: "end" });
        }, 0);

        return () => clearTimeout(t);
    }, [activeConversation?.messages.length]);

    const handleSend = async () => {
        if (!input.trim() || !activeConversation) return;

        const content = input.trim();
        const tempId = Date.now();

        const tempMessage = {
            id: tempId,
            content,
            isOwn: true,
            createdAt: new Date().toISOString(),
        };

        addMessage(activeConversation.id, tempMessage);
        setInput("");

        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    conversationId: activeConversation.id,
                    content,
                }),
            });

            if (!res.ok) {
            throw new Error("Failed to send message");
            }

            const savedMessage = await res.json();

            replaceMessage(activeConversation.id, tempId, savedMessage);
        } catch (error) {
            removeMessage(activeConversation.id, tempId);
            setInput(content);
            console.error(error);
        }
    };

    return(
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
                    <ScrollArea className="flex-1 min-h-0 p-4">
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

                        <div ref={bottomRef} />
                    </ScrollArea>

                    {/* Input */}
                    <div className="border-t border-white/10 p-4 flex gap-2">
                        <Input
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                                }
                            }}
                            className="bg-white/5 border-white/10 text-white"
                        />
                        <Button onClick={handleSend} disabled={!input.trim()}>
                            Send
                        </Button>
                    </div>
                </>
            ) : (
                <CardContent className="p-6 flex h-full items-center justify-center">
                    <p className="text-white/50">Select a conversation to start chatting</p>
                </CardContent>
            )}
        </Card>
    );
}