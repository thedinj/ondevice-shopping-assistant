import { IonItemDivider, IonLabel, IonList } from "@ionic/react";
import { ReactNode, useMemo } from "react";

export interface GroupedDisplayItem {
    id: number | string;
    aisle_id: number | string | null;
    section_id: number | string | null;
    aisle_name?: string | null;
    section_name?: string | null;
    aisle_sort_order?: number | null;
    section_sort_order?: number | null;
}

interface AisleGroup {
    aisle_id: number | string | null;
    aisle_name: string;
    aisle_sort_order: number;
    sections: SectionGroup[];
}

interface SectionGroup {
    section_id: number | string | null;
    section_name: string;
    section_sort_order: number;
    items: GroupedDisplayItem[];
}

function groupItemsByAisleAndSection(
    items: GroupedDisplayItem[]
): AisleGroup[] {
    const aisleMap = new Map<number | string | null, AisleGroup>();

    for (const item of items) {
        const aisleId = item.aisle_id;
        const sectionId = item.section_id;
        const aisleName = item.aisle_name || "Uncategorized";
        const sectionName = item.section_name || "Uncategorized";
        // Use -1 for null aisle to ensure uncategorized items sort first
        // Also treat null sort_order as 0 (sort early)
        const aisleSortOrder =
            aisleId === null ? -1 : item.aisle_sort_order ?? 0;
        const sectionSortOrder =
            sectionId === null ? -1 : item.section_sort_order ?? 0;

        let aisleGroup = aisleMap.get(aisleId);
        if (!aisleGroup) {
            aisleGroup = {
                aisle_id: aisleId,
                aisle_name: aisleName,
                aisle_sort_order: aisleSortOrder,
                sections: [],
            };
            aisleMap.set(aisleId, aisleGroup);
        }

        let sectionGroup = aisleGroup.sections.find(
            (s) => s.section_id === sectionId
        );
        if (!sectionGroup) {
            sectionGroup = {
                section_id: sectionId,
                section_name: sectionName,
                section_sort_order: sectionSortOrder,
                items: [],
            };
            aisleGroup.sections.push(sectionGroup);
        }

        sectionGroup.items.push(item);
    }

    const aisleGroups = Array.from(aisleMap.values()).sort((a, b) => {
        // Put uncategorized items first (null aisle_id or no sort order)
        const aIsUncategorized = a.aisle_id === null;
        const bIsUncategorized = b.aisle_id === null;

        if (aIsUncategorized && !bIsUncategorized) return -1;
        if (!aIsUncategorized && bIsUncategorized) return 1;

        // Both categorized or both uncategorized - sort by order
        return a.aisle_sort_order - b.aisle_sort_order;
    });

    for (const aisleGroup of aisleGroups) {
        aisleGroup.sections.sort((a, b) => {
            // Put uncategorized sections first within each aisle
            const aIsUncategorized = a.section_id === null;
            const bIsUncategorized = b.section_id === null;

            if (aIsUncategorized && !bIsUncategorized) return -1;
            if (!aIsUncategorized && bIsUncategorized) return 1;

            // Both categorized or both uncategorized - sort by order
            return a.section_sort_order - b.section_sort_order;
        });
    }

    return aisleGroups;
}

interface GroupedItemListProps<T extends GroupedDisplayItem> {
    items: T[];
    renderItem: (item: T) => ReactNode;
    showAisleHeaders?: boolean;
    showSectionHeaders?: boolean;
    headerSlot?: ReactNode;
    emptyMessage?: string;
}

export function GroupedItemList<T extends GroupedDisplayItem>({
    items,
    renderItem,
    showAisleHeaders = true,
    showSectionHeaders = true,
    headerSlot,
    emptyMessage = "No items",
}: GroupedItemListProps<T>) {
    const aisleGroups = useMemo(
        () => groupItemsByAisleAndSection(items),
        [items]
    );

    if (items.length === 0) {
        return (
            <IonList>
                <IonItemDivider>
                    <IonLabel>{emptyMessage}</IonLabel>
                </IonItemDivider>
            </IonList>
        );
    }

    return (
        <IonList>
            {headerSlot}
            {aisleGroups.map((aisleGroup) => {
                return (
                    <div key={`aisle-${aisleGroup.aisle_id}`}>
                        {showAisleHeaders && (
                            <IonItemDivider sticky color="light">
                                <IonLabel
                                    color="dark"
                                    style={{
                                        fontSize: "0.9rem",
                                        fontWeight: "600",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px",
                                    }}
                                >
                                    {aisleGroup.aisle_name}
                                </IonLabel>
                            </IonItemDivider>
                        )}
                        {aisleGroup.sections.map((sectionGroup) => {
                            return (
                                <div
                                    key={`section-${sectionGroup.section_id}`}
                                    style={{
                                        paddingLeft: "16px",
                                    }}
                                >
                                    {showSectionHeaders &&
                                        sectionGroup.section_id !== null && (
                                            <IonItemDivider color="light">
                                                <IonLabel
                                                    style={{
                                                        fontSize: "0.85rem",
                                                        fontWeight: "500",
                                                        opacity: 0.9,
                                                    }}
                                                >
                                                    {sectionGroup.section_name}
                                                </IonLabel>
                                            </IonItemDivider>
                                        )}
                                    {sectionGroup.items.map((item) =>
                                        renderItem(item as T)
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </IonList>
    );
}
