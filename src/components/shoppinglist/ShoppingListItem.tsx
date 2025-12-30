import {
    IonButton,
    IonCheckbox,
    IonIcon,
    IonItem,
    IonLabel,
} from "@ionic/react";
import { create } from "ionicons/icons";
import { useToggleItemChecked } from "../../db/hooks";
import { ShoppingListItemWithDetails } from "../../models/Store";
import { useShoppingListContext } from "./useShoppingListContext";

import "./ShoppingListItem.css";

interface ShoppingListItemProps {
    item: ShoppingListItemWithDetails;
    isChecked: boolean;
}

export const ShoppingListItem = ({
    item,
    isChecked,
}: ShoppingListItemProps) => {
    const { openEditModal, newlyImportedItemIds } = useShoppingListContext();
    const toggleChecked = useToggleItemChecked();

    const isNewlyImported = newlyImportedItemIds.has(item.id);

    const handleCheckboxChange = (checked: boolean) => {
        toggleChecked.mutate({
            id: item.id,
            isChecked: checked,
            storeId: item.store_id,
        });
    };

    const handleCheckboxClick = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleCheckboxChange(!isChecked);
    };

    const itemStyle = isChecked
        ? {
              textDecoration: "line-through",
              opacity: 0.6,
          }
        : {};

    const titleToUse = item.is_idea ? item.notes : item.item_name;
    const notesToUse = item.is_idea ? "" : item.notes;

    return (
        <IonItem style={itemStyle} button={false}>
            <div
                slot="start"
                style={{
                    display: "flex",
                    alignItems: "center",
                    paddingRight: "8px",
                    cursor: "pointer",
                }}
                onClick={handleCheckboxClick}
                onTouchStart={(e) => {
                    e.stopPropagation();
                }}
                onTouchEnd={(e) => {
                    e.stopPropagation();
                    handleCheckboxClick(e);
                }}
            >
                <IonCheckbox
                    checked={isChecked}
                    style={{ pointerEvents: "none" }}
                />
            </div>
            <IonLabel style={{ cursor: "default" }}>
                <>
                    <h2 className={isNewlyImported ? "shimmer-text" : ""}>
                        {titleToUse}{" "}
                        {(item.qty > 1 || item.unit_abbreviation) && (
                            <span>
                                ({item.qty || 1}
                                {item.unit_abbreviation &&
                                    ` ${item.unit_abbreviation}`}
                                )
                            </span>
                        )}{" "}
                        {item.is_sample === 1 ? (
                            <span
                                style={{
                                    fontSize: "0.6em",
                                    textTransform: "uppercase",
                                }}
                            >
                                [sample]
                            </span>
                        ) : null}
                    </h2>
                    {notesToUse && (
                        <p style={{ fontStyle: "italic" }}>{notesToUse}</p>
                    )}
                </>
            </IonLabel>
            <IonButton
                slot="end"
                fill="clear"
                onClick={() =>
                    openEditModal(item as ShoppingListItemWithDetails)
                }
            >
                <IonIcon icon={create} color="medium" />
            </IonButton>
        </IonItem>
    );
};
