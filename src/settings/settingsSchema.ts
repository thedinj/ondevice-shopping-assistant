import { z } from "zod";

/**
 * Setting keys used in the app
 */
export const SETTING_KEYS = {
    // add keys here
} as const;

/**
 * Zod schema for app settings
 * All fields are optional since users may not have set them yet
 */
export const settingsSchema = z.object({
    openaiApiKey: z
        .string()
        .trim()
        .optional()
        .refine(
            (val) => {
                // If value is provided, it should start with 'sk-' (OpenAI format)
                if (!val || val === "") return true;
                return val.startsWith("sk-");
            },
            {
                message: "OpenAI API key should start with 'sk-'",
            }
        ),
});

/**
 * TypeScript type inferred from the schema
 */
export type SettingsFormData = z.infer<typeof settingsSchema>;

/**
 * Helper to convert form data to database format (key-value pairs)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function toSettingsKeyValues(data: SettingsFormData): Array<{
    key: string;
    value: string;
}> {
    const pairs: Array<{ key: string; value: string }> = [];

    /* if (data.openaiApiKey) {
        pairs.push({
            key: SETTING_KEYS.OPENAI_API_KEY,
            value: data.openaiApiKey,
        });
    } */

    return pairs;
}

/**
 * Helper to convert database values to form data
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function fromSettingsKeyValues(values: {
    [key: string]: string | null | undefined;
}): SettingsFormData {
    return {
        /* openaiApiKey: values[SETTING_KEYS.OPENAI_API_KEY] || undefined, */
    };
}
