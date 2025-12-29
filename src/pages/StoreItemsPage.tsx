import {
    IonAlert,
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonItemDivider,
    IonLabel,
    IonPage,
    IonSearchbar,
    IonText,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import {
    add,
    cart,
    cartOutline,
    create,
    star,
    starOutline,
} from "ionicons/icons";
import { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { GroupedItemList } from "../components/shared/GroupedItemList";
import { StoreItemEditorModal } from "../components/storeitem/StoreItemEditorModal";
import {
    useDeleteShoppingListItem,
    useShoppingListItems,
    useStore,
    useStoreItemsWithDetails,
    useToggleFavorite,
    useUpsertShoppingListItem,
} from "../db/hooks";
import { StoreItemWithDetails } from "../db/types";
import { useToast } from "../hooks/useToast";

const StoreItemsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: store } = useStore(id);
    const { data: items, isLoading } = useStoreItemsWithDetails(id);
    const { data: shoppingListItems } = useShoppingListItems(id);
    const toggleFavorite = useToggleFavorite();
    const upsertShoppingListItem = useUpsertShoppingListItem();
    const deleteShoppingListItem = useDeleteShoppingListItem();
    const { showSuccess, showError } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<StoreItemWithDetails | null>(
        null
    );
    const [removeFromListAlert, setRemoveFromListAlert] = useState<{
        itemId: string;
        itemName: string;
        shoppingListItemId: string;
    } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

    // Create a map of store_item_id -> shopping_list_item for quick lookups
    const shoppingListItemMap = useMemo(() => {
        const map = new Map<string, string>();
        if (shoppingListItems) {
            for (const item of shoppingListItems) {
                map.set(item.store_item_id, item.id);
            }
        }
        return map;
    }, [shoppingListItems]);

    // Filter and split items into favorites and regular
    const { favoriteItems, regularItems } = useMemo(() => {
        if (!items) return { favoriteItems: [], regularItems: [] };

        let filtered = items;
        if (debouncedSearchTerm.trim()) {
            const lowerSearch = debouncedSearchTerm.toLowerCase();
            filtered = items.filter((item) =>
                item.name.toLowerCase().includes(lowerSearch)
            );
        }

        const favorites = filtered.filter((item) => item.is_favorite === 1);
        const regular = filtered.filter((item) => item.is_favorite === 0);

        return { favoriteItems: favorites, regularItems: regular };
    }, [items, debouncedSearchTerm]);

    const openCreateModal = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const openEditModal = useCallback((item: StoreItemWithDetails) => {
        setEditingItem(item);
        setIsModalOpen(true);
    }, []);

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleToggleFavorite = useCallback(
        async (item: StoreItemWithDetails) => {
            try {
                await toggleFavorite.mutateAsync({ id: item.id, storeId: id });
            } catch {
                showError("Failed to update favorite");
            }
        },
        [id, showError, toggleFavorite]
    );

    const handleAddToShoppingList = useCallback(
        async (item: StoreItemWithDetails) => {
            try {
                await upsertShoppingListItem.mutateAsync({
                    store_id: id,
                    store_item_id: item.id,
                    qty: 1,
                    unit_id: null,
                    notes: null,
                });
                showSuccess("Added to shopping list");
            } catch {
                showError("Failed to add to shopping list");
            }
        },
        [id, upsertShoppingListItem, showSuccess, showError]
    );

    const confirmRemoveFromShoppingList = useCallback(
        (item: StoreItemWithDetails) => {
            const shoppingListItemId = shoppingListItemMap.get(item.id);
            if (!shoppingListItemId) return;

            setRemoveFromListAlert({
                itemId: item.id,
                itemName: item.name,
                shoppingListItemId,
            });
        },
        [shoppingListItemMap]
    );

    const executeRemoveFromShoppingList = async () => {
        if (!removeFromListAlert) return;

        try {
            await deleteShoppingListItem.mutateAsync({
                id: removeFromListAlert.shoppingListItemId,
                storeId: id,
            });
            showSuccess("Removed from shopping list");
            setRemoveFromListAlert(null);
        } catch {
            showError("Failed to remove from shopping list");
        }
    };

    const renderItem = (item: StoreItemWithDetails) => {
        const isInShoppingList = shoppingListItemMap.has(item.id);
        const isFavorite = item.is_favorite === 1;

        return (
            <IonItem key={item.id}>
                <IonButton
                    slot="start"
                    fill="clear"
                    onClick={() => handleToggleFavorite(item)}
                >
                    <IonIcon
                        icon={isFavorite ? star : starOutline}
                        color={isFavorite ? "warning" : "medium"}
                    />
                </IonButton>
                <IonLabel>{item.name}</IonLabel>
                <IonButton
                    slot="end"
                    fill="clear"
                    onClick={() =>
                        isInShoppingList
                            ? confirmRemoveFromShoppingList(item)
                            : handleAddToShoppingList(item)
                    }
                >
                    <IonIcon
                        icon={isInShoppingList ? cart : cartOutline}
                        color={isInShoppingList ? "primary" : "medium"}
                    />
                </IonButton>
                <IonButton
                    slot="end"
                    fill="clear"
                    onClick={() => openEditModal(item)}
                >
                    <IonIcon icon={create} color="medium" />
                </IonButton>
            </IonItem>
        );
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref={`/stores/${id}`} />
                    </IonButtons>
                    <IonTitle>{store?.name || "Store"} Items</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonSearchbar
                    value={searchTerm}
                    onIonInput={(e) => setSearchTerm(e.detail.value || "")}
                    placeholder="Search items..."
                    debounce={0}
                />

                {isLoading ? (
                    <div style={{ padding: "20px", textAlign: "center" }}>
                        <IonText color="medium">Loading items...</IonText>
                    </div>
                ) : favoriteItems.length === 0 && regularItems.length === 0 ? (
                    <div style={{ padding: "20px", textAlign: "center" }}>
                        <IonText color="medium">
                            {items?.length === 0 ? (
                                <>
                                    No items yet. Add items to track products
                                    and their locations in this store.
                                </>
                            ) : (
                                <>No items match your search.</>
                            )}
                        </IonText>
                    </div>
                ) : (
                    <>
                        {favoriteItems.length > 0 && (
                            <GroupedItemList<(typeof favoriteItems)[number]>
                                items={favoriteItems}
                                renderItem={renderItem}
                                headerSlot={
                                    <IonItemDivider sticky>
                                        <IonLabel>
                                            <strong>Favorites</strong>
                                        </IonLabel>
                                    </IonItemDivider>
                                }
                                emptyMessage="No favorite items"
                            />
                        )}
                        {favoriteItems.length > 0 &&
                            regularItems.length > 0 && (
                                <IonItemDivider>
                                    <IonLabel>
                                        <strong>Other Store Items</strong>
                                    </IonLabel>
                                </IonItemDivider>
                            )}
                        {regularItems.length > 0 && (
                            <GroupedItemList<(typeof regularItems)[number]>
                                items={regularItems}
                                renderItem={renderItem}
                                emptyMessage="No items"
                            />
                        )}
                    </>
                )}

                <IonFab slot="fixed" vertical="bottom" horizontal="end">
                    <IonFabButton onClick={openCreateModal}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>

                <StoreItemEditorModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    storeId={id}
                    editingItem={editingItem}
                />

                <IonAlert
                    isOpen={!!removeFromListAlert}
                    onDidDismiss={() => setRemoveFromListAlert(null)}
                    header="Remove from Shopping List"
                    message={`Remove "${removeFromListAlert?.itemName}" from your shopping list?`}
                    buttons={[
                        {
                            text: "Cancel",
                            role: "cancel",
                        },
                        {
                            text: "Remove",
                            role: "destructive",
                            handler: executeRemoveFromShoppingList,
                        },
                    ]}
                />
            </IonContent>
        </IonPage>
    );
};

export default StoreItemsPage;
