import {
    IonList,
    IonReorderGroup,
    IonListHeader,
    IonLabel,
    IonText,
    ItemReorderEventDetail,
} from "@ionic/react";
import { ShoppingListItem } from "./ShoppingListItem";
import { useBatchUpdateShoppingListItems } from "../../db/hooks";

interface GroupedItem {
    id: string;
    list_id: string;
    name: string;
    qty: number;
    notes: string | null;
    section_id: string | null;
    section_name: string | null;
    aisle_id: string | null;
    aisle_name: string | null;
    sort_order: number;
    is_checked: number;
}

interface UncheckedItemsProps {
    items: GroupedItem[];
    listId: string;
}

interface GroupInfo {
    aisleId: string | null;
    aisleName: string | null;
    sectionId: string | null;
    sectionName: string | null;
}

export const UncheckedItems = ({ items, listId }: UncheckedItemsProps) => {
    const batchUpdate = useBatchUpdateShoppingListItems();

    // Group items hierarchically
    const groupedItems = groupItemsByAisleAndSection(items);

    // Flatten for reorder group while maintaining group boundaries
    const flatItems = groupedItems.flatMap((aisleGroup) =>
        aisleGroup.sections.flatMap((sectionGroup) => sectionGroup.items)
    );

    const handleReorder = (event: CustomEvent<ItemReorderEventDetail>) => {
        const from = event.detail.from;
        const to = event.detail.to;

        // Clone and reorder
        const reordered = [...flatItems];
        const [movedItem] = reordered.splice(from, 1);
        reordered.splice(to, 0, movedItem);

        // Build updates with new sort orders and possibly new aisle/section
        const updates = reordered.map((item, index) => {
            const itemTargetGroup = findGroupForIndex(index, groupedItems);
            return {
                id: item.id,
                sort_order: index,
                aisle_id: itemTargetGroup.aisleId,
                section_id: itemTargetGroup.sectionId,
            };
        });

        batchUpdate.mutate({ updates, listId });
        event.detail.complete();
    };

    if (flatItems.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "20px" }}>
                <IonText color="medium">
                    <p>No items in shopping list</p>
                </IonText>
            </div>
        );
    }

    return (
        <IonList>
            <IonReorderGroup disabled={false} onIonItemReorder={handleReorder}>
                {groupedItems.map((aisleGroup, aisleIdx) => (
                    <div
                        key={`aisle-${
                            aisleGroup.aisleId || "none"
                        }-${aisleIdx}`}
                    >
                        {/* Aisle Header */}
                        <IonListHeader>
                            <IonLabel>
                                {aisleGroup.aisleName || "Uncategorized"}
                            </IonLabel>
                        </IonListHeader>

                        {aisleGroup.sections.map((sectionGroup, sectionIdx) => (
                            <div
                                key={`section-${
                                    sectionGroup.sectionId || "none"
                                }-${sectionIdx}`}
                            >
                                {/* Section subheader (if exists) */}
                                {sectionGroup.sectionName && (
                                    <IonListHeader
                                        style={{ paddingLeft: "32px" }}
                                    >
                                        <IonLabel style={{ fontSize: "0.9em" }}>
                                            {sectionGroup.sectionName}
                                        </IonLabel>
                                    </IonListHeader>
                                )}

                                {/* Items */}
                                {sectionGroup.items.map((item) => (
                                    <ShoppingListItem
                                        key={item.id}
                                        item={item}
                                        isChecked={false}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
            </IonReorderGroup>
        </IonList>
    );
};

// Helper functions

interface AisleGroup {
    aisleId: string | null;
    aisleName: string | null;
    sections: SectionGroup[];
}

interface SectionGroup {
    sectionId: string | null;
    sectionName: string | null;
    items: GroupedItem[];
}

function groupItemsByAisleAndSection(items: GroupedItem[]): AisleGroup[] {
    const aisleMap = new Map<
        string | null,
        Map<string | null, GroupedItem[]>
    >();

    for (const item of items) {
        const aisleKey = item.aisle_id;
        const sectionKey = item.section_id;

        if (!aisleMap.has(aisleKey)) {
            aisleMap.set(aisleKey, new Map());
        }

        const sectionMap = aisleMap.get(aisleKey)!;
        if (!sectionMap.has(sectionKey)) {
            sectionMap.set(sectionKey, []);
        }

        sectionMap.get(sectionKey)!.push(item);
    }

    // Convert to array structure
    const result: AisleGroup[] = [];

    // Sort: uncategorized first (null aisle), then by aisle name
    const sortedAisles = Array.from(aisleMap.entries()).sort((a, b) => {
        if (a[0] === null) return -1;
        if (b[0] === null) return 1;
        const nameA =
            items.find((item) => item.aisle_id === a[0])?.aisle_name || "";
        const nameB =
            items.find((item) => item.aisle_id === b[0])?.aisle_name || "";
        return nameA.localeCompare(nameB);
    });

    for (const [aisleId, sectionMap] of sortedAisles) {
        const aisleName =
            items.find((item) => item.aisle_id === aisleId)?.aisle_name || null;

        const sections: SectionGroup[] = [];
        const sortedSections = Array.from(sectionMap.entries()).sort((a, b) => {
            if (a[0] === null) return -1;
            if (b[0] === null) return 1;
            const nameA =
                items.find((item) => item.section_id === a[0])?.section_name ||
                "";
            const nameB =
                items.find((item) => item.section_id === b[0])?.section_name ||
                "";
            return nameA.localeCompare(nameB);
        });

        for (const [sectionId, sectionItems] of sortedSections) {
            const sectionName =
                items.find((item) => item.section_id === sectionId)
                    ?.section_name || null;
            sections.push({
                sectionId,
                sectionName,
                items: sectionItems,
            });
        }

        result.push({
            aisleId,
            aisleName,
            sections,
        });
    }

    return result;
}

function findGroupForIndex(
    index: number,
    groupedItems: AisleGroup[]
): GroupInfo {
    let currentIndex = 0;

    for (const aisleGroup of groupedItems) {
        for (const sectionGroup of aisleGroup.sections) {
            const groupEnd = currentIndex + sectionGroup.items.length;
            if (index < groupEnd) {
                return {
                    aisleId: aisleGroup.aisleId,
                    aisleName: aisleGroup.aisleName,
                    sectionId: sectionGroup.sectionId,
                    sectionName: sectionGroup.sectionName,
                };
            }
            currentIndex = groupEnd;
        }
    }

    // Fallback: last group
    const lastAisle = groupedItems[groupedItems.length - 1];
    const lastSection = lastAisle?.sections[lastAisle.sections.length - 1];
    return {
        aisleId: lastAisle?.aisleId || null,
        aisleName: lastAisle?.aisleName || null,
        sectionId: lastSection?.sectionId || null,
        sectionName: lastSection?.sectionName || null,
    };
}
