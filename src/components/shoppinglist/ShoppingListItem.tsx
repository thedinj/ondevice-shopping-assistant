import {
    IonCheckbox,
    IonIcon,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
} from "@ionic/react";
import { create, trash } from "ionicons/icons";
import { useToggleItemChecked } from "../../db/hooks";
import { ShoppingListItemWithDetails } from "../../models/Store";
import { useShoppingListContext } from "./useShoppingListContext";

interface ShoppingListItemProps {
    item: {
        id: string;
        list_id: string;
        item_name: string; // From store_item via JOIN
        qty: number;
        notes: string | null;
        section_name: string | null;
        aisle_name: string | null;
        is_checked: number;
    };
    isChecked: boolean;
}

export const ShoppingListItem = ({
    item,
    isChecked,
}: ShoppingListItemProps) => {
    const { openEditModal, confirmDelete } = useShoppingListContext();
    const toggleChecked = useToggleItemChecked();

    const handleCheckboxChange = (checked: boolean) => {
        toggleChecked.mutate({
            id: item.id,
            isChecked: checked,
            listId: item.list_id,
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

    return (
        <IonItemSliding>
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
                    <h2>
                        {item.item_name} {item.qty > 1 && `(${item.qty})`}
                    </h2>
                    {item.notes && (
                        <p style={{ fontStyle: "italic" }}>{item.notes}</p>
                    )}
                </IonLabel>
            </IonItem>
            <IonItemOptions side="end">
                <IonItemOption
                    color="primary"
                    onClick={() =>
                        openEditModal(item as ShoppingListItemWithDetails)
                    }
                >
                    <IonIcon slot="icon-only" icon={create} />
                </IonItemOption>
                <IonItemOption
                    color="danger"
                    onClick={() => confirmDelete(item.id, item.item_name)}
                >
                    <IonIcon slot="icon-only" icon={trash} />
                </IonItemOption>
            </IonItemOptions>
        </IonItemSliding>
    );
};
