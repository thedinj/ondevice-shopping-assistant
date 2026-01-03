import { IonButton, IonIcon } from "@ionic/react";
import { bulbOutline, checkmarkDone } from "ionicons/icons";
import { useMemo } from "react";
import { ShoppingListItemWithDetails } from "../../models/Store";
import { GroupedItemList } from "../shared/GroupedItemList";
import { ItemGroup } from "../shared/grouping.types";
import { createAisleSectionGroups } from "../shared/grouping.utils";
import { ShoppingListItem } from "./ShoppingListItem";

interface GroupedShoppingListProps {
    items: ShoppingListItemWithDetails[];
    isChecked: boolean;
    onClearChecked?: () => void;
    isClearing?: boolean;
    showSnoozed?: boolean;
}

export const GroupedShoppingList = ({
    items,
    isChecked,
    onClearChecked,
    isClearing,
    showSnoozed = false,
}: GroupedShoppingListProps) => {
    // Filter out snoozed items (unless showSnoozed is true)
    const activeItems = useMemo(() => {
        if (showSnoozed) return items;

        return items.filter((item) => {
            if (!item.snoozed_until) return true;
            const snoozeDate = new Date(item.snoozed_until);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return snoozeDate < today;
        });
    }, [items, showSnoozed]);

    const groups = useMemo(() => {
        const itemGroups: ItemGroup<ShoppingListItemWithDetails>[] = [];

        if (isChecked) {
            // CHECKED ITEMS: Header group + flat list of all items
            const headerGroup: ItemGroup<ShoppingListItemWithDetails> = {
                id: "checked-items",
                items: activeItems,
                header: {
                    label: "Checked Items",
                    color: "light",
                    sticky: true,
                    labelStyle: {
                        // TODO: share this label style constant with grouping.utils.ts
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                    },
                    actionSlot: onClearChecked && (
                        <IonButton
                            fill="clear"
                            size="small"
                            onClick={onClearChecked}
                            disabled={isClearing}
                        >
                            <IonIcon slot="start" icon={checkmarkDone} />
                            Obliterate
                        </IonButton>
                    ),
                },
                sortOrder: 0,
                indentLevel: 16, // TODO: This too
            };

            itemGroups.push(headerGroup);
        } else {
            // UNCHECKED ITEMS: Ideas + Categorized items
            const ideas = activeItems.filter((item) => item.is_idea === 1);
            const regularItems = activeItems.filter(
                (item) => item.is_idea !== 1
            );

            // Group 1: Ideas (if any)
            if (ideas.length > 0) {
                itemGroups.push({
                    id: "ideas",
                    items: ideas,
                    header: {
                        label: (
                            <>
                                <IonIcon icon={bulbOutline} color="warning" />{" "}
                                Ideas
                            </>
                        ),
                        color: "light",
                        sticky: true,
                        labelStyle: {
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                        },
                    },
                    sortOrder: 0,
                    indentLevel: 16,
                });
            }

            // Groups 2+: Regular items organized by aisle/section
            const aisleGroups = createAisleSectionGroups(regularItems, {
                showAisleHeaders: true,
                showSectionHeaders: true,
                sortOrderOffset: 100, // Sort after ideas
            });

            itemGroups.push(...aisleGroups);
        }

        return itemGroups;
    }, [activeItems, isChecked, onClearChecked, isClearing]);

    if (items.length === 0) {
        return null;
    }

    return (
        <GroupedItemList<ShoppingListItemWithDetails>
            groups={groups}
            renderItem={(item) => (
                <ShoppingListItem
                    key={item.id}
                    item={item}
                    isChecked={isChecked}
                />
            )}
        />
    );
};
