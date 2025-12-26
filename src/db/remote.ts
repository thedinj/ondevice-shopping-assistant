import { Database, StoreAisle, StoreSection, StoreItem } from "./types";
import { BaseDatabase } from "./base";
import { Store } from "../models/Store";
import { AppSetting } from "../models/AppSetting";

/**
 * Remote database implementation stub for future API integration
 * All methods throw "not implemented" errors
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export class RemoteDatabase extends BaseDatabase implements Database {
    async initialize(): Promise<void> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async close(): Promise<void> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async reset(_tablesToPersist?: string[]): Promise<void> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    // ========== Store Operations ==========
    async insertStore(_name: string): Promise<Store> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async loadAllStores(): Promise<Store[]> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async getStoreById(_id: string): Promise<Store | null> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async updateStore(_id: string, _name: string): Promise<Store> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async deleteStore(_id: string): Promise<void> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    // ========== App Settings Operations ==========
    async getAppSetting(_key: string): Promise<AppSetting | null> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async setAppSetting(_key: string, _value: string): Promise<void> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    // ========== StoreAisle Operations ==========
    async insertAisle(_storeId: string, _name: string): Promise<StoreAisle> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async getAislesByStore(_storeId: string): Promise<StoreAisle[]> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async getAisleById(_id: string): Promise<StoreAisle | null> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async updateAisle(_id: string, _name: string): Promise<StoreAisle> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async deleteAisle(_id: string): Promise<void> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async reorderAisles(
        _updates: Array<{ id: string; sort_order: number }>
    ): Promise<void> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    // ========== StoreSection Operations ==========
    async insertSection(
        _storeId: string,
        _name: string,
        _aisleId: string
    ): Promise<StoreSection> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async getSectionsByStore(_storeId: string): Promise<StoreSection[]> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async getSectionById(_id: string): Promise<StoreSection | null> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async updateSection(
        _id: string,
        _name: string,
        _aisleId: string
    ): Promise<StoreSection> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async deleteSection(_id: string): Promise<void> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async reorderSections(
        _updates: Array<{ id: string; sort_order: number }>
    ): Promise<void> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    // ========== StoreItem Operations ==========
    async insertItem(
        _storeId: string,
        _name: string,
        _sectionId?: string | null
    ): Promise<StoreItem> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async getItemsByStore(_storeId: string): Promise<StoreItem[]> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async getItemById(_id: string): Promise<StoreItem | null> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async updateItem(
        _id: string,
        _name: string,
        _sectionId?: string | null
    ): Promise<StoreItem> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async deleteItem(_id: string): Promise<void> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async searchStoreItems(
        _storeId: string,
        _searchTerm: string,
        _limit?: number
    ): Promise<StoreItem[]> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    // ========== ShoppingList Operations ==========
    async getOrCreateShoppingListForStore(_storeId: string): Promise<{
        id: string;
        store_id: string;
        title: string | null;
        created_at: string;
        updated_at: string;
        completed_at: string | null;
    }> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async getShoppingListItemsGrouped(_listId: string): Promise<any[]> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async upsertShoppingListItem(_params: any): Promise<any> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async toggleShoppingListItemChecked(
        _id: string,
        _isChecked: boolean
    ): Promise<void> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async deleteShoppingListItem(_id: string): Promise<void> {
        throw new Error("RemoteDatabase not yet implemented");
    }

    async clearCheckedShoppingListItems(_listId: string): Promise<void> {
        throw new Error("RemoteDatabase not yet implemented");
    }
}
