import pluralize from "pluralize";

/**
 * Converts a string to sentence case (first letter capitalized, rest lowercase)
 * Used for formatting LLM output for display consistency
 * @param str - The string to convert
 * @returns The string in sentence case
 */
export const toSentenceCase = (str: string): string => {
    if (!str || str.length === 0) return str;
    const trimmed = str.trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

/**
 * Normalizes an item name for database storage and matching
 * - Converts to singular form (using pluralize library)
 * - Converts to lowercase
 * - Trims whitespace
 *
 * This ensures that "apple", "apples", "Apple", and "Apples" all normalize to "apple"
 * enabling proper matching while preserving the user's original input in the display name.
 *
 * @param name - The item name to normalize
 * @returns The normalized name for storage in name_norm field
 */
export const normalizeItemName = (name: string): string => {
    const trimmed = name.trim();
    const singular = pluralize.singular(trimmed);
    return singular.toLowerCase();
};
