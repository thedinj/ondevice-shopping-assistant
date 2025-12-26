import { ReactNode, useState, useEffect } from "react";
import {
    ShoppingListContext,
    ShoppingListContextValue,
} from "./ShoppingListContext";
import { ShoppingListItemWithDetails } from "../../models/Store";
import { useDeleteShoppingListItem, useStores } from "../../db/hooks";

interface ShoppingListProviderProps {
    children: ReactNode;
    listId: string | null;
}

export const ShoppingListProvider = ({
    children,
    listId,
}: ShoppingListProviderProps) => {
    const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] =
        useState<ShoppingListItemWithDetails | null>(null);
    const [deleteAlert, setDeleteAlert] = useState<{
        id: string;
        name: string;
    } | null>(null);

    const deleteItemMutation = useDeleteShoppingListItem();
    const { data: stores } = useStores();

    // Auto-select store if exactly one exists
    useEffect(() => {
        if (!selectedStoreId && stores && stores.length === 1) {
            setSelectedStoreId(stores[0].id);
        }
    }, [stores, selectedStoreId]);

    const openCreateModal = () => {
        setEditingItem(null);
        setIsItemModalOpen(true);
    };

    const openEditModal = (item: ShoppingListItemWithDetails) => {
        setEditingItem(item);
        setIsItemModalOpen(true);
    };

    const closeItemModal = () => {
        setIsItemModalOpen(false);
        setEditingItem(null);
    };

    const confirmDelete = (id: string, name: string) => {
        setDeleteAlert({ id, name });
    };

    const cancelDelete = () => {
        setDeleteAlert(null);
    };

    const executeDelete = async () => {
        if (deleteAlert && listId) {
            await deleteItemMutation.mutateAsync({
                id: deleteAlert.id,
                listId,
            });
            setDeleteAlert(null);
        }
    };

    const value: ShoppingListContextValue = {
        selectedStoreId,
        setSelectedStoreId,
        isItemModalOpen,
        editingItem,
        openCreateModal,
        openEditModal,
        closeItemModal,
        deleteAlert,
        confirmDelete,
        cancelDelete,
        executeDelete,
    };

    return (
        <ShoppingListContext.Provider value={value}>
            {children}
        </ShoppingListContext.Provider>
    );
};
