import { StringToBoolean } from "class-variance-authority/types";
import { CreateReadStreamOptions } from "fs/promises";
import { WeekNumberLabel } from "react-day-picker";

type ConfirmFunctionArgs = {
  user: User;
  text: string;
}

type ConfirmFunction = (args: ConfirmFunctionArgs) => Promise<void> | void


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

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  authorId: number;
  targetUserId: number;
  listingId: number;
}

type PropertyApplication = {
  id: number;
  moveInDate: string;
  moveOutDate: string;
  status: string;
  lastUpdated: string;
  expiryDate?: string;
  createdAt: string;
  userId: number;
  listingId: number;
}

type PropertyListing = {
  id: number;
  title: string;
  description: string;
  rent: number;
  availableFrom: string;
  createdAt: string;
  propertyId: number;
  landlordId: number;
}

type Property = {
  id: number;
  address: string;
  city: string;
  postcode: string;
  bedrooms: number;
  bathrooms: number;
  maxOccupancy: number;
  createdAt: string;
  landlordId: number;
}

type Status = "OPEN" | "UNDER_REVIEW" | "RESOLVED";


type FilterSearchProps = {
  selectedStatuses: Record<Status, boolean>;
  sortField: 'modifiedAt' | 'createdAt';
  sortDirection: 'asc' | 'desc';
};