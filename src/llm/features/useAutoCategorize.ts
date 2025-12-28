/**
 * Hook for auto-categorization feature
 */

import { useCallback } from "react";
import { useOpenAIApiKey } from "../../settings/useOpenAIApiKey";
import { callLLMDirect } from "../shared/directCall";
import { AUTO_CATEGORIZE_PROMPT } from "./autoCategorizePrompt";
import {
    validateAutoCategorizeResult,
    transformAutoCategorizeResult,
    type AutoCategorizeInput,
} from "./autoCategorize";

export interface UseAutoCategorizeOptions {
    itemName: string;
    aisles: AutoCategorizeInput["aisles"];
}

export interface UseAutoCategorizeResult {
    aisleId: string | null;
    sectionId: string | null;
    aisleName?: string;
    sectionName?: string;
}

/**
 * Hook that provides auto-categorization functionality.
 * Handles API key loading internally.
 */
export function useAutoCategorize() {
    const { data: apiKey } = useOpenAIApiKey();

    const autoCategorize = useCallback(
        async ({
            itemName,
            aisles,
        }: UseAutoCategorizeOptions): Promise<UseAutoCategorizeResult> => {
            if (!itemName?.trim()) {
                throw new Error("Item name is required");
            }

            if (!aisles || aisles.length === 0) {
                throw new Error("No aisles available");
            }

            const input: AutoCategorizeInput = {
                item_name: itemName,
                aisles,
            };

            const response = await callLLMDirect({
                apiKey: apiKey?.value,
                prompt: AUTO_CATEGORIZE_PROMPT,
                userText: JSON.stringify(input),
                model: "gpt-4o-mini",
            });

            if (!validateAutoCategorizeResult(response.data)) {
                throw new Error(
                    "Invalid response from AI: expected aisle_name, section_name, confidence, and reasoning fields"
                );
            }

            const { aisleId, sectionId } = transformAutoCategorizeResult(
                response.data,
                input.aisles
            );

            if (!aisleId) {
                throw new Error("Could not determine a matching aisle/section");
            }

            // Find names for the result
            const aisle = aisles.find((a) => a.id === aisleId);
            const section = aisle?.sections.find((s) => s.id === sectionId);

            return {
                aisleId,
                sectionId,
                aisleName: aisle?.name,
                sectionName: section?.name,
            };
        },
        [apiKey]
    );

    return autoCategorize;
}
