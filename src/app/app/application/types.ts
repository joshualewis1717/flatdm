export type ApplicationForm={
    name: string,
    email: string,
    phone: string,
    moveInDate: Date | null,
    moveOutDate: Date | null,
    notes?: string,
}

// type of what type of data the InputField component should expect
export type InputFieldInput = React.HTMLInputTypeAttribute | "select" | "textarea";

// what each radio button should hold
export type RadioOption<T extends string = string> = {
    label: string;
    value: T;
};
