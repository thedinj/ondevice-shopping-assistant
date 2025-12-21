import { createContext, useContext } from "react";
import { StoreDatabase } from "./StoreDatabaseContext";

export const StoreDatabaseContext = createContext<StoreDatabase | null>(null);

export const useStoreDatabase = (): StoreDatabase => {
    const ctx = useContext(StoreDatabaseContext);
    if (!ctx)
        throw new Error(
            "useStoreDatabase must be used within StoreDatabaseProvider"
        );
    return ctx;
};
