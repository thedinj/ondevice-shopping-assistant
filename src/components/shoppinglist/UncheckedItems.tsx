import { IonList, IonListHeader, IonLabel, IonText } from "@ionic/react";
import { ShoppingListItem } from "./ShoppingListItem";

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
    is_checked: number;
}

interface UncheckedItemsProps {
    items: GroupedItem[];
}

export const UncheckedItems = ({ items }: UncheckedItemsProps) => {
    // Group items hierarchically
    const groupedItems = groupItemsByAisleAndSection(items);

    if (items.length === 0) {
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
            {groupedItems.map((aisleGroup, aisleIdx) => (
                <div key={`aisle-${aisleGroup.aisleId || "none"}-${aisleIdx}`}>
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
                                <IonListHeader style={{ paddingLeft: "32px" }}>
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
