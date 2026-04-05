"use client";

import { useEffect, useState, useMemo, ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

import { Conversation, Message } from "./type";
import { formatDayLabelChat, isSameDay, useScrollToBottom } from "./helperFunctions";
import { sendMessageRequest, deleteMessageRequest } from "./chat-api-requests";
import MessageBubble from "./MessageBubble";

type Props = {
  activeConversation?: Conversation;
  addMessage: (conversationId: number, message: Message) => void;
  replaceMessage: (conversationId: number,tempId: number, savedMessage: Message) => void;
  removeMessage: (conversationId: number, tempId: number) => void;
  deleteMessage: (conversationId: number, tempId: number) => void;
  mobileInboxTrigger?: ReactNode;
};

export default function Chat({activeConversation,addMessage,replaceMessage,removeMessage,deleteMessage,mobileInboxTrigger}: Props) {
    const [input, setInput] = useState("");
    const bottomRef = useScrollToBottom(activeConversation?.messages.length);

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
            const savedMessage = await sendMessageRequest(activeConversation.id, content);
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
            await deleteMessageRequest(messageId);
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
                                <MessageBubble
                                key={message.id}
                                message={message}
                                handleDeleteMessage={handleDeleteMessage} />
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