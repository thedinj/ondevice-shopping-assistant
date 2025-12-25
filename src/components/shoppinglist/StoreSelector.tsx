import { IonItem, IonLabel, IonSelect, IonSelectOption } from "@ionic/react";
import { useStores } from "../../db/hooks";
import { useShoppingListContext } from "./useShoppingListContext";

export const StoreSelector = () => {
    const { data: stores, isLoading } = useStores();
    const { selectedStoreId, setSelectedStoreId } = useShoppingListContext();

    if (isLoading) {
        return null;
    }

    return (
        <IonItem>
            <IonLabel>Store</IonLabel>
            <IonSelect
                value={selectedStoreId}
                placeholder="Select a store"
                onIonChange={(e) => setSelectedStoreId(e.detail.value)}
            >
                {stores?.map((store) => (
                    <IonSelectOption key={store.id} value={store.id}>
                        {store.name}
                    </IonSelectOption>
                ))}
            </IonSelect>
        </IonItem>
    );
};
