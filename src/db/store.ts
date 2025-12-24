import { Capacitor } from "@capacitor/core";
import { getDb } from ".";
import { getInitializedStore, Store } from "../models/Store";

export const fakeStores: Store[] = [
    getInitializedStore("Unnamed Store (fake)"),
];

export type StoreDatabase = {
    insertStore: (name: string) => Promise<Store>;
    loadAllStores: () => Promise<Store[]>;
};

export const getStoreDatabase = (): StoreDatabase => {
    if (!Capacitor.isNativePlatform()) {
        // Faking -- should check for .env setting later
        return {
            insertStore: fake_insertStore,
            loadAllStores: fake_loadAllStores,
        };
    }

    return {
        insertStore,
        loadAllStores,
    };
};

const loadAllStores = async (): Promise<Store[]> => {
    const db = await getDb();
    if (!db) throw new Error("DB not ready");

    const res = await db.query(
        "SELECT id, name, created_at, updated_at, deleted_at FROM store WHERE deleted_at IS NULL ORDER BY created_at"
    );
    return res.values || [];
};

const insertStore = async (name: string): Promise<Store> => {
    const db = await getDb();
    if (!db) throw new Error("DB not ready");

    const newStore = getInitializedStore(name);
    await db.run(
        "INSERT INTO store (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)",
        [newStore.id, newStore.name, newStore.created_at, newStore.updated_at]
    );
    return newStore;
};

const fake_loadAllStores = async (): Promise<Store[]> => {
    return [...fakeStores];
};

const fake_insertStore = async (name: string): Promise<Store> => {
    const newStore = getInitializedStore(name);
    fakeStores.push(newStore);
    return newStore;
};
