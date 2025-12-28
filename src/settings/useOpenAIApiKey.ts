import { useMemo } from "react";
import { useAppSetting } from "../db/hooks";
import { SETTING_KEYS } from "./settingsSchema";

/**
 * Hook to get the OpenAI API key from settings
 * Returns the API key from app settings if configured,
 * otherwise falls back to the VITE_OPENAI_API_KEY environment variable.
 *
 * @returns Query result with the API key value (prioritizes settings over env)
 */
export function useOpenAIApiKey() {
    const settingQuery = useAppSetting(SETTING_KEYS.OPENAI_API_KEY);
    const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;

    // Merge the query result with fallback logic
    const data = useMemo(() => {
        // If settings API key exists and is not empty, use it
        if (settingQuery.data?.value && settingQuery.data.value.trim()) {
            return settingQuery.data;
        }

        // Otherwise, fall back to env variable if it exists
        if (envApiKey && envApiKey.trim()) {
            return {
                key: SETTING_KEYS.OPENAI_API_KEY,
                value: envApiKey,
            };
        }

        // No API key available
        return settingQuery.data;
    }, [settingQuery.data, envApiKey]);

    return {
        ...settingQuery,
        data,
    };
}
