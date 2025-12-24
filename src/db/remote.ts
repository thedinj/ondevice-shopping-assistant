import { Database } from "./types";
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
}
