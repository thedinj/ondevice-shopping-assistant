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

export const QUANTITY_UNITS: QuantityUnit[] = [
    {
        id: "gram",
        name: "Gram",
        abbreviation: "g",
        sort_order: 10,
        category: "weight",
    },
    {
        id: "kilogram",
        name: "Kilogram",
        abbreviation: "kg",
        sort_order: 11,
        category: "weight",
    },
    {
        id: "milligram",
        name: "Milligram",
        abbreviation: "mg",
        sort_order: 9,
        category: "weight",
    },
    {
        id: "ounce",
        name: "Ounce",
        abbreviation: "oz",
        sort_order: 12,
        category: "weight",
    },
    {
        id: "pound",
        name: "Pound",
        abbreviation: "lb",
        sort_order: 13,
        category: "weight",
    },
    {
        id: "milliliter",
        name: "Milliliter",
        abbreviation: "ml",
        sort_order: 20,
        category: "volume",
    },
    {
        id: "liter",
        name: "Liter",
        abbreviation: "l",
        sort_order: 21,
        category: "volume",
    },
    {
        id: "fluid-ounce",
        name: "Fluid Ounce",
        abbreviation: "fl oz",
        sort_order: 22,
        category: "volume",
    },
    {
        id: "gallon",
        name: "Gallon",
        abbreviation: "gal",
        sort_order: 23,
        category: "volume",
    },
    {
        id: "cup",
        name: "Cup",
        abbreviation: "cup",
        sort_order: 24,
        category: "volume",
    },
    {
        id: "tablespoon",
        name: "Tablespoon",
        abbreviation: "tbsp",
        sort_order: 25,
        category: "volume",
    },
    {
        id: "teaspoon",
        name: "Teaspoon",
        abbreviation: "tsp",
        sort_order: 26,
        category: "volume",
    },
    {
        id: "count",
        name: "Count",
        abbreviation: "ct",
        sort_order: 30,
        category: "count",
    },
    {
        id: "dozen",
        name: "Dozen",
        abbreviation: "doz",
        sort_order: 31,
        category: "count",
    },
    {
        id: "package",
        name: "Package",
        abbreviation: "pkg",
        sort_order: 40,
        category: "package",
    },
    {
        id: "can",
        name: "Can",
        abbreviation: "can",
        sort_order: 41,
        category: "package",
    },
    {
        id: "box",
        name: "Box",
        abbreviation: "box",
        sort_order: 42,
        category: "package",
    },
    {
        id: "bag",
        name: "Bag",
        abbreviation: "bag",
        sort_order: 43,
        category: "package",
    },
    {
        id: "bottle",
        name: "Bottle",
        abbreviation: "btl",
        sort_order: 44,
        category: "package",
    },
    {
        id: "jar",
        name: "Jar",
        abbreviation: "jar",
        sort_order: 45,
        category: "package",
    },
    {
        id: "bunch",
        name: "Bunch",
        abbreviation: "bunch",
        sort_order: 50,
        category: "other",
    },
];
