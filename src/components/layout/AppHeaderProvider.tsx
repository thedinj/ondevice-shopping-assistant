import { useState, useCallback } from "react";
import { AppHeaderContext, PageMenuItemConfig } from "./AppHeaderContext";

export const AppHeaderProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [pageMenuItems, setPageMenuItems] = useState<PageMenuItemConfig[]>(
        []
    );

    const openSettings = useCallback(() => setIsSettingsOpen(true), []);
    const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

    const addPageMenuItem = useCallback((config: PageMenuItemConfig) => {
        setPageMenuItems((prev) => {
            // Check if item with this ID already exists
            const existingIndex = prev.findIndex(
                (item) => item.id === config.id
            );

            if (existingIndex >= 0) {
                // Replace existing item with updated config
                const newItems = [...prev];
                newItems[existingIndex] = config;
                return newItems;
            }

            // Add new item
            return [...prev, config];
        });
    }, []);

    const removePageMenuItem = useCallback((id: string) => {
        setPageMenuItems((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const clearPageMenuItems = useCallback(() => {
        setPageMenuItems([]);
    }, []);

    const value = {
        isSettingsOpen,
        openSettings,
        closeSettings,
        pageMenuItems,
        addPageMenuItem,
        removePageMenuItem,
        clearPageMenuItems,
    };

    return (
        <AppHeaderContext.Provider value={value}>
            {children}
        </AppHeaderContext.Provider>
    );
};
