import {
    CapacitorSQLite,
    SQLiteConnection,
    SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import { Database, DEFAULT_TABLES_TO_PERSIST } from "./types";
import { BaseDatabase } from "./base";
import { Store, getInitializedStore } from "../models/Store";
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
            const conn = await this.sqlite.createConnection(
                DB_NAME,
                false,
                "no-encryption",
                DB_VERSION,
                false
            );
            await conn.open();
            await this.runMigrations(conn);
            await this.ensureOneStore(
                conn,
                `Unnamed store init ${Math.random()}`
            );
            this.connection = conn;
            this.initPromise = null;
            this.notifyChange();
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
        if (!storeCountRes.values?.[0]?.count) {
            await this.insertStore(name ?? "Unnamed Store");
        }
    }

    // ========== Store Operations ==========
    async insertStore(name: string): Promise<Store> {
        const conn = await this.getConnection();
        const newStore = getInitializedStore(name);

        await conn.run(
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
}
