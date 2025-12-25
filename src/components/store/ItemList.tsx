import { useState, forwardRef, useImperativeHandle } from "react";
import {
    IonList,
    IonItem,
    IonLabel,
    IonSkeletonText,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonIcon,
    IonAlert,
    IonText,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonInput,
    IonSelect,
    IonSelectOption,
} from "@ionic/react";
import { create, trash } from "ionicons/icons";
import {
    useStoreItems,
    useStoreSections,
    useCreateItem,
    useUpdateItem,
    useDeleteItem,
} from "../../db/hooks";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ListHandle } from "../../pages/StoreDetail";

const itemFormSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .transform((val) => val.trim()),
    default_qty: z.number().min(1, "Quantity must be at least 1"),
    notes: z.string().optional().nullable(),
    section_id: z.string().nullable().optional(),
});

type ItemFormData = z.infer<typeof itemFormSchema>;

interface ItemListProps {
    storeId: string;
}

const ItemList = forwardRef<ListHandle, ItemListProps>(({ storeId }, ref) => {
    const { data: items, isLoading } = useStoreItems(storeId);
    const { data: sections } = useStoreSections(storeId);
    const createItem = useCreateItem();
    const updateItem = useUpdateItem();
    const deleteItem = useDeleteItem();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<{
        id: string;
        name: string;
        default_qty: number;
        notes?: string | null;
        section_id?: string | null;
    } | null>(null);
    const [deleteAlert, setDeleteAlert] = useState<{
        id: string;
        name: string;
    } | null>(null);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm<ItemFormData>({
        resolver: zodResolver(itemFormSchema),
        mode: "onChange",
        defaultValues: {
            name: "",
            default_qty: 1,
            notes: null,
            section_id: null,
        },
    });

    const openCreateModal = () => {
        setEditingItem(null);
        reset({ name: "", default_qty: 1, notes: null, section_id: null });
        setIsModalOpen(true);
    };

    useImperativeHandle(ref, () => ({
        openCreateModal,
    }));

    const openEditModal = (item: {
        id: string;
        name: string;
        default_qty: number;
        notes?: string | null;
        section_id?: string | null;
    }) => {
        setEditingItem(item);
        reset({
            name: item.name,
            default_qty: item.default_qty,
            notes: item.notes || null,
            section_id: item.section_id || null,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        reset({ name: "", default_qty: 1, notes: null, section_id: null });
    };

    const onSubmit = async (data: ItemFormData) => {
        if (editingItem) {
            await updateItem.mutateAsync({
                id: editingItem.id,
                name: data.name,
                defaultQty: data.default_qty,
                notes: data.notes || null,
                sectionId: data.section_id || null,
                storeId,
            });
        } else {
            await createItem.mutateAsync({
                storeId,
                name: data.name,
                defaultQty: data.default_qty,
                notes: data.notes || null,
                sectionId: data.section_id || null,
            });
        }
        closeModal();
    };

    const confirmDelete = (item: { id: string; name: string }) => {
        setDeleteAlert(item);
    };

    const handleDelete = async () => {
        if (deleteAlert) {
            await deleteItem.mutateAsync({ id: deleteAlert.id, storeId });
            setDeleteAlert(null);
        }
    };

    // Create section name map for display
    const sectionMap = new Map(sections?.map((s) => [s.id, s.name]));

    if (isLoading) {
        return (
            <IonList>
                {[1, 2, 3].map((i) => (
                    <IonItem key={i}>
                        <IonLabel>
                            <IonSkeletonText
                                animated
                                style={{ width: "60%" }}
                            />
                        </IonLabel>
                    </IonItem>
                ))}
            </IonList>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div
                style={{
                    textAlign: "center",
                    marginTop: "40px",
                    padding: "20px",
                }}
            >
                <IonText color="medium">
                    <p>No items yet. Tap the + button to add one.</p>
                </IonText>
            </div>
        );
    }

    return (
        <>
            <IonList>
                {items.map((item) => (
                    <IonItemSliding key={item.id}>
                        <IonItem>
                            <IonLabel>
                                <h2>{item.name}</h2>
                                <p>
                                    Qty: {item.default_qty}
                                    {item.section_id &&
                                        ` • Section: ${
                                            sectionMap.get(item.section_id) ||
                                            "Unknown"
                                        }`}
                                </p>
                                {item.notes && (
                                    <p style={{ fontStyle: "italic" }}>
                                        {item.notes}
                                    </p>
                                )}
                            </IonLabel>
                        </IonItem>
                        <IonItemOptions side="end">
                            <IonItemOption
                                color="primary"
                                onClick={() => openEditModal(item)}
                            >
                                <IonIcon slot="icon-only" icon={create} />
                            </IonItemOption>
                            <IonItemOption
                                color="danger"
                                onClick={() => confirmDelete(item)}
                            >
                                <IonIcon slot="icon-only" icon={trash} />
                            </IonItemOption>
                        </IonItemOptions>
                    </IonItemSliding>
                ))}
            </IonList>

            {/* Item Modal */}
            <IonModal isOpen={isModalOpen} onDidDismiss={closeModal}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>
                            {editingItem ? "Edit Item" : "New Item"}
                        </IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={closeModal}>Cancel</IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <IonItem>
                                    <IonLabel position="stacked">
                                        Item Name
                                    </IonLabel>
                                    <IonInput
                                        {...field}
                                        placeholder="Enter item name"
                                        onIonInput={(e) =>
                                            field.onChange(e.detail.value)
                                        }
                                    />
                                </IonItem>
                            )}
                        />
                        {errors.name && (
                            <IonText color="danger">
                                <p
                                    style={{
                                        fontSize: "12px",
                                        marginLeft: "16px",
                                    }}
                                >
                                    {errors.name.message}
                                </p>
                            </IonText>
                        )}

                        <Controller
                            name="default_qty"
                            control={control}
                            render={({ field }) => (
                                <IonItem>
                                    <IonLabel position="stacked">
                                        Default Quantity
                                    </IonLabel>
                                    <IonInput
                                        value={field.value}
                                        type="number"
                                        min="1"
                                        placeholder="1"
                                        onIonInput={(e) => {
                                            const val = e.detail.value;
                                            field.onChange(
                                                val ? Number(val) : 1
                                            );
                                        }}
                                    />
                                </IonItem>
                            )}
                        />
                        {errors.default_qty && (
                            <IonText color="danger">
                                <p
                                    style={{
                                        fontSize: "12px",
                                        marginLeft: "16px",
                                    }}
                                >
                                    {errors.default_qty.message}
                                </p>
                            </IonText>
                        )}

                        <Controller
                            name="section_id"
                            control={control}
                            render={({ field }) => (
                                <IonItem>
                                    <IonLabel position="stacked">
                                        Section (Optional)
                                    </IonLabel>
                                    <IonSelect
                                        value={field.value}
                                        placeholder="Select a section"
                                        onIonChange={(e) =>
                                            field.onChange(e.detail.value)
                                        }
                                    >
                                        <IonSelectOption value={null}>
                                            None
                                        </IonSelectOption>
                                        {sections?.map((section) => (
                                            <IonSelectOption
                                                key={section.id}
                                                value={section.id}
                                            >
                                                {section.name}
                                            </IonSelectOption>
                                        ))}
                                    </IonSelect>
                                </IonItem>
                            )}
                        />

                        <Controller
                            name="notes"
                            control={control}
                            render={({ field }) => (
                                <IonItem>
                                    <IonLabel position="stacked">
                                        Notes (Optional)
                                    </IonLabel>
                                    <IonInput
                                        {...field}
                                        value={field.value || ""}
                                        placeholder="Enter any notes"
                                        onIonInput={(e) =>
                                            field.onChange(
                                                e.detail.value || null
                                            )
                                        }
                                    />
                                </IonItem>
                            )}
                        />

                        <IonButton
                            expand="block"
                            type="submit"
                            disabled={
                                !isValid ||
                                createItem.isPending ||
                                updateItem.isPending
                            }
                            style={{ marginTop: "20px" }}
                        >
                            {editingItem ? "Update" : "Create"}
                        </IonButton>
                    </form>
                </IonContent>
            </IonModal>

            {/* Delete Alert */}
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
                        handler: handleDelete,
                    },
                ]}
            />
        </>
    );
});

export default ItemList;
