"use client";

import { useState, useEffect } from "react";
import { UserConversations, Message } from "./type";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

import Inbox from "./Inbox";
import Chat from "./Chat";

export default function MessagesClient({ conversations }: UserConversations) {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [allConversations, setAllConversations] = useState(conversations);
  const [isMobileInboxOpen, setIsMobileInboxOpen] = useState(false);

  const activeConversation = allConversations.find((conversation) => conversation.id === selectedConversation);

  const updateConversation = ( 
    conversationId: number,
    updater: (conversation: (typeof allConversations)[number]) => (typeof allConversations)[number]
  ) => {
    setAllConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId ? updater(conversation) : conversation
      )
    );
  };

  const addMessageToConversation = (conversationId: number, message: Message) => {
    setAllConversations((current) => {
      const conversation = current.find((item) => item.id === conversationId);
      if (!conversation) return current;

      const updatedConversation = {
        ...conversation,
        messages: [...conversation.messages, message],
        lastMessage: message.content,
        timestamp: message.createdAt,
      };

      return [
        updatedConversation,
        ...current.filter((item) => item.id !== conversationId),
      ];
    });
  };

  const replacePendingMessage = ( conversationId: number, tempId: number, message: Message ) => {
    updateConversation(conversationId, (conversation) => {
      const messages = conversation.messages.map((item) =>
        item.id === tempId ? message : item
      );
      const lastMessage = messages[messages.length - 1];

      return {
        ...conversation,
        messages,
        lastMessage: lastMessage?.content ?? conversation.lastMessage,
        timestamp: lastMessage?.createdAt ?? conversation.timestamp,
      };
    });
  };

  const removePendingMessage = (conversationId: number, tempId: number) => {
    updateConversation(conversationId, (conversation) => {
      const messages = conversation.messages.filter((message) => message.id !== tempId);
      const lastMessage = messages[messages.length - 1];

      return {
        ...conversation,
        messages,
        lastMessage: lastMessage?.content ?? "",
        timestamp: lastMessage?.createdAt ?? null,
      };
    });
  };

  const deleteMessage = (conversationId: number, messageId: number) => {
    updateConversation(conversationId, (conversation) => {
      const messages = conversation.messages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              isDeleted: true,
              deletedAt: new Date().toISOString(),
            }
          : message
      );

      const lastMessage = messages[messages.length - 1];

      return {
        ...conversation,
        messages,
        lastMessage: lastMessage?.isDeleted
          ? "This message was deleted"
          : lastMessage?.content ?? "",
        timestamp: lastMessage?.createdAt ?? conversation.timestamp,
      };
    });
  };

  useEffect(() => {
    setAllConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    if (!selectedConversation) return;

    const pollMessages = async () => {
      try {
        const response = await fetch(
          `/api/messages?conversationId=${selectedConversation}`
        );
        if (!response.ok) return;

        const messages: Message[] = await response.json();

        updateConversation(selectedConversation, (conversation) => {
          const currentLastId = conversation.messages[conversation.messages.length - 1]?.id;
          const nextLastId = messages[messages.length - 1]?.id;

          if (
            currentLastId === nextLastId &&
            conversation.messages.length === messages.length
          ) {
            return conversation;
          }

          const lastMessage = messages[messages.length - 1];

          return {
            ...conversation,
            messages,
            lastMessage: lastMessage?.content ?? conversation.lastMessage,
            timestamp: lastMessage?.createdAt ?? conversation.timestamp,
          };
        });
      } catch (error) {
        console.error("Failed to refresh messages", error);
      }
    };

    pollMessages();
    const intervalId = setInterval(pollMessages, 3000);

    return () => clearInterval(intervalId);
  }, [selectedConversation]);

  return (
    <div className="grid h-[calc(87vh-4rem)] grid-cols-1 gap-6 md:grid-cols-3">
      <div className="hidden md:block">
        <Inbox
          conversations={allConversations}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
          search={search}
          setSearch={setSearch}
        />
      </div>

      <div className="md:col-span-2">
        <Chat
          activeConversation={activeConversation}
          addMessage={addMessageToConversation}
          replaceMessage={replacePendingMessage}
          removeMessage={removePendingMessage}
          deleteMessage={deleteMessage}
          mobileInboxTrigger={
            <Sheet open={isMobileInboxOpen} onOpenChange={setIsMobileInboxOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-[85vw] border-white/10 bg-black p-0">
                <SheetHeader className="px-4 pt-4">
                  <SheetTitle className="text-white">Inbox</SheetTitle>
                </SheetHeader>

                <div className="p-4 pt-2">
                  <Inbox
                    conversations={allConversations}
                    selectedConversation={selectedConversation}
                    setSelectedConversation={(id) => {
                      setSelectedConversation(id);
                      setIsMobileInboxOpen(false);
                    }}
                    search={search}
                    setSearch={setSearch}
                  />
                </div>
              </SheetContent>
            </Sheet>
          }
        />
      </div>
    </div>
  );
}