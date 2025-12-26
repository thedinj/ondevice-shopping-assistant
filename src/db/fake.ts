import { AppSetting } from "../models/AppSetting";
import {
    getInitializedStore,
    ShoppingList,
    ShoppingListItem,
    ShoppingListItemOptionalId,
    ShoppingListItemWithDetails,
    Store,
    StoreAisle,
    StoreItem,
    StoreSection,
} from "../models/Store";
import { BaseDatabase } from "./base";
import { DEFAULT_TABLES_TO_PERSIST } from "./types";

/**
 * In-memory fake database implementation for browser/development
 */
export class FakeDatabase extends BaseDatabase {
    private stores: Map<string, Store> = new Map();
    private aisles: Map<string, StoreAisle> = new Map();
    private sections: Map<string, StoreSection> = new Map();
    private items: Map<string, StoreItem> = new Map();
    private shoppingLists: Map<string, ShoppingList> = new Map();
    private shoppingListItems: Map<string, ShoppingListItem> = new Map();
    private appSettings: Map<string, AppSetting> = new Map();
    private initialized = false;

    async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        await this.ensureInitialData();
        this.initialized = true;
        this.notifyChange();
    }

    async close(): Promise<void> {
        // Nothing to close for in-memory database
        this.initialized = false;
        this.notifyChange();
    }

    protected async hasStores(): Promise<boolean> {
        return this.stores.size > 0;
    }

    async reset(
        tablesToPersist: string[] = DEFAULT_TABLES_TO_PERSIST
    ): Promise<void> {
        // Clear all data except persisted tables
        if (!tablesToPersist.includes("store")) {
            this.stores.clear();
            this.aisles.clear();
            this.sections.clear();
            this.items.clear();
        }
        if (!tablesToPersist.includes("app_setting")) {
            this.appSettings.clear();
        }

        await this.ensureInitialData();
        this.notifyChange();
    }

    // ========== Store Operations ==========
    async insertStore(name: string): Promise<Store> {
        const newStore = getInitializedStore(name);
        this.stores.set(newStore.id, newStore);
        this.notifyChange();
        return newStore;
    }

    async loadAllStores(): Promise<Store[]> {
        return Array.from(this.stores.values()).sort(
            (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
        );
    }

    async getStoreById(id: string): Promise<Store | null> {
        const store = this.stores.get(id);
        if (!store) {
            return null;
        }
        return store;
    }

    async updateStore(id: string, name: string): Promise<Store> {
        const store = this.stores.get(id);
        if (!store) {
            throw new Error(`Store with id ${id} not found`);
        }

        const updatedStore: Store = {
            ...store,
            name,
            updated_at: new Date().toISOString(),
        };
        this.stores.set(id, updatedStore);
        this.notifyChange();
        return updatedStore;
    }

    async deleteStore(id: string): Promise<void> {
        const store = this.stores.get(id);
        if (!store) {
            return;
        }

        this.stores.delete(id);
        this.notifyChange();
    }

    // ========== App Settings Operations ==========
    async getAppSetting(key: string): Promise<AppSetting | null> {
        return this.appSettings.get(key) || null;
    }

    async setAppSetting(key: string, value: string): Promise<void> {
        const setting: AppSetting = {
            key,
            value,
            updated_at: new Date().toISOString(),
        };
        this.appSettings.set(key, setting);
        this.notifyChange();
    }

    // ========== StoreAisle Operations ==========
    async insertAisle(storeId: string, name: string): Promise<StoreAisle> {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const existingAisles = Array.from(this.aisles.values()).filter(
            (a) => a.store_id === storeId
        );
        const sort_order = existingAisles.length;

        const aisle: StoreAisle = {
            id,
            store_id: storeId,
            name,
            sort_order,
            created_at: now,
            updated_at: now,
        };
        this.aisles.set(id, aisle);
        this.notifyChange();
        return aisle;
    }

    async getAislesByStore(storeId: string): Promise<StoreAisle[]> {
        return Array.from(this.aisles.values())
            .filter((aisle) => aisle.store_id === storeId)
            .sort((a, b) => a.sort_order - b.sort_order);
    }

    async getAisleById(id: string): Promise<StoreAisle | null> {
        const aisle = this.aisles.get(id);
        return aisle ? aisle : null;
    }

    async updateAisle(id: string, name: string): Promise<StoreAisle> {
        const aisle = this.aisles.get(id);
        if (!aisle) {
            throw new Error(`Aisle with id ${id} not found`);
        }

        const updated: StoreAisle = {
            ...aisle,
            name,
            updated_at: new Date().toISOString(),
        };
        this.aisles.set(id, updated);
        this.notifyChange();
        return updated;
    }

    async deleteAisle(id: string): Promise<void> {
        const aisle = this.aisles.get(id);
        if (aisle) {
            this.aisles.delete(id);
            this.notifyChange();
        }
    }

    async reorderAisles(
        updates: Array<{ id: string; sort_order: number }>
    ): Promise<void> {
        const now = new Date().toISOString();
        for (const { id, sort_order } of updates) {
            const aisle = this.aisles.get(id);
            if (aisle) {
                this.aisles.set(id, {
                    ...aisle,
                    sort_order,
                    updated_at: now,
                });
            }
        }
        this.notifyChange();
    }

    // ========== StoreSection Operations ==========
    async insertSection(
        storeId: string,
        name: string,
        aisleId: string
    ): Promise<StoreSection> {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const existingSections = Array.from(this.sections.values()).filter(
            (s) => s.aisle_id === aisleId
        );
        const sort_order = existingSections.length;

        const section: StoreSection = {
            id,
            store_id: storeId,
            aisle_id: aisleId,
            name,
            sort_order,
            created_at: now,
            updated_at: now,
        };
        this.sections.set(id, section);
        this.notifyChange();
        return section;
    }

    async getSectionsByStore(storeId: string): Promise<StoreSection[]> {
        return Array.from(this.sections.values())
            .filter((section) => section.store_id === storeId)
            .sort((a, b) => a.sort_order - b.sort_order);
    }

    async getSectionById(id: string): Promise<StoreSection | null> {
        const section = this.sections.get(id);
        return section ? section : null;
    }

    async updateSection(
        id: string,
        name: string,
        aisleId: string
    ): Promise<StoreSection> {
        const section = this.sections.get(id);
        if (!section) {
            throw new Error(`Section with id ${id} not found`);
        }

        const updated: StoreSection = {
            ...section,
            name,
            aisle_id: aisleId,
            updated_at: new Date().toISOString(),
        };
        this.sections.set(id, updated);
        this.notifyChange();
        return updated;
    }

    async deleteSection(id: string): Promise<void> {
        const section = this.sections.get(id);
        if (section) {
            this.sections.delete(id);
            this.notifyChange();
        }
    }

    async reorderSections(
        updates: Array<{ id: string; sort_order: number }>
    ): Promise<void> {
        const now = new Date().toISOString();
        for (const { id, sort_order } of updates) {
            const section = this.sections.get(id);
            if (section) {
                this.sections.set(id, {
                    ...section,
                    sort_order,
                    updated_at: now,
                });
            }
        }
        this.notifyChange();
    }

    // ========== StoreItem Operations ==========
    async insertItem(
        storeId: string,
        name: string,
        aisleId?: string | null,
        sectionId?: string | null
    ): Promise<StoreItem> {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const name_norm = name.toLowerCase().trim();

        // Normalize: store only section when present (null aisle), else store aisle
        const normalizedAisleId = sectionId ? null : aisleId ?? null;
        const normalizedSectionId = sectionId ?? null;

        const item: StoreItem = {
            id,
            store_id: storeId,
            name,
            name_norm,
            aisle_id: normalizedAisleId,
            section_id: normalizedSectionId,
            usage_count: 0,
            last_used_at: null,
            is_hidden: 0,
            created_at: now,
            updated_at: now,
        };
        this.items.set(id, item);
        this.notifyChange();
        return item;
    }

    async getItemsByStore(storeId: string): Promise<StoreItem[]> {
        return Array.from(this.items.values())
            .filter((item) => item.store_id === storeId && item.is_hidden === 0)
            .sort((a, b) => a.name_norm.localeCompare(b.name_norm));
    }

    async getItemById(id: string): Promise<StoreItem | null> {
        const item = this.items.get(id);
        return item ? item : null;
    }

    async updateItem(
        id: string,
        name: string,
        aisleId?: string | null,
        sectionId?: string | null
    ): Promise<StoreItem> {
        const item = this.items.get(id);
        if (!item) {
            throw new Error(`Item with id ${id} not found`);
        }

        const name_norm = name.toLowerCase().trim();

        // Normalize: store only section when present (null aisle), else store aisle
        const normalizedAisleId = sectionId ? null : aisleId ?? null;
        const normalizedSectionId = sectionId ?? null;

        const updated: StoreItem = {
            ...item,
            name,
            name_norm,
            aisle_id: normalizedAisleId,
            section_id: normalizedSectionId,
            updated_at: new Date().toISOString(),
        };
        this.items.set(id, updated);
        this.notifyChange();
        return updated;
    }

    async deleteItem(id: string): Promise<void> {
        const item = this.items.get(id);
        if (item) {
            this.items.delete(id);
            this.notifyChange();
        }
    }

    async searchStoreItems(
        storeId: string,
        searchTerm: string,
        limit: number = 10
    ): Promise<StoreItem[]> {
        const searchNorm = searchTerm.toLowerCase().trim();
        return Array.from(this.items.values())
            .filter(
                (item) =>
                    item.store_id === storeId &&
                    item.is_hidden === 0 &&
                    item.name_norm.startsWith(searchNorm)
            )
            .sort((a, b) => {
                // Sort by usage_count desc, last_used_at desc, then name
                if (b.usage_count !== a.usage_count) {
                    return b.usage_count - a.usage_count;
                }
                if (a.last_used_at && b.last_used_at) {
                    return (
                        new Date(b.last_used_at).getTime() -
                        new Date(a.last_used_at).getTime()
                    );
                }
                return a.name_norm.localeCompare(b.name_norm);
            })
            .slice(0, limit);
    }

    // ========== ShoppingList Operations ==========
    async getOrCreateShoppingListForStore(
        storeId: string
    ): Promise<ShoppingList> {
        // Find active list
        const activeList = Array.from(this.shoppingLists.values()).find(
            (list) => list.store_id === storeId && !list.completed_at
        );

        if (activeList) {
            return activeList;
        }

        // Create new list
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const newList: ShoppingList = {
            id,
            store_id: storeId,
            title: null,
            created_at: now,
            updated_at: now,
            completed_at: null,
        };
        this.shoppingLists.set(id, newList);
        this.notifyChange();
        return newList;
    }

    async getShoppingListItemsGrouped(
        listId: string
    ): Promise<ShoppingListItemWithDetails[]> {
        const items = Array.from(this.shoppingListItems.values())
            .filter((item) => item.list_id === listId)
            .map((item) => {
                // Join with store_item
                const storeItem = this.items.get(item.store_item_id);
                if (!storeItem) {
                    throw new Error(
                        `Store item ${item.store_item_id} not found for shopping list item ${item.id}`
                    );
                }

                // Join with section and aisle from store_item
                const section = storeItem.section_id
                    ? this.sections.get(storeItem.section_id)
                    : null;
                // Prefer section's aisle_id over item's direct aisle_id
                const calculatedAisleId =
                    section?.aisle_id ?? storeItem.aisle_id ?? null;
                const aisle = calculatedAisleId
                    ? this.aisles.get(calculatedAisleId)
                    : null;

                return {
                    ...item,
                    item_name: storeItem.name,
                    section_id: section?.id ?? null,
                    aisle_id: calculatedAisleId,
                    section_name: section?.name ?? null,
                    section_sort_order: section?.sort_order ?? null,
                    aisle_name: aisle?.name ?? null,
                    aisle_sort_order: aisle?.sort_order ?? null,
                } as ShoppingListItemWithDetails;
            })
            .sort((a, b) => {
                // Sort by: is_checked, aisle, section, item name
                if (a.is_checked !== b.is_checked) {
                    return a.is_checked - b.is_checked;
                }
                const aAisleOrder = a.aisle_sort_order ?? 999999;
                const bAisleOrder = b.aisle_sort_order ?? 999999;
                if (aAisleOrder !== bAisleOrder) {
                    return aAisleOrder - bAisleOrder;
                }
                const aSectionOrder = a.section_sort_order ?? 999999;
                const bSectionOrder = b.section_sort_order ?? 999999;
                if (aSectionOrder !== bSectionOrder) {
                    return aSectionOrder - bSectionOrder;
                }
                return a.item_name.localeCompare(b.item_name);
            });

        return items;
    }

    async getOrCreateStoreItemByName(
        storeId: string,
        name: string,
        aisleId?: string | null,
        sectionId?: string | null
    ): Promise<StoreItem> {
        const now = new Date().toISOString();
        const name_norm = name.toLowerCase().trim();

        // Try to find existing item
        const existingItem = Array.from(this.items.values()).find(
            (item) => item.store_id === storeId && item.name_norm === name_norm
        );

        if (existingItem) {
            // Update usage count, last_used_at, and location if provided
            const normalizedAisleId = sectionId
                ? null
                : aisleId ?? existingItem.aisle_id;
            const normalizedSectionId = sectionId ?? existingItem.section_id;

            const updatedItem: StoreItem = {
                ...existingItem,
                usage_count: existingItem.usage_count + 1,
                last_used_at: now,
                aisle_id: normalizedAisleId,
                section_id: normalizedSectionId,
                updated_at: now,
            };
            this.items.set(existingItem.id, updatedItem);
            this.notifyChange();
            return updatedItem;
        } else {
            // Create new item
            return await this.insertItem(storeId, name, aisleId, sectionId);
        }
    }

    async upsertShoppingListItem(
        params: ShoppingListItemOptionalId
    ): Promise<ShoppingListItem> {
        const now = new Date().toISOString();

        if (params.id) {
            // Update existing shopping list item
            const existing = this.shoppingListItems.get(params.id);
            if (!existing) {
                throw new Error(`Shopping list item ${params.id} not found`);
            }

            const updated: ShoppingListItem = {
                ...existing,
                store_item_id: params.store_item_id,
                qty: params.qty,
                notes: params.notes,
                updated_at: now,
            };
            this.shoppingListItems.set(params.id, updated);
            this.notifyChange();
            return updated;
        } else {
            // Create new shopping list item
            const id = crypto.randomUUID();

            const newItem: ShoppingListItem = {
                id,
                list_id: params.list_id,
                store_id: params.store_id,
                store_item_id: params.store_item_id,
                qty: params.qty,
                notes: params.notes,
                is_checked: 0,
                checked_at: null,
                created_at: now,
                updated_at: now,
            };
            this.shoppingListItems.set(id, newItem);
            this.notifyChange();
            return newItem;
        }
    }

    async toggleShoppingListItemChecked(
        id: string,
        isChecked: boolean
    ): Promise<void> {
        const item = this.shoppingListItems.get(id);
        if (item) {
            const now = new Date().toISOString();
            this.shoppingListItems.set(id, {
                ...item,
                is_checked: isChecked ? 1 : 0,
                checked_at: isChecked ? now : null,
                updated_at: now,
            });
            this.notifyChange();
        }
    }

    async deleteShoppingListItem(id: string): Promise<void> {
        const item = this.shoppingListItems.get(id);
        if (item) {
            this.shoppingListItems.delete(id);
            this.notifyChange();
        }
    }

    async clearCheckedShoppingListItems(listId: string): Promise<void> {
        const items = Array.from(this.shoppingListItems.values()).filter(
            (item) => item.list_id === listId && item.is_checked === 1
        );

        for (const item of items) {
            this.shoppingListItems.delete(item.id);
        }

        this.notifyChange();
    }
}
