import {
    CapacitorSQLite,
    SQLiteConnection,
    SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import { Capacitor } from "@capacitor/core";
import { getInitializedStore } from "../models/Store";
import { fakeStores } from "./store";

export const DB_NAME = "shopping_assistant";
const DB_VERSION = 1;

const sqlite = new SQLiteConnection(CapacitorSQLite);

let initDbPromise: Promise<SQLiteDBConnection | null> | null = null;
let initializedDbConnection: SQLiteDBConnection | null = null;

const migrations: Array<{ version: number; up: string[] }> = [
    {
        version: 1,
        up: [
            `PRAGMA foreign_keys = ON;`,

            `CREATE TABLE IF NOT EXISTS app_setting (
         key TEXT PRIMARY KEY,
         value TEXT NOT NULL,
         updated_at TEXT NOT NULL DEFAULT (datetime('now'))
       );`,

            `CREATE TABLE IF NOT EXISTS store (
         id TEXT PRIMARY KEY,
         name TEXT NOT NULL,
         created_at TEXT NOT NULL DEFAULT (datetime('now')),
         updated_at TEXT NOT NULL DEFAULT (datetime('now')),
         deleted_at TEXT
       );`,

            `CREATE TABLE IF NOT EXISTS store_aisle (
         id TEXT PRIMARY KEY,
         store_id TEXT NOT NULL,
         name TEXT NOT NULL,
         sort_order INTEGER NOT NULL DEFAULT 0,
         created_at TEXT NOT NULL DEFAULT (datetime('now')),
         updated_at TEXT NOT NULL DEFAULT (datetime('now')),
         deleted_at TEXT,
         FOREIGN KEY (store_id) REFERENCES store(id) ON DELETE CASCADE
       );`,

            `CREATE TABLE IF NOT EXISTS store_section (
         id TEXT PRIMARY KEY,
         store_id TEXT NOT NULL,
         aisle_id TEXT,
         name TEXT NOT NULL,
         sort_order INTEGER NOT NULL DEFAULT 0,
         created_at TEXT NOT NULL DEFAULT (datetime('now')),
         updated_at TEXT NOT NULL DEFAULT (datetime('now')),
         deleted_at TEXT,
         FOREIGN KEY (store_id) REFERENCES store(id) ON DELETE CASCADE,
         FOREIGN KEY (aisle_id) REFERENCES store_aisle(id) ON DELETE SET NULL
       );`,

            `CREATE TABLE IF NOT EXISTS store_item (
         id TEXT PRIMARY KEY,
         store_id TEXT NOT NULL,
         name TEXT NOT NULL,
         name_norm TEXT NOT NULL,
         section_id TEXT,
         default_qty REAL NOT NULL DEFAULT 1,
         notes TEXT,
         last_used_at TEXT,
         is_hidden INTEGER NOT NULL DEFAULT 0,
         created_at TEXT NOT NULL DEFAULT (datetime('now')),
         updated_at TEXT NOT NULL DEFAULT (datetime('now')),
         deleted_at TEXT,
         FOREIGN KEY (store_id) REFERENCES store(id) ON DELETE CASCADE,
         FOREIGN KEY (section_id) REFERENCES store_section(id) ON DELETE SET NULL
       );`,

            `CREATE UNIQUE INDEX IF NOT EXISTS ux_store_item_store_norm
         ON store_item(store_id, name_norm)
         WHERE deleted_at IS NULL;`,

            `CREATE TABLE IF NOT EXISTS shopping_list (
         id TEXT PRIMARY KEY,
         store_id TEXT NOT NULL,
         title TEXT,
         created_at TEXT NOT NULL DEFAULT (datetime('now')),
         updated_at TEXT NOT NULL DEFAULT (datetime('now')),
         completed_at TEXT,
         deleted_at TEXT,
         FOREIGN KEY (store_id) REFERENCES store(id) ON DELETE CASCADE
       );`,

            `CREATE TABLE IF NOT EXISTS shopping_list_item (
         id TEXT PRIMARY KEY,
         list_id TEXT NOT NULL,
         store_id TEXT NOT NULL,
         store_item_id TEXT,
         name TEXT NOT NULL,
         name_norm TEXT NOT NULL,
         qty REAL NOT NULL DEFAULT 1,
         notes TEXT,
         section_id TEXT,
         section_name_snap TEXT,
         aisle_id TEXT,
         aisle_name_snap TEXT,
         is_checked INTEGER NOT NULL DEFAULT 0,
         checked_at TEXT,
         created_at TEXT NOT NULL DEFAULT (datetime('now')),
         updated_at TEXT NOT NULL DEFAULT (datetime('now')),
         deleted_at TEXT,
         FOREIGN KEY (list_id) REFERENCES shopping_list(id) ON DELETE CASCADE,
         FOREIGN KEY (store_id) REFERENCES store(id) ON DELETE CASCADE,
         FOREIGN KEY (store_item_id) REFERENCES store_item(id) ON DELETE SET NULL,
         FOREIGN KEY (section_id) REFERENCES store_section(id) ON DELETE SET NULL,
         FOREIGN KEY (aisle_id) REFERENCES store_aisle(id) ON DELETE SET NULL
       );`,

            `CREATE INDEX IF NOT EXISTS ix_list_item_list_checked
         ON shopping_list_item(list_id, is_checked, updated_at);`,
        ],
    },
];

export async function getUserVersion(
    conn: SQLiteDBConnection
): Promise<number> {
    const res = await conn.query(`PRAGMA user_version;`);
    return (res.values?.[0]?.user_version as number) ?? 0;
}

export async function setUserVersion(conn: SQLiteDBConnection, v: number) {
    await conn.execute(`PRAGMA user_version = ${v};`);
}

async function runMigrations(conn: SQLiteDBConnection) {
    const current = await getUserVersion(conn);

    const pending = migrations
        .filter((m) => m.version > current)
        .sort((a, b) => a.version - b.version);
    if (!pending.length) return;

    for (const m of pending) {
        for (const stmt of m.up) await conn.execute(stmt);
        await setUserVersion(conn, m.version);
    }
}

const ensureOneStore = async (
    conn?: SQLiteDBConnection | null
): Promise<undefined> => {
    const connToUse = conn ?? (await getDb());
    if (!connToUse) {
        throw new Error("Database not initialized");
    }

    const storeCountRes = await connToUse.query(
        "SELECT COUNT(*) as count FROM store WHERE deleted_at IS NULL"
    );
    if (!storeCountRes.values?.[0]?.count) {
        const newStoreName = `Unnamed Store ${Math.random()}`;
        const newStore = getInitializedStore(newStoreName);
        await connToUse.run(
            "INSERT INTO store (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)",
            [
                newStore.id,
                newStore.name,
                newStore.created_at,
                newStore.updated_at,
            ]
        );
    }
};

export function getDb(): Promise<SQLiteDBConnection | null> {
    if (!Capacitor.isNativePlatform()) {
        //throw new Error("SQLite only available on native platforms");
        return Promise.resolve(null);
    }

    if (initializedDbConnection) {
        return Promise.resolve(initializedDbConnection);
    }
    if (initDbPromise) {
        return initDbPromise;
    }

    initDbPromise = (async () => {
        const conn = await sqlite.createConnection(
            DB_NAME,
            false,
            "no-encryption",
            DB_VERSION,
            false
        );
        await conn.open();

        await runMigrations(conn); // must not be called anywhere else

        // Insert initial store if none exist
        await ensureOneStore(conn);

        initializedDbConnection = conn;
        initDbPromise = null; // clear promise on success
        return conn;
    })();

    return initDbPromise;
}

// TODO: Do we need to be doing this when exiting the app? Capacitor lifecycle events?
export const closeDb = async (): Promise<void> => {
    // TODO: This is a bit of a hack, but it's the best we can do for now
    if (!initializedDbConnection) {
        if (initDbPromise) {
            // Special case: we are still initializing the db, wait for it to finish
            await initDbPromise;

            // REALLY not expected, but if we still don't have a connection after waiting, just return
            if (!initializedDbConnection) {
                initDbPromise = null; // clear promise on failure
                return; // If we still don't have a connection after waiting, just return
            }
        } else {
            return;
        }
    }

    await initializedDbConnection.close();
    await sqlite.closeConnection(DB_NAME, false);
    initializedDbConnection = null;
    initDbPromise = null;
};

export async function resetDatabase(
    tablesToPersist: string[] = ["app_setting"]
): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
        // TODO: We need to move all of the mock browser stuff to a separate file
        fakeStores.length = 0;
        fakeStores.push(
            getInitializedStore("Unnamed Store (fake), from resetDatabase")
        );
        return;
    }

    const db = await getDb();
    if (!db) {
        throw new Error("Failed to open database");
    }

    const tablesToDelete = [
        "shopping_list_item",
        "shopping_list",
        "store_item",
        "store_section",
        "store_aisle",
        "store",
        "app_setting",
    ].filter((t) => !tablesToPersist.includes(t));
    for (const t of tablesToDelete) {
        await db.execute(`DELETE FROM ${t};`);
    }

    // Insert initial store if none exist
    await ensureOneStore();
}
