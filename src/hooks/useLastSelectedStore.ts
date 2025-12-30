import { usePreference } from "./usePreference";

const LAST_STORE_KEY = "lastSelectedStoreId";

/**
 * Hook for managing the last selected store preference.
 * Light wrapper around usePreference for type-safe store ID management.
 */
export const useLastSelectedStore = () => {
    const { value: lastStoreId, savePreference } = usePreference(LAST_STORE_KEY);

    return {
        lastStoreId,
        saveLastStore: savePreference,
    };
};
