import { Store } from "../models/Store";
import { AppSetting } from "../models/AppSetting";

/**
 * Default tables to preserve during database reset
 */
export const DEFAULT_TABLES_TO_PERSIST = ["app_setting"];

export type DatabaseChangeListener = () => void;

/**
 * Core database operations for lifecycle management
 */
export interface CoreDatabase {
    /**
     * Initialize the database connection and schema
     */
    initialize(): Promise<void>;

    /**
     * Close the database connection
     */
    close(): Promise<void>;

    /**
     * Reset the database by clearing data from specified tables
     * @param tablesToPersist - Array of table names to preserve during reset
     */
    reset(tablesToPersist?: string[]): Promise<void>;
}

export interface DatabaseEvents {
    /**
     * Subscribe to database change events. Returns an unsubscribe function.
     */
    onChange(listener: DatabaseChangeListener): () => void;
}

/**
 * Entity-specific database operations
 */
export interface EntityDatabase {
    // ========== Store Operations ==========
    /**
     * Insert a new store
     */
    insertStore(name: string): Promise<Store>;

    /**
     * Load all non-deleted stores
     */
    loadAllStores(): Promise<Store[]>;

    /**
     * Get a single store by ID
     */
    getStoreById(id: string): Promise<Store | null>;

    /**
     * Update a store's name
     */
    updateStore(id: string, name: string): Promise<Store>;

    /**
     * Soft delete a store
     */
    deleteStore(id: string): Promise<void>;

    // ========== App Settings Operations ==========
    /**
     * Get an app setting by key
     */
    getAppSetting(key: string): Promise<AppSetting | null>;

    /**
     * Set an app setting
     */
    setAppSetting(key: string, value: string): Promise<void>;

    // TODO: Add operations for other entities as needed:
    // - StoreAisle
    // - StoreSection
    // - StoreItem
    // - ShoppingList
    // - ShoppingListItem
}

/**
 * Combined database interface with both core and entity operations
 */
export interface Database
    extends CoreDatabase,
        EntityDatabase,
        DatabaseEvents {}
