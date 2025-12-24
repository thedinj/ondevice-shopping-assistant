import { Database, DEFAULT_TABLES_TO_PERSIST } from "./types";
import { BaseDatabase } from "./base";
import { Store, getInitializedStore } from "../models/Store";
import { AppSetting } from "../models/AppSetting";

/**
 * In-memory fake database implementation for browser/development
 */
export class FakeDatabase extends BaseDatabase implements Database {
    private stores: Map<string, Store> = new Map();
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
}
