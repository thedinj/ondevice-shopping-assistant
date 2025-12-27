import { IonItem } from "@ionic/react";
import { useMemo, useState } from "react";
import { useStores } from "../../db/hooks";
import {
    ClickableSelectionModal,
    SelectableItem,
} from "../shared/ClickableSelectionModal";
import { useShoppingListContext } from "./useShoppingListContext";

export const StoreSelector = () => {
    const { data: stores, isLoading } = useStores();
    const { selectedStoreId, setSelectedStoreId } = useShoppingListContext();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const storeItems: SelectableItem[] = useMemo(() => {
        return (
            stores?.map((store) => ({
                id: store.id,
                label: store.name,
            })) || []
        );
    }, [stores]);

    const selectedStore = stores?.find((s) => s.id === selectedStoreId);

    if (isLoading) {
        return null;
    }

    return (
        <>
            <IonItem
                button
                onClick={() => storeItems.length > 0 && setIsModalOpen(true)}
                disabled={storeItems.length === 0}
            >
                <div
                    style={{
                        color: selectedStoreId
                            ? "var(--ion-color-dark)"
                            : "var(--ion-color-medium)",
                    }}
                >
                    {selectedStoreId ? selectedStore?.name : "Select a store"}
                </div>
            </IonItem>

            <ClickableSelectionModal
                items={storeItems}
                value={selectedStoreId || undefined}
                onSelect={(storeId) => setSelectedStoreId(storeId)}
                isOpen={isModalOpen}
                onDismiss={() => setIsModalOpen(false)}
                title="Select Store"
                showSearch={false}
            />
        </>
    );
};
