import {
    CapacitorSQLite,
    SQLiteConnection,
    SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import { Capacitor } from "@capacitor/core";
import { insertStore } from "./store";

export const DB_NAME = "shopping_assistant";
const DB_VERSION = 1;

const sqlite = new SQLiteConnection(CapacitorSQLite);

let db: SQLiteDBConnection | null = null;
let dbReadyPromise: Promise<void> | null = null;

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

async function getUserVersion(conn: SQLiteDBConnection): Promise<number> {
    const res = await conn.query(`PRAGMA user_version;`);
    return (res.values?.[0]?.user_version as number) ?? 0;
}

async function setUserVersion(conn: SQLiteDBConnection, v: number) {
    await conn.execute(`PRAGMA user_version = ${v};`);
}

async function runMigrations(conn: SQLiteDBConnection) {
    const current = await getUserVersion(conn);
    const pending = migrations
        .filter((m) => m.version > current)
        .sort((a, b) => a.version - b.version);
    if (!pending.length) return;

    await conn.execute("BEGIN;");
    try {
        for (const m of pending) {
            for (const stmt of m.up) await conn.execute(stmt);
            await setUserVersion(conn, m.version);
        }
        await conn.execute("COMMIT;");
    } catch (e) {
        await conn.execute("ROLLBACK;");
        throw e;
    }
}

export async function getDb(): Promise<SQLiteDBConnection | null> {
    if (db) {
        // Already have our singleton
        return db;
    }

    if (!Capacitor.isNativePlatform()) {
        //throw new Error("SQLite only available on native platforms");
        return null;
    }

    db = await sqlite.createConnection(
        DB_NAME,
        false,
        "no-encryption",
        DB_VERSION,
        false
    );
    await db.open();
    await db.execute("PRAGMA foreign_keys = ON;");
    await runMigrations(db);

    // Insert initial store if none exist
    const storeCountRes = await db.query(
        "SELECT COUNT(*) as count FROM store WHERE deleted_at IS NULL"
    );
    if (!storeCountRes.values?.[0]?.count) {
        await insertStore("Unnamed Store");
    }

    return db;
}

export function ensureDbReady(): Promise<void> {
    if (!dbReadyPromise) {
        dbReadyPromise = getDb().then(() => undefined);
    }
    return dbReadyPromise;
}
