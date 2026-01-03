import { ShoppingListItemWithDetails } from "../../models/Store";
import { GroupedShoppingList } from "./GroupedShoppingList";

interface UncheckedItemsProps {
    items: ShoppingListItemWithDetails[];
    showSnoozed?: boolean;
}

export const UncheckedItems = ({ items, showSnoozed }: UncheckedItemsProps) => {
    return (
        <GroupedShoppingList
            items={items}
            isChecked={false}
            showSnoozed={showSnoozed}
        />
    );
};
