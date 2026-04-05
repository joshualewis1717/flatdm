import { useRef, useEffect } from "react";

export function formatTimestampInbox(timestamp: string | null) {
    if (!timestamp) return "";
    const date = new Date(timestamp);

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
    }

    if (isYesterday) {
        return "Yesterday";
    }

    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
    });
}

export function formatTimestampChat(timestamp?: string | null) {
    if (!timestamp) return "";
    const date = new Date(timestamp);

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatDayLabelChat(timestamp?: string | null) {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return "Today";
    }

    if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    }

    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export function isSameDay(firstTimestamp?: string | null, secondTimestamp?: string | null) {
  if (!firstTimestamp || !secondTimestamp) return false;
  return new Date(firstTimestamp).toDateString() === new Date(secondTimestamp).toDateString();
}

export function useScrollToBottom(dependency: unknown) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [dependency]);

  return bottomRef;
}