import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonFab,
    IonFabButton,
    IonIcon,
    IonAlert,
    IonSkeletonText,
    IonText,
    IonList,
    IonItem,
} from "@ionic/react";
import { add } from "ionicons/icons";
import { ShoppingListProvider } from "../components/shoppinglist/ShoppingListProvider";
import { StoreSelector } from "../components/shoppinglist/StoreSelector";
import { UncheckedItems } from "../components/shoppinglist/UncheckedItems";
import { CheckedItems } from "../components/shoppinglist/CheckedItems";
import { ItemEditorModal } from "../components/shoppinglist/ItemEditorModal";
import { useShoppingListContext } from "../components/shoppinglist/useShoppingListContext";
import {
    useActiveShoppingList,
    useShoppingListItems,
    useClearCheckedItems,
} from "../db/hooks";

const ShoppingListContent: React.FC = () => {
    const {
        selectedStoreId,
        openCreateModal,
        deleteAlert,
        cancelDelete,
        executeDelete,
    } = useShoppingListContext();

    const { data: shoppingList, isLoading: isLoadingList } =
        useActiveShoppingList(selectedStoreId || "");
    const { data: items, isLoading: isLoadingItems } = useShoppingListItems(
        shoppingList?.id || ""
    );
    const clearChecked = useClearCheckedItems();

    const uncheckedItems = items?.filter((item) => item.is_checked === 0) || [];
    const checkedItems = items?.filter((item) => item.is_checked === 1) || [];

    const handleClearChecked = () => {
        if (shoppingList) {
            clearChecked.mutate({ listId: shoppingList.id });
        }
    };

    const isLoading = isLoadingList || isLoadingItems;

    return (
        <>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Basket</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <StoreSelector />

                {!selectedStoreId && (
                    <div
                        style={{
                            textAlign: "center",
                            marginTop: "40px",
                            padding: "20px",
                        }}
                    >
                        <IonText color="medium">
                            <p>
                                Select a store, human. I cannot assist without
                                data.
                            </p>
                        </IonText>
                    </div>
                )}

                {selectedStoreId && isLoading && (
                    <IonList>
                        {[1, 2, 3].map((i) => (
                            <IonItem key={i}>
                                <IonSkeletonText
                                    animated
                                    style={{ width: "100%" }}
                                />
                            </IonItem>
                        ))}
                    </IonList>
                )}

                {selectedStoreId &&
                    !isLoading &&
                    shoppingList &&
                    items &&
                    items.length === 0 && (
                        <div
                            style={{
                                textAlign: "center",
                                marginTop: "40px",
                                padding: "20px",
                            }}
                        >
                            <IonText color="medium">
                                <p>
                                    Your basket is empty. Tap + to add items, if
                                    your memory permits.
                                </p>
                            </IonText>
                        </div>
                    )}

                {selectedStoreId && !isLoading && shoppingList && (
                    <>
                        <UncheckedItems items={uncheckedItems} />
                        <CheckedItems
                            items={checkedItems}
                            onClearChecked={handleClearChecked}
                            isClearing={clearChecked.isPending}
                        />
                    </>
                )}

                {selectedStoreId && shoppingList && (
                    <>
                        <IonFab vertical="bottom" horizontal="end" slot="fixed">
                            <IonFabButton onClick={openCreateModal}>
                                <IonIcon icon={add} />
                            </IonFabButton>
                        </IonFab>

                        <ItemEditorModal
                            listId={shoppingList.id}
                            storeId={selectedStoreId}
                        />
                    </>
                )}
            </IonContent>

            <IonAlert
                isOpen={!!deleteAlert}
                onDidDismiss={cancelDelete}
                header="Remove Item"
                message={`Delete "${deleteAlert?.name}" from your basket?`}
                buttons={[
                    {
                        text: "Cancel",
                        role: "cancel",
                    },
                    {
                        text: "Delete",
                        role: "destructive",
                        handler: executeDelete,
                    },
                ]}
            />
        </>
    );
};

const ShoppingList: React.FC = () => {
    return (
        <IonPage>
            <ShoppingListProvider listId={null}>
                <ShoppingListContent />
            </ShoppingListProvider>
        </IonPage>
    );
};

export default ShoppingList;

