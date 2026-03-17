export type ApplicationForm={
    name: string,
    email: string,
    phone: string,
    moveInDate: Date | null,
    moveOutDate: Date | null,
    notes?: string,
}