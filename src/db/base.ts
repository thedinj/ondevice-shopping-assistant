import { AppSetting } from "../models/AppSetting";
import {
    QuantityUnit,
    ShoppingListItem,
    ShoppingListItemOptionalId,
    ShoppingListItemWithDetails,
    Store,
    StoreAisle,
    StoreItem,
    StoreItemWithDetails,
    StoreSection,
} from "../models/Store";
import { Database, DatabaseChangeListener } from "./types";

/**
 * Base class providing change-listener management and common functionality
 * for all database implementations.
 */
export abstract class BaseDatabase implements Database {
    private listeners: Set<DatabaseChangeListener> = new Set();

    // ========== Lifecycle Methods ==========
    /**
     * Initialize the database. This method orchestrates the initialization process:
     * 1. Calls initializeStorage() for storage-specific setup
     * 2. Ensures initial data exists
     *
     * Derived classes should implement initializeStorage() instead of overriding this method.
     */
    async initialize(): Promise<void> {
        await this.initializeStorage();
        await this.ensureInitialData();
    }

    /**
     * Initialize the storage mechanism (e.g., open database connection, create tables, etc.)
     * This is called by initialize() before ensuring initial data exists.
     */
    protected abstract initializeStorage(): Promise<void>;

    abstract close(): Promise<void>;
    abstract reset(tablesToPersist?: string[]): Promise<void>;

    // ========== Store Operations (Abstract) ==========
    abstract insertStore(name: string): Promise<Store>;
    abstract loadAllStores(): Promise<Store[]>;
    abstract getStoreById(id: string): Promise<Store | null>;
    abstract updateStore(id: string, name: string): Promise<Store>;
    abstract deleteStore(id: string): Promise<void>;

    // ========== App Settings Operations (Abstract) ==========
    abstract getAppSetting(key: string): Promise<AppSetting | null>;
    abstract setAppSetting(key: string, value: string): Promise<void>;

    // ========== Quantity Unit Operations (Abstract) ==========
    abstract loadAllQuantityUnits(): Promise<QuantityUnit[]>;

    // ========== StoreAisle Operations (Abstract) ==========
    abstract insertAisle(storeId: string, name: string): Promise<StoreAisle>;
    abstract getAislesByStore(storeId: string): Promise<StoreAisle[]>;
    abstract getAisleById(id: string): Promise<StoreAisle | null>;
    abstract updateAisle(id: string, name: string): Promise<StoreAisle>;
    abstract deleteAisle(id: string): Promise<void>;
    abstract reorderAisles(
        updates: Array<{ id: string; sort_order: number }>
    ): Promise<void>;

    // ========== StoreSection Operations (Abstract) ==========
    abstract insertSection(
        storeId: string,
        name: string,
        aisleId: string
    ): Promise<StoreSection>;
    abstract getSectionsByStore(storeId: string): Promise<StoreSection[]>;
    abstract getSectionById(id: string): Promise<StoreSection | null>;
    abstract updateSection(
        id: string,
        name: string,
        aisleId: string
    ): Promise<StoreSection>;
    abstract deleteSection(id: string): Promise<void>;
    abstract reorderSections(
        updates: Array<{ id: string; sort_order: number }>
    ): Promise<void>;

    // ========== StoreItem Operations (Abstract) ==========
    abstract insertItem(
        storeId: string,
        name: string,
        aisleId?: string | null,
        sectionId?: string | null
    ): Promise<StoreItem>;
    abstract getItemsByStore(storeId: string): Promise<StoreItem[]>;
    abstract getItemsByStoreWithDetails(
        storeId: string
    ): Promise<StoreItemWithDetails[]>;
    abstract getItemById(id: string): Promise<StoreItem | null>;
    abstract updateItem(
        id: string,
        name: string,
        aisleId?: string | null,
        sectionId?: string | null
    ): Promise<StoreItem>;
    abstract toggleItemFavorite(id: string): Promise<StoreItem>;
    abstract deleteItem(id: string): Promise<void>;
    abstract searchStoreItems(
        storeId: string,
        searchTerm: string,
        limit?: number
    ): Promise<StoreItem[]>;
    abstract getOrCreateStoreItemByName(
        storeId: string,
        name: string,
        aisleId?: string | null,
        sectionId?: string | null
    ): Promise<StoreItem>;

    // ========== ShoppingList Operations (Abstract) ==========
    abstract getOrCreateShoppingListForStore(storeId: string): Promise<{
        id: string;
        store_id: string;
        title: string | null;
        created_at: string;
        updated_at: string;
        completed_at: string | null;
    }>;
    abstract getShoppingListItemsGrouped(
        listId: string
    ): Promise<Array<ShoppingListItemWithDetails>>;
    abstract upsertShoppingListItem(
        params: ShoppingListItemOptionalId
    ): Promise<ShoppingListItem>;
    abstract toggleShoppingListItemChecked(
        id: string,
        isChecked: boolean
    ): Promise<void>;
    abstract deleteShoppingListItem(id: string): Promise<void>;
    abstract clearCheckedShoppingListItems(listId: string): Promise<void>;

    // ========== Helper for Store Checking (Abstract) ==========
    /**
     * Check if any stores exist in the database
     * Each implementation should override this based on their storage mechanism
     */
    protected abstract hasStores(): Promise<boolean>;

    // ========== Shared Change Listener Management ==========
    onChange(listener: DatabaseChangeListener): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    protected notifyChange() {
        this.listeners.forEach((listener) => listener());
    }

    // ========== Shared Initial Store Logic ==========
    /**
     * Ensures at least one store exists, creating a default one if needed.
     * If VITE_SEED_TEST_DATA environment variable is set to 'true', populates
     * the store with realistic test data including aisles, sections, items, and a shopping list.
     * Should be called during initialization and after reset.
     */
    protected async ensureInitialData(): Promise<void> {
        const hasAnyStores = await this.hasStores();
        if (!hasAnyStores) {
            await this.insertInitialData();
        }
    }

    /**
     * Inserts realistic test data into a store for development/testing purposes.
     * Creates a grocery store structure with aisles, sections, store items, and a shopping list.
     */
    protected async insertInitialData(): Promise<void> {
        // Initial store
        const store = await this.insertStore("Sample Store");
        const storeId = store.id;

        // Create aisles
        await this.insertAisle(storeId, "Deli");
        const bakeryAisle = await this.insertAisle(storeId, "Bakery");
        const produceAisle = await this.insertAisle(storeId, "Produce");
        await this.insertAisle(storeId, "Produce");
        const aisle1 = await this.insertAisle(storeId, "Aisle 1");
        await this.insertSection(storeId, "Canned Goods", aisle1.id);
        const pastaSection = await this.insertSection(
            storeId,
            "Pasta & Grains",
            aisle1.id
        );
        await this.insertAisle(storeId, "Aisle 2");
        const dairyAisle = await this.insertAisle(storeId, "Dairy & Eggs");
        await this.insertAisle(storeId, "Frozen Foods");
        await this.insertAisle(storeId, "Wine, Beer, and Liquor");

        // Create sample items
        const shoppingList = await this.getOrCreateShoppingListForStore(
            storeId
        );

        // Add items to the shopping list
        const bananas = await this.getOrCreateStoreItemByName(
            storeId,
            "Bananas",
            produceAisle.id,
            null
        );
        await this.upsertShoppingListItem({
            list_id: shoppingList.id,
            store_id: storeId,
            store_item_id: bananas.id,
            qty: 1,
            unit_id: "bunch",
            notes: "Ripe, not green",
            is_sample: 1,
        });

        const frenchBread = await this.getOrCreateStoreItemByName(
            storeId,
            "French Bread",
            bakeryAisle.id,
            null
        );
        await this.upsertShoppingListItem({
            list_id: shoppingList.id,
            store_id: storeId,
            store_item_id: frenchBread.id,
            qty: 1,
            unit_id: null,
            notes: null,
            is_sample: 1,
        });

        const pennePasta = await this.getOrCreateStoreItemByName(
            storeId,
            "Penne Pasta",
            null,
            pastaSection.id
        );
        await this.upsertShoppingListItem({
            list_id: shoppingList.id,
            store_id: storeId,
            store_item_id: pennePasta.id,
            qty: 1,
            unit_id: null,
            notes: null,
            is_sample: 1,
        });

        const milk = await this.getOrCreateStoreItemByName(
            storeId,
            "Milk",
            dairyAisle.id,
            null
        );
        await this.upsertShoppingListItem({
            list_id: shoppingList.id,
            store_id: storeId,
            store_item_id: milk.id,
            qty: 1,
            unit_id: "gallon",
            notes: null,
            is_sample: 1,
        });
    }
}
