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

interface CheckedItemsProps {
    items: ShoppingListItemWithDetails[];
    onClearChecked: () => void;
    isClearing: boolean;
}

interface AisleGroup {
    aisleName: string | null;
    sections: SectionGroup[];
}

interface SectionGroup {
    sectionName: string | null;
    items: ShoppingListItemWithDetails[];
}

export const CheckedItems = ({
    items,
    onClearChecked,
    isClearing,
}: CheckedItemsProps) => {
    if (items.length === 0) {
        return null;
    }

    const groupedItems = groupItemsByAisleAndSection(items);

    return (
        <>
            <IonListHeader>
                <IonLabel>
                    <h2>Checked Items</h2>
                </IonLabel>
                <IonButton
                    fill="clear"
                    size="small"
                    onClick={onClearChecked}
                    disabled={isClearing}
                >
                    <IonIcon slot="start" icon={checkmarkDone} />
                    Clear
                </IonButton>
            </IonListHeader>
            <IonList>
                {groupedItems.map((aisleGroup, aisleIdx) => (
                    <div key={`checked-aisle-${aisleIdx}`}>
                        {/* Aisle Header (subtle) */}
                        {aisleGroup.aisleName && (
                            <IonListHeader>
                                <IonLabel>
                                    <IonText color="medium">
                                        {aisleGroup.aisleName}
                                    </IonText>
                                </IonLabel>
                            </IonListHeader>
                        )}

                        {aisleGroup.sections.map((sectionGroup, sectionIdx) => (
                            <div key={`checked-section-${sectionIdx}`}>
                                {/* Section subheader (if exists) */}
                                {sectionGroup.sectionName && (
                                    <IonListHeader
                                        style={{ paddingLeft: "32px" }}
                                    >
                                        <IonLabel style={{ fontSize: "0.9em" }}>
                                            <IonText color="medium">
                                                {sectionGroup.sectionName}
                                            </IonText>
                                        </IonLabel>
                                    </IonListHeader>
                                )}

                                {/* Items */}
                                {sectionGroup.items.map((item) => (
                                    <ShoppingListItem
                                        key={item.id}
                                        item={item}
                                        isChecked={true}
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
        const aisleKey = item.aisle_name;
        const sectionKey = item.section_name;

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

    for (const [aisleName, sectionMap] of aisleMap.entries()) {
        const sections: SectionGroup[] = [];

        for (const [sectionName, sectionItems] of sectionMap.entries()) {
            sections.push({
                sectionName,
                items: sectionItems,
            });
        }

        result.push({
            aisleName,
            sections,
        });
    }

    return result;
}
