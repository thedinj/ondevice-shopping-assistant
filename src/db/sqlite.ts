import {
    CapacitorSQLite,
    SQLiteConnection,
    SQLiteDBConnection,
} from "@capacitor-community/sqlite";
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

const DB_NAME = "shopping_assistant";
const DB_VERSION = 1;

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
         aisle_id TEXT NOT NULL,
         name TEXT NOT NULL,
         sort_order INTEGER NOT NULL DEFAULT 0,
         created_at TEXT NOT NULL DEFAULT (datetime('now')),
         updated_at TEXT NOT NULL DEFAULT (datetime('now')),
         deleted_at TEXT,
         FOREIGN KEY (store_id) REFERENCES store(id) ON DELETE CASCADE,
         FOREIGN KEY (aisle_id) REFERENCES store_aisle(id) ON DELETE CASCADE
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

/**
 * SQLite implementation of the Database interface
 */
export class SQLiteDatabase extends BaseDatabase implements Database {
    private sqlite: SQLiteConnection;
    private connection: SQLiteDBConnection | null = null;
    private initPromise: Promise<void> | null = null;

    constructor() {
        super();
        this.sqlite = new SQLiteConnection(CapacitorSQLite);
    }

    private async getUserVersion(conn: SQLiteDBConnection): Promise<number> {
        const res = await conn.query(`PRAGMA user_version;`);
        return (res.values?.[0]?.user_version as number) ?? 0;
    }

    private async setUserVersion(conn: SQLiteDBConnection, v: number) {
        await conn.execute(`PRAGMA user_version = ${v};`);
    }

    private async runMigrations(conn: SQLiteDBConnection) {
        const current = await this.getUserVersion(conn);

        const pending = migrations
            .filter((m) => m.version > current)
            .sort((a, b) => a.version - b.version);
        if (!pending.length) return;

        for (const m of pending) {
            for (const stmt of m.up) await conn.execute(stmt);
            await this.setUserVersion(conn, m.version);
        }
    }

    private async getConnection(): Promise<SQLiteDBConnection> {
        if (this.connection) {
            return this.connection;
        }

        if (this.initPromise) {
            await this.initPromise;
            if (!this.connection) {
                throw new Error("Failed to initialize database connection");
            }
            return this.connection;
        }

        throw new Error("Database not initialized. Call initialize() first.");
    }

    async initialize(): Promise<void> {
        if (this.connection) {
            return; // Already initialized
        }

        if (this.initPromise) {
            return this.initPromise; // Already initializing
        }

        this.initPromise = (async () => {
            let conn: SQLiteDBConnection | null = null;
            try {
                conn = await this.sqlite.createConnection(
                    DB_NAME,
                    false,
                    "no-encryption",
                    DB_VERSION,
                    false
                );
                await conn.open();
                await this.runMigrations(conn);

                const initStoreName = `Unnamed store init ${Math.random()}`;
                await this.ensureOneStore(conn, initStoreName);

                this.connection = conn;
            } catch (err) {
                if (conn) {
                    try {
                        await conn.close();
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    } catch (err) {
                        // Ignore close errors during cleanup
                    }
                }
                throw err;
            } finally {
                this.initPromise = null;
                this.notifyChange();
            }
        })();

        return this.initPromise;
    }

    async close(): Promise<void> {
        if (!this.connection) {
            if (this.initPromise) {
                await this.initPromise;
                if (!this.connection) {
                    this.initPromise = null;
                    return;
                }
            } else {
                return;
            }
        }

        await this.connection.close();
        await this.sqlite.closeConnection(DB_NAME, false);
        this.connection = null;
        this.initPromise = null;
        this.notifyChange();
    }

    async reset(
        tablesToPersist: string[] = DEFAULT_TABLES_TO_PERSIST
    ): Promise<void> {
        const conn = await this.getConnection();

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
            await conn.execute(`DELETE FROM ${t};`);
        }

        await this.ensureOneStore(
            conn,
            `Unnamed store after reset ${Math.random()}`
        );
        this.notifyChange();
    }

    private async ensureOneStore(
        conn?: SQLiteDBConnection,
        name?: string
    ): Promise<void> {
        const connToUse = conn ?? (await this.getConnection());

        const storeCountRes = await connToUse.query(
            "SELECT COUNT(*) as count FROM store WHERE deleted_at IS NULL"
        );
        const count = storeCountRes.values?.[0]?.count ?? 0;
        if (!count) {
            const nameToUse = name ?? "Unnamed Store";
            await this.insertStore(nameToUse, connToUse);
        }
    }

    // ========== Store Operations ==========
    async insertStore(name: string, conn?: SQLiteDBConnection): Promise<Store> {
        const connToUse = conn ?? (await this.getConnection());
        const newStore = getInitializedStore(name);

        await connToUse.run(
            "INSERT INTO store (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)",
            [
                newStore.id,
                newStore.name,
                newStore.created_at,
                newStore.updated_at,
            ]
        );
        this.notifyChange();
        return newStore;
    }

    async loadAllStores(): Promise<Store[]> {
        const conn = await this.getConnection();
        const res = await conn.query(
            "SELECT id, name, created_at, updated_at, deleted_at FROM store WHERE deleted_at IS NULL ORDER BY created_at"
        );
        return res.values || [];
    }

    async getStoreById(id: string): Promise<Store | null> {
        const conn = await this.getConnection();
        const res = await conn.query(
            "SELECT id, name, created_at, updated_at, deleted_at FROM store WHERE id = ? AND deleted_at IS NULL",
            [id]
        );
        return res.values?.[0] || null;
    }

    async updateStore(id: string, name: string): Promise<Store> {
        const conn = await this.getConnection();
        const updated_at = new Date().toISOString();

        await conn.run(
            "UPDATE store SET name = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL",
            [name, updated_at, id]
        );

        const store = await this.getStoreById(id);
        if (!store) {
            throw new Error(`Store with id ${id} not found`);
        }
        this.notifyChange();
        return store;
    }

    async deleteStore(id: string): Promise<void> {
        const conn = await this.getConnection();
        const deleted_at = new Date().toISOString();

        await conn.run(
            "UPDATE store SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL",
            [deleted_at, id]
        );
        this.notifyChange();
    }

    // ========== App Settings Operations ==========
    async getAppSetting(key: string): Promise<AppSetting | null> {
        const conn = await this.getConnection();
        const res = await conn.query(
            "SELECT key, value, updated_at FROM app_setting WHERE key = ?",
            [key]
        );
        return res.values?.[0] || null;
    }

    async setAppSetting(key: string, value: string): Promise<void> {
        const conn = await this.getConnection();
        const updated_at = new Date().toISOString();

        await conn.run(
            `INSERT INTO app_setting (key, value, updated_at) 
             VALUES (?, ?, ?)
             ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?`,
            [key, value, updated_at, value, updated_at]
        );
        this.notifyChange();
    }

    // ========== StoreAisle Operations ==========
    async insertAisle(storeId: string, name: string): Promise<StoreAisle> {
        const conn = await this.getConnection();
        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        // Get max sort_order for this store
        const maxRes = await conn.query(
            "SELECT COALESCE(MAX(sort_order), -1) as max_order FROM store_aisle WHERE store_id = ? AND deleted_at IS NULL",
            [storeId]
        );
        const sort_order = (maxRes.values?.[0]?.max_order ?? -1) + 1;

        await conn.run(
            "INSERT INTO store_aisle (id, store_id, name, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            [id, storeId, name, sort_order, now, now]
        );

        this.notifyChange();
        return {
            id,
            store_id: storeId,
            name,
            sort_order,
            created_at: now,
            updated_at: now,
            deleted_at: null,
        };
    }

    async getAislesByStore(storeId: string): Promise<StoreAisle[]> {
        const conn = await this.getConnection();
        const res = await conn.query(
            "SELECT id, store_id, name, sort_order, created_at, updated_at, deleted_at FROM store_aisle WHERE store_id = ? AND deleted_at IS NULL ORDER BY sort_order",
            [storeId]
        );
        return res.values || [];
    }

    async getAisleById(id: string): Promise<StoreAisle | null> {
        const conn = await this.getConnection();
        const res = await conn.query(
            "SELECT id, store_id, name, sort_order, created_at, updated_at, deleted_at FROM store_aisle WHERE id = ? AND deleted_at IS NULL",
            [id]
        );
        return res.values?.[0] || null;
    }

    async updateAisle(id: string, name: string): Promise<StoreAisle> {
        const conn = await this.getConnection();
        const updated_at = new Date().toISOString();

        await conn.run(
            "UPDATE store_aisle SET name = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL",
            [name, updated_at, id]
        );

        const aisle = await this.getAisleById(id);
        if (!aisle) {
            throw new Error(`Aisle with id ${id} not found`);
        }
        this.notifyChange();
        return aisle;
    }

    async deleteAisle(id: string): Promise<void> {
        const conn = await this.getConnection();
        const deleted_at = new Date().toISOString();

        await conn.run(
            "UPDATE store_aisle SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL",
            [deleted_at, id]
        );
        this.notifyChange();
    }

    async reorderAisles(
        updates: Array<{ id: string; sort_order: number }>
    ): Promise<void> {
        const conn = await this.getConnection();
        const updated_at = new Date().toISOString();

        for (const { id, sort_order } of updates) {
            await conn.run(
                "UPDATE store_aisle SET sort_order = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL",
                [sort_order, updated_at, id]
            );
        }
        this.notifyChange();
    }

    // ========== StoreSection Operations ==========
    async insertSection(
        storeId: string,
        name: string,
        aisleId: string
    ): Promise<StoreSection> {
        const conn = await this.getConnection();
        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        // Get max sort_order for this aisle
        const maxRes = await conn.query(
            "SELECT COALESCE(MAX(sort_order), -1) as max_order FROM store_section WHERE aisle_id = ? AND deleted_at IS NULL",
            [aisleId]
        );
        const sort_order = (maxRes.values?.[0]?.max_order ?? -1) + 1;

        await conn.run(
            "INSERT INTO store_section (id, store_id, aisle_id, name, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [id, storeId, aisleId, name, sort_order, now, now]
        );

        this.notifyChange();
        return {
            id,
            store_id: storeId,
            aisle_id: aisleId,
            name,
            sort_order,
            created_at: now,
            updated_at: now,
            deleted_at: null,
        };
    }

    async getSectionsByStore(storeId: string): Promise<StoreSection[]> {
        const conn = await this.getConnection();
        const res = await conn.query(
            "SELECT id, store_id, aisle_id, name, sort_order, created_at, updated_at, deleted_at FROM store_section WHERE store_id = ? AND deleted_at IS NULL ORDER BY sort_order",
            [storeId]
        );
        return res.values || [];
    }

    async getSectionById(id: string): Promise<StoreSection | null> {
        const conn = await this.getConnection();
        const res = await conn.query(
            "SELECT id, store_id, aisle_id, name, sort_order, created_at, updated_at, deleted_at FROM store_section WHERE id = ? AND deleted_at IS NULL",
            [id]
        );
        return res.values?.[0] || null;
    }

    async updateSection(
        id: string,
        name: string,
        aisleId: string
    ): Promise<StoreSection> {
        const conn = await this.getConnection();
        const updated_at = new Date().toISOString();

        await conn.run(
            "UPDATE store_section SET name = ?, aisle_id = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL",
            [name, aisleId, updated_at, id]
        );

        const section = await this.getSectionById(id);
        if (!section) {
            throw new Error(`Section with id ${id} not found`);
        }
        this.notifyChange();
        return section;
    }

    async deleteSection(id: string): Promise<void> {
        const conn = await this.getConnection();
        const deleted_at = new Date().toISOString();

        await conn.run(
            "UPDATE store_section SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL",
            [deleted_at, id]
        );
        this.notifyChange();
    }

    async reorderSections(
        updates: Array<{ id: string; sort_order: number }>
    ): Promise<void> {
        const conn = await this.getConnection();
        const updated_at = new Date().toISOString();

        for (const { id, sort_order } of updates) {
            await conn.run(
                "UPDATE store_section SET sort_order = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL",
                [sort_order, updated_at, id]
            );
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
        const conn = await this.getConnection();
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const name_norm = name.toLowerCase().trim();

        await conn.run(
            `INSERT INTO store_item (id, store_id, name, name_norm, section_id, default_qty, notes, usage_count, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
            [
                id,
                storeId,
                name,
                name_norm,
                sectionId ?? null,
                defaultQty,
                notes ?? null,
                now,
                now,
            ]
        );

        this.notifyChange();
        return {
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
    }

    async getItemsByStore(storeId: string): Promise<StoreItem[]> {
        const conn = await this.getConnection();
        const res = await conn.query(
            `SELECT id, store_id, name, name_norm, section_id, default_qty, notes, usage_count, last_used_at, is_hidden, created_at, updated_at, deleted_at 
             FROM store_item 
             WHERE store_id = ? AND deleted_at IS NULL AND is_hidden = 0 
             ORDER BY name_norm`,
            [storeId]
        );
        return res.values || [];
    }

    async getItemById(id: string): Promise<StoreItem | null> {
        const conn = await this.getConnection();
        const res = await conn.query(
            `SELECT id, store_id, name, name_norm, section_id, default_qty, notes, usage_count, last_used_at, is_hidden, created_at, updated_at, deleted_at 
             FROM store_item 
             WHERE id = ? AND deleted_at IS NULL`,
            [id]
        );
        return res.values?.[0] || null;
    }

    async updateItem(
        id: string,
        name: string,
        defaultQty: number,
        notes?: string | null,
        sectionId?: string | null
    ): Promise<StoreItem> {
        const conn = await this.getConnection();
        const updated_at = new Date().toISOString();
        const name_norm = name.toLowerCase().trim();

        await conn.run(
            `UPDATE store_item 
             SET name = ?, name_norm = ?, default_qty = ?, notes = ?, section_id = ?, updated_at = ? 
             WHERE id = ? AND deleted_at IS NULL`,
            [
                name,
                name_norm,
                defaultQty,
                notes ?? null,
                sectionId ?? null,
                updated_at,
                id,
            ]
        );

        const item = await this.getItemById(id);
        if (!item) {
            throw new Error(`Item with id ${id} not found`);
        }
        this.notifyChange();
        return item;
    }

    async deleteItem(id: string): Promise<void> {
        const conn = await this.getConnection();
        const deleted_at = new Date().toISOString();

        await conn.run(
            "UPDATE store_item SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL",
            [deleted_at, id]
        );
        this.notifyChange();
    }
}
