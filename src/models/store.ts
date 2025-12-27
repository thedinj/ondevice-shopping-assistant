import { PartialPick } from "../db/types";

export const DEFAULT_STORE_NAME = "Unnamed store";

export type Store = {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
};

export type StoreAisle = {
    id: string;
    store_id: string;
    name: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
};

export type StoreSection = {
    id: string;
    store_id: string;
    aisle_id: string;
    name: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
};

export type QuantityUnit = {
    id: string;
    name: string;
    abbreviation: string;
    sort_order: number;
    category: string;
};

export type StoreItem = {
    id: string;
    store_id: string;
    name: string;
    name_norm: string;
    // Only section_id is stored when present; aisle_id is null (aisle derived from section)
    // Only aisle_id is stored when no section specified
    aisle_id: string | null;
    section_id: string | null;
    usage_count: number;
    last_used_at: string | null;
    is_hidden: number;
    is_favorite: number;
    created_at: string;
    updated_at: string;
};

export type ShoppingList = {
    id: string;
    store_id: string;
    title: string | null;
    created_at: string;
    updated_at: string;
    completed_at: string | null;
};

export type ShoppingListItem = {
    id: string;
    list_id: string;
    store_id: string;
    store_item_id: string; // Non-nullable - shopping list items must reference a store item
    qty: number;
    unit_id: string | null;
    notes: string | null;
    is_checked: number;
    checked_at: string | null;
    is_sample: number | null;
    created_at: string;
    updated_at: string;
};

/**
 * Shopping list item input for upsert operations.
 * Only requires user-provided fields; auto-generated fields are handled by the database.
 */
export type ShoppingListItemOptionalId = PartialPick<ShoppingListItem, "id"> &
    Pick<
        ShoppingListItem,
        "list_id" | "store_id" | "store_item_id" | "qty" | "unit_id" | "notes"
    > &
    Partial<Pick<ShoppingListItem, "is_sample">>;

/**
 * Shopping list item with joined store item and location details from the database
 */
export type ShoppingListItemWithDetails = ShoppingListItem & {
    item_name: string; // From store_item.name via JOIN
    unit_abbreviation: string | null; // From quantity_unit.abbreviation via JOIN
    section_id: string | null; // From store_item or section JOIN
    aisle_id: string | null; // From store_item or section's aisle
    section_name: string | null;
    section_sort_order: number | null;
    aisle_name: string | null;
    aisle_sort_order: number | null;
};

/**
 * Store item with joined location details from the database
 */
export type StoreItemWithDetails = StoreItem & {
    aisle_name: string | null;
    aisle_sort_order: number | null;
    section_name: string | null;
    section_sort_order: number | null;
};

export const getInitializedStore = (
    name: string = DEFAULT_STORE_NAME
): Store => {
    return {
        id: crypto.randomUUID(),
        name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
};
