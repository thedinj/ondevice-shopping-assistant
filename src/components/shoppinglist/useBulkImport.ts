import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
    useUpsertShoppingListItem,
    useStoreItems,
    useGetOrCreateStoreItem,
    useStoreAisles,
    useStoreSections,
} from "../../db/hooks";
import { useAutoCategorize } from "../../llm/features/useAutoCategorize";
import { useToast } from "../../hooks/useToast";
import type { ParsedShoppingItem } from "../../llm/features/bulkImport";
import type { ShoppingListItemOptionalId } from "../../models/Store";

/**
 * Hook to handle bulk import of shopping list items
 * - Checks for existing items by name match
 * - Auto-categorizes new items
 * - Creates or updates items in the shopping list
 */
export function useBulkImport(listId: string, storeId: string) {
    const [isImporting, setIsImporting] = useState(false);
    const upsertItem = useUpsertShoppingListItem();
    const getOrCreateStoreItem = useGetOrCreateStoreItem();
    const { data: storeItems } = useStoreItems(storeId);
    const { data: aisles } = useStoreAisles(storeId);
    const { data: sections } = useStoreSections(storeId);
    const autoCategorize = useAutoCategorize();
    const { showError, showSuccess } = useToast();
    const queryClient = useQueryClient();

    const importItems = useCallback(
        async (parsedItems: ParsedShoppingItem[]) => {
            setIsImporting(true);
            let successCount = 0;
            let errorCount = 0;

            try {
                for (const parsed of parsedItems) {
                    try {
                        // Find existing store item by name (case-insensitive)
                        const existingItem = storeItems?.find(
                            (item) =>
                                item.name.toLowerCase() ===
                                parsed.name.toLowerCase()
                        );

                        let itemId: string;
                        let aisleId: string | null = null;
                        let sectionId: string | null = null;

                        if (existingItem) {
                            // Use existing item
                            itemId = existingItem.id;
                            aisleId = existingItem.aisle_id;
                            sectionId = existingItem.section_id;
                        } else {
                            // Try auto-categorization for new items
                            if (aisles && aisles.length > 0) {
                                try {
                                    const categorization = await autoCategorize(
                                        {
                                            itemName: parsed.name,
                                            aisles:
                                                aisles.map((aisle) => ({
                                                    id: aisle.id,
                                                    name: aisle.name,
                                                    sections:
                                                        sections
                                                            ?.filter(
                                                                (s) =>
                                                                    s.aisle_id ===
                                                                    aisle.id
                                                            )
                                                            .map((s) => ({
                                                                id: s.id,
                                                                name: s.name,
                                                            })) || [],
                                                })) || [],
                                        }
                                    );
                                    aisleId = categorization.aisleId;
                                    sectionId = categorization.sectionId;
                                } catch {
                                    // Auto-categorization failed, continue without categories
                                }
                            }

                            // Create new store item
                            const newItem =
                                await getOrCreateStoreItem.mutateAsync({
                                    storeId,
                                    name: parsed.name,
                                    aisleId,
                                    sectionId,
                                });
                            itemId = newItem.id;
                        }

                        // Create shopping list item
                        const shoppingListItem: ShoppingListItemOptionalId = {
                            list_id: listId,
                            store_item_id: itemId,
                            store_id: storeId,
                            qty: parsed.quantity ?? 1,
                            unit_id: parsed.unit,
                            notes: parsed.notes,
                        };

                        await upsertItem.mutateAsync(shoppingListItem);
                        successCount++;
                    } catch (error) {
                        console.error(
                            `Failed to import item "${parsed.name}":`,
                            error
                        );
                        errorCount++;
                    }
                }

                // Invalidate queries to refresh the list
                queryClient.invalidateQueries({
                    queryKey: ["shopping-list-items", listId],
                });

                if (successCount > 0) {
                    showSuccess(
                        `Added ${successCount} item${
                            successCount > 1 ? "s" : ""
                        } to your basket`
                    );
                }

                if (errorCount > 0) {
                    showError(
                        `Failed to import ${errorCount} item${
                            errorCount > 1 ? "s" : ""
                        }`
                    );
                }
            } catch (error) {
                showError(
                    error instanceof Error
                        ? error.message
                        : "Failed to import items"
                );
            } finally {
                setIsImporting(false);
            }
        },
        [
            listId,
            storeId,
            storeItems,
            aisles,
            sections,
            autoCategorize,
            getOrCreateStoreItem,
            upsertItem,
            queryClient,
            showError,
            showSuccess,
        ]
    );

    return { importItems, isImporting };
}
