import { useEffect } from "react";
import { Message } from "./type";
import { fetchMessagesRequest } from "./chat-api";

type Parameters = {
  conversationId: number | null;
  onMessages: (messages: Message[]) => void;
  onError: (error: string | null) => void;
  interval?: number;
};

export function useMessagePolling({conversationId, onMessages, onError, interval = 2000}: Parameters) {
  useEffect(() => {
    if (!conversationId) return;

    let cancelled = false;

    const pollMessages = async () => {
      try {
        const messages = await fetchMessagesRequest(conversationId);
        if (cancelled) return;

        onMessages(messages);
        onError(null);
      } catch (error) {
        if (cancelled) return;

        onError(
          error instanceof Error
            ? error.message
            : "Unable to load messages. Please try again."
        );
      }
    };

    pollMessages();
    const intervalId = window.setInterval(pollMessages, interval);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [conversationId, interval, onMessages, onError]);
}