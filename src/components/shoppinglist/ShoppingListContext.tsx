import { createContext } from "react";
import { ShoppingListItem } from "../../models/Store";

export interface ShoppingListContextValue {
    // Selected store
    selectedStoreId: string | null;
    setSelectedStoreId: (storeId: string | null) => void;

    // Modal states
    isItemModalOpen: boolean;
    editingItem: ShoppingListItem | null;
    openCreateModal: () => void;
    openEditModal: (item: ShoppingListItem) => void;
    closeItemModal: () => void;

    // Delete confirmation
    deleteAlert: { id: string; name: string } | null;
    confirmDelete: (id: string, name: string) => void;
    cancelDelete: () => void;
    executeDelete: () => void;
}

export const ShoppingListContext = createContext<
    ShoppingListContextValue | undefined
>(undefined);
