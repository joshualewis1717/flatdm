import { Message } from "./type";

export async function sendMessageRequest( conversationId: number, content: string ): Promise<Message> {
  const response = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId, content }),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return response.json();
}

export async function deleteMessageRequest(messageId: number) {
  const response = await fetch("/api/messages", { 
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messageId }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete message");
  }

  return response.json();
}