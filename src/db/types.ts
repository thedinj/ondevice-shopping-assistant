import { Store, StoreAisle, StoreSection, StoreItem } from "../models/Store";
import { AppSetting } from "../models/AppSetting";

// Re-export types for convenience
export type { StoreAisle, StoreSection, StoreItem };

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

    // ========== StoreAisle Operations ==========
    /**
     * Insert a new aisle
     */
    insertAisle(storeId: string, name: string): Promise<StoreAisle>;

    /**
     * Get all non-deleted aisles for a store (ordered by sort_order)
     */
    getAislesByStore(storeId: string): Promise<StoreAisle[]>;

    /**
     * Get a single aisle by ID
     */
    getAisleById(id: string): Promise<StoreAisle | null>;

    /**
     * Update an aisle's name
     */
    updateAisle(id: string, name: string): Promise<StoreAisle>;

    /**
     * Soft delete an aisle
     */
    deleteAisle(id: string): Promise<void>;

    /**
     * Update sort order for multiple aisles
     */
    reorderAisles(
        updates: Array<{ id: string; sort_order: number }>
    ): Promise<void>;

    // ========== StoreSection Operations ==========
    /**
     * Insert a new section
     */
    insertSection(
        storeId: string,
        name: string,
        aisleId: string
    ): Promise<StoreSection>;

    /**
     * Get all non-deleted sections for a store (ordered by sort_order)
     */
    getSectionsByStore(storeId: string): Promise<StoreSection[]>;

    /**
     * Get a single section by ID
     */
    getSectionById(id: string): Promise<StoreSection | null>;

    /**
     * Update a section's name and/or aisle assignment
     */
    updateSection(
        id: string,
        name: string,
        aisleId: string
    ): Promise<StoreSection>;

    /**
     * Soft delete a section
     */
    deleteSection(id: string): Promise<void>;

    /**
     * Update sort order for multiple sections
     */
    reorderSections(
        updates: Array<{ id: string; sort_order: number }>
    ): Promise<void>;

    // ========== StoreItem Operations ==========
    /**
     * Insert a new item
     */
    insertItem(
        storeId: string,
        name: string,
        defaultQty: number,
        notes?: string | null,
        sectionId?: string | null
    ): Promise<StoreItem>;

    /**
     * Get all non-deleted, non-hidden items for a store
     */
    getItemsByStore(storeId: string): Promise<StoreItem[]>;

    /**
     * Get a single item by ID
     */
    getItemById(id: string): Promise<StoreItem | null>;

    /**
     * Update an item
     */
    updateItem(
        id: string,
        name: string,
        defaultQty: number,
        notes?: string | null,
        sectionId?: string | null
    ): Promise<StoreItem>;

    /**
     * Soft delete an item
     */
    deleteItem(id: string): Promise<void>;

    // TODO: Add operations for other entities as needed:
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
