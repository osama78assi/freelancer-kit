import type {
    CreateFreelanceServiceBody,
    FreelanceService,
    UpdateFreelanceServiceBody,
} from "../../api/types";

// What the form sends up: every field when adding, only the changed ones when updating
// (parentServiceId is always included when the service has one)
export type FreelanceServiceFormValues = Partial<CreateFreelanceServiceBody>;

// What the form keeps in its state while the user types
export interface FreelanceServiceFormState {
    title: string;
    content: string;
    price: number | null;
    currency: string | undefined;
    // Never shown to the user, only used when adding an additional service
    parentServiceId: string | undefined;
}

export type FreelanceServiceFormErrors = Partial<
    Record<"title" | "content" | "price" | "currency", string>
>;

export interface FreelanceServiceFormProps {
    // Current values when updating, or { parentServiceId } when adding an additional service
    data?: Partial<FreelanceService>;
    isUpdate?: boolean;
    onSubmit: (values: FreelanceServiceFormValues) => Promise<void>;
}

export interface AddFreelanceServiceProps {
    onSuccessAdding: () => void;
    className?: string;
}

// The parent handlers return true on success so the modal knows when to close
export interface FreelanceServiceActionsProps {
    service: FreelanceService;
    onDelete: (id: string) => Promise<void>;
    onUpdate: (
        id: string,
        changes: UpdateFreelanceServiceBody,
    ) => Promise<boolean>;
    onAddAdditional: (values: CreateFreelanceServiceBody) => Promise<boolean>;
}

export interface FreelanceTableProps {
    onSearchDone: () => void;
    query: string | null;
}
