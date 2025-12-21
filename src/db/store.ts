import { getDb } from ".";
import { getInitializedStore, Store } from "../models/Store";

export const loadAllStores = async (): Promise<Store[]> => {
    const db = await getDb();
    if (!db) throw new Error("DB not ready");

    const res = await db.query(
        "SELECT id, name, created_at, updated_at, deleted_at FROM store WHERE deleted_at IS NULL ORDER BY created_at"
    );
    return res.values || [];
};

export const insertStore = async (name: string): Promise<Store> => {
    const db = await getDb();
    if (!db) throw new Error("DB not ready");

    const newStore = getInitializedStore(name);
    await db.run(
        "INSERT INTO store (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)",
        [newStore.id, newStore.name, newStore.created_at, newStore.updated_at]
    );
    return newStore;
};
