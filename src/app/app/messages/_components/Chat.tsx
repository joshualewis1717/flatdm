"use client";

import { useEffect, useRef, useState,useMemo,ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

import { Conversation, Message } from "./type";
import { formatTimestampChat, formatDayLabelChat, isSameDay } from "./helper";

type Props = {
  activeConversation?: Conversation;
  addMessage: (conversationId: number, message: Message) => void;
  replaceMessage: (conversationId: number,tempId: number,savedMessage: Message) => void;
  removeMessage: (conversationId: number, tempId: number) => void;
  deleteMessage: (conversationId: number, tempId: number) => void;
  mobileInboxTrigger?: ReactNode;
};

export default function Chat({activeConversation,addMessage,replaceMessage,removeMessage,deleteMessage,mobileInboxTrigger}: Props) {
    const [input, setInput] = useState("");
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });}, 0);
        return () => clearTimeout(timer);
    }, [activeConversation?.messages.length]);

    const messagesWithSeparators = useMemo(() => {if (!activeConversation?.messages) return [];
        return activeConversation.messages.map((message, index, messages) => {
            const previousMessage = messages[index - 1];
            const showDaySeparator = index === 0 || !isSameDay(previousMessage?.createdAt, message.createdAt);

            return {
                ...message,
                showDaySeparator,
                dayLabel: showDaySeparator ? formatDayLabelChat(message.createdAt) : "",
            };
        });
    }, [activeConversation?.messages]);

    const handleSend = async () => {
        if (!input.trim() || !activeConversation) return;

        const content = input.trim();
        const tempId = Date.now();

        const tempMessage: Message = {
            id: tempId,
            content,
            isOwn: true,
            createdAt: new Date().toISOString(),
            isDeleted:false
        };

        addMessage(activeConversation.id, tempMessage);
        setInput("");

        try {
            const response = await fetch("/api/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                conversationId: activeConversation.id,
                content,
            }),
            });

            if (!response.ok) {
                throw new Error("Failed to send message");
            }

            const savedMessage: Message = await response.json();

            replaceMessage(activeConversation.id, tempId, savedMessage);
        } catch (error) {
            removeMessage(activeConversation.id, tempId);
            setInput(content);
            console.error(error);
        }
    };

    const handleDeleteMessage = async (messageId: number) => {
        if (!activeConversation) return;

        try {
            const response = await fetch("/api/messages", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ messageId }),
            });

            if (!response.ok) {
            throw new Error("Failed to delete message");
            }

            deleteMessage(activeConversation.id, messageId);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Card className="h-full min-h-0 flex flex-col rounded-2xl border-white/10 bg-white/[0.03]">
            {activeConversation ? (
                <>
                    <div className="flex items-center gap-3 border-b border-white/10 p-4">
                        {mobileInboxTrigger}
                        <Avatar>
                            <AvatarFallback>{activeConversation.isDeletedUser ? "❌" : activeConversation.name[0]}</AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium text-white">
                            {activeConversation.name}
                        </p>
                    </div>

                    <ScrollArea className="min-h-0 flex-1 p-4">
                        <div className="space-y-3">
                            {messagesWithSeparators.map((message) => (
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
                                                message.isOwn
                                                ? "rounded-br-md bg-primary text-black"
                                                : "rounded-bl-md bg-white/10 text-white"
                                            } ${message.isDeleted ? "opacity-70 italic" : ""}`}>
                                                <div className="flex items-end gap-2">
                                                    <p className="break-words">
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
                                                    <button className="mt-1 rounded-md p-1 text-white/60 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleDeleteMessage(message.id)}>
                                                        Delete message
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            )
                                            }
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>
                    </ScrollArea>

                    <div className="flex gap-2 border-t border-white/10 p-4">
                        <Input
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={activeConversation?.isDeletedUser}
                            onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();}
                            }}
                            className="border-white/10 bg-white/5 text-white"
                        />
                        <Button onClick={handleSend} disabled={!input.trim() || activeConversation?.isDeletedUser}>
                            Send
                        </Button>
                    </div>
                </>
            ) : (
                <CardContent className="flex h-full items-center justify-center p-6">
                    <p className="text-white/50">Select a conversation to start chatting</p>
                </CardContent>
            )}
        </Card>
    );
}