import {
    IonAlert,
    IonBackButton,
    IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
    IonPage,
    IonSearchbar,
    IonText,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import { add, create, trash } from "ionicons/icons";
import { useCallback, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { GroupedItemList } from "../components/shared/GroupedItemList";
import { StoreItemEditorModal } from "../components/storeitem/StoreItemEditorModal";
import { useDeleteItem, useStore, useStoreItemsWithDetails } from "../db/hooks";
import { StoreItem } from "../db/types";

const StoreItemsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: store } = useStore(id);
    const { data: items, isLoading } = useStoreItemsWithDetails(id);
    const deleteItem = useDeleteItem();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<StoreItem | null>(null);
    const [deleteAlert, setDeleteAlert] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

    const slidingRefs = useRef<Map<string | number, HTMLIonItemSlidingElement>>(
        new Map()
    );

    // Filter items based on debounced search term
    const filteredItems = useMemo(() => {
        if (!items) return [];
        if (!debouncedSearchTerm.trim()) return items;

        const lowerSearch = debouncedSearchTerm.toLowerCase();
        return items.filter((item) =>
            item.name.toLowerCase().includes(lowerSearch)
        );
    }, [items, debouncedSearchTerm]);

    const openCreateModal = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const openEditModal = useCallback((item: StoreItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
        slidingRefs.current.get(item.id)?.close();
    }, []);

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const confirmDelete = useCallback((item: StoreItem) => {
        setDeleteAlert({ id: item.id, name: item.name });
        slidingRefs.current.get(item.id)?.close();
    }, []);

    const executeDelete = async () => {
        if (deleteAlert) {
            await deleteItem.mutateAsync({ id: deleteAlert.id, storeId: id });
            setDeleteAlert(null);
        }
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
                ) : filteredItems.length === 0 ? (
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
                    <GroupedItemList<(typeof filteredItems)[number]>
                        items={filteredItems}
                        renderItem={(item) => (
                            <IonItemSliding
                                key={item.id}
                                ref={(el) => {
                                    if (el) {
                                        slidingRefs.current.set(item.id, el);
                                    }
                                }}
                            >
                                <IonItem>
                                    <IonLabel>{item.name}</IonLabel>
                                </IonItem>
                                <IonItemOptions side="end">
                                    <IonItemOption
                                        color="primary"
                                        onClick={() => openEditModal(item)}
                                    >
                                        <IonIcon
                                            slot="icon-only"
                                            icon={create}
                                        />
                                    </IonItemOption>
                                    <IonItemOption
                                        color="danger"
                                        onClick={() => confirmDelete(item)}
                                    >
                                        <IonIcon
                                            slot="icon-only"
                                            icon={trash}
                                        />
                                    </IonItemOption>
                                </IonItemOptions>
                            </IonItemSliding>
                        )}
                        emptyMessage="No items"
                    />
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
                    isOpen={!!deleteAlert}
                    onDidDismiss={() => setDeleteAlert(null)}
                    header="Delete Item"
                    message={`Are you sure you want to delete "${deleteAlert?.name}"?`}
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
            </IonContent>
        </IonPage>
    );
};

export default StoreItemsPage;
