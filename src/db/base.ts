import { AppSetting } from "../models/AppSetting";
import {
    QuantityUnit,
    ShoppingListItem,
    ShoppingListItemOptionalId,
    ShoppingListItemWithDetails,
    Store,
    StoreAisle,
    StoreItem,
    StoreSection,
} from "../models/Store";
import { Database, DatabaseChangeListener } from "./types";

/**
 * Base class providing change-listener management and common functionality
 * for all database implementations.
 */
export abstract class BaseDatabase implements Database {
    private listeners: Set<DatabaseChangeListener> = new Set();

    // ========== Lifecycle Methods (Abstract) ==========
    abstract initialize(): Promise<void>;
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
    abstract getItemById(id: string): Promise<StoreItem | null>;
    abstract updateItem(
        id: string,
        name: string,
        aisleId?: string | null,
        sectionId?: string | null
    ): Promise<StoreItem>;
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
            // Check if test data seeding is enabled
            const shouldSeedTestData =
                import.meta.env.VITE_SEED_TEST_DATA === "true";

            if (shouldSeedTestData) {
                // Create a sample store with test data
                const store = await this.insertStore("Sample Store");
                await this.insertTestData(store.id);
            } else {
                // Create a basic empty store
                await this.insertStore("Unnamed Store");
            }
        }
    }

    /**
     * Inserts realistic test data into a store for development/testing purposes.
     * Creates a grocery store structure with aisles, sections, store items, and a shopping list.
     */
    protected async insertTestData(storeId: string): Promise<void> {
        // Create aisles
        const produceAisle = await this.insertAisle(storeId, "Produce");
        const bakeryAisle = await this.insertAisle(storeId, "Aisle 1 - Bakery");
        const pantryAisle = await this.insertAisle(storeId, "Aisle 2 - Pantry");
        const snacksAisle = await this.insertAisle(storeId, "Aisle 3 - Snacks");
        const dairyAisle = await this.insertAisle(
            storeId,
            "Dairy & Refrigerated"
        );

        // Create sections (only for bakery and pantry aisles)
        const breadSection = await this.insertSection(
            storeId,
            "Bread & Rolls",
            bakeryAisle.id
        );
        const pastriesSection = await this.insertSection(
            storeId,
            "Pastries",
            bakeryAisle.id
        );
        const cannedSection = await this.insertSection(
            storeId,
            "Canned Goods",
            pantryAisle.id
        );
        const pastaSection = await this.insertSection(
            storeId,
            "Pasta & Grains",
            pantryAisle.id
        );

        // Create store items across different locations
        await this.insertItem(storeId, "Apples", produceAisle.id, null);
        await this.insertItem(
            storeId,
            "Whole Wheat Bread",
            null,
            breadSection.id
        );
        await this.insertItem(storeId, "Croissants", null, pastriesSection.id);
        await this.insertItem(
            storeId,
            "Canned Tomatoes",
            null,
            cannedSection.id
        );
        await this.insertItem(storeId, "Penne Pasta", null, pastaSection.id);
        await this.insertItem(storeId, "Milk", dairyAisle.id, null);

        // Create a shopping list with items (none pre-checked)
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
        });

        const sourdough = await this.getOrCreateStoreItemByName(
            storeId,
            "Sourdough Bread",
            null,
            breadSection.id
        );
        await this.upsertShoppingListItem({
            list_id: shoppingList.id,
            store_id: storeId,
            store_item_id: sourdough.id,
            qty: 1,
            unit_id: null,
            notes: null,
        });

        const tomatoes = await this.getOrCreateStoreItemByName(
            storeId,
            "Diced Tomatoes",
            null,
            cannedSection.id
        );
        await this.upsertShoppingListItem({
            list_id: shoppingList.id,
            store_id: storeId,
            store_item_id: tomatoes.id,
            qty: 2,
            unit_id: "can",
            notes: "14.5 oz cans",
        });

        const spaghetti = await this.getOrCreateStoreItemByName(
            storeId,
            "Spaghetti",
            null,
            pastaSection.id
        );
        await this.upsertShoppingListItem({
            list_id: shoppingList.id,
            store_id: storeId,
            store_item_id: spaghetti.id,
            qty: 1,
            unit_id: "box",
            notes: null,
        });

        const cheese = await this.getOrCreateStoreItemByName(
            storeId,
            "Cheddar Cheese",
            dairyAisle.id,
            null
        );
        await this.upsertShoppingListItem({
            list_id: shoppingList.id,
            store_id: storeId,
            store_item_id: cheese.id,
            qty: 1,
            unit_id: "pound",
            notes: "Sharp, block style",
        });

        const chips = await this.getOrCreateStoreItemByName(
            storeId,
            "Potato Chips",
            snacksAisle.id,
            null
        );
        await this.upsertShoppingListItem({
            list_id: shoppingList.id,
            store_id: storeId,
            store_item_id: chips.id,
            qty: 1,
            unit_id: "bag",
            notes: null,
        });
    }
}
