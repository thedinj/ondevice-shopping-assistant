import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAppSetting, useSaveAppSetting } from "../db/hooks";
import { useToast } from "../hooks/useToast";
import {
    fromSettingsKeyValues,
    SETTING_KEYS,
    settingsSchema,
    toSettingsKeyValues,
    type SettingsFormData,
} from "./settingsSchema";

/**
 * Custom hook to manage settings form state and operations
 */
export function useSettingsForm() {
    const { showSuccess } = useToast();

    // Fetch current settings from database
    const { data: openaiApiKey, isLoading: isLoadingOpenAI } = useAppSetting(
        SETTING_KEYS.OPENAI_API_KEY
    );

    // Save setting mutation
    const { mutateAsync: saveSetting } = useSaveAppSetting();

    // Initialize form
    const form = useForm<SettingsFormData>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            openaiApiKey: undefined,
        },
    });

    const { reset, handleSubmit, formState } = form;
    const { isSubmitting } = formState;

    // Update form when settings are loaded
    useEffect(() => {
        if (!isLoadingOpenAI) {
            reset(
                fromSettingsKeyValues({
                    [SETTING_KEYS.OPENAI_API_KEY]: openaiApiKey?.value,
                })
            );
        }
    }, [isLoadingOpenAI, openaiApiKey, reset]);

    // Handle form submission
    const onSubmit = handleSubmit(async (data: SettingsFormData) => {
        try {
            // Convert form data to key-value pairs and save each setting
            const settingPairs = toSettingsKeyValues(data);

            for (const { key, value } of settingPairs) {
                await saveSetting({ key, value });
            }

            // Show success message
            showSuccess("Settings saved successfully");
        } catch (error) {
            // Error toast is automatically shown by mutation hook
            console.error("Failed to save settings:", error);
        }
    });

    return {
        form,
        onSubmit,
        isLoading: isLoadingOpenAI,
        isSubmitting,
    };
}
