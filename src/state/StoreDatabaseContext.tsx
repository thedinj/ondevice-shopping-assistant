import React, { PropsWithChildren, useEffect, useState } from "react";
import { getDatabase, Database } from "../db/database";
import { DatabaseContext } from "./storehooks";

export const DatabaseProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [database, setDatabase] = useState<Database | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [changeToken, setChangeToken] = useState(0);

    useEffect(() => {
        let mounted = true;
        let unsubscribe: (() => void) | null = null;

        setError(null);

        getDatabase()
            .then((db) => {
                if (!mounted) return;
                setDatabase(db);
                unsubscribe = db.onChange(() => setChangeToken((k) => k + 1));
            })
            .catch((err) => {
                if (!mounted) return;
                setError(err instanceof Error ? err : new Error(String(err)));
            });

        return () => {
            mounted = false;
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [refreshKey]);

    if (error) {
        // Throw during render so AppErrorBoundary can catch it
        throw error;
    }

    if (!database) {
        return null; // or a loading spinner
    }

    return (
        <DatabaseContext.Provider
            value={{
                database,
                changeToken,
                refresh: () => setRefreshKey((k) => k + 1),
            }}
        >
            {children}
        </DatabaseContext.Provider>
    );
};
