import { ShoppingListItemWithDetails } from "../../models/Store";
import { GroupedShoppingList } from "./GroupedShoppingList";

interface CheckedItemsProps {
    items: ShoppingListItemWithDetails[];
    onClearChecked: () => void;
    isClearing: boolean;
    showSnoozed?: boolean;
}

export const CheckedItems = ({
    items,
    onClearChecked,
    isClearing,
    showSnoozed,
}: CheckedItemsProps) => {
    return (
        <GroupedShoppingList
            items={items}
            isChecked={true}
            onClearChecked={onClearChecked}
            isClearing={isClearing}
            showSnoozed={showSnoozed}
        />
    );
};
