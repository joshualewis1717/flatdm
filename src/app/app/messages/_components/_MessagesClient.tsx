"use client";

import { useState, useEffect } from "react";
import { UserConversations } from "./type";
import Inbox from "./Inbox";
import Chat from "./Chat";

import { Message } from "./type";



export default function MessagesClient({ conversations }:UserConversations ) {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [allConversations, setAllConversations] = useState(conversations);

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
        <Inbox
        conversations={allConversations}
        selectedConversation={selectedConversation}
        setSelectedConversation={setSelectedConversation}
        search={search}
        setSearch={setSearch} />

        <Chat
        activeConversation={activeConversation}
        addMessage={addMessageToConversation}
        replaceMessage={replacePendingMessage}
        removeMessage={removePendingMessage}
        />

    </div>
  );
}