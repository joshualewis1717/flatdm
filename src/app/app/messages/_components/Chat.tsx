"use client";

import { useState, useMemo, useEffect, ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

import { Conversation, Message } from "./type";
import { formatDayLabelChat, isSameDay, useScrollToBottom } from "./helperFunctions";
import { sendMessageRequest, deleteMessageRequest } from "./chat-api-requests";

import MessageBubble from "./MessageBubble";
import ReportPanel from "../../reports/ReportPanel";
import ReportButton from "../../reports/ReportButton";
import ErrorDisplay from "./ErrorDisplay"

type Parameters = {
  activeConversation?: Conversation;
  addMessage: (conversationId: number, message: Message) => void;
  replaceMessage: (conversationId: number,tempId: number, savedMessage: Message) => void;
  removeMessage: (conversationId: number, tempId: number) => void;
  deleteMessage: (conversationId: number, tempId: number) => void;
  mobileInboxTrigger?: ReactNode;
  error?: string | null;
  clearError?: () => void;
};

export default function Chat({activeConversation, addMessage, replaceMessage, removeMessage, deleteMessage, 
    mobileInboxTrigger, error=null, clearError}: Parameters) {
    const [input, setInput] = useState("");
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const bottomRef = useScrollToBottom(activeConversation?.messages.length);

    useEffect(() => {
    setActionError(null);
    }, [activeConversation?.id]);

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

        clearError?.();
        setActionError(null);

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
            setActionError(error instanceof Error ? error.message : "Failed to send message.");
        }
    };

    const handleDeleteMessage = async (messageId: number) => {
        if (!activeConversation) return;

        clearError?.();
        setActionError(null);

        try {
            await deleteMessageRequest(messageId);
            deleteMessage(activeConversation.id, messageId);
        } catch (error) {
            setActionError(error instanceof Error ? error.message : "Failed to delete message.");
        }
    };

    return (
        <Card className="h-full min-h-0 flex flex-col rounded-2xl border-white/10 bg-white/[0.03]">
            {(!activeConversation && mobileInboxTrigger) ? (
            <div className="flex items-center border-b border-white/10 p-4 md:hidden">
                {mobileInboxTrigger}
            </div>
            ) : activeConversation ? (
            <div className="flex items-center justify-between border-b border-white/10 p-4">
                <div className="flex items-center gap-3">
                    {mobileInboxTrigger}
                    <Avatar>
                        <AvatarFallback>
                        {activeConversation.isDeletedUser ? "❌" : activeConversation.name[0]}
                        </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium text-white">
                        {activeConversation.name}
                    </p>
                </div>

                <ReportButton
                onClick={() => setIsReportOpen(true)}
                disabled={activeConversation?.isDeletedUser}
                className="border-white/10 bg-primary text-white hover:bg-white/10 hover:text-white"
                />
            </div>
            ) : null}

            {activeConversation ? (
            <>
                <ReportPanel
                open={isReportOpen}
                onOpenChange={setIsReportOpen}
                targetType="conversation"
                targetId={activeConversation.id}
                targetName={activeConversation.name}
                title={`Report ${activeConversation.name}`}
                />

                {error && (
                    <ErrorDisplay message={error} />
                )}

                <ScrollArea className="min-h-0 flex-1 p-4">
                    <div className="space-y-3">
                        {messagesWithSeparators.map((message) => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            handleDeleteMessage={handleDeleteMessage}
                        />
                        ))}
                        <div ref={bottomRef} />
                    </div>
                </ScrollArea>

                {actionError && (
                    <ErrorDisplay message={actionError} />
                )}

                <div className="flex gap-2 border-t border-white/10 p-4">
                    <Input
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={activeConversation?.isDeletedUser}
                        onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                        }}
                        className="border-white/10 bg-white/5 text-white"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || activeConversation?.isDeletedUser}
                    >
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