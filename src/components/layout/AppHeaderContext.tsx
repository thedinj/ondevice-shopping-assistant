import { createContext } from "react";

export interface MenuItemConfig {
    id: string;
    icon: string;
    label: string;
    onClick: () => void;
    color?: string;
}

export interface AppHeaderContextValue {
    isSettingsOpen: boolean;
    openSettings: () => void;
    closeSettings: () => void;
    customMenuItems: MenuItemConfig[];
    addMenuItem: (config: MenuItemConfig) => void;
    removeMenuItem: (id: string) => void;
    clearMenuItems: () => void;
}

export const AppHeaderContext = createContext<
    AppHeaderContextValue | undefined
>(undefined);
