import { createContext } from "react";

export interface PageMenuItemConfig {
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
    pageMenuItems: PageMenuItemConfig[];
    addPageMenuItem: (config: PageMenuItemConfig) => void;
    removePageMenuItem: (id: string) => void;
    clearPageMenuItems: () => void;
}

export const AppHeaderContext = createContext<
    AppHeaderContextValue | undefined
>(undefined);
