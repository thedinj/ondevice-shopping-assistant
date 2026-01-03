import { useState, useCallback } from "react";
import { AppHeaderContext, MenuItemConfig } from "./AppHeaderContext";

export const AppHeaderProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [customMenuItems, setCustomMenuItems] = useState<MenuItemConfig[]>(
        []
    );

    const openSettings = useCallback(() => setIsSettingsOpen(true), []);
    const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

    const addMenuItem = useCallback((config: MenuItemConfig) => {
        setCustomMenuItems((prev) => {
            // Don't add duplicates
            if (prev.some((item) => item.id === config.id)) return prev;
            return [...prev, config];
        });
    }, []);

    const removeMenuItem = useCallback((id: string) => {
        setCustomMenuItems((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const clearMenuItems = useCallback(() => {
        setCustomMenuItems([]);
    }, []);

    const value = {
        isSettingsOpen,
        openSettings,
        closeSettings,
        customMenuItems,
        addMenuItem,
        removeMenuItem,
        clearMenuItems,
    };

    return (
        <AppHeaderContext.Provider value={value}>
            {children}
        </AppHeaderContext.Provider>
    );
};
