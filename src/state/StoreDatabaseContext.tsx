import React, { PropsWithChildren, useMemo, useState } from "react";
import { getStoreDatabase } from "../db/store";
import { StoreDatabaseContext } from "./storehooks";

export const StoreDatabaseProvider: React.FC<PropsWithChildren> = ({
    children,
}) => {
    const [refreshKey, setRefreshKey] = useState(0);

    const value = useMemo(
        () => ({
            database: getStoreDatabase(),
            refresh: () => setRefreshKey((k) => k + 1),
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [refreshKey]
    );

    return (
        <StoreDatabaseContext.Provider value={value}>
            {children}
        </StoreDatabaseContext.Provider>
    );
};
