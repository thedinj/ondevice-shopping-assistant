import { zodResolver } from "@hookform/resolvers/zod";
import {
    IonAlert,
    IonButton,
    IonButtons,
    IonIcon,
    IonContent,
    IonHeader,
    IonModal,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import { closeOutline } from "ionicons/icons";
import { UseMutationResult } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
    useDeleteShoppingListItem,
    useGetOrCreateStoreItem,
    useUpdateItem,
    useUpsertShoppingListItem,
} from "../../db/hooks";
import {
    ShoppingListItem,
    ShoppingListItemOptionalId,
} from "../../models/Store";
import { ItemEditorProvider } from "./ItemEditorContext";
import { ItemFormData, itemFormSchema } from "./itemEditorSchema";
import { LocationSelectors } from "./LocationSelectors";
import { NameAutocomplete } from "./NameAutocomplete";
import { NotesInput } from "./NotesInput";
import { QuantityInput } from "./QuantityInput";
import { UnitSelector } from "./UnitSelector";
import { useShoppingListContext } from "./useShoppingListContext";

interface ItemEditorModalProps {
    listId: string;
    storeId: string;
}

export const ItemEditorModal = ({ listId, storeId }: ItemEditorModalProps) => {
    const { isItemModalOpen, editingItem, closeItemModal } =
        useShoppingListContext();
    const upsertItem = useUpsertShoppingListItem();
    const getOrCreateStoreItem = useGetOrCreateStoreItem();
    const updateItem = useUpdateItem();
    const deleteItem = useDeleteShoppingListItem();
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isValid },
    } = useForm<ItemFormData>({
        resolver: zodResolver(itemFormSchema),
        mode: "onChange",
        defaultValues: {
            name: "",
            qty: 1,
            notes: null,
            aisleId: null,
            sectionId: null,
        },
    });

    // Reset form when modal opens/closes or editing item changes
    useEffect(() => {
        if (isItemModalOpen && editingItem) {
            reset({
                name: editingItem.item_name,
                qty: editingItem.qty,
                unitId: editingItem.unit_id,
                notes: editingItem.notes,
                aisleId: editingItem.aisle_id,
                sectionId: editingItem.section_id,
            });
        } else if (isItemModalOpen) {
            reset({
                name: "",
                qty: 1,
                unitId: null,
                notes: null,
                aisleId: null,
                sectionId: null,
            });
        }
    }, [isItemModalOpen, editingItem, reset]);

    const onSubmit = async (data: ItemFormData) => {
        let storeItemId: string;

        if (editingItem) {
            // Update existing store item
            await updateItem.mutateAsync({
                id: editingItem.store_item_id,
                name: data.name,
                aisleId: data.aisleId || null,
                sectionId: data.sectionId || null,
                storeId,
            });
            storeItemId = editingItem.store_item_id;
        } else {
            // Get or create store item
            const storeItem = await getOrCreateStoreItem.mutateAsync({
                storeId,
                name: data.name,
                aisleId: data.aisleId || null,
                sectionId: data.sectionId || null,
            });
            storeItemId = storeItem.id;
        }

        // Update or create shopping list item
        await upsertItem.mutateAsync({
            id: editingItem?.id,
            list_id: listId,
            store_id: storeId,
            store_item_id: storeItemId,
            qty: data.qty,
            unit_id: data.unitId || null,
            notes: data.notes || null,
        });
        closeItemModal();
    };

    const handleDelete = async () => {
        if (!editingItem) return;

        try {
            await deleteItem.mutateAsync({
                id: editingItem.id,
                listId: listId,
            });
            setShowDeleteAlert(false);
            closeItemModal();
        } catch (error) {
            console.error("Error deleting shopping list item:", error);
        }
    };

    return (
        <IonModal isOpen={isItemModalOpen} onDidDismiss={closeItemModal}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>
                        {editingItem ? "Edit Item" : "Add Item"}
                    </IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={closeItemModal}>
                            <IonIcon icon={closeOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <ItemEditorProvider
                    storeId={storeId}
                    control={control}
                    errors={errors}
                    setValue={setValue}
                    watch={watch}
                >
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <NameAutocomplete />
                        <QuantityInput />
                        <UnitSelector />
                        <LocationSelectors />
                        <NotesInput />

                        <SaveButton
                            isValid={isValid}
                            upsertItem={upsertItem}
                            editingItem={editingItem}
                        />

                        {editingItem && (
                            <IonButton
                                expand="block"
                                color="danger"
                                fill="outline"
                                onClick={() => setShowDeleteAlert(true)}
                                disabled={deleteItem.isPending}
                                style={{ marginTop: "10px" }}
                            >
                                Delete Item
                            </IonButton>
                        )}
                    </form>
                </ItemEditorProvider>

                <IonAlert
                    isOpen={showDeleteAlert}
                    onDidDismiss={() => setShowDeleteAlert(false)}
                    header="Remove from List"
                    message={`Remove "${editingItem?.item_name}" from your shopping list?`}
                    buttons={[
                        {
                            text: "Cancel",
                            role: "cancel",
                        },
                        {
                            text: "Remove",
                            role: "destructive",
                            handler: handleDelete,
                        },
                    ]}
                />
            </IonContent>
        </IonModal>
    );
};

const SaveButton: React.FC<{
    isValid: boolean;
    upsertItem: UseMutationResult<
        ShoppingListItem,
        Error,
        ShoppingListItemOptionalId
    >;
    editingItem: ShoppingListItem | null;
}> = ({ isValid, upsertItem, editingItem }) => {
    return (
        <IonButton
            expand="block"
            type="submit"
            disabled={!isValid || upsertItem.isPending}
            style={{ marginTop: "20px" }}
        >
            {editingItem ? "Update" : "Add"}
        </IonButton>
    );
};
