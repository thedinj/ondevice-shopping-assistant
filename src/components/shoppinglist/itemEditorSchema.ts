import { z } from "zod";
import type { StoreAisle, StoreItem, StoreSection } from "../../models/Store";

export const itemFormSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .transform((val) => val.trim()),
    qty: z.number().min(0.01, "Quantity must be greater than 0"),
    unitId: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    aisleId: z.string().nullable().optional(),
    sectionId: z.string().nullable().optional(),
});

export type ItemFormData = z.infer<typeof itemFormSchema>;

export type Aisle = Pick<StoreAisle, "id" | "name">;

export type Section = Pick<StoreSection, "id" | "name" | "aisle_id">;

export type AutocompleteItem = Pick<
    StoreItem,
    "id" | "name" | "aisle_id" | "section_id"
>;
