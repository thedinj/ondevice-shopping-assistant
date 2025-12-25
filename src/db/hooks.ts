import {
    useQueryClient,
    useMutation as useTanstackMutation,
    useQuery as useTanstackQuery,
} from "@tanstack/react-query";
import { useToast } from "../hooks/useToast";
import { use } from "react";
import { DatabaseContext } from "./context";
import type { Database } from "./types";

/**
 * Hook to get database instance directly
 */
export function useDatabase(): Database {
    const context = use(DatabaseContext);
    if (!context) {
        throw new Error("useDatabase must be used within a DatabaseProvider");
    }
    return context.database;
}

// ============================================================================
// Entity-specific Query Hooks
// ============================================================================

/**
 * Hook to fetch all stores
 */
export function useStores() {
    const database = useDatabase();
    return useTanstackQuery({
        queryKey: ["stores"],
        queryFn: () => database.loadAllStores(),
    });
}

/**
 * Hook to fetch a single store by ID
 */
export function useStore(id: string) {
    const database = useDatabase();
    return useTanstackQuery({
        queryKey: ["stores", id],
        queryFn: () => database.getStoreById(id),
        enabled: !!id,
    });
}

/**
 * Hook to fetch a single app setting by key
 */
export function useAppSetting(key: string) {
    const database = useDatabase();
    return useTanstackQuery({
        queryKey: ["appSettings", key],
        queryFn: () => database.getAppSetting(key),
        enabled: !!key,
    });
}

// ============================================================================
// Entity-specific Mutation Hooks
// ============================================================================

/**
 * Hook to create a new store
 */
export function useCreateStore() {
    const database = useDatabase();
    const queryClient = useQueryClient();
    const { showError } = useToast();

    return useTanstackMutation({
        mutationFn: (name: string) => database.insertStore(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stores"] });
        },
        onError: (error: Error) => {
            showError(`Failed to create store: ${error.message}`);
        },
    });
}

/**
 * Hook to update a store
 */
export function useUpdateStore() {
    const database = useDatabase();
    const queryClient = useQueryClient();
    const { showError } = useToast();

    return useTanstackMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) =>
            database.updateStore(id, name),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["stores"] });
            queryClient.invalidateQueries({
                queryKey: ["stores", variables.id],
            });
        },
        onError: (error: Error) => {
            showError(`Failed to update store: ${error.message}`);
        },
    });
}

/**
 * Hook to delete a store
 */
export function useDeleteStore() {
    const database = useDatabase();
    const queryClient = useQueryClient();
    const { showError } = useToast();

    return useTanstackMutation({
        mutationFn: (id: string) => database.deleteStore(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stores"] });
        },
        onError: (error: Error) => {
            showError(`Failed to delete store: ${error.message}`);
        },
    });
}

/**
 * Hook to save an app setting
 */
export function useSaveAppSetting() {
    const database = useDatabase();
    const queryClient = useQueryClient();
    const { showError } = useToast();

    return useTanstackMutation({
        mutationFn: ({ key, value }: { key: string; value: string }) =>
            database.setAppSetting(key, value),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["appSettings", variables.key],
            });
        },
        onError: (error: Error) => {
            showError(`Failed to save setting: ${error.message}`);
        },
    });
}

/**
 * Hook to reset the database
 */
export function useResetDatabase() {
    const database = useDatabase();
    const queryClient = useQueryClient();
    const { showError } = useToast();

    return useTanstackMutation({
        mutationFn: (tablesToPersist?: string[]) =>
            database.reset(tablesToPersist),
        onSuccess: () => {
            // Invalidate all queries after reset
            queryClient.invalidateQueries();
        },
        onError: (error: Error) => {
            showError(`Failed to reset database: ${error.message}`);
        },
    });
}

// ============================================================================
// StoreAisle Query & Mutation Hooks
// ============================================================================

/**
 * Hook to fetch all aisles for a store
 */
export function useStoreAisles(storeId: string) {
    const database = useDatabase();
    return useTanstackQuery({
        queryKey: ["aisles", storeId],
        queryFn: () => database.getAislesByStore(storeId),
        enabled: !!storeId,
    });
}

/**
 * Hook to fetch a single aisle by ID
 */
export function useAisle(id: string) {
    const database = useDatabase();
    return useTanstackQuery({
        queryKey: ["aisles", "detail", id],
        queryFn: () => database.getAisleById(id),
        enabled: !!id,
    });
}

/**
 * Hook to create a new aisle
 */
export function useCreateAisle() {
    const database = useDatabase();
    const queryClient = useQueryClient();
    const { showError } = useToast();

    return useTanstackMutation({
        mutationFn: ({ storeId, name }: { storeId: string; name: string }) =>
            database.insertAisle(storeId, name),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["aisles", variables.storeId],
            });
        },
        onError: (error: Error) => {
            showError(`Failed to create aisle: ${error.message}`);
        },
    });
}

/**
 * Hook to update an aisle
 */
export function useUpdateAisle() {
    const database = useDatabase();
    const queryClient = useQueryClient();
    const { showError } = useToast();

    return useTanstackMutation({
        mutationFn: ({
            id,
            name,
        }: {
            id: string;
            name: string;
            storeId: string;
        }) => database.updateAisle(id, name),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["aisles", variables.storeId],
            });
            queryClient.invalidateQueries({
                queryKey: ["aisles", "detail", variables.id],
            });
        },
        onError: (error: Error) => {
            showError(`Failed to update aisle: ${error.message}`);
        },
    });
}

/**
 * Hook to delete an aisle
 */
export function useDeleteAisle() {
    const database = useDatabase();
    const queryClient = useQueryClient();
    const { showError } = useToast();

    return useTanstackMutation({
        mutationFn: ({ id }: { id: string; storeId: string }) =>
            database.deleteAisle(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["aisles", variables.storeId],
            });
        },
        onError: (error: Error) => {
            showError(`Failed to delete aisle: ${error.message}`);
        },
    });
}

/**
 * Hook to reorder aisles
 */
export function useReorderAisles() {
    const database = useDatabase();
    const queryClient = useQueryClient();
    const { showError } = useToast();

    return useTanstackMutation({
        mutationFn: ({
            updates,
        }: {
            updates: Array<{ id: string; sort_order: number }>;
            storeId: string;
        }) => database.reorderAisles(updates),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["aisles", variables.storeId],
            });
        },
        onError: (error: Error) => {
            showError(`Failed to reorder aisles: ${error.message}`);
        },
    });
}

// ============================================================================
// StoreSection Query & Mutation Hooks
// ============================================================================

/**
 * Hook to fetch all sections for a store
 */
export function useStoreSections(storeId: string) {
    const database = useDatabase();
    return useTanstackQuery({
        queryKey: ["sections", storeId],
        queryFn: () => database.getSectionsByStore(storeId),
        enabled: !!storeId,
    });
}

/**
 * Hook to fetch a single section by ID
 */
export function useSection(id: string) {
    const database = useDatabase();
    return useTanstackQuery({
        queryKey: ["sections", "detail", id],
        queryFn: () => database.getSectionById(id),
        enabled: !!id,
    });
}

/**
 * Hook to create a new section
 */
export function useCreateSection() {
    const database = useDatabase();
    const queryClient = useQueryClient();
    const { showError } = useToast();

    return useTanstackMutation({
        mutationFn: ({
            storeId,
            name,
            aisleId,
        }: {
            storeId: string;
            name: string;
            aisleId: string;
        }) => database.insertSection(storeId, name, aisleId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["sections", variables.storeId],
            });
        },
        onError: (error: Error) => {
            showError(`Failed to create section: ${error.message}`);
        },
    });
}

/**
 * Hook to update a section
 */
export function useUpdateSection() {
    const database = useDatabase();
    const queryClient = useQueryClient();
    const { showError } = useToast();

    return useTanstackMutation({
        mutationFn: ({
            id,
            name,
            aisleId,
        }: {
            id: string;
            name: string;
            aisleId: string;
            storeId: string;
        }) => database.updateSection(id, name, aisleId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["sections", variables.storeId],
            });
            queryClient.invalidateQueries({
                queryKey: ["sections", "detail", variables.id],
            });
        },
        onError: (error: Error) => {
            showError(`Failed to update section: ${error.message}`);
        },
    });
}

/**
 * Hook to delete a section
 */
export function useDeleteSection() {
    const database = useDatabase();
    const queryClient = useQueryClient();
    const { showError } = useToast();

    return useTanstackMutation({
        mutationFn: ({ id }: { id: string; storeId: string }) =>
            database.deleteSection(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["sections", variables.storeId],
            });
        },
        onError: (error: Error) => {
            showError(`Failed to delete section: ${error.message}`);
        },
    });
}

/**
 * Hook to reorder sections
 */
export function useReorderSections() {
    const database = useDatabase();
    const queryClient = useQueryClient();
    const { showError } = useToast();

    return useTanstackMutation({
        mutationFn: ({
            updates,
        }: {
            updates: Array<{ id: string; sort_order: number }>;
            storeId: string;
        }) => database.reorderSections(updates),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["sections", variables.storeId],
            });
        },
        onError: (error: Error) => {
            showError(`Failed to reorder sections: ${error.message}`);
        },
    });
}

// ============================================================================
// StoreItem Query & Mutation Hooks
// ============================================================================

/**
 * Hook to fetch all items for a store
 */
export function useStoreItems(storeId: string) {
    const database = useDatabase();
    return useTanstackQuery({
        queryKey: ["items", storeId],
        queryFn: () => database.getItemsByStore(storeId),
        enabled: !!storeId,
    });
}

/**
 * Hook to fetch a single item by ID
 */
export function useItem(id: string) {
    const database = useDatabase();
    return useTanstackQuery({
        queryKey: ["items", "detail", id],
        queryFn: () => database.getItemById(id),
        enabled: !!id,
    });
}

/**
 * Hook to create a new item
 */
export function useCreateItem() {
    const database = useDatabase();
    const queryClient = useQueryClient();
    const { showError } = useToast();

    return useTanstackMutation({
        mutationFn: ({
            storeId,
            name,
            sectionId,
        }: {
            storeId: string;
            name: string;
            sectionId?: string | null;
        }) => database.insertItem(storeId, name, sectionId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["items", variables.storeId],
            });
        },
        onError: (error: Error) => {
            showError(`Failed to create item: ${error.message}`);
        },
    });
}

/**
 * Hook to update an item
 */
export function useUpdateItem() {
    const database = useDatabase();
    const queryClient = useQueryClient();
    const { showError } = useToast();

    return useTanstackMutation({
        mutationFn: ({
            id,
            name,
            sectionId,
        }: {
            id: string;
            name: string;
            sectionId?: string | null;
            storeId: string;
        }) => database.updateItem(id, name, sectionId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["items", variables.storeId],
            });
            queryClient.invalidateQueries({
                queryKey: ["items", "detail", variables.id],
            });
        },
        onError: (error: Error) => {
            showError(`Failed to update item: ${error.message}`);
        },
    });
}

/**
 * Hook to delete an item
 */
export function useDeleteItem() {
    const database = useDatabase();
    const queryClient = useQueryClient();
    const { showError } = useToast();

    return useTanstackMutation({
        mutationFn: ({ id }: { id: string; storeId: string }) =>
            database.deleteItem(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["items", variables.storeId],
            });
        },
        onError: (error: Error) => {
            showError(`Failed to delete item: ${error.message}`);
        },
    });
}

// ========== ShoppingList Hooks ==========

/**
 * Hook to get or create the active shopping list for a store
 */
export function useActiveShoppingList(storeId: string) {
    const database = useDatabase();

    return useTanstackQuery({
        queryKey: ["shopping-list", "active", storeId],
        queryFn: () => database.getOrCreateShoppingListForStore(storeId),
        enabled: !!storeId,
    });
}

/**
 * Hook to get shopping list items (grouped and sorted)
 */
export function useShoppingListItems(listId: string) {
    const database = useDatabase();

    return useTanstackQuery({
        queryKey: ["shopping-list-items", listId],
        queryFn: () => database.getShoppingListItemsGrouped(listId),
        enabled: !!listId,
    });
}

/**
 * Hook to search store items for autocomplete
 */
export function useStoreItemAutocomplete(storeId: string, searchTerm: string) {
    const database = useDatabase();

    return useTanstackQuery({
        queryKey: ["store-items", "search", storeId, searchTerm],
        queryFn: () => database.searchStoreItems(storeId, searchTerm, 10),
        enabled: !!storeId && searchTerm.length >= 3,
        staleTime: 30000, // Cache for 30 seconds
    });
}

/**
 * Hook to upsert a shopping list item
 */
export function useUpsertShoppingListItem() {
    const database = useDatabase();
    const queryClient = useQueryClient();
    const { showError } = useToast();

    return useTanstackMutation({
        mutationFn: (params: {
            id?: string;
            listId: string;
            storeId: string;
            name: string;
            qty: number;
            notes: string | null;
            sectionId: string | null;
            aisleId: string | null;
        }) => database.upsertShoppingListItem(params),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["shopping-list-items", variables.listId],
            });
            // Also invalidate store items for autocomplete
            queryClient.invalidateQueries({
                queryKey: ["items", variables.storeId],
            });
            queryClient.invalidateQueries({
                queryKey: ["store-items", "search", variables.storeId],
            });
        },
        onError: (error: Error) => {
            showError(`Failed to save item: ${error.message}`);
        },
    });
}

/**
 * Hook to batch update shopping list items (for reordering)
 */
export function useBatchUpdateShoppingListItems() {
    const database = useDatabase();
    const queryClient = useQueryClient();
    const { showError } = useToast();

    return useTanstackMutation({
        mutationFn: ({
            updates,
            listId,
        }: {
            updates: Array<{
                id: string;
                sort_order: number;
                aisle_id?: string | null;
                section_id?: string | null;
            }>;
            listId: string;
        }) => database.batchUpdateShoppingListItems(updates),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["shopping-list-items", variables.listId],
            });
        },
        onError: (error: Error) => {
            showError(`Failed to reorder items: ${error.message}`);
        },
    });
}

/**
 * Hook to toggle shopping list item checked status
 */
export function useToggleItemChecked() {
    const database = useDatabase();
    const queryClient = useQueryClient();
    const { showError } = useToast();

    return useTanstackMutation({
        mutationFn: ({
            id,
            isChecked,
            listId,
        }: {
            id: string;
            isChecked: boolean;
            listId: string;
        }) => database.toggleShoppingListItemChecked(id, isChecked),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["shopping-list-items", variables.listId],
            });
        },
        onError: (error: Error) => {
            showError(`Failed to update item: ${error.message}`);
        },
    });
}

/**
 * Hook to delete a shopping list item
 */
export function useDeleteShoppingListItem() {
    const database = useDatabase();
    const queryClient = useQueryClient();
    const { showError } = useToast();

    return useTanstackMutation({
        mutationFn: ({ id, listId }: { id: string; listId: string }) =>
            database.deleteShoppingListItem(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["shopping-list-items", variables.listId],
            });
        },
        onError: (error: Error) => {
            showError(`Failed to delete item: ${error.message}`);
        },
    });
}

/**
 * Hook to clear all checked items from a shopping list
 */
export function useClearCheckedItems() {
    const database = useDatabase();
    const queryClient = useQueryClient();
    const { showError } = useToast();

    return useTanstackMutation({
        mutationFn: ({ listId }: { listId: string }) =>
            database.clearCheckedShoppingListItems(listId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["shopping-list-items", variables.listId],
            });
        },
        onError: (error: Error) => {
            showError(`Failed to clear checked items: ${error.message}`);
        },
    });
}
