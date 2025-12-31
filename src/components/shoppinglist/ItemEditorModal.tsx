import { zodResolver } from "@hookform/resolvers/zod";
import {
    IonAlert,
    IonButton,
    IonButtons,
    IonChip,
    IonContent,
    IonHeader,
    IonIcon,
    IonLabel,
    IonModal,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import { UseMutationResult } from "@tanstack/react-query";
import {
    bulbOutline,
    cartOutline,
    closeOutline,
    swapHorizontalOutline,
} from "ionicons/icons";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
    useDeleteShoppingListItem,
    useGetOrCreateStoreItem,
    useRemoveShoppingListItem,
    useStores,
    useUpdateItem,
    useUpsertShoppingListItem,
} from "../../db/hooks";
import { useToast } from "../../hooks/useToast";
import {
    ShoppingListItem,
    ShoppingListItemOptionalId,
    Store,
} from "../../models/Store";
import { GenericStoreSelector } from "../shared/GenericStoreSelector";
import { ItemEditorProvider } from "./ItemEditorContext";
import { ItemFormData, itemFormSchema } from "./itemEditorSchema";
import { LocationSelectors } from "./LocationSelectors";
import { NameAutocomplete } from "./NameAutocomplete";
import { NotesInput } from "./NotesInput";
import { QuantityInput } from "./QuantityInput";
import { UnitSelector } from "./UnitSelector";
import { useShoppingListContext } from "./useShoppingListContext";

interface ItemEditorModalProps {
    storeId: string;
}

export const ItemEditorModal = ({ storeId }: ItemEditorModalProps) => {
    const { isItemModalOpen, editingItem, closeItemModal } =
        useShoppingListContext();
    const upsertItem = useUpsertShoppingListItem();
    const getOrCreateStoreItem = useGetOrCreateStoreItem();
    const updateItem = useUpdateItem();
    const deleteItem = useDeleteShoppingListItem();
    const removeItem = useRemoveShoppingListItem();
    const { data: stores } = useStores();
    const toast = useToast();
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [pendingMove, setPendingMove] = useState<Store | null>(null);
    const [isMoving, setIsMoving] = useState(false);

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
            isIdea: false,
        },
    });

    // Watch form values
    const currentNotes = watch("notes");
    const currentName = watch("name");
    const isIdea = watch("isIdea");

    // Reset form when modal opens/closes or editing item changes
    useEffect(() => {
        if (isItemModalOpen && editingItem) {
            reset({
                name: editingItem.item_name || "",
                qty: editingItem.qty,
                unitId: editingItem.unit_id,
                notes: editingItem.notes,
                aisleId: editingItem.aisle_id,
                sectionId: editingItem.section_id,
                isIdea: editingItem.is_idea === 1,
            });
        } else if (isItemModalOpen) {
            reset({
                name: "",
                qty: 1,
                unitId: null,
                notes: null,
                aisleId: null,
                sectionId: null,
                isIdea: false,
            });
        }
    }, [isItemModalOpen, editingItem, reset]);

    // Handle mode toggle - transfer notes between modes
    const handleModeToggle = (newMode: boolean) => {
        setValue("isIdea", newMode);

        if (newMode) {
            // Switching to Idea mode: transfer name to notes
            if (currentName && !currentNotes) {
                setValue("notes", currentName);
                setValue("name", "");
            }
        } else {
            // Switching to Item mode: transfer notes to name if name is empty
            if (currentNotes && !currentName) {
                setValue("name", currentNotes);
                setValue("notes", null);
            }
        }
    };

    const onSubmit = async (data: ItemFormData) => {
        if (isIdea) {
            // Idea - no store item needed
            await upsertItem.mutateAsync({
                id: editingItem?.id,
                store_id: storeId,
                store_item_id: null,
                qty: 1, // Default qty for ideas
                unit_id: null,
                notes: data.notes || null,
                is_idea: 1,
            });
        } else {
            // Regular item - need store item
            let storeItemId: string;

            if (editingItem) {
                // Update existing store item
                await updateItem.mutateAsync({
                    id: editingItem.store_item_id!,
                    name: data.name,
                    aisleId: data.aisleId || null,
                    sectionId: data.sectionId || null,
                    storeId,
                });
                storeItemId = editingItem.store_item_id!;
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
                store_id: storeId,
                store_item_id: storeItemId,
                qty: data.qty,
                unit_id: data.unitId || null,
                notes: data.notes || null,
                is_idea: 0,
            });
        }
        closeItemModal();
    };

    const handleDelete = async () => {
        if (!editingItem) return;

        try {
            await deleteItem.mutateAsync({
                id: editingItem.id,
                storeId: storeId,
            });
            setShowDeleteAlert(false);
            closeItemModal();
        } catch (error) {
            console.error("Error deleting shopping list item:", error);
        }
    };

    const handleMoveToStore = async () => {
        if (!editingItem || !pendingMove) return;

        setIsMoving(true);
        try {
            const itemName = isIdea
                ? editingItem.notes || ""
                : editingItem.item_name;

            if (isIdea) {
                // Move idea - just notes, no store item needed
                await upsertItem.mutateAsync({
                    store_id: pendingMove.id,
                    store_item_id: null,
                    qty: 1,
                    unit_id: null,
                    notes: editingItem.notes,
                    is_idea: 1,
                });
            } else {
                // Move regular item - get or create store item at target store
                // This will match by normalized_name if item exists at target store
                const targetStoreItem = await getOrCreateStoreItem.mutateAsync({
                    storeId: pendingMove.id,
                    name: editingItem.item_name,
                    aisleId: null, // Will use existing location if item found by normalized_name
                    sectionId: null,
                });

                // Create shopping list item at target store
                await upsertItem.mutateAsync({
                    store_id: pendingMove.id,
                    store_item_id: targetStoreItem.id,
                    qty: editingItem.qty,
                    unit_id: editingItem.unit_id,
                    notes: editingItem.notes,
                    is_idea: 0,
                });
            }

            // Delete from current store (without removing the store item)
            await removeItem.mutateAsync({
                id: editingItem.id,
                storeId: storeId,
            });

            toast.showSuccess(
                `Moved "${itemName}" to ${pendingMove.name}. Obviously.`
            );
            setPendingMove(null);
            closeItemModal();
        } catch (error) {
            console.error("Error moving item to store:", error);
            toast.showError("Failed to move item. Perhaps try again?");
        } finally {
            setIsMoving(false);
        }
    };

    const handleStoreSelected = (storeId: string | null) => {
        if (storeId && stores) {
            const storeObj = stores.find((s) => s.id === storeId);
            if (storeObj) {
                setPendingMove(storeObj);
                setShowMoveModal(false);
            }
        }
    };

    return (
        <IonModal isOpen={isItemModalOpen} onDidDismiss={closeItemModal}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>
                        {editingItem
                            ? isIdea
                                ? "Edit Idea"
                                : "Edit Item"
                            : isIdea
                            ? "Add Idea"
                            : "Add Item"}
                    </IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={closeItemModal}>
                            <IonIcon icon={closeOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                {/* Mode Toggle - only show for new items */}
                {!editingItem && (
                    <div
                        style={{
                            display: "flex",
                            gap: "8px",
                            marginBottom: "16px",
                            justifyContent: "center",
                        }}
                    >
                        <IonChip
                            onClick={() => handleModeToggle(false)}
                            color={!isIdea ? "primary" : "medium"}
                            style={{
                                cursor: "pointer",
                                opacity: !isIdea ? 1 : 0.6,
                            }}
                        >
                            <IonIcon icon={cartOutline} />
                            <IonLabel>Item</IonLabel>
                        </IonChip>
                        <IonChip
                            onClick={() => handleModeToggle(true)}
                            color={isIdea ? "primary" : "medium"}
                            style={{
                                cursor: "pointer",
                                opacity: isIdea ? 1 : 0.6,
                            }}
                        >
                            <IonIcon icon={bulbOutline} />
                            <IonLabel>Idea</IonLabel>
                        </IonChip>
                    </div>
                )}

                <ItemEditorProvider
                    storeId={storeId}
                    control={control}
                    errors={errors}
                    setValue={setValue}
                    watch={watch}
                >
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {isIdea ? (
                            // Idea mode - only notes
                            <NotesInput />
                        ) : (
                            // Regular Item mode - all fields
                            <>
                                <NameAutocomplete />
                                <QuantityInput />
                                <UnitSelector />
                                <LocationSelectors />
                                <NotesInput />
                            </>
                        )}

                        <SaveButton
                            isValid={isValid}
                            upsertItem={upsertItem}
                            editingItem={editingItem}
                            isIdea={isIdea}
                        />

                        {editingItem &&
                            !isIdea &&
                            editingItem.is_checked === 0 &&
                            stores &&
                            stores.length > 1 && (
                                <IonButton
                                    expand="block"
                                    color="primary"
                                    fill="outline"
                                    onClick={() => setShowMoveModal(true)}
                                    disabled={isMoving}
                                    style={{ marginTop: "10px" }}
                                >
                                    <IonIcon
                                        icon={swapHorizontalOutline}
                                        slot="start"
                                    />
                                    Move to Another Store
                                </IonButton>
                            )}

                        {editingItem && !isIdea && (
                            <IonButton
                                expand="block"
                                color="danger"
                                fill="outline"
                                onClick={() => setShowDeleteAlert(true)}
                                disabled={deleteItem.isPending}
                                style={{ marginTop: "10px" }}
                            >
                                Delete {isIdea ? "Idea" : "Item"}
                            </IonButton>
                        )}
                    </form>
                </ItemEditorProvider>

                <IonAlert
                    isOpen={showDeleteAlert}
                    onDidDismiss={() => setShowDeleteAlert(false)}
                    header={`Remove ${isIdea ? "Idea" : "Item"}`}
                    message={`Permanently remove "${editingItem?.item_name}" from your store and shopping list?`}
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

                <IonAlert
                    isOpen={!!pendingMove}
                    onDidDismiss={() => setPendingMove(null)}
                    header="Move to Store"
                    message={`Move "${
                        isIdea
                            ? editingItem?.notes || "Idea"
                            : editingItem?.item_name
                    }" to ${
                        pendingMove?.name ?? "the other store"
                    }? The item will be removed from the current store and added to the selected store.`}
                    buttons={[
                        {
                            text: "Cancel",
                            role: "cancel",
                            handler: () => setPendingMove(null),
                        },
                        {
                            text: "Move",
                            handler: handleMoveToStore,
                        },
                    ]}
                />
            </IonContent>

            {/* Move to Store Modal */}
            <IonModal
                isOpen={showMoveModal}
                onDidDismiss={() => setShowMoveModal(false)}
            >
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Move to Store</IonTitle>
                        <IonButtons slot="end">
                            <IonButton
                                onClick={() => {
                                    setShowMoveModal(false);
                                    setPendingMove(null);
                                }}
                            >
                                <IonIcon icon={closeOutline} />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <GenericStoreSelector
                        selectedStoreId={null}
                        onStoreSelect={handleStoreSelected}
                        modalTitle="Select Destination Store"
                        placeholderText="Select destination store"
                        excludeStoreIds={[storeId]}
                        allowClear={false}
                    />
                </IonContent>
            </IonModal>
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
    isIdea: boolean | undefined;
}> = ({ isValid, upsertItem, editingItem, isIdea }) => {
    return (
        <IonButton
            expand="block"
            type="submit"
            disabled={!isValid || upsertItem.isPending}
            style={{ marginTop: "20px" }}
        >
            {editingItem ? "Update" : "Add"}
            {isIdea ? " Idea" : " Item"}
        </IonButton>
    );
};
