import {
    useMutation,
    useQuery,
    useSuspenseQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { secureStorage } from "../utils/secureStorage";

/**
 * Generic hook for reading a value from secure storage with TanStack Query caching.
 * Uses regular useQuery for backward compatibility.
 *
 * @param key The secure storage key to query
 * @param getFn Async function that retrieves the value from secure storage
 * @returns TanStack Query result with the stored value
 */
export const useSecureValue = <T>(
    key: string,
    getFn: () => Promise<T | null>
) => {
    return useQuery({
        queryKey: ["secure-storage", key],
        queryFn: getFn,
        staleTime: 5 * 60 * 1000, // 5 minutes - secure values don't change often
        gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
    });
};

/**
 * Generic hook for writing a value to secure storage with TanStack Query invalidation.
 *
 * @param key The secure storage key to update
 * @param setFn Async function that writes the value to secure storage
 * @returns TanStack Query mutation result
 */
export const useSaveSecureValue = <T>(
    key: string,
    setFn: (value: T) => Promise<void>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: setFn,
        onSuccess: () => {
            // Invalidate the specific key to trigger refetch
            queryClient.invalidateQueries({
                queryKey: ["secure-storage", key],
            });
        },
    });
};

/**
 * Hook to get the OpenAI API key from secure storage.
 * On native platforms, reads from Android Keystore.
 * On web, falls back to localStorage.
 *
 * Uses Suspense - component will suspend until API key is loaded.
 * No isLoading checks needed!
 *
 * @returns The API key string (or null if not configured)
 */
export const useSecureApiKey = (): string | null => {
    const { data } = useSuspenseQuery({
        queryKey: ["secure-storage", "openai_api_key"],
        queryFn: () => secureStorage.getApiKey(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
    return data;
};

/**
 * Hook to save the OpenAI API key to secure storage.
 * Only works on native platforms (Android Keystore).
 * Web platform throws error (must use .env file instead).
 *
 * @returns TanStack Query mutation for saving the API key
 */
export const useSaveSecureApiKey = () => {
    return useSaveSecureValue("openai_api_key", (value: string) =>
        secureStorage.setApiKey(value)
    );
};
