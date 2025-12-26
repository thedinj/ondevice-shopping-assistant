import {
    IonButton,
    IonIcon,
    IonLabel,
    IonList,
    IonListHeader,
    IonText,
} from "@ionic/react";
import { checkmarkDone } from "ionicons/icons";
import { ShoppingListItemWithDetails } from "../../models/Store";
import { ShoppingListItem } from "./ShoppingListItem";

interface GroupedShoppingListProps {
    items: ShoppingListItemWithDetails[];
    isChecked: boolean;
    onClearChecked?: () => void;
    isClearing?: boolean;
}

interface AisleGroup {
    aisleId: string | null;
    aisleName: string | null;
    aisleSortOrder: number | null;
    sections: SectionGroup[];
}

interface SectionGroup {
    sectionId: string | null;
    sectionName: string | null;
    sectionSortOrder: number | null;
    items: ShoppingListItemWithDetails[];
}

export const GroupedShoppingList = ({
    items,
    isChecked,
    onClearChecked,
    isClearing,
}: GroupedShoppingListProps) => {
    if (items.length === 0) {
        if (!isChecked) {
            return (
                <div style={{ textAlign: "center", padding: "20px" }}>
                    <IonText color="medium">
                        <p>No items in shopping list</p>
                    </IonText>
                </div>
            );
        }
        return null;
    }

    const groupedItems = groupItemsByAisleAndSection(items);

    return (
        <>
            {isChecked && (
                <IonListHeader>
                    <IonLabel>
                        <h2>Checked Items</h2>
                    </IonLabel>
                    {onClearChecked && (
                        <IonButton
                            fill="clear"
                            size="small"
                            onClick={onClearChecked}
                            disabled={isClearing}
                        >
                            <IonIcon slot="start" icon={checkmarkDone} />
                            Clear
                        </IonButton>
                    )}
                </IonListHeader>
            )}
            <IonList>
                {groupedItems.map((aisleGroup, aisleIdx) => (
                    <div
                        key={`${isChecked ? "checked" : "unchecked"}-aisle-${
                            aisleGroup.aisleId || "none"
                        }-${aisleIdx}`}
                    >
                        {/* Aisle Header */}
                        {(aisleGroup.aisleName || !isChecked) && (
                            <IonListHeader>
                                <IonLabel>
                                    {isChecked ? (
                                        <IonText color="medium">
                                            {aisleGroup.aisleName ||
                                                "Uncategorized"}
                                        </IonText>
                                    ) : (
                                        aisleGroup.aisleName || "Uncategorized"
                                    )}
                                </IonLabel>
                            </IonListHeader>
                        )}

                        {aisleGroup.sections.map((sectionGroup, sectionIdx) => (
                            <div
                                key={`${
                                    isChecked ? "checked" : "unchecked"
                                }-section-${
                                    sectionGroup.sectionId || "none"
                                }-${sectionIdx}`}
                            >
                                {/* Section subheader (if exists) */}
                                {sectionGroup.sectionName && (
                                    <IonListHeader
                                        style={{ paddingLeft: "32px" }}
                                    >
                                        <IonLabel style={{ fontSize: "0.9em" }}>
                                            {isChecked ? (
                                                <IonText color="medium">
                                                    {sectionGroup.sectionName}
                                                </IonText>
                                            ) : (
                                                sectionGroup.sectionName
                                            )}
                                        </IonLabel>
                                    </IonListHeader>
                                )}

                                {/* Items */}
                                {sectionGroup.items.map((item) => (
                                    <ShoppingListItem
                                        key={item.id}
                                        item={item}
                                        isChecked={isChecked}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
            </IonList>
        </>
    );
};

// Helper function
function groupItemsByAisleAndSection(
    items: ShoppingListItemWithDetails[]
): AisleGroup[] {
    const aisleMap = new Map<
        string | null,
        Map<string | null, ShoppingListItemWithDetails[]>
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

    // Sort by aisle_sort_order (null/uncategorized last using 999999 fallback)
    const sortedAisles = Array.from(aisleMap.entries()).sort((a, b) => {
        const aisleA = items.find((item) => item.aisle_id === a[0]);
        const aisleB = items.find((item) => item.aisle_id === b[0]);
        const sortOrderA = aisleA?.aisle_sort_order ?? 999999;
        const sortOrderB = aisleB?.aisle_sort_order ?? 999999;
        return sortOrderA - sortOrderB;
    });

    for (const [aisleId, sectionMap] of sortedAisles) {
        const aisleItem = items.find((item) => item.aisle_id === aisleId);
        const aisleName = aisleItem?.aisle_name || null;
        const aisleSortOrder = aisleItem?.aisle_sort_order || null;

        const sections: SectionGroup[] = [];

        // Sort by section_sort_order (null/uncategorized last using 999999 fallback)
        const sortedSections = Array.from(sectionMap.entries()).sort((a, b) => {
            const sectionA = items.find((item) => item.section_id === a[0]);
            const sectionB = items.find((item) => item.section_id === b[0]);
            const sortOrderA = sectionA?.section_sort_order ?? 999999;
            const sortOrderB = sectionB?.section_sort_order ?? 999999;
            return sortOrderA - sortOrderB;
        });

        for (const [sectionId, sectionItems] of sortedSections) {
            const sectionItem = items.find(
                (item) => item.section_id === sectionId
            );
            const sectionName = sectionItem?.section_name || null;
            const sectionSortOrder = sectionItem?.section_sort_order || null;

            sections.push({
                sectionId,
                sectionName,
                sectionSortOrder,
                items: sectionItems,
            });
        }

        result.push({
            aisleId,
            aisleName,
            aisleSortOrder,
            sections,
        });
    }

    return result;
}
