"use client";

import { useState, useEffect } from "react";
import { UserConversations, Message } from "./type";

import { Sheet,SheetContent,SheetHeader,SheetTitle,SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

import Inbox from "./Inbox";
import Chat from "./Chat";

export default function MessagesClient({ conversations }:UserConversations ) {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [allConversations, setAllConversations] = useState(conversations);
  const [isMobileInboxOpen, setIsMobileInboxOpen] = useState(false);

  const activeConversation = allConversations.find((c) => c.id === selectedConversation);

  const addMessageToConversation = (conversationId: number, message: Message) => {
    setAllConversations((current) => {
      const index = current.findIndex((conversation) => conversation.id === conversationId);
      if (index === -1) return current;

      const updatedConversation = {
        ...current[index],
        messages: [...current[index].messages, message],
        lastMessage: message.content,
        timestamp: new Date().toISOString(),
      };

      return [
        updatedConversation,
        ...current.filter((conversation) => conversation.id !== conversationId),
      ];
    });
  };

  const replacePendingMessage = (conversationId: number,tempId: number,message: Message) => {
    setAllConversations((current) =>
      current.map((conversation) => {
        if (conversation.id !== conversationId) return conversation;

        const messages = conversation.messages.map((item) =>
          item.id === tempId ? message : item
        );

        return {
          ...conversation,
          messages,
          lastMessage: messages.at(-1)?.content ?? conversation.lastMessage,
          timestamp: messages.at(-1)?.createdAt ?? conversation.timestamp,
        };
      })
    );
  };

  const removePendingMessage = (conversationId: number, tempId: number) => {
    setAllConversations((current) =>
      current.map((conversation) => {
        if (conversation.id !== conversationId) return conversation;

        const messages = conversation.messages.filter((message) => message.id !== tempId);
        const lastMessage = messages.at(-1);

        return {
          ...conversation,
          messages,
          lastMessage: lastMessage?.content ?? "",
          timestamp: lastMessage?.createdAt ?? null,
        };
      })
    );
  };

  useEffect(() => {
    if (!selectedConversation) return;
    const pollMessages = async () => {
      try {
        const response = await fetch(`/api/messages?conversationId=${selectedConversation}`);
        if (!response.ok) return;

        const messages: Message[] = await response.json();

        setAllConversations((current) =>
          current.map((conversation) => {
            if (conversation.id !== selectedConversation) return conversation;

            const currentLastId = conversation.messages.at(-1)?.id;
            const nextLastId = messages.at(-1)?.id;

            if (currentLastId === nextLastId && conversation.messages.length === messages.length) {
              return conversation;
            }

            return {
              ...conversation,
              messages,
              lastMessage: messages.at(-1)?.content ?? conversation.lastMessage,
              timestamp: messages.at(-1)?.createdAt ?? conversation.timestamp,
            };
          })
        );
      } catch (error) {
        console.error("Failed to refresh messages", error);
      }
    };

    pollMessages();
    const intervalId = setInterval(pollMessages, 3000);
    return () => clearInterval(intervalId);
  }, [selectedConversation]);

  useEffect(() => { setAllConversations(conversations);}, [conversations]);

  return (
    <div className="grid h-[calc(87vh-4rem)] grid-cols-1 gap-6 md:grid-cols-3">
      {/* Desktop inbox */}
      <div className="hidden md:block">
        <Inbox
          conversations={allConversations}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
          search={search}
          setSearch={setSearch}/>
      </div>

      {/* Chat */}
      <div className="md:col-span-2">
        <Chat
          activeConversation={activeConversation}
          addMessage={addMessageToConversation}
          replaceMessage={replacePendingMessage}
          removeMessage={removePendingMessage}
          mobileInboxTrigger={
            <Sheet open={isMobileInboxOpen} onOpenChange={setIsMobileInboxOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-white">
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
                    setSearch={setSearch}/>
                </div>
              </SheetContent>
            </Sheet>
          }
        />
      </div>
    </div>
  );
}