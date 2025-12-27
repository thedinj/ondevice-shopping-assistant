import { useAppSetting } from "../db/hooks";
import { SETTING_KEYS } from "./settingsSchema";

/**
 * Hook to get the OpenAI API key from settings
 * @returns Query result with the API key value
 */
export function useOpenAIApiKey() {
    return useAppSetting(SETTING_KEYS.OPENAI_API_KEY);
}
