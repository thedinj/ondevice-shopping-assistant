import { createContext, useCallback, useContext } from "react";
import { StoreDatabase } from "../db/store";
import { resetDatabase } from "../db";

export type StoreDatabaseContextValue = {
    database: StoreDatabase;
    refresh: () => void;
};

export const StoreDatabaseContext =
    createContext<StoreDatabaseContextValue | null>(null);

const useStoreDatabaseContext = (): StoreDatabaseContextValue => {
    const ctx = useContext(StoreDatabaseContext);
    if (!ctx)
        throw new Error(
            "StoreDatabase hooks must be used within StoreDatabaseProvider"
        );
    return ctx;
};

export const useStoreDatabase = (): StoreDatabase => {
    return useStoreDatabaseContext().database;
};

export const useResetDatabase = () => {
    const { refresh } = useStoreDatabaseContext();
    return useCallback(async () => {
        await resetDatabase();
        refresh();
    }, [refresh]);
};
