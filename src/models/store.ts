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

export type StoreItem = {
    id: string;
    store_id: string;
    name: string;
    name_norm: string;
    aisle_id: string | null;
    section_id: string | null;
    usage_count: number;
    last_used_at: string | null;
    is_hidden: number;
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
    store_item_id: string | null;
    name: string;
    name_norm: string;
    qty: number;
    notes: string | null;
    section_id: string | null;
    section_name_snap: string | null;
    aisle_id: string | null;
    aisle_name_snap: string | null;
    is_checked: number;
    checked_at: string | null;
    created_at: string;
    updated_at: string;
};

/**
 * Shopping list item input for upsert operations.
 * Only requires user-provided fields; auto-generated fields are handled by the database.
 */
export type ShoppingListItemOptionalId = PartialPick<
    ShoppingListItem,
    "id"
> &
    Pick<
        ShoppingListItem,
        "list_id" | "store_id" | "name" | "qty" | "notes" | "aisle_id" | "section_id"
    >;

/**
 * Shopping list item with joined aisle and section details from the database
 */
export type ShoppingListItemWithDetails = ShoppingListItem & {
    section_name: string | null;
    section_sort_order: number | null;
    aisle_name: string | null;
    aisle_sort_order: number | null;
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
