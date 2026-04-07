import { ApplicationStatus } from "@prisma/client";

export type ApplicationForm={
    moveInDate: Date | null,
    moveOutDate: Date | null,
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    message?: string,// any optional message user wants to say to landlord
}

export type Application = {
  id: number;
  buildingName: string;
  flatNumber?: string;
  listingAddress: string;
  applicantName: string;
  applicantAvatar?: string;
  landlordName?: string;
  landlordAvatar?: string;
  status: ApplicationStatus;
  submittedDate: string;
  lastUpdatedDate?: string;
  expiryDate?: string;
  moveInDate?: string;
  rent: number;
};

// type of what type of data the InputField component should expect
export type InputFieldInput = React.HTMLInputTypeAttribute | "select" | "textarea";

// what each radio button should hold
export type RadioOption<T extends string = string> = {
    label: string;
    value: T;
};
