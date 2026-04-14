import { RequestStatus } from "@prisma/client";

export type Message = {
  id: number;
  content: string;
  createdAt: string | null;
  senderId?: number;
  isOwn: boolean;
  pending?: boolean;
  isDeleted: boolean
};

export type Conversation = {
  id: number;
  name: string;
  isDeletedUser: boolean;
  lastMessage: string;
  timestamp: string | null;
  messages: Message[];
};

export type Request ={
  id: number;
  senderId: number;
  name: string;
  isDeletedUser: boolean;
  status: RequestStatus;
  createdAt: string;
};

export type Report = {
  category: string;
  severity: string;
  reason: string;
  description?: string;
  targetType: "conversation" | "listing" | "review";
  targetId: number;
  targetUserId?: number | null;
};