import { Capacitor } from "@capacitor/core";
import React, { PropsWithChildren, use, useMemo } from "react";
import { ensureDbReady } from "../db";
import { getInitializedStore, type Store } from "../models/Store";
import { StoreDatabaseContext } from "./storehooks";
import { insertStore, loadAllStores } from "../db/store";

export type StoreDatabase = {
    insertStore: (name: string) => Promise<Store>;
    loadAllStores: () => Promise<Store[]>;
};

const getStoreDatabase = (): StoreDatabase => {
    if (!Capacitor.isNativePlatform()) {
        // Faking -- should check for .env setting later
        return {
            insertStore: async (name: string) => getInitializedStore(name),
            loadAllStores: async () => [getInitializedStore("Unnamed Store")],
        };
    }

    return {
        insertStore,
        loadAllStores: loadAllStores,
    };
};

export const StoreDatabaseProvider: React.FC<PropsWithChildren> = ({
    children,
}) => {
    use(ensureDbReady());

    const value = useMemo(() => getStoreDatabase(), []);

    return (
        <StoreDatabaseContext.Provider value={value}>
            {children}
        </StoreDatabaseContext.Provider>
    );
};
