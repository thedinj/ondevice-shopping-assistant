import { IonButton, IonIcon, IonLabel, IonListHeader } from "@ionic/react";
import { checkmarkDone } from "ionicons/icons";
import { ShoppingListItemWithDetails } from "../../models/Store";
import { ShoppingListItem } from "./ShoppingListItem";
import { GroupedItemList } from "../shared/GroupedItemList";
import { FabSpacer } from "../shared/FabSpacer";

interface GroupedShoppingListProps {
    items: ShoppingListItemWithDetails[];
    isChecked: boolean;
    onClearChecked?: () => void;
    isClearing?: boolean;
}

export const GroupedShoppingList = ({
    items,
    isChecked,
    onClearChecked,
    isClearing,
}: GroupedShoppingListProps) => {
    if (items.length === 0) {
        return null;
    }

    const headerSlot = isChecked ? (
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
                    OBLITERATE
                </IonButton>
            )}
        </IonListHeader>
    ) : undefined;

    return (
        <GroupedItemList<ShoppingListItemWithDetails>
            items={items}
            renderItem={(item) => (
                <ShoppingListItem
                    key={item.id}
                    item={item}
                    isChecked={isChecked}
                />
            )}
            showAisleHeaders={!isChecked}
            showSectionHeaders={!isChecked}
            headerSlot={headerSlot}
            footerSlot={<FabSpacer />}
        />
    );
};
