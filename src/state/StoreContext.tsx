import React, { createContext, useContext, useMemo, useState } from "react";
import type { Store } from "../models/store";

type StoreState = {
    stores: Store[];
    selectedStoreId: string | null;
    setSelectedStoreId: (id: string | null) => void;
    addStore: (name: string) => void;
};

const StoreContext = createContext<StoreState | null>(null);

function makeId() {
    // good enough for now; swap to crypto/randomUUID later if you want
    return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [stores, setStores] = useState<Store[]>([
        { id: "demo-1", name: "Demo Store" },
    ]);
    const [selectedStoreId, setSelectedStoreId] = useState<string | null>(
        "demo-1"
    );

    const addStore = (name: string) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const newStore: Store = { id: makeId(), name: trimmed };
        setStores((prev) => [newStore, ...prev]);
        setSelectedStoreId(newStore.id);
    };

    const value = useMemo(
        () => ({ stores, selectedStoreId, setSelectedStoreId, addStore }),
        [stores, selectedStoreId]
    );

    return (
        <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
    );
}

export function useStores() {
    const ctx = useContext(StoreContext);
    if (!ctx) throw new Error("useStores must be used within StoreProvider");
    return ctx;
}
