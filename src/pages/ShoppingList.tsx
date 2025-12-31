import {
    IonAlert,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonList,
    IonPage,
    IonSkeletonText,
    IonText,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import { add } from "ionicons/icons";
import { useCallback, useState } from "react";
import { FabSpacer } from "../components/shared/FabSpacer";
import { useBulkImportModal } from "../components/shoppinglist/BulkImportModal";
import { CheckedItems } from "../components/shoppinglist/CheckedItems";
import { ItemEditorModal } from "../components/shoppinglist/ItemEditorModal";
import { ShoppingListProvider } from "../components/shoppinglist/ShoppingListProvider";
import { StoreSelector } from "../components/shoppinglist/StoreSelector";
import { UncheckedItems } from "../components/shoppinglist/UncheckedItems";
import { useShoppingListContext } from "../components/shoppinglist/useShoppingListContext";
import { useClearCheckedItems, useShoppingListItems } from "../db/hooks";
import { LLMFabButton } from "../llm/shared";

const ShoppingListContent: React.FC = () => {
    const {
        selectedStoreId,
        openCreateModal,
    } = useShoppingListContext();

    const { data: items, isLoading: isLoadingItems } = useShoppingListItems(
        selectedStoreId || ""
    );
    const clearChecked = useClearCheckedItems();

    const { openBulkImport, isImporting } = useBulkImportModal(
        selectedStoreId || ""
    );

    const uncheckedItems = items?.filter((item) => item.is_checked === 0) || [];
    const checkedItems = items?.filter((item) => item.is_checked === 1) || [];

    const [showClearCheckedAlert, setShowClearCheckedAlert] = useState(false);

    const handleClearChecked = useCallback(() => {
        setShowClearCheckedAlert(true);
    }, []);

    const confirmClearChecked = useCallback(() => {
        if (selectedStoreId) {
            clearChecked.mutate({ storeId: selectedStoreId });
        }
        setShowClearCheckedAlert(false);
    }, [clearChecked, selectedStoreId]);

    const isLoading = isLoadingItems;

    return (
        <>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Shopping List</IonTitle>
                </IonToolbar>
                <StoreSelector />
            </IonHeader>
            <IonContent fullscreen>
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
                                    Your list is empty. Tap + to add items, if
                                    your memory permits.
                                </p>
                            </IonText>
                        </div>
                    )}

                {selectedStoreId && !isLoading && items && (
                    <>
                        <UncheckedItems items={uncheckedItems} />
                        <CheckedItems
                            items={checkedItems}
                            onClearChecked={handleClearChecked}
                            isClearing={clearChecked.isPending}
                        />
                    </>
                )}

                {selectedStoreId && items && (
                    <>
                        <FabSpacer />

                        {/* Add Item FAB */}
                        <IonFab vertical="bottom" horizontal="end" slot="fixed">
                            <IonFabButton
                                color="primary"
                                onClick={openCreateModal}
                            >
                                <IonIcon icon={add} />
                            </IonFabButton>
                        </IonFab>

                        {/* Bulk Import FAB */}
                        <IonFab
                            vertical="bottom"
                            horizontal="end"
                            slot="fixed"
                            style={{ marginRight: "70px" }}
                        >
                            <LLMFabButton
                                onClick={openBulkImport}
                                disabled={isImporting}
                            />
                        </IonFab>

                        <ItemEditorModal storeId={selectedStoreId} />
                    </>
                )}
            </IonContent>

            <IonAlert
                isOpen={showClearCheckedAlert}
                onDidDismiss={() => setShowClearCheckedAlert(false)}
                header="Obliterate Checked Items?"
                message={
                    "Clear all checked items? If you're certain you're done with them."
                }
                buttons={[
                    {
                        text: "Cancel",
                        role: "cancel",
                    },
                    {
                        text: "Obliterate",
                        role: "destructive",
                        handler: confirmClearChecked,
                    },
                ]}
            />
        </>
    );
};

const ShoppingList: React.FC = () => {
    return (
        <IonPage>
            <ShoppingListProvider>
                <ShoppingListContent />
            </ShoppingListProvider>
        </IonPage>
    );
};

export default ShoppingList;

