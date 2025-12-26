import { IonItem, IonLabel, IonSelect, IonSelectOption } from "@ionic/react";
import { useStores } from "../../db/hooks";
import { useShoppingListContext } from "./useShoppingListContext";

export const StoreSelector = () => {
    const { data: stores, isLoading } = useStores();
    const { selectedStoreId, setSelectedStoreId } = useShoppingListContext();

    if (isLoading) {
        return null;
    }

    // HACK: Force IonSelect to remount when store names change.
    // IonSelect is an Ionic web component that maintains its own internal state
    // for displaying the selected option's text. When stores are updated on another
    // tab (e.g., renaming a store on the Stores tab), React Query properly refetches
    // and updates the stores data, React re-renders this component with new
    // IonSelectOption children, BUT the IonSelect web component doesn't sync its
    // internal display state from the updated options. By changing the key when any
    // store name changes, we force React to unmount the old IonSelect and mount a
    // fresh one that rebuilds its internal state from scratch with the correct names.
    // This is a common issue with web components in React - they have their own state
    // management separate from React's virtual DOM reconciliation.
    const key = stores?.map((s) => s.name).join(",");

    return (
        <IonItem>
            <IonLabel>Store</IonLabel>
            <IonSelect
                key={key}
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
