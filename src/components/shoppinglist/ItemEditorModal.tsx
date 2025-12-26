import { zodResolver } from "@hookform/resolvers/zod";
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonModal,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import { UseMutationResult } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
    useUpsertShoppingListItem,
    useGetOrCreateStoreItem,
    useUpdateItem,
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

    return (
        <IonModal isOpen={isItemModalOpen} onDidDismiss={closeItemModal}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>
                        {editingItem ? "Edit Item" : "Add Item"}
                    </IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={closeItemModal}>Cancel</IonButton>
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
                    </form>
                </ItemEditorProvider>
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
