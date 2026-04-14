type ConfirmFunctionArgs = {
  user: User;
  text: string;
}

export type ConfirmFunction = (args: ConfirmFunctionArgs) => Promise<void> | void


export type Report = {
  id: number;
  reason: string;
  description: string;
  status: string;
  createdAt: string | Date;
  reporterId: number;
  targetUserId: number;
  listingId: number;
  category?: string;
  severity?: string;
};

export type User = {
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

export type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  authorId: number;
  targetUserId: number;
  listingId: number;
}

export type PropertyApplication = {
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

export type PropertyListing = {
  id: number;
  title: string;
  description: string;
  rent: number;
  availableFrom: string;
  createdAt: string;
  propertyId: number;
  landlordId: number;
}

export type Property = {
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


// types for reports

export type Status = "OPEN" | "UNDER_REVIEW" | "RESOLVED";

export type Severity = "UNRANKED" | "LOW" | "MEDIUM" | "HIGH";

export type Category = "INAPPROPRIATE_CONTENT" | "FRAUD" | "HARASSMENT" | "FAKE_INFORMATION" | "IMPERSONATION" | "OTHER";

export type FilterSearchProps = {
  selectedStatuses: Record<Status, boolean>;
  selectedSeverities: Record<Severity, boolean>;
  selectedCategories: Record<Category, boolean>;
  sortField: 'modifiedAt' | 'createdAt';
  sortDirection: 'asc' | 'desc';
};


type DbReturnType<T> = {
  error: Error | null;
  result: T | null;
}