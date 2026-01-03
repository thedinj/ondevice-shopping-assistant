import { GenericStoreSelector } from "../shared/GenericStoreSelector";
import { useShoppingListContext } from "./useShoppingListContext";

export const StoreSelector = () => {
    const { selectedStoreId, setSelectedStoreId } = useShoppingListContext();

    return (
        <GenericStoreSelector
            selectedStoreId={selectedStoreId}
            onStoreSelect={setSelectedStoreId}
            modalTitle="Select Store"
            showSearch={false}
            placeholderText="Select a Store"
        />
    );
};
