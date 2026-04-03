import { CreateReadStreamOptions } from "fs/promises";

type Report = {
  id: number;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
  reporterId: number;
  targetUserId: number;
  listingId: number;
};

type User = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: string
  createdAt: string;
  updatedAt: string;
}