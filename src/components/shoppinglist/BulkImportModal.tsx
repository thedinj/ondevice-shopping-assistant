import React from "react";
import { IonText } from "@ionic/react";
import { useLLMModal } from "../../llm/shared/useLLMModal";
import { BULK_IMPORT_PROMPT } from "../../llm/features/bulkImportPrompt";
import {
    validateBulkImportResult,
    type ParsedShoppingItem,
} from "../../llm/features/bulkImport";
import type { LLMResponse } from "../../llm/shared/types";

/**
 * Hook to open bulk import modal
 */
export function useBulkImportModal(
    onImport: (items: ParsedShoppingItem[]) => void
) {
    const { openModal } = useLLMModal();

    const openBulkImport = React.useCallback(() => {
        openModal({
            title: "Import Shopping List",
            prompt: BULK_IMPORT_PROMPT,
            model: "gpt-4o",
            allowTextInput: true,
            allowAttachments: true,
            userInstructions:
                "Paste your shopping list as text or upload a photo of a handwritten/printed list.",
            buttonText: "Parse List",
            renderOutput: (response: LLMResponse) => {
                if (!validateBulkImportResult(response.data)) {
                    return (
                        <IonText color="danger">
                            <p>
                                Failed to parse shopping list. Please try again.
                            </p>
                        </IonText>
                    );
                }

                const items = response.data as ParsedShoppingItem[];
                return (
                    <div>
                        <IonText>
                            <h4>Found {items.length} items:</h4>
                        </IonText>
                        <ul style={{ paddingLeft: "20px" }}>
                            {items.map((item, idx) => (
                                <li key={idx}>
                                    {item.quantity && item.unit
                                        ? `${item.quantity} ${item.unit} `
                                        : item.quantity
                                        ? `${item.quantity} `
                                        : ""}
                                    {item.name}
                                    {item.notes ? ` (${item.notes})` : ""}
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            },
            onAccept: (response: LLMResponse) => {
                if (validateBulkImportResult(response.data)) {
                    onImport(response.data as ParsedShoppingItem[]);
                }
            },
            onCancel: () => {
                // Nothing to do
            },
        });
    }, [openModal, onImport]);

    return { openBulkImport };
}
