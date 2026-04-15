import { Conversation, Message } from "./type";

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data.error === "string"
        ? data.error
        : "Something went wrong.";
    throw new Error(message);
  }

  return data as T;
}

export async function sendMessageRequest(conversationId: number, content: string): Promise<Message> {
  const response = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId, content }),
  });

  return parseJson<Message>(response);
}

export async function deleteMessageRequest(messageId: number): Promise<Message> {
  const response = await fetch("/api/messages", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messageId }),
  });

  return parseJson<Message>(response);
}

export async function fetchMessagesRequest(conversationId: number): Promise<Message[]> {
  const response = await fetch(`/api/messages?conversationId=${conversationId}`, {
    cache: "no-store",
  });

  return parseJson<Message[]>(response);
}

export async function deleteConversationRequest(conversationId: number): Promise<{ success: true }> {
  const response = await fetch("/api/conversations", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId }),
  });

  return parseJson<{ success: true }>(response);
}

export async function acceptRequestRequest(requestId: number): Promise<{ conversation: Conversation }> {
  const response = await fetch("/api/requests", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestId, action: "ACCEPT" }),
  });

  return parseJson<{ conversation: Conversation }>(response);
}

export async function declineRequestRequest(requestId: number): Promise<{ success: true }> {
  const response = await fetch("/api/requests", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestId, action: "DECLINE" }),
  });

  return parseJson<{ success: true }>(response);
}