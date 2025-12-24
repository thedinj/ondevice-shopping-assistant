import { createContext, useCallback, useContext } from "react";
import { Database } from "../db/database";

export type DatabaseContextValue = {
    database: Database;
    changeToken: number;
    refresh: () => void;
};

export const DatabaseContext = createContext<DatabaseContextValue | null>(null);

const useDatabaseContext = (): DatabaseContextValue => {
    const ctx = useContext(DatabaseContext);
    if (!ctx)
        throw new Error("Database hooks must be used within DatabaseProvider");
    return ctx;
};

export const useDatabase = (): Database => {
    return useDatabaseContext().database;
};

export const useDatabaseChangeToken = (): number => {
    return useDatabaseContext().changeToken;
};

export const useResetDatabase = () => {
    const { database, refresh } = useDatabaseContext();
    return useCallback(async () => {
        await database.reset();
        refresh();
    }, [database, refresh]);
};
