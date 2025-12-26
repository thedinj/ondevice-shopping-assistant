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
import { useUpsertShoppingListItem } from "../../db/hooks";
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
import { useShoppingListContext } from "./useShoppingListContext";

interface ItemEditorModalProps {
    listId: string;
    storeId: string;
}

export const ItemEditorModal = ({ listId, storeId }: ItemEditorModalProps) => {
    const { isItemModalOpen, editingItem, closeItemModal } =
        useShoppingListContext();
    const upsertItem = useUpsertShoppingListItem();

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
                name: editingItem.name,
                qty: editingItem.qty,
                notes: editingItem.notes,
                aisleId: editingItem.aisle_id,
                sectionId: editingItem.section_id,
            });
        } else if (isItemModalOpen) {
            reset({
                name: "",
                qty: 1,
                notes: null,
                aisleId: null,
                sectionId: null,
            });
        }
    }, [isItemModalOpen, editingItem, reset]);

    const onSubmit = async (data: ItemFormData) => {
        await upsertItem.mutateAsync({
            id: editingItem?.id,
            list_id: listId,
            store_id: storeId,
            name: data.name,
            qty: data.qty,
            notes: data.notes || null,
            aisle_id: data.aisleId || null,
            section_id: data.sectionId || null,
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
