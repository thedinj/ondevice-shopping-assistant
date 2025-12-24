import { useIonToast } from "@ionic/react";
import {
    useQueryClient,
    useMutation as useTanstackMutation,
    useQuery as useTanstackQuery,
} from "@tanstack/react-query";
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
    const [present] = useIonToast();

    return useTanstackMutation({
        mutationFn: (name: string) => database.insertStore(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stores"] });
        },
        onError: (error: Error) => {
            present({
                message: `Failed to create store: ${error.message}`,
                duration: 3000,
                color: "danger",
                position: "top",
            });
        },
    });
}

/**
 * Hook to update a store
 */
export function useUpdateStore() {
    const database = useDatabase();
    const queryClient = useQueryClient();
    const [present] = useIonToast();

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
            present({
                message: `Failed to update store: ${error.message}`,
                duration: 3000,
                color: "danger",
                position: "top",
            });
        },
    });
}

/**
 * Hook to delete a store
 */
export function useDeleteStore() {
    const database = useDatabase();
    const queryClient = useQueryClient();
    const [present] = useIonToast();

    return useTanstackMutation({
        mutationFn: (id: string) => database.deleteStore(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stores"] });
        },
        onError: (error: Error) => {
            present({
                message: `Failed to delete store: ${error.message}`,
                duration: 3000,
                color: "danger",
                position: "top",
            });
        },
    });
}

/**
 * Hook to save an app setting
 */
export function useSaveAppSetting() {
    const database = useDatabase();
    const queryClient = useQueryClient();
    const [present] = useIonToast();

    return useTanstackMutation({
        mutationFn: ({ key, value }: { key: string; value: string }) =>
            database.setAppSetting(key, value),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["appSettings", variables.key],
            });
        },
        onError: (error: Error) => {
            present({
                message: `Failed to save setting: ${error.message}`,
                duration: 3000,
                color: "danger",
                position: "top",
            });
        },
    });
}

/**
 * Hook to reset the database
 */
export function useResetDatabase() {
    const database = useDatabase();
    const queryClient = useQueryClient();
    const [present] = useIonToast();

    return useTanstackMutation({
        mutationFn: (tablesToPersist?: string[]) =>
            database.reset(tablesToPersist),
        onSuccess: () => {
            // Invalidate all queries after reset
            queryClient.invalidateQueries();
        },
        onError: (error: Error) => {
            present({
                message: `Failed to reset database: ${error.message}`,
                duration: 3000,
                color: "danger",
                position: "top",
            });
        },
    });
}
