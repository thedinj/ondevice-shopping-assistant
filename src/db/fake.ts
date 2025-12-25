import { Database, DEFAULT_TABLES_TO_PERSIST } from "./types";
import { BaseDatabase } from "./base";
import {
    Store,
    StoreAisle,
    StoreSection,
    StoreItem,
    getInitializedStore,
} from "../models/Store";
import { AppSetting } from "../models/AppSetting";

/**
 * In-memory fake database implementation for browser/development
 */
export class FakeDatabase extends BaseDatabase implements Database {
    private stores: Map<string, Store> = new Map();
    private aisles: Map<string, StoreAisle> = new Map();
    private sections: Map<string, StoreSection> = new Map();
    private items: Map<string, StoreItem> = new Map();
    private appSettings: Map<string, AppSetting> = new Map();
    private initialized = false;

    async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        // Initialize with one store
        const initialStore = getInitializedStore("Unnamed Store (Browser)");
        this.stores.set(initialStore.id, initialStore);

        this.initialized = true;
        this.notifyChange();
    }

    async close(): Promise<void> {
        // Nothing to close for in-memory database
        this.initialized = false;
        this.notifyChange();
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

        // Ensure at least one store exists
        if (this.stores.size === 0) {
            const newStore = getInitializedStore(
                "Unnamed Store (Browser), after reset"
            );
            this.stores.set(newStore.id, newStore);
        }

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
        return Array.from(this.stores.values())
            .filter((store) => !store.deleted_at)
            .sort(
                (a, b) =>
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime()
            );
    }

    async getStoreById(id: string): Promise<Store | null> {
        const store = this.stores.get(id);
        if (!store || store.deleted_at) {
            return null;
        }
        return store;
    }

    async updateStore(id: string, name: string): Promise<Store> {
        const store = this.stores.get(id);
        if (!store || store.deleted_at) {
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
        if (!store || store.deleted_at) {
            return;
        }

        const deletedStore: Store = {
            ...store,
            deleted_at: new Date().toISOString(),
        };
        this.stores.set(id, deletedStore);
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
            (a) => a.store_id === storeId && !a.deleted_at
        );
        const sort_order = existingAisles.length;

        const aisle: StoreAisle = {
            id,
            store_id: storeId,
            name,
            sort_order,
            created_at: now,
            updated_at: now,
            deleted_at: null,
        };
        this.aisles.set(id, aisle);
        this.notifyChange();
        return aisle;
    }

    async getAislesByStore(storeId: string): Promise<StoreAisle[]> {
        return Array.from(this.aisles.values())
            .filter((aisle) => aisle.store_id === storeId && !aisle.deleted_at)
            .sort((a, b) => a.sort_order - b.sort_order);
    }

    async getAisleById(id: string): Promise<StoreAisle | null> {
        const aisle = this.aisles.get(id);
        return aisle && !aisle.deleted_at ? aisle : null;
    }

    async updateAisle(id: string, name: string): Promise<StoreAisle> {
        const aisle = this.aisles.get(id);
        if (!aisle || aisle.deleted_at) {
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
        if (aisle && !aisle.deleted_at) {
            this.aisles.set(id, {
                ...aisle,
                deleted_at: new Date().toISOString(),
            });
            this.notifyChange();
        }
    }

    async reorderAisles(
        updates: Array<{ id: string; sort_order: number }>
    ): Promise<void> {
        const now = new Date().toISOString();
        for (const { id, sort_order } of updates) {
            const aisle = this.aisles.get(id);
            if (aisle && !aisle.deleted_at) {
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
            (s) => s.aisle_id === aisleId && !s.deleted_at
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
            deleted_at: null,
        };
        this.sections.set(id, section);
        this.notifyChange();
        return section;
    }

    async getSectionsByStore(storeId: string): Promise<StoreSection[]> {
        return Array.from(this.sections.values())
            .filter(
                (section) => section.store_id === storeId && !section.deleted_at
            )
            .sort((a, b) => a.sort_order - b.sort_order);
    }

    async getSectionById(id: string): Promise<StoreSection | null> {
        const section = this.sections.get(id);
        return section && !section.deleted_at ? section : null;
    }

    async updateSection(
        id: string,
        name: string,
        aisleId: string
    ): Promise<StoreSection> {
        const section = this.sections.get(id);
        if (!section || section.deleted_at) {
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
        if (section && !section.deleted_at) {
            this.sections.set(id, {
                ...section,
                deleted_at: new Date().toISOString(),
            });
            this.notifyChange();
        }
    }

    async reorderSections(
        updates: Array<{ id: string; sort_order: number }>
    ): Promise<void> {
        const now = new Date().toISOString();
        for (const { id, sort_order } of updates) {
            const section = this.sections.get(id);
            if (section && !section.deleted_at) {
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
        defaultQty: number,
        notes?: string | null,
        sectionId?: string | null
    ): Promise<StoreItem> {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const name_norm = name.toLowerCase().trim();

        const item: StoreItem = {
            id,
            store_id: storeId,
            name,
            name_norm,
            section_id: sectionId ?? null,
            default_qty: defaultQty,
            notes: notes ?? null,
            usage_count: 0,
            last_used_at: null,
            is_hidden: 0,
            created_at: now,
            updated_at: now,
            deleted_at: null,
        };
        this.items.set(id, item);
        this.notifyChange();
        return item;
    }

    async getItemsByStore(storeId: string): Promise<StoreItem[]> {
        return Array.from(this.items.values())
            .filter(
                (item) =>
                    item.store_id === storeId &&
                    !item.deleted_at &&
                    item.is_hidden === 0
            )
            .sort((a, b) => a.name_norm.localeCompare(b.name_norm));
    }

    async getItemById(id: string): Promise<StoreItem | null> {
        const item = this.items.get(id);
        return item && !item.deleted_at ? item : null;
    }

    async updateItem(
        id: string,
        name: string,
        defaultQty: number,
        notes?: string | null,
        sectionId?: string | null
    ): Promise<StoreItem> {
        const item = this.items.get(id);
        if (!item || item.deleted_at) {
            throw new Error(`Item with id ${id} not found`);
        }

        const name_norm = name.toLowerCase().trim();
        const updated: StoreItem = {
            ...item,
            name,
            name_norm,
            default_qty: defaultQty,
            notes: notes ?? null,
            section_id: sectionId ?? null,
            updated_at: new Date().toISOString(),
        };
        this.items.set(id, updated);
        this.notifyChange();
        return updated;
    }

    async deleteItem(id: string): Promise<void> {
        const item = this.items.get(id);
        if (item && !item.deleted_at) {
            this.items.set(id, {
                ...item,
                deleted_at: new Date().toISOString(),
            });
            this.notifyChange();
        }
    }
}
