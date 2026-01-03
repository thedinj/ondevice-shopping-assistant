import {
    IonAlert,
    IonContent,
    IonFab,
    IonFabButton,
    IonIcon,
    IonItem,
    IonList,
    IonPage,
    IonSkeletonText,
    IonText,
    IonToolbar,
} from "@ionic/react";
import { add, eyeOffOutline, eyeOutline } from "ionicons/icons";
import { useCallback, useState } from "react";
import { AppHeader } from "../components/layout/AppHeader";
import { FabSpacer } from "../components/shared/FabSpacer";
import { useBulkImportModal } from "../components/shoppinglist/BulkImportModal";
import { CheckedItems } from "../components/shoppinglist/CheckedItems";
import { ItemEditorModal } from "../components/shoppinglist/ItemEditorModal";
import { ShoppingListProvider } from "../components/shoppinglist/ShoppingListProvider";
import { StoreSelector } from "../components/shoppinglist/StoreSelector";
import { UncheckedItems } from "../components/shoppinglist/UncheckedItems";
import { useShoppingListContext } from "../components/shoppinglist/useShoppingListContext";
import { useClearCheckedItems, useShoppingListItems } from "../db/hooks";
import { useShowSnoozedItems } from "../hooks/useShowSnoozedItems";
import { LLMFabButton } from "../llm/shared";

const ShoppingListContent: React.FC = () => {
    const { selectedStoreId, openCreateModal } = useShoppingListContext();
    const { showSnoozed, toggleShowSnoozed } = useShowSnoozedItems();

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

    // Check if there are any snoozed items
    const hasSnoozedItems =
        items?.some((item) => {
            if (!item.snoozed_until) return false;
            return new Date(item.snoozed_until) > new Date();
        }) || false;

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

    const menuItems = hasSnoozedItems
        ? [
              {
                  id: "toggle-snoozed",
                  icon: showSnoozed ? eyeOffOutline : eyeOutline,
                  label: showSnoozed
                      ? "Hide Snoozed Items"
                      : "Show Snoozed Items",
                  onClick: toggleShowSnoozed,
              },
          ]
        : [];

    return (
        <>
            <AppHeader title="Shopping List" menuItems={menuItems} />
            <IonToolbar>
                <StoreSelector />
            </IonToolbar>
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
                        <UncheckedItems
                            items={uncheckedItems}
                            showSnoozed={showSnoozed}
                        />
                        <CheckedItems
                            items={checkedItems}
                            onClearChecked={handleClearChecked}
                            isClearing={clearChecked.isPending}
                            showSnoozed={showSnoozed}
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
