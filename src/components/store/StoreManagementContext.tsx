import { createContext, useContext } from "react";

export type EntityType = "aisle" | "section";

export interface EditingEntity {
    id: string;
    name: string;
    type: EntityType;
    aisle_id?: string | null;
}

export interface DeleteEntity {
    id: string;
    name: string;
    type: EntityType;
}

export interface StoreManagementContextType {
    // Modal state
    isModalOpen: boolean;
    editingEntity: EditingEntity | null;
    openCreateModal: () => void;
    openEditAisleModal: (aisle: { id: string; name: string }) => void;
    openEditSectionModal: (section: {
        id: string;
        name: string;
        aisle_id: string;
    }) => void;
    closeModal: () => void;

    // Delete alert state
    deleteAlert: DeleteEntity | null;
    confirmDeleteAisle: (aisle: { id: string; name: string }) => void;
    confirmDeleteSection: (section: { id: string; name: string }) => void;
    closeDeleteAlert: () => void;
}

export const StoreManagementContext = createContext<
    StoreManagementContextType | undefined
>(undefined);

export const useStoreManagement = () => {
    const context = useContext(StoreManagementContext);
    if (!context) {
        throw new Error(
            "useStoreManagement must be used within StoreManagementProvider"
        );
    }
    return context;
};
